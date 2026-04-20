"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts, swatchRadii } from "@/lib/nothing-tokens";
import { PLATFORMS } from "@/lib/platforms";
import type { DSPlatform } from "@/lib/types";

export function IngestNewClient() {
  const { theme } = useTheme();
  const t = getNd(theme);
  const router = useRouter();

  const [repoUrl, setRepoUrl] = useState("");
  const [platform, setPlatform] = useState<DSPlatform>("ios-swiftui");
  const [branch, setBranch] = useState("");
  const [subpath, setSubpath] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repoUrl: repoUrl.trim(),
        platform,
        branch: branch.trim() || undefined,
        subpath: subpath.trim() || undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? `Request failed (${res.status})`);
      setSubmitting(false);
      return;
    }

    const data = (await res.json()) as { jobId: string };
    router.push(`/ingest/${data.jobId}`);
  };

  const pageStyle: CSSProperties = {
    maxWidth: 720,
    margin: "0 auto",
    padding: "56px 32px 120px",
    color: t.textPrimary,
    fontFamily: editorialFonts.body,
  };

  const sectionStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
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
    padding: "12px 14px",
    fontSize: 14,
    fontFamily: editorialFonts.body,
    outline: "none",
    width: "100%",
  };

  const descStyle: CSSProperties = {
    fontSize: 13,
    color: t.textSecondary,
    lineHeight: 1.5,
  };

  return (
    <form onSubmit={handleSubmit} style={pageStyle}>
      <header style={{ marginBottom: 40 }}>
        <span
          style={{
            fontFamily: editorialFonts.mono,
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: t.textDisabled,
          }}
        >
          Import design system
        </span>
        <h1
          style={{
            margin: "8px 0 12px",
            fontFamily: editorialFonts.display,
            fontSize: 36,
            fontWeight: 500,
            lineHeight: 1.15,
            color: t.textDisplay,
          }}
        >
          Paste a repo, pick a platform, get a draft
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            lineHeight: 1.55,
            color: t.textSecondary,
            maxWidth: "60ch",
          }}
        >
          We&apos;ll walk the repo, extract tokens + components, and hand you a
          draft manifest to review before publishing to the registry.
        </p>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={sectionStyle}>
          <label htmlFor="repoUrl" style={labelStyle}>
            Repository URL
          </label>
          <input
            id="repoUrl"
            type="url"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            required
            autoFocus
            style={inputStyle}
          />
          <span style={descStyle}>Public GitHub repos only for now.</span>
        </div>

        <div style={sectionStyle}>
          <span style={labelStyle}>Platform</span>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 8,
            }}
          >
            {PLATFORMS.map((p) => (
              <PlatformCard
                key={p.slug}
                label={p.label}
                description={p.description}
                active={platform === p.slug}
                onSelect={() => setPlatform(p.slug)}
                t={t}
              />
            ))}
          </div>
          <span style={descStyle}>
            iOS · SwiftUI is fully supported today. Other platforms return an
            empty draft — you can still publish manually.
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          <div style={sectionStyle}>
            <label htmlFor="branch" style={labelStyle}>
              Branch (optional)
            </label>
            <input
              id="branch"
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
              style={inputStyle}
            />
          </div>
          <div style={sectionStyle}>
            <label htmlFor="subpath" style={labelStyle}>
              Subpath (optional)
            </label>
            <input
              id="subpath"
              type="text"
              value={subpath}
              onChange={(e) => setSubpath(e.target.value)}
              placeholder="packages/design-system"
              style={inputStyle}
            />
          </div>
        </div>

        {error && (
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
            {error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            paddingTop: 8,
          }}
        >
          <button
            type="submit"
            disabled={submitting || !repoUrl.trim()}
            style={{
              background: t.textDisplay,
              color: t.black,
              border: "none",
              borderRadius: swatchRadii.full,
              padding: "10px 20px",
              fontFamily: editorialFonts.body,
              fontSize: 13,
              fontWeight: 600,
              cursor: submitting ? "wait" : "pointer",
              opacity: submitting || !repoUrl.trim() ? 0.55 : 1,
              transition: "opacity 160ms ease",
            }}
          >
            {submitting ? "Starting…" : "Import repo"}
          </button>
          <span style={{ fontSize: 12, color: t.textDisabled }}>
            Needs you to be signed in.
          </span>
        </div>
      </div>
    </form>
  );
}

function PlatformCard({
  label,
  description,
  active,
  onSelect,
  t,
}: {
  label: string;
  description: string;
  active: boolean;
  onSelect: () => void;
  t: ReturnType<typeof getNd>;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 4,
        padding: "12px 14px",
        textAlign: "left",
        border: `1px solid ${active ? t.textDisplay : t.border}`,
        background: active ? t.surfaceRaised : t.surfaceInk,
        borderRadius: swatchRadii.md,
        cursor: "pointer",
        fontFamily: editorialFonts.body,
        color: t.textPrimary,
        transition: "border-color 120ms ease, background 120ms ease",
      }}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: active ? 600 : 500,
          color: t.textDisplay,
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 11, color: t.textSecondary, lineHeight: 1.35 }}>
        {description}
      </span>
    </button>
  );
}
