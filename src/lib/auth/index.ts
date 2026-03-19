import { devAuth } from "@/lib/auth/devAuthMiddleware.js";
import auth from "@/lib/auth/authMiddleware.js";

export const requireAuth = (process.env.NODE_ENV === 'development' && process.env.DEV_USER_ID)
    ? devAuth : auth;