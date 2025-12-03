-- ============================================================================
-- FIX ALL RLS POLICIES TO USE is_admin() FUNCTION (AVOIDS RECURSION)
-- ============================================================================

-- ============================================================================
-- 1. FIX IMAGE_SETS TABLE POLICY
-- ============================================================================

-- Drop old policy that uses raw_app_meta_data
DROP POLICY IF EXISTS "Image sets can be managed by admins" ON image_sets;

-- Create new policy using is_admin() function
CREATE POLICY "Image sets can be managed by admins"
ON image_sets FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================================
-- 2. FIX STORAGE BUCKET POLICIES
-- ============================================================================

-- Drop old policies that use raw_app_meta_data
DROP POLICY IF EXISTS "Admins can upload game images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete game images" ON storage.objects;

-- Create new policies using is_admin() function
CREATE POLICY "Admins can upload game images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'game-images'
  AND public.is_admin()
);

CREATE POLICY "Admins can delete game images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'game-images'
  AND public.is_admin()
);

-- Also add update policy for admins (was missing before)
CREATE POLICY "Admins can update game images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'game-images'
  AND public.is_admin()
);

