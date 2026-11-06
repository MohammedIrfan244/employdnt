import { Suspense } from "react";
import { Metadata } from "next";
import ClientDetailView from "@/components/pages/freelance/client-detail-view";

export const metadata: Metadata = {
  title: "Client Lifecycle | Employdnt Freelance",
  description: "Manage freelance client stages and project deliverables.",
};

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

async function ClientContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClientDetailView clientId={id} />;
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-[var(--muted)] animate-pulse">
          Loading client record...
        </div>
      }
    >
      <ClientContent params={params} />
    </Suspense>
  );
}
