import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
{
  // =========================
  // Identity & Authentication
  // =========================

  fullName: {
    type: String,
    required: true,
    trim: true
  },

  username: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
    index: true
  },

  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
    index: true
  },

  password: {
    type: String,
    required: true,
    select: false
  },

  avatar: {
    type: String,
    default: ""
  },
  coverImage: {
    type: String,
    default: ""
  },

  resumeUrl: {
    type: String,
    trim: true,
    default: ""
  },

  // =========================
  // Profile Info
  // =========================

  headline: {
    type: String,
    trim: true,
    maxlength: 120,
    default: ""
  },

  bio: {
    type: String,
    maxlength: [300, "Bio cannot exceed 300 characters"],//textarea maxLength={300} add this to frontend
    default:""
  },

  dob: {
    type: Date,
    default:""
  },

  location: {
    type: String
  },

  skills: {
    type: [String],
    default: []
  },

  experienceLevel: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    default: "beginner"
  },

  // =========================
  // Work Experience
  // =========================

  workExperience: [
    {
      company: String,
      jobTitle: String,

      start: {
        month: String,
        year: Number
      },

      end: {
        month: String,
        year: Number
      }
    }
  ],

  // =========================
  // Education
  // =========================

  education: [
    {
      school: String,
      degree: String,

      start: {
        month: String,
        year: Number
      },

      end: {
        month: String,
        year: Number
      }
    }
  ],

  // =========================
  // Mandatory Links
  // =========================

  github: {
    type: String,
    trim: true,
    default:""
  },

  linkedin: {
    type: String,
    trim: true,
    default:""
  },

  // =========================
  // Optional External Links
  // =========================

  links: [
    {
      label: String,
      url: String
    }
  ],

  // =========================
  // Stats
  // =========================

  createdProjectCount: {
    type: Number,
    default: 0
  },

  participatedProjectCount: {
    type: Number,
    default: 0
  },

  // =========================
  // System Controls
  // =========================

  role: {
    type: String,
    default: "user"
  },

  isActive: {
    type: Boolean,
    default: true
  },

  refreshToken: {
    type: String,
    select:false
  }

},
{
  timestamps: true
}
);


// =========================
// Password Hash Middleware
// =========================

userSchema.pre("save", async function () {

  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);

  return;
});


// =========================
// Instance Methods
// =========================

userSchema.methods.isPasswordCorrect = function (password) {

  return bcrypt.compare(password, this.password);
};


userSchema.methods.generateAccessToken = function () {

  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
};


userSchema.methods.generateRefreshToken = function () {

  return jwt.sign(
    {
      _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  );
};


export const User = mongoose.model("User", userSchema);
