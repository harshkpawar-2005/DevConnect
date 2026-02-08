import mongoose, { Schema } from "mongoose";

const membershipSchema = new Schema(
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
  // Role & Responsibility
  // =========================

  role: {
    type: String,
    required: true,
    trim: true
  },

  responsibilityText: {
    type: String,
    trim: true,
    maxlength: 150,
    default: ""
  },

  // =========================
  // Ownership & Permissions
  // =========================

  isOwner: {
    type: Boolean,
    default: false
  },

  // =========================
  // Metadata
  // =========================

  joinedAt: {
    type: Date,
    default: Date.now
  }

},
{
  timestamps: true
});


// =========================
// Compound Index
// =========================
// Prevents same user joining same project twice

membershipSchema.index(
  { projectId: 1, userId: 1 },
  { unique: true }
);


export const Membership = mongoose.model(
  "Membership",
  membershipSchema
);
