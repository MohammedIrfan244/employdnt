import mongoose, { Schema, Model } from "mongoose";
import { IFreelanceClient } from "@/types/freelance-client";

const FreelanceClientSchema = new Schema<IFreelanceClient>(
  {
    userEmail: {
      type: String,
      required: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    contactName: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    leadSource: {
      type: String,
      required: true,
      default: "Other",
    },
    outreachDate: {
      type: String,
      required: true,
    },
    initialNotes: {
      type: String,
      trim: true,
    },
    currentStage: {
      type: String,
      required: true,
      enum: [
        "Outreached",
        "Scoping",
        "Contract",
        "Build",
        "Test",
        "Launch",
        "Post-launch",
      ],
      default: "Outreached",
      index: true,
    },
    stageEnteredAt: {
      type: Date,
      default: Date.now,
    },
    stageDueDate: {
      type: String,
      trim: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    scopingSnoozedUntil: {
      type: String,
      trim: true,
    },

    // Stage-specific objects
    scoping: {
      requirementsSummary: { type: String, trim: true },
      scopeDocUrl: { type: String, trim: true },
      budgetEstimate: { type: Number },
      currency: { type: String, default: "USD" },
    },
    contract: {
      contractDocUrl: { type: String, trim: true },
      agreedAmount: { type: Number },
      currency: { type: String, default: "USD" },
      functionalRequirements: { type: String, trim: true },
      signedDate: { type: String, trim: true },
    },
    build: {
      repositoryUrl: { type: String, trim: true },
      stagingUrl: { type: String, trim: true },
      developmentNotes: { type: String, trim: true },
    },
    test: {
      testingUrl: { type: String, trim: true },
      feedbackNotes: { type: String, trim: true },
      bugLog: { type: String, trim: true },
    },
    launch: {
      productionUrl: { type: String, trim: true },
      deploymentDate: { type: String, trim: true },
      handoverNotes: { type: String, trim: true },
    },
    postLaunch: {
      supportPeriodMonths: { type: Number },
      supportEndDate: { type: String, trim: true },
      maintenanceNotes: { type: String, trim: true },
    },

    stageHistory: [
      {
        stage: { type: String, required: true },
        enteredAt: { type: Date, default: Date.now },
        completedAt: { type: Date },
        notes: { type: String, trim: true },
      },
    ],
  },
  {
    timestamps: true,
    strict: false,
  }
);

FreelanceClientSchema.index({ userEmail: 1, currentStage: 1 });
FreelanceClientSchema.index({ userEmail: 1, createdAt: -1 });

if (process.env.NODE_ENV !== "production") {
  delete (mongoose.models as Record<string, unknown>).FreelanceClient;
}

export const FreelanceClient: Model<IFreelanceClient> =
  mongoose.models.FreelanceClient ||
  mongoose.model<IFreelanceClient>("FreelanceClient", FreelanceClientSchema);

