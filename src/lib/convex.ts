import { ConvexReactClient } from "convex/react";

// Initialize Convex client
export const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Export commonly used types from the generated API
export type { Id } from "../../convex/_generated/dataModel";
export { api } from "../../convex/_generated/api";