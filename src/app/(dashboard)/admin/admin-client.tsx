"use client";

import { useState, useTransition } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts } from "@/lib/nothing-tokens";
import {
  Eyebrow,
  PrimaryPill,
  SectionHeader,
} from "@/components/editorial";
import { approveUser, rejectUser } from "./actions";

export type AdminUser = {
  id: string;
  fullName: string | null;
  githubUsername: string | null;
  email: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  approvedAt: string | null;
};

type Tab = "pending" | "approved" | "rejected" | "all";

export function AdminClient({ users }: { users: AdminUser[] }) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const [tab, setTab] = useState<Tab>("pending");

  const filtered =
    tab === "all" ? users : users.filter((u) => u.status === tab);

  const counts = {
    pending: users.filter((u) => u.status === "pending").length,
    approved: users.filter((u) => u.status === "approved").length,
    rejected: users.filter((u) => u.status === "rejected").length,
    all: users.length,
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "approved", label: "Approved", count: counts.approved },
    { key: "rejected", label: "Rejected", count: counts.rejected },
    { key: "all", label: "All", count: counts.all },
  ];

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: "clamp(32px, 4vw, 56px) clamp(24px, 5vw, 72px) 96px",
        display: "flex",
        flexDirection: "column",
        gap: 40,
      }}
    >
      <SectionHeader
        eyebrow="Admin"
        title="User approvals"
      />

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 28,
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        {tabs.map((x) => {
          const active = tab === x.key;
          return (
            <button
              key={x.key}
              type="button"
              onClick={() => setTab(x.key)}
              style={{
                background: "transparent",
                border: "none",
                padding: "10px 0",
                marginBottom: -1,
                cursor: "pointer",
                fontFamily: editorialFonts.body,
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                color: active ? t.textDisplay : t.textSecondary,
                borderBottom: `2px solid ${
                  active ? t.textDisplay : "transparent"
                }`,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                transition: "color 200ms ease, border-color 200ms ease",
              }}
            >
              {x.label}
              <span
                style={{
                  fontFamily: editorialFonts.mono,
                  fontSize: 11,
                  color: t.textDisabled,
                }}
              >
                {x.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div
          style={{
            padding: "64px 0",
            textAlign: "center",
            color: t.textSecondary,
            fontFamily: editorialFonts.body,
            fontSize: 14,
          }}
        >
          No users in this view.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {filtered.map((u) => (
            <UserRow key={u.id} user={u} />
          ))}
        </div>
      )}
    </div>
  );
}

function UserRow({ user }: { user: AdminUser }) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const [isPending, startTransition] = useTransition();
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handle = (next: "approve" | "reject") => {
    setError(null);
    setAction(next);
    startTransition(async () => {
      try {
        if (next === "approve") {
          await approveUser(user.id);
        } else {
          await rejectUser(user.id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setAction(null);
      }
    });
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 24,
        alignItems: "center",
        padding: "20px 0",
        borderTop: `1px solid ${t.border}`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
        <div
          style={{
            fontFamily: editorialFonts.display,
            fontSize: 18,
            fontWeight: 500,
            color: t.textDisplay,
            letterSpacing: "-0.015em",
          }}
        >
          {user.fullName || user.githubUsername || user.email || "Unnamed"}
        </div>
        <div
          style={{
            fontFamily: editorialFonts.body,
            fontSize: 13,
            color: t.textSecondary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {user.email}
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <StatusPill status={user.status} t={t} />
          <Eyebrow tone="muted">
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </Eyebrow>
          {error ? <Eyebrow style={{ color: t.danger }}>! {error}</Eyebrow> : null}
        </div>
      </div>

      {user.status === "pending" ? (
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={() => handle("reject")}
            disabled={isPending}
            style={{
              background: "transparent",
              border: `1px solid ${t.borderVisible}`,
              borderRadius: 9999,
              padding: "10px 18px",
              fontFamily: editorialFonts.body,
              fontSize: 14,
              fontWeight: 500,
              color: t.textSecondary,
              cursor: isPending ? "not-allowed" : "pointer",
              transition:
                "color 200ms ease, border-color 200ms ease",
            }}
            onMouseEnter={(e) => {
              if (isPending) return;
              e.currentTarget.style.color = t.danger;
              e.currentTarget.style.borderColor = t.danger;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = t.textSecondary;
              e.currentTarget.style.borderColor = t.borderVisible;
            }}
          >
            {isPending && action === "reject" ? "Rejecting…" : "Reject"}
          </button>

          <PrimaryPill
            as="button"
            type="button"
            onClick={() => handle("approve")}
            disabled={isPending}
            trailingArrow={false}
          >
            {isPending && action === "approve" ? "Approving…" : "Approve"}
          </PrimaryPill>
        </div>
      ) : (
        <button
          type="button"
          onClick={() =>
            handle(user.status === "approved" ? "reject" : "approve")
          }
          disabled={isPending}
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: isPending ? "not-allowed" : "pointer",
            fontFamily: editorialFonts.mono,
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: t.textSecondary,
            transition: "color 200ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = t.textDisplay)}
          onMouseLeave={(e) => (e.currentTarget.style.color = t.textSecondary)}
        >
          {user.status === "approved" ? "Revoke" : "Re-approve"}
        </button>
      )}
    </div>
  );
}

function StatusPill({
  status,
  t,
}: {
  status: "pending" | "approved" | "rejected";
  t: ReturnType<typeof getNd>;
}) {
  const tone =
    status === "approved"
      ? t.success
      : status === "rejected"
      ? t.danger
      : t.warning;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: editorialFonts.mono,
        fontSize: 11,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: tone,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: 9999,
          background: tone,
        }}
      />
      {status}
    </span>
  );
}
