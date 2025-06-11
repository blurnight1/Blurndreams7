import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const tracks = await ctx.db
      .query("tracks")
      .order("desc")
      .collect();

    return Promise.all(
      tracks.map(async (track) => {
        const uploader = await ctx.db.get(track.uploadedBy);
        const audioUrl = await ctx.storage.getUrl(track.audioFileId);
        
        return {
          ...track,
          uploaderName: uploader?.name || uploader?.email || "Anonymous",
          audioUrl,
        };
      })
    );
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to upload tracks");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    audioFileId: v.id("_storage"),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create tracks");
    }

    return await ctx.db.insert("tracks", {
      title: args.title,
      description: args.description,
      audioFileId: args.audioFileId,
      uploadedBy: userId,
      duration: args.duration,
      plays: 0,
    });
  },
});

export const incrementPlays = mutation({
  args: { trackId: v.id("tracks") },
  handler: async (ctx, args) => {
    const track = await ctx.db.get(args.trackId);
    if (!track) {
      throw new Error("Track not found");
    }

    await ctx.db.patch(args.trackId, {
      plays: track.plays + 1,
    });
  },
});
