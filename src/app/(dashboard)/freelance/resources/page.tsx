import { Metadata } from "next";
import FreelanceResourcesView from "@/components/pages/freelance/freelance-resources-view";

export const metadata: Metadata = {
  title: "Requirement Form & Resources | Employdnt Freelance",
  description: "Client intake forms, scope templates, and freelance legal agreements.",
};

export default function FreelanceResourcesPage() {
  return <FreelanceResourcesView />;
}

