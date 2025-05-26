import { publicHandlers } from "./handlers/public";
import { privateHandlers } from "./handlers/private";

export { publicHandlers };
export const authHandlers = privateHandlers;

export type AppRouter = typeof publicHandlers;
export type AuthRouter = typeof authHandlers;
