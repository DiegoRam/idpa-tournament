/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as clubs from "../clubs.js";
import type * as http from "../http.js";
import type * as registrations from "../registrations.js";
import type * as scoring from "../scoring.js";
import type * as squads from "../squads.js";
import type * as stages from "../stages.js";
import type * as tournaments from "../tournaments.js";
import type * as userAuth from "../userAuth.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  clubs: typeof clubs;
  http: typeof http;
  registrations: typeof registrations;
  scoring: typeof scoring;
  squads: typeof squads;
  stages: typeof stages;
  tournaments: typeof tournaments;
  userAuth: typeof userAuth;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
