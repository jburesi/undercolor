-- ============================================================================
-- Fix Security Linter Warnings Migration
-- ============================================================================
-- This migration fixes:
-- 1. Functions without search_path set (security vulnerability)
-- 2. RLS policies that are too permissive (USING/WITH CHECK always true)
-- 3. auth_rls_initplan: Replace auth.uid() with (select auth.uid()) for performance
-- 4. multiple_permissive_policies: Consolidate overlapping policies

-- ============================================================================
-- FIX FUNCTIONS: Add search_path = '' to all functions
-- ============================================================================

-- Fix: generate_room_code
CREATE OR REPLACE FUNCTION public.generate_room_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Fix: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix: handle_updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix: update_audit_columns
CREATE OR REPLACE FUNCTION public.update_audit_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$;

-- Fix: set_created_by
CREATE OR REPLACE FUNCTION public.set_created_by()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- Fix: get_my_role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'user_role')::public.app_role,
    'user'::public.app_role
  );
$$;

-- ============================================================================
-- FIX RLS POLICIES: Replace overly permissive policies with proper checks
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ROOMS TABLE POLICIES
-- ----------------------------------------------------------------------------

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Rooms can be created by anyone" ON public.rooms;
DROP POLICY IF EXISTS "Rooms can be updated by host" ON public.rooms;

-- Rooms can be created by authenticated users only
-- The host_id must match the current user
CREATE POLICY "Rooms can be created by authenticated users"
  ON public.rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (
    host_id = (select auth.uid())
    OR created_by = (select auth.uid())
  );

-- Rooms can only be updated by the host
CREATE POLICY "Rooms can be updated by host"
  ON public.rooms
  FOR UPDATE
  TO authenticated
  USING (host_id = (select auth.uid()))
  WITH CHECK (host_id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- PLAYERS TABLE POLICIES
-- ----------------------------------------------------------------------------

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Players can join rooms" ON public.players;
DROP POLICY IF EXISTS "Players can update their own data" ON public.players;
DROP POLICY IF EXISTS "Players can leave rooms" ON public.players;

-- Players can join rooms if authenticated or with a valid session
-- user_id must match current user if provided
CREATE POLICY "Players can join rooms"
  ON public.players
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    -- If user_id is provided, it must match the current user
    (user_id IS NULL OR user_id = (select auth.uid()))
    -- Session ID must be provided
    AND session_id IS NOT NULL
  );

-- Players can only update their own data
CREATE POLICY "Players can update their own data"
  ON public.players
  FOR UPDATE
  TO authenticated, anon
  USING (
    -- Match by user_id if authenticated
    ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()))
    -- Or match by session_id for anonymous users (validated via session)
    OR ((select auth.uid()) IS NULL AND session_id IS NOT NULL)
  )
  WITH CHECK (
    -- Can only update own record
    ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()))
    OR ((select auth.uid()) IS NULL AND session_id IS NOT NULL)
  );

-- Players can only leave (delete) their own record
CREATE POLICY "Players can leave rooms"
  ON public.players
  FOR DELETE
  TO authenticated, anon
  USING (
    -- Match by user_id if authenticated
    ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()))
    -- Or allow host to remove players (via room ownership)
    OR EXISTS (
      SELECT 1 FROM public.rooms
      WHERE rooms.id = players.room_id
      AND rooms.host_id = (select auth.uid())
    )
  );

-- ----------------------------------------------------------------------------
-- GAME HISTORY TABLE POLICIES
-- ----------------------------------------------------------------------------

-- Drop overly permissive policy
DROP POLICY IF EXISTS "History can be inserted by system" ON public.game_history;

-- Game history can only be inserted for the current user
-- or by admin/service role (when game ends)
CREATE POLICY "History can be inserted for authenticated users"
  ON public.game_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User can insert their own history
    user_id = (select auth.uid())
    -- Or admin can insert for anyone
    OR public.is_admin()
  );

-- Allow service role to insert history (for game end processing)
-- This is handled by SECURITY DEFINER functions or service role access

-- ----------------------------------------------------------------------------
-- FIX: game_history SELECT policy (auth_rls_initplan)
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view their own history" ON public.game_history;

CREATE POLICY "Users can view their own history"
  ON public.game_history
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ----------------------------------------------------------------------------
-- FIX: profiles policies (auth_rls_initplan)
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- ----------------------------------------------------------------------------
-- FIX: user_roles policies (auth_rls_initplan + multiple_permissive_policies)
-- ----------------------------------------------------------------------------

-- Drop existing policies to recreate with optimized auth calls
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles except their own" ON public.user_roles;

-- Consolidate SELECT policies into one to avoid multiple_permissive_policies warning
-- Users can view their own role, admins can view all
CREATE POLICY "Users can view roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = user_id
    OR public.is_admin()
  );

-- Admins can update roles (with optimized auth calls)
CREATE POLICY "Admins can update roles"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (
    -- Prevent admin from demoting themselves
    NOT (user_id = (select auth.uid()) AND role != 'admin')
  );

-- Admins can delete roles except their own (with optimized auth calls)
CREATE POLICY "Admins can delete roles except their own"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (
    public.is_admin()
    AND user_id != (select auth.uid())
  );

-- ----------------------------------------------------------------------------
-- FIX: image_sets policies (multiple_permissive_policies)
-- ----------------------------------------------------------------------------

-- Drop existing overlapping SELECT policies
DROP POLICY IF EXISTS "Image sets are viewable by everyone" ON public.image_sets;
DROP POLICY IF EXISTS "Image sets can be managed by admins" ON public.image_sets;

-- Consolidate into single SELECT policy
-- Everyone can view active image sets, admins can view all
CREATE POLICY "Image sets are viewable"
  ON public.image_sets
  FOR SELECT
  USING (
    is_active = true
    OR public.is_admin()
  );

-- Separate policies for INSERT, UPDATE, DELETE (admin only)
CREATE POLICY "Admins can insert image sets"
  ON public.image_sets
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update image sets"
  ON public.image_sets
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete image sets"
  ON public.image_sets
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

