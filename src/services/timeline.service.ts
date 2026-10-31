import { connectDB } from "@/lib/mongodb";
import { ApplicationEvent } from "@/models/application-event.model";
import { EventType } from "@/lib/constants";
import { IApplicationEvent } from "@/types/application-event";

/**
 * Records an event in the application's chronological timeline.
 */
export async function logTimelineEvent(
  applicationId: string,
  eventType: EventType,
  description: string,
  metadata?: Record<string, unknown>
): Promise<IApplicationEvent> {
  await connectDB();
  const event = await ApplicationEvent.create({
    applicationId,
    eventType,
    description,
    metadata: metadata || {},
  });
  return JSON.parse(JSON.stringify(event));
}

/**
 * Retrieves the chronological timeline events for a given application.
 */
export async function getApplicationTimeline(applicationId: string): Promise<IApplicationEvent[]> {
  await connectDB();
  const events = await ApplicationEvent.find({ applicationId }).sort({ createdAt: 1 }).lean();
  return JSON.parse(JSON.stringify(events));
}

