import { Metadata } from "next";
import ClientDetailView from "@/components/pages/freelance/client-detail-view";

export const metadata: Metadata = {
  title: "Client Lifecycle | Employdnt Freelance",
  description: "Manage freelance client stages and project deliverables.",
};

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClientDetailView clientId={id} />;
}

