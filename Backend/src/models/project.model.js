import mongoose, { Schema } from "mongoose";


// =========================
// Role Subdocument Schema
// =========================

const roleSchema = new Schema(
{
  title: {
    type: String,
    required: true,
    trim: true
  },

  responsibilities: {
    type: [String],
    default: []
  },

  requirements: {
    type: [String],
    default: []
  },

  membersRequired: {
    type: Number,
    default: 1
  }

},
{ _id: false }
);


// =========================
// Project Schema
// =========================

const projectSchema = new Schema(
{
  // =========================
  // Identity
  // =========================

  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },

  summary: {
    type: String,
    trim: true,
    maxlength: 200
  },

  description: {
    type: String,
    required: true
  },

  ownerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },


  // =========================
  // Skills / Tech Stack
  // =========================

  techStack: {
    type: [String],
    default: []
  },


  // =========================
  // Roles Structure
  // =========================

  roles: [roleSchema],


  // =========================
  // Additional Details
  // =========================

  deadline: {
    type: Date
  },

  stipend: {
    type: String,
    default: "Unpaid"
  },

  availability: {
    type: String
  },

  timing: {
    type: String
  },

  mode: {
    type: String,
    enum: ["Remote", "Hybrid", "Onsite"],
    default: "Remote"
  },

  location: {
    type: String
  },


  // =========================
  // Recruiting System
  // =========================

  open: {
    type: Boolean,
    default: true,
    index: true
  },

  status: {
    type: String,
    enum: ["open", "closed", "expired", "completed", "archived"],
    default: "open",
    index: true
  },


  // =========================
  // Cached Metadata
  // =========================

  teamCount: {
    type: Number,
    default: 1
  }

}, 
{
  timestamps: true
}
);

export const Project = mongoose.model("Project", projectSchema);
