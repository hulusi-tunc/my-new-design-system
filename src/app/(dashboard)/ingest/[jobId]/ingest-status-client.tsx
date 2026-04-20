"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, swatchRadii } from "@/lib/nothing-tokens";
import {
  Button,
  Card,
  Container,
  Display,
  Body,
  Label,
  Field,
  Input,
  Textarea,
  Stack,
  Row,
  StatRow,
} from "@/components/hub";
import type { DSComponent, DSManifest } from "@/lib/types";

interface ExtractionWarning {
  kind: string;
  message: string;
  path?: string;
}

interface Job {
  id: string;
  status: "queued" | "running" | "done" | "failed";
  repo_url: string;
  platform: string;
  branch: string | null;
  subpath: string | null;
  draft_manifest: DSManifest | null;
  warnings: ExtractionWarning[] | null;
  error: string | null;
  design_system_id: string | null;
  created_at: string;
  updated_at: string;
}

const POLL_MS = 2000;

export function IngestStatusClient({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const stopPolling = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    const tick = async () => {
      const res = await fetch(`/api/ingest/${jobId}`, { cache: "no-store" });
      if (!res.ok) {
        if (cancelled) return;
        setLoadError(`Could not load job (${res.status}).`);
        stopPolling();
        return;
      }
      const data = (await res.json()) as Job;
      if (cancelled) return;
      setJob(data);
      if (data.status === "done" || data.status === "failed") stopPolling();
    };

    tick();
    timerRef.current = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [jobId]);

  if (loadError) return <CenteredNote>{loadError}</CenteredNote>;
  if (!job) return <CenteredNote>Loading job…</CenteredNote>;
  if (job.status === "failed") {
    return (
      <CenteredNote>
        <Label>Extraction failed</Label>
        <Body tone="secondary">{job.error ?? "Unknown error."}</Body>
      </CenteredNote>
    );
  }
  if (job.status !== "done" || !job.draft_manifest) {
    return <ProgressNote job={job} />;
  }

  return (
    <Container width="lg" style={{ paddingTop: 56, paddingBottom: 120 }}>
      <DraftReview
        job={job}
        draft={job.draft_manifest}
        warnings={job.warnings ?? []}
        onPublished={(slug) => router.push(`/ds/${slug}`)}
      />
    </Container>
  );
}

function CenteredNote({ children }: { children: React.ReactNode }) {
  return (
    <Stack
      gap={2}
      align="center"
      style={{ padding: "80px 32px", textAlign: "center", maxWidth: 560, margin: "0 auto" }}
    >
      {children}
    </Stack>
  );
}

function ProgressNote({ job }: { job: Job }) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const label =
    job.status === "queued"
      ? "Queued — waiting for a worker"
      : "Running — walking the repo and extracting tokens";
  return (
    <CenteredNote>
      <Row gap={2} align="center" justify="center">
        <span
          style={{
            display: "inline-block",
            width: 14,
            height: 14,
            border: `2px solid ${t.border}`,
            borderTopColor: t.accent,
            borderRadius: "50%",
            animation: "hub-spin 800ms linear infinite",
          }}
        />
        <Body tone="secondary">{label}</Body>
      </Row>
      <style>{`@keyframes hub-spin { to { transform: rotate(360deg); } }`}</style>
    </CenteredNote>
  );
}

function DraftReview({
  job,
  draft,
  warnings,
  onPublished,
}: {
  job: Job;
  draft: DSManifest;
  warnings: ExtractionWarning[];
  onPublished: (slug: string) => void;
}) {
  const [slug, setSlug] = useState(draft.slug ?? "");
  const [name, setName] = useState(draft.name ?? "");
  const [description, setDescription] = useState(draft.description ?? "");
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const components = useMemo(() => draft.components ?? [], [draft.components]);
  const colorCount = useMemo(() => countColors(draft), [draft]);

  const publish = async () => {
    setPublishError(null);
    setPublishing(true);
    const res = await fetch(`/api/ingest/${job.id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, name, description }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setPublishError(data.error ?? `Publish failed (${res.status})`);
      setPublishing(false);
      return;
    }
    const data = (await res.json()) as { slug: string };
    onPublished(data.slug);
  };

  return (
    <Stack gap={6}>
      <Stack gap={1}>
        <Label>Draft extracted</Label>
        <Display level={3}>Review and publish</Display>
        <Body size="sm" tone="secondary">
          {job.repo_url}
          {job.branch ? ` · ${job.branch}` : ""}
          {job.subpath ? ` · ${job.subpath}` : ""}
        </Body>
      </Stack>

      <StatRow
        items={[
          { label: "Components", value: components.length },
          { label: "Color tokens", value: colorCount },
          { label: "Warnings", value: warnings.length },
        ]}
      />

      {warnings.length > 0 && <WarningList warnings={warnings} />}

      <Field id="slug" label="Slug">
        <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
      </Field>

      <Field id="name" label="Name">
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>

      <Field id="description" label="Description">
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </Field>

      {components.length > 0 && (
        <Stack gap={2}>
          <Label>Detected components</Label>
          <ComponentList components={components} />
        </Stack>
      )}

      {publishError && (
        <Card tone="default" pad="md">
          <Body tone="display">{publishError}</Body>
        </Card>
      )}

      <Row gap={3} style={{ paddingTop: 8 }}>
        <Button
          variant="primary"
          size="md"
          loading={publishing}
          disabled={!slug.trim() || !name.trim() || publishing}
          onClick={publish}
        >
          {publishing ? "Publishing…" : "Publish to registry"}
        </Button>
      </Row>
    </Stack>
  );
}

function WarningList({ warnings }: { warnings: ExtractionWarning[] }) {
  const { theme } = useTheme();
  const t = getNd(theme);
  return (
    <Card tone="default" pad="md">
      <Stack gap={2} as="ul" style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {warnings.map((w, i) => (
          <li key={i} style={{ display: "flex", gap: 8 }}>
            <span
              style={{
                fontFamily: "var(--font-space-mono), ui-monospace, monospace",
                fontSize: 10,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: t.textDisabled,
                paddingTop: 2,
                flexShrink: 0,
              }}
            >
              {w.kind}
            </span>
            <Body size="sm" tone="secondary">
              {w.message}
            </Body>
          </li>
        ))}
      </Stack>
    </Card>
  );
}

function ComponentList({ components }: { components: DSComponent[] }) {
  const { theme } = useTheme();
  const t = getNd(theme);
  return (
    <ul
      style={{
        margin: 0,
        padding: 0,
        listStyle: "none",
        border: `1px solid ${t.border}`,
        borderRadius: swatchRadii.lg,
        overflow: "hidden",
        background: t.surfaceInk,
      }}
    >
      {components.map((c, i) => (
        <li
          key={c.file}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: "10px 14px",
            borderTop: i === 0 ? "none" : `1px solid ${t.border}`,
          }}
        >
          <Body size="sm">{c.name}</Body>
          <span
            style={{
              fontFamily: "var(--font-space-mono), ui-monospace, monospace",
              fontSize: 11,
              color: t.textDisabled,
            }}
          >
            {c.file}
          </span>
        </li>
      ))}
    </ul>
  );
}

function countColors(manifest: DSManifest): number {
  const colors = manifest.tokens?.colors ?? {};
  let count = 0;
  for (const v of Object.values(colors)) {
    if (typeof v === "string") count += 1;
    else if (v && typeof v === "object") count += Object.keys(v).length;
  }
  return count;
}
