import { Types } from "mongoose";
import { EventType } from "@/lib/constants";

export interface IApplicationEvent {
  _id?: Types.ObjectId | string;
  applicationId: Types.ObjectId | string;
  eventType: EventType;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
}
