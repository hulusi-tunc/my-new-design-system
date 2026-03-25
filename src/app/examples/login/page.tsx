"use client";

import { useState, useEffect, useCallback } from "react";
import { colors } from "@/styles/design-tokens";

// ── Shared helpers ───────────────────────────────

function Logo({ dark }: { dark?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: colors.brand[600], display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>O</span>
      </div>
      <span style={{ fontSize: 15, fontWeight: 600, color: dark ? colors.gray[300] : colors.gray[900] }}>Octopus</span>
    </div>
  );
}

function FormInput({ label, placeholder, type = "text", dark }: { label: string; placeholder: string; type?: string; dark?: boolean }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 14, fontWeight: 500, display: "block", marginBottom: 6, color: dark ? colors.gray[300] : colors.gray[700] }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={type === "password" ? "password1" : ""}
        style={{
          width: "100%", height: 44, borderRadius: 8, padding: "0 14px", fontSize: 14, outline: "none",
          border: `1px solid ${dark ? colors.gray[700] : colors.gray[300]}`,
          background: dark ? colors.gray[900] : "#fff",
          color: dark ? colors.gray[100] : colors.gray[900],
        }}
      />
    </div>
  );
}

function RememberRow({ dark }: { dark?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, fontSize: 14 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 8, color: dark ? colors.gray[300] : colors.gray[700], cursor: "pointer" }}>
        <input type="checkbox" style={{ width: 16, height: 16, accentColor: colors.brand[600] }} />
        Remember for 30 days
      </label>
      <span style={{ color: colors.brand[dark ? 400 : 700], fontWeight: 600, cursor: "pointer" }}>Forgot password</span>
    </div>
  );
}

function PrimaryBtn({ children }: { children: React.ReactNode }) {
  return (
    <button style={{ width: "100%", height: 44, borderRadius: 8, border: "none", background: colors.brand[600], color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 12 }}>
      {children}
    </button>
  );
}

function GoogleBtn({ dark }: { dark?: boolean }) {
  return (
    <button style={{
      width: "100%", height: 44, borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      border: `1px solid ${dark ? colors.gray[700] : colors.gray[300]}`,
      background: dark ? colors.gray[900] : "#fff",
      color: dark ? colors.gray[200] : colors.gray[700],
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
      Sign in with Google
    </button>
  );
}

function BottomLink({ dark }: { dark?: boolean }) {
  return (
    <p style={{ fontSize: 14, textAlign: "center", marginTop: 24, color: dark ? colors.gray[400] : colors.gray[500] }}>
      Don&apos;t have an account? <span style={{ color: colors.brand[dark ? 400 : 700], fontWeight: 600, cursor: "pointer" }}>Sign up</span>
    </p>
  );
}

function Stars() {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="#FDB022"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
      ))}
    </div>
  );
}

function PageFooter({ dark }: { dark?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 32px", fontSize: 12, color: dark ? colors.gray[600] : colors.gray[500] }}>
      <span>&copy; Octopus 2026</span>
    </div>
  );
}

// ── Login form (reused) ──────────────────────────
function LoginForm({ dark, centered }: { dark?: boolean; centered?: boolean }) {
  return (
    <div style={{ maxWidth: 360, width: "100%", textAlign: centered ? "center" : "left" }}>
      {centered && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: dark ? colors.gray[800] : colors.brand[50], border: `1px solid ${dark ? colors.gray[700] : colors.brand[100]}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: colors.brand[600] }} />
          </div>
        </div>
      )}
      <h1 style={{ fontSize: centered ? 24 : 28, fontWeight: 600, marginBottom: 6, color: dark ? colors.gray[50] : colors.gray[900] }}>
        {centered ? "Welcome back" : "Log in"}
      </h1>
      <p style={{ fontSize: 14, marginBottom: 28, color: dark ? colors.gray[400] : colors.gray[500] }}>
        Welcome back! Please enter your details.
      </p>
      <div style={{ textAlign: "left" }}>
        <FormInput label="Email" placeholder="Enter your email" dark={dark} />
        <FormInput label="Password" placeholder="••••••••" type="password" dark={dark} />
        <RememberRow dark={dark} />
        <PrimaryBtn>Sign in</PrimaryBtn>
        <GoogleBtn dark={dark} />
      </div>
      <BottomLink dark={dark} />
    </div>
  );
}

// ── Pattern 1: Centered with tabs (dark) ─────────
function CenteredTabs() {
  const [tab, setTab] = useState<"signup" | "login">("login");
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: colors.gray[950] }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: 360, width: "100%", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: colors.gray[800], border: `1px solid ${colors.gray[700]}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: colors.brand[600] }} />
            </div>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: colors.gray[50], marginBottom: 6 }}>Log in to your account</h1>
          <p style={{ fontSize: 14, color: colors.gray[400], marginBottom: 20 }}>Welcome back! Please enter your details.</p>

          {/* Tabs */}
          <div style={{ display: "flex", borderRadius: 8, border: `1px solid ${colors.gray[700]}`, marginBottom: 24, overflow: "hidden" }}>
            {(["signup", "login"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: "8px 0", fontSize: 14, fontWeight: 600, cursor: "pointer", border: "none",
                background: tab === t ? colors.gray[800] : "transparent",
                color: tab === t ? colors.gray[100] : colors.gray[500],
              }}>
                {t === "signup" ? "Sign up" : "Log in"}
              </button>
            ))}
          </div>

          <div style={{ textAlign: "left" }}>
            <FormInput label="Email" placeholder="Enter your email" dark />
            <FormInput label="Password" placeholder="••••••••" type="password" dark />
            <RememberRow dark />
            <PrimaryBtn>Sign in</PrimaryBtn>
            <GoogleBtn dark />
          </div>
          <BottomLink dark />
        </div>
      </div>
    </div>
  );
}

// ── Pattern 2: Split + app preview (dark) ────────
function SplitPreviewDark() {
  return (
    <div style={{ height: "100%", display: "flex", background: colors.gray[950] }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 24 }}><Logo dark /></div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 48px" }}>
          <LoginForm dark />
        </div>
        <PageFooter dark />
      </div>
      <div style={{ width: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: colors.gray[900] }}>
        <div style={{ width: 320, height: 400, borderRadius: 16, border: `1px solid ${colors.gray[700]}`, background: colors.gray[800], display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: colors.gray[600], fontSize: 13 }}>App preview</span>
        </div>
      </div>
    </div>
  );
}

// ── Pattern 3: Split + testimonial + preview (dark)
function SplitTestimonialPreview() {
  return (
    <div style={{ height: "100%", display: "flex", background: colors.gray[950] }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 24 }}><Logo dark /></div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 48px" }}>
          <LoginForm dark />
        </div>
        <PageFooter dark />
      </div>
      <div style={{ width: "50%", display: "flex", flexDirection: "column" }}>
        {/* Testimonial */}
        <div style={{ padding: "48px 48px 24px" }}>
          <p style={{ fontSize: 22, lineHeight: 1.5, fontWeight: 500, color: colors.gray[100], marginBottom: 20 }}>
            &ldquo;Few things make me feel more powerful than setting up automations to make my life easier.&rdquo;
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 600, color: colors.gray[200] }}>Aliah Lane</div>
              <div style={{ fontSize: 14, color: colors.gray[400] }}>Founder, Layers.io</div>
            </div>
            <Stars />
          </div>
        </div>
        {/* Preview */}
        <div style={{ flex: 1, margin: "0 24px 24px", borderRadius: 12, border: `1px solid ${colors.gray[700]}`, background: colors.gray[800], display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: colors.gray[600], fontSize: 13 }}>App preview</span>
        </div>
      </div>
    </div>
  );
}

// ── Pattern 4: Split + hero image (dark) ─────────
function SplitHeroImage() {
  return (
    <div style={{ height: "100%", display: "flex", background: colors.gray[950] }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <LoginForm dark centered />
      </div>
      <div style={{ width: "50%", background: `linear-gradient(135deg, ${colors.brand[800]}, ${colors.brand[600]})`, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "0 0 0 0" }}>
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>Hero image</div>
      </div>
    </div>
  );
}

// ── Pattern 5: Testimonial left + form right (dark)
function TestimonialLeft() {
  return (
    <div style={{ height: "100%", display: "flex", background: colors.gray[950] }}>
      <div style={{ width: "50%", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 24 }}><Logo dark /></div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 48px", textAlign: "center" }}>
          <p style={{ fontSize: 24, lineHeight: 1.5, fontWeight: 500, color: colors.gray[100], marginBottom: 24, maxWidth: 400 }}>
            &ldquo;We&apos;ve been using Octopus to kick start every new project and can&apos;t imagine working without it.&rdquo;
          </p>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: colors.gray[700], marginBottom: 12 }} />
          <div style={{ fontWeight: 600, color: colors.gray[200] }}>Pippa Wilkinson</div>
          <div style={{ fontSize: 14, color: colors.gray[400], marginBottom: 16 }}>Head of Design, Layers</div>
          <Stars />
        </div>
        <PageFooter dark />
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: colors.gray[900] }}>
        <LoginForm dark centered />
      </div>
    </div>
  );
}

// ── Pattern 6: Form left + photo testimonial right
function PhotoTestimonialRight() {
  return (
    <div style={{ height: "100%", display: "flex", background: colors.gray[950] }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 24 }}><Logo dark /></div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 48px" }}>
          <LoginForm dark />
        </div>
        <PageFooter dark />
      </div>
      <div style={{ width: "50%", background: `linear-gradient(180deg, ${colors.gray[700]}, ${colors.gray[800]})`, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 32, borderRadius: "16px 0 0 0", margin: "16px 16px 16px 0" }}>
        <p style={{ fontSize: 22, lineHeight: 1.5, fontWeight: 500, color: "#fff", marginBottom: 16 }}>
          &ldquo;Octopus has saved us thousands of hours of work. We&apos;re able to ship faster.&rdquo;
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontWeight: 600, color: "#fff" }}>Lulu Meyers</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>Product Manager, Hourglass</div>
          </div>
          <Stars />
        </div>
      </div>
    </div>
  );
}

// ── Pattern 7: Form left + photo close-up ────────
function PhotoCloseup() {
  return (
    <div style={{ height: "100%", display: "flex", background: colors.gray[950] }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 24 }}><Logo dark /></div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 48px" }}>
          <LoginForm dark />
        </div>
        <PageFooter dark />
      </div>
      <div style={{ width: "50%", background: `linear-gradient(135deg, ${colors.gray[600]}, ${colors.gray[500]})`, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 32, margin: "16px 16px 16px 0", borderRadius: 16 }}>
        <p style={{ fontSize: 22, lineHeight: 1.5, fontWeight: 500, color: "#fff", marginBottom: 16 }}>
          &ldquo;We&apos;ve been using Octopus to kick start every new project and can&apos;t imagine working without it.&rdquo;
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontWeight: 600, color: "#fff" }}>Amélie Laurent</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>Lead Designer, Layers</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["←", "→"].map((a, i) => (
              <div key={i} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer", fontSize: 14 }}>{a}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Fullscreen overlay ───────────────────────────
function FullscreenOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  const handleEsc = useCallback((e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }, [onClose]);
  useEffect(() => {
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handleEsc); document.body.style.overflow = ""; };
  }, [handleEsc]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column" }} onClick={onClose}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "12px 16px", flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
          Close <span style={{ opacity: 0.4, fontSize: 11 }}>ESC</span>
        </button>
      </div>
      <div style={{ flex: 1, margin: "0 16px 16px", borderRadius: 12, overflow: "hidden" }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function ExpandIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>;
}

// ── Page ─────────────────────────────────────────
const patterns = [
  { id: "centered-tabs", label: "Centered + Tabs" },
  { id: "split-preview", label: "Split + Preview" },
  { id: "split-testimonial-preview", label: "Testimonial + Preview" },
  { id: "split-hero", label: "Split + Hero" },
  { id: "testimonial-left", label: "Testimonial Left" },
  { id: "photo-testimonial", label: "Photo + Quote" },
  { id: "photo-closeup", label: "Photo Close-up" },
] as const;

type PatternId = typeof patterns[number]["id"];

function renderPattern(id: PatternId) {
  switch (id) {
    case "centered-tabs": return <CenteredTabs />;
    case "split-preview": return <SplitPreviewDark />;
    case "split-testimonial-preview": return <SplitTestimonialPreview />;
    case "split-hero": return <SplitHeroImage />;
    case "testimonial-left": return <TestimonialLeft />;
    case "photo-testimonial": return <PhotoTestimonialRight />;
    case "photo-closeup": return <PhotoCloseup />;
  }
}

export default function LoginExamplesPage() {
  const [active, setActive] = useState<PatternId>("centered-tabs");
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div className="px-10 py-14 max-w-5xl">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Login Pages</h1>
      <p className="text-[14px] text-neutral-500 dark:text-neutral-400 leading-relaxed mb-8 max-w-lg">
        Dark-themed login page patterns with email/password, social login,
        testimonials, and visual panels.
      </p>

      {/* Tabs + fullscreen */}
      <div className="flex items-center gap-2 mb-6 border-b border-neutral-100 dark:border-neutral-800 pb-2">
        <div className="flex gap-1 flex-1 flex-wrap">
          {patterns.map(p => (
            <button
              key={p.id}
              onClick={() => setActive(p.id)}
              className={`px-3 py-1.5 rounded-md text-[12px] transition-colors cursor-pointer ${
                active === p.id
                  ? "text-neutral-900 dark:text-neutral-100 font-medium bg-neutral-100 dark:bg-neutral-800"
                  : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
              style={{ border: "none" }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setFullscreen(true)}
          className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors cursor-pointer shrink-0"
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500, background: "none", border: "1px solid transparent" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "currentColor"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; }}
        >
          <ExpandIcon /> View full
        </button>
      </div>

      {/* Preview */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden" style={{ height: 600 }}>
        {renderPattern(active)}
      </div>

      {fullscreen && (
        <FullscreenOverlay onClose={() => setFullscreen(false)}>
          {renderPattern(active)}
        </FullscreenOverlay>
      )}

      {/* Pattern notes */}
      <div className="mt-10 space-y-4">
        <h2 className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-3">Pattern notes</h2>
        <pre className="text-[12px]"><code>{`All login patterns share:
  • Email + Password fields
  • "Remember for 30 days" checkbox + "Forgot password" link
  • Primary CTA ("Sign in") + Google social login
  • "Don't have an account? Sign up" footer link

Layout variants:
  centered-tabs      — Centered form with Sign up / Log in tab switcher
  split-preview      — Form left, app preview right
  testimonial-preview — Form left, testimonial + app preview right
  split-hero         — Centered form left, full hero image right
  testimonial-left   — Quote + avatar left, form right (reversed)
  photo-testimonial  — Form left, gradient panel with quote right
  photo-closeup      — Form left, rounded card with quote + nav arrows`}</code></pre>
      </div>
    </div>
  );
}
