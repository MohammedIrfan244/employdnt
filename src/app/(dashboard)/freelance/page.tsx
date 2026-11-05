import { Metadata } from "next";
import FreelanceDashboardView from "@/components/pages/freelance/freelance-dashboard-view";

export const metadata: Metadata = {
  title: "Freelance CRM | Employdnt",
  description: "Track freelance leads, project milestones, and client lifecycles.",
};

export default function FreelanceDashboardPage() {
  return <FreelanceDashboardView />;
}

