import { IngestStatusClient } from "./ingest-status-client";

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export default async function IngestStatusPage({ params }: PageProps) {
  const { jobId } = await params;
  return <IngestStatusClient jobId={jobId} />;
}
