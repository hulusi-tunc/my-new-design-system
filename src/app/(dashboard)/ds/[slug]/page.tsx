import { getAllManifests, getManifestBySlug, getForks } from "@/lib/registry";
import { notFound } from "next/navigation";
import { DetailClient } from "./detail-client";

export async function generateStaticParams() {
  const manifests = await getAllManifests();
  return manifests.map((m) => ({ slug: m.slug }));
}

export default async function DesignSystemDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const manifest = await getManifestBySlug(slug);
  if (!manifest) notFound();

  const allManifests = await getAllManifests();
  const forks = getForks(allManifests, slug);
  const parentManifest = manifest.parent
    ? await getManifestBySlug(manifest.parent)
    : null;

  return (
    <DetailClient
      manifest={manifest}
      forks={forks}
      allManifests={allManifests}
      parentManifest={parentManifest}
    />
  );
}
