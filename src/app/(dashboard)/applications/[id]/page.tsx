import { Suspense } from "react";

interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>;
}

async function ApplicationContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Application Details</h1>
      <p className="text-zinc-600">Application ID: {id}</p>
    </div>
  );
}

export default function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  return (
    <Suspense fallback={<div className="p-4 text-zinc-500">Loading application details...</div>}>
      <ApplicationContent params={params} />
    </Suspense>
  );
}
