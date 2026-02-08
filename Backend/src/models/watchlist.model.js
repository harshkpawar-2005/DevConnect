import mongoose, { Schema } from "mongoose";

const watchlistSchema = new Schema(
{
  // =========================
  // Relations
  // =========================

  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  projectId: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    required: true,
    index: true
  }

},
{
  timestamps: true
});


// =========================
// Compound Index
// =========================
// Prevents saving same project twice

watchlistSchema.index(
  { userId: 1, projectId: 1 },
  { unique: true }
);


export const Watchlist = mongoose.model(
  "Watchlist",
  watchlistSchema
);
