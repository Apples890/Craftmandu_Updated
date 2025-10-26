// types/express.types.ts
import type { UserRole } from './user.types';

/**
 * Extend Express Request to include `user` injected by auth middleware.
 * Place `typeRoots` or `paths` in tsconfig to include this folder, e.g.:
 *  "typeRoots": ["./node_modules/@types", "./src/types"]
 */
declare global {
  namespace Express {
    interface User {
      id: string;
      role?: UserRole;
      jwt: string;
      [k: string]: unknown;
    }
    interface Request {
      user?: User;
    }
  }
}
export {};
