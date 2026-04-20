"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts, swatchRadii } from "@/lib/nothing-tokens";
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
  const { theme } = useTheme();
  const t = getNd(theme);
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
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
      if (data.status === "done" || data.status === "failed") {
        stopPolling();
      }
    };

    const stopPolling = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    tick();
    timerRef.current = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [jobId]);

  const wrapperStyle: CSSProperties = {
    maxWidth: 820,
    margin: "0 auto",
    padding: "56px 32px 120px",
    color: t.textPrimary,
    fontFamily: editorialFonts.body,
  };

  if (loadError) {
    return <CenteredNote t={t}>{loadError}</CenteredNote>;
  }
  if (!job) {
    return <CenteredNote t={t}>Loading job…</CenteredNote>;
  }
  if (job.status === "failed") {
    return (
      <CenteredNote t={t}>
        <strong style={{ color: t.textDisplay, display: "block", marginBottom: 8 }}>
          Extraction failed
        </strong>
        {job.error ?? "Unknown error."}
      </CenteredNote>
    );
  }
  if (job.status !== "done" || !job.draft_manifest) {
    return <ProgressNote job={job} t={t} />;
  }

  return (
    <div style={wrapperStyle}>
      <DraftReview
        job={job}
        draft={job.draft_manifest}
        warnings={job.warnings ?? []}
        onPublished={(slug) => router.push(`/ds/${slug}`)}
        t={t}
      />
    </div>
  );
}

function CenteredNote({
  children,
  t,
}: {
  children: React.ReactNode;
  t: ReturnType<typeof getNd>;
}) {
  return (
    <div
      style={{
        padding: "80px 32px",
        textAlign: "center",
        fontFamily: editorialFonts.body,
        fontSize: 14,
        color: t.textSecondary,
        maxWidth: 560,
        margin: "0 auto",
      }}
    >
      {children}
    </div>
  );
}

function ProgressNote({ job, t }: { job: Job; t: ReturnType<typeof getNd> }) {
  const label =
    job.status === "queued"
      ? "Queued — waiting for a worker"
      : "Running — walking the repo and extracting tokens";
  return (
    <CenteredNote t={t}>
      <span
        style={{
          display: "inline-block",
          width: 14,
          height: 14,
          border: `2px solid ${t.border}`,
          borderTopColor: t.accent,
          borderRadius: "50%",
          animation: "spin 800ms linear infinite",
          verticalAlign: "middle",
          marginRight: 10,
        }}
      />
      {label}
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </CenteredNote>
  );
}

function DraftReview({
  job,
  draft,
  warnings,
  onPublished,
  t,
}: {
  job: Job;
  draft: DSManifest;
  warnings: ExtractionWarning[];
  onPublished: (slug: string) => void;
  t: ReturnType<typeof getNd>;
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

  const sectionStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    paddingTop: 24,
    borderTop: `1px solid ${t.border}`,
  };

  const labelStyle: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 10,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: t.textDisabled,
  };

  const inputStyle: CSSProperties = {
    appearance: "none",
    background: t.surfaceInk,
    color: t.textPrimary,
    border: `1px solid ${t.border}`,
    borderRadius: swatchRadii.md,
    padding: "10px 12px",
    fontSize: 14,
    fontFamily: editorialFonts.body,
    outline: "none",
    width: "100%",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <header>
        <span style={labelStyle}>Draft extracted</span>
        <h1
          style={{
            margin: "8px 0 6px",
            fontFamily: editorialFonts.display,
            fontSize: 32,
            fontWeight: 500,
            lineHeight: 1.15,
            color: t.textDisplay,
          }}
        >
          Review and publish
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: t.textSecondary }}>
          {job.repo_url}
          {job.branch ? ` · ${job.branch}` : ""}
          {job.subpath ? ` · ${job.subpath}` : ""}
        </p>
      </header>

      <StatsRow
        components={components.length}
        colors={colorCount}
        warnings={warnings.length}
        t={t}
      />

      {warnings.length > 0 && (
        <WarningList warnings={warnings} t={t} />
      )}

      <div style={sectionStyle}>
        <label htmlFor="slug" style={labelStyle}>
          Slug
        </label>
        <input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={sectionStyle}>
        <label htmlFor="name" style={labelStyle}>
          Name
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={sectionStyle}>
        <label htmlFor="description" style={labelStyle}>
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
        />
      </div>

      {components.length > 0 && (
        <div style={sectionStyle}>
          <span style={labelStyle}>Detected components</span>
          <ComponentList components={components} t={t} />
        </div>
      )}

      {publishError && (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: swatchRadii.md,
            border: `1px solid ${t.border}`,
            background: t.surface,
            color: t.textDisplay,
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {publishError}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, paddingTop: 16 }}>
        <button
          type="button"
          onClick={publish}
          disabled={publishing || !slug.trim() || !name.trim()}
          style={{
            background: t.textDisplay,
            color: t.black,
            border: "none",
            borderRadius: swatchRadii.full,
            padding: "10px 20px",
            fontFamily: editorialFonts.body,
            fontSize: 13,
            fontWeight: 600,
            cursor: publishing ? "wait" : "pointer",
            opacity: publishing || !slug.trim() || !name.trim() ? 0.55 : 1,
          }}
        >
          {publishing ? "Publishing…" : "Publish to registry"}
        </button>
      </div>
    </div>
  );
}

function StatsRow({
  components,
  colors,
  warnings,
  t,
}: {
  components: number;
  colors: number;
  warnings: number;
  t: ReturnType<typeof getNd>;
}) {
  const items = [
    { label: "Components", value: components },
    { label: "Color tokens", value: colors },
    { label: "Warnings", value: warnings },
  ];
  return (
    <div
      style={{
        display: "flex",
        gap: 28,
        padding: "16px 18px",
        border: `1px solid ${t.border}`,
        borderRadius: swatchRadii.md,
        background: t.surfaceInk,
      }}
    >
      {items.map((it) => (
        <div key={it.label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span
            style={{
              fontFamily: editorialFonts.mono,
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: t.textDisabled,
            }}
          >
            {it.label}
          </span>
          <span
            style={{
              fontFamily: editorialFonts.body,
              fontSize: 20,
              fontWeight: 600,
              color: t.textDisplay,
            }}
          >
            {it.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function WarningList({
  warnings,
  t,
}: {
  warnings: ExtractionWarning[];
  t: ReturnType<typeof getNd>;
}) {
  return (
    <ul
      style={{
        margin: 0,
        padding: 16,
        border: `1px solid ${t.border}`,
        borderRadius: swatchRadii.md,
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {warnings.map((w, i) => (
        <li
          key={i}
          style={{
            fontFamily: editorialFonts.body,
            fontSize: 13,
            color: t.textSecondary,
            lineHeight: 1.5,
          }}
        >
          <span
            style={{
              fontFamily: editorialFonts.mono,
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: t.textDisabled,
              marginRight: 8,
            }}
          >
            {w.kind}
          </span>
          {w.message}
        </li>
      ))}
    </ul>
  );
}

function ComponentList({
  components,
  t,
}: {
  components: DSComponent[];
  t: ReturnType<typeof getNd>;
}) {
  return (
    <ul
      style={{
        margin: 0,
        padding: 0,
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        border: `1px solid ${t.border}`,
        borderRadius: swatchRadii.md,
        overflow: "hidden",
        background: t.surfaceInk,
      }}
    >
      {components.map((c, i) => (
        <li
          key={c.file}
          style={{
            padding: "10px 14px",
            borderTop: i === 0 ? "none" : `1px solid ${t.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            fontFamily: editorialFonts.body,
          }}
        >
          <span style={{ fontSize: 13, color: t.textPrimary }}>{c.name}</span>
          <span
            style={{
              fontFamily: editorialFonts.mono,
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
