/**
 * Common field schemas - reusable building blocks
 */

import { z } from "zod";

export const usernameSchema = z.string().min(2).max(20);
export const roomCodeSchema = z.string().length(6);
export const sessionIdSchema = z.string().uuid();
export const playerIdSchema = z.string().uuid();
