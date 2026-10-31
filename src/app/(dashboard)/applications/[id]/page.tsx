import { Suspense } from "react";
import ApplicationDetail from "@/components/pages/applications/application-detail";

interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>;
}

async function ApplicationContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ApplicationDetail id={id} />;
}

export default function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-zinc-400 text-center animate-pulse">Loading application...</div>}>
      <ApplicationContent params={params} />
    </Suspense>
  );
}
