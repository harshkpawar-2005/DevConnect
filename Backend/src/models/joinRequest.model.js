import mongoose, { Schema } from "mongoose";

const joinRequestSchema = new Schema(
{
  // =========================
  // Relations
  // =========================

  projectId: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    required: true,
    index: true
  },

  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  // =========================
  // Application Data
  // =========================

  appliedRole: {
    type: String,
    required: true,
    trim: true
  },

  message: {
    type: String,
    trim: true,
    maxlength: 300,
    default: ""
  },

  // =========================
  // Request Status
  // =========================

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  }

},
{
  timestamps: true
});


// =========================
// Compound Index
// =========================
// Prevents duplicate applications

joinRequestSchema.index(
  { projectId: 1, userId: 1 },
  { unique: true }
);


export const JoinRequest = mongoose.model(
  "JoinRequest",
  joinRequestSchema
);
