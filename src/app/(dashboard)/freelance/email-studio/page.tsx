import { Metadata } from "next";
import EmailStudioView from "@/components/pages/freelance/email-studio-view";

export const metadata: Metadata = {
  title: "Email Studio | Employdnt Freelance",
  description: "Compose personalized cold outreach emails with reusable templates.",
};

export default function EmailStudioPage() {
  return <EmailStudioView />;
}

