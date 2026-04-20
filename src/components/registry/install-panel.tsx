"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { getNd } from "@/lib/nothing-tokens";
import { getPlatformMeta } from "@/lib/platforms";
import { getSetupTemplate } from "@/lib/mcp/setup-templates";
import {
  Body,
  CopyCommand,
  Label,
  Stack,
} from "@/components/hub";
import type { DSManifest } from "@/lib/types";

export function InstallPanel({ manifest }: { manifest: DSManifest }) {
  const platformMeta = getPlatformMeta(manifest.platform);
  const template = getSetupTemplate(manifest.platform);
  const mcpCommand = `Install the "${manifest.slug}" design system from Hubera`;

  return (
    <Stack gap={8}>
      <Section
        title="Install via Claude Code"
        subtitle={`${platformMeta.longLabel} · v${manifest.version}`}
      >
        <Stack gap={3}>
          <Body tone="secondary" style={{ maxWidth: "60ch" }}>
            Connect your Claude Code to the Hubera MCP server, then ask it to
            install this design system. Claude Code will fetch the source files
            from {manifest.repository} and write them into your current project.
          </Body>
          <CopyCommand text={mcpCommand} />
        </Stack>
      </Section>

      <Section title="Setup" subtitle="After the files are installed">
        <ol
          style={{
            margin: 0,
            paddingLeft: 20,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
            fontSize: 14,
            lineHeight: 1.55,
          }}
        >
          {template.full.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </Section>

      <Section title="Path aliases">
        <Body tone="secondary">{template.importAliasNote}</Body>
      </Section>
    </Stack>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const t = getNd(theme);
  return (
    <section>
      <header
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 16,
          borderBottom: `1px solid ${t.border}`,
          paddingBottom: 10,
          marginBottom: 14,
        }}
      >
        <Label>{title}</Label>
        {subtitle && <Label tone="disabled">{subtitle}</Label>}
      </header>
      {children}
    </section>
  );
}
