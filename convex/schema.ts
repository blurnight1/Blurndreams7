import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  tracks: defineTable({
    title: v.string(),
    description: v.string(),
    audioFileId: v.id("_storage"),
    uploadedBy: v.id("users"),
    duration: v.optional(v.number()),
    plays: v.number(),
  }).index("by_uploader", ["uploadedBy"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
