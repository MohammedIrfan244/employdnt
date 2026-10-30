import mongoose, { Schema, Model } from "mongoose";
import { IApplicationEvent } from "@/types/application-event";

const ApplicationEventSchema = new Schema<IApplicationEvent>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const ApplicationEvent: Model<IApplicationEvent> =
  mongoose.models.ApplicationEvent || mongoose.model<IApplicationEvent>("ApplicationEvent", ApplicationEventSchema);

