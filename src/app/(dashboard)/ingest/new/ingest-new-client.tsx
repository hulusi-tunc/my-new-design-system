"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PLATFORMS } from "@/lib/platforms";
import {
  Button,
  Card,
  Display,
  Body,
  Label,
  Field,
  Input,
  Stack,
  Row,
  Container,
} from "@/components/hub";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd } from "@/lib/nothing-tokens";
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

  return (
    <Container width="md" style={{ paddingTop: 56, paddingBottom: 120 }}>
      <form onSubmit={handleSubmit}>
        <Stack gap={8}>
          <Stack gap={2}>
            <Label>Import design system</Label>
            <Display level={3}>Paste a repo, pick a platform, get a draft</Display>
            <Body tone="secondary" style={{ maxWidth: "60ch" }}>
              We&apos;ll walk the repo, extract tokens and components, and hand
              you a draft manifest to review before publishing to the registry.
            </Body>
          </Stack>

          <Field
            id="repoUrl"
            label="Repository URL"
            hint="Public GitHub repos only for now."
          >
            <Input
              id="repoUrl"
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              required
              autoFocus
            />
          </Field>

          <Stack gap={2}>
            <Label>Platform</Label>
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
                />
              ))}
            </div>
            <Body size="sm" tone="secondary">
              iOS · SwiftUI is fully supported today. Other platforms return an
              empty draft — you can still publish manually.
            </Body>
          </Stack>

          <Row gap={4}>
            <Field id="branch" label="Branch (optional)">
              <Input
                id="branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
              />
            </Field>
            <Field id="subpath" label="Subpath (optional)">
              <Input
                id="subpath"
                value={subpath}
                onChange={(e) => setSubpath(e.target.value)}
                placeholder="packages/design-system"
              />
            </Field>
          </Row>

          {error && (
            <Card tone="default" pad="md">
              <Body tone="display">{error}</Body>
            </Card>
          )}

          <Row gap={3}>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
              disabled={!repoUrl.trim() || submitting}
            >
              {submitting ? "Starting…" : "Import repo"}
            </Button>
            <Body size="sm" tone="disabled" style={{ color: t.textDisabled }}>
              Needs you to be signed in.
            </Body>
          </Row>
        </Stack>
      </form>
    </Container>
  );
}

function PlatformCard({
  label,
  description,
  active,
  onSelect,
}: {
  label: string;
  description: string;
  active: boolean;
  onSelect: () => void;
}) {
  const { theme } = useTheme();
  const t = getNd(theme);
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
        borderRadius: 6,
        cursor: "pointer",
        fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
        color: t.textPrimary,
        transition: "120ms cubic-bezier(0.2, 0.8, 0.2, 1)",
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
