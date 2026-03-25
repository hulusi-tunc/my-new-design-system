"use client";

import { useState, useEffect, useCallback } from "react";
import { colors } from "@/styles/design-tokens";

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="mb-16">
      <h2 className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{title}</h2>
      <p className="text-[12px] text-neutral-400 dark:text-neutral-500 mb-4">{description}</p>
      {children}
    </section>
  );
}

function ExampleFrame({ children, height = 560 }: { children: React.ReactNode; height?: number }) {
  return (
    <div
      className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden"
      style={{ height }}
    >
      {children}
    </div>
  );
}

// Shared sub-components for the examples
function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: colors.brand[600], display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>O</span>
      </div>
      <span className="text-neutral-900 dark:text-neutral-100" style={{ fontSize: 15, fontWeight: 600 }}>Octopus</span>
    </div>
  );
}

function FormInput({ label, placeholder, type = "text", hint }: { label: string; placeholder: string; type?: string; hint?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label className="text-neutral-700 dark:text-neutral-300" style={{ fontSize: 14, fontWeight: 500, display: "block", marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
        style={{ width: "100%", height: 44, borderRadius: 8, padding: "0 14px", fontSize: 14, outline: "none" }}
      />
      {hint && <p className="text-neutral-500 dark:text-neutral-400" style={{ fontSize: 12, marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

function PrimaryBtn({ children }: { children: React.ReactNode }) {
  return (
    <button
      style={{
        width: "100%", height: 44, borderRadius: 8, border: "none",
        background: colors.brand[600], color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function SecondaryBtn({ children }: { children: React.ReactNode }) {
  return (
    <button
      className="border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900"
      style={{
        width: "100%", height: 44, borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}
    >
      {children}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
      <div className="bg-neutral-200 dark:bg-neutral-700" style={{ flex: 1, height: 1 }} />
      <span className="text-neutral-400 dark:text-neutral-500" style={{ fontSize: 12 }}>OR</span>
      <div className="bg-neutral-200 dark:bg-neutral-700" style={{ flex: 1, height: 1 }} />
    </div>
  );
}

function FooterLink() {
  return (
    <p className="text-neutral-500 dark:text-neutral-400" style={{ fontSize: 14, textAlign: "center", marginTop: 24 }}>
      Already have an account? <span style={{ color: colors.brand[700], fontWeight: 600, cursor: "pointer" }}>Log in</span>
    </p>
  );
}

function PageFooter() {
  return (
    <div className="border-t border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400" style={{ display: "flex", justifyContent: "space-between", padding: "16px 32px", fontSize: 12 }}>
      <span>&copy; Octopus 2026</span>
      <span>help@octopus.dev</span>
    </div>
  );
}

// ── Pattern 1: Centered minimal ──────────────────
function CenteredMinimal() {
  return (
    <div className="bg-white dark:bg-neutral-950" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 360, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: colors.brand[50], border: `1px solid ${colors.brand[100]}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: colors.brand[600] }} />
            </div>
          </div>
          <h1 className="text-neutral-900 dark:text-neutral-100" style={{ fontSize: 24, fontWeight: 600, marginBottom: 6 }}>Create an account</h1>
          <p className="text-neutral-500 dark:text-neutral-400" style={{ fontSize: 14, marginBottom: 24 }}>Start your 30-day free trial.</p>
          <FormInput label="" placeholder="Enter your email" />
          <PrimaryBtn>Get started</PrimaryBtn>
          <Divider />
          <SecondaryBtn><GoogleIcon /> Sign up with Google</SecondaryBtn>
          <FooterLink />
        </div>
      </div>
    </div>
  );
}

// ── Pattern 2: Split with preview ────────────────
function SplitWithPreview() {
  return (
    <div className="bg-white dark:bg-neutral-950" style={{ height: "100%", display: "flex" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 24 }}><Logo /></div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 48px" }}>
          <div style={{ maxWidth: 360 }}>
            <h1 className="text-neutral-900 dark:text-neutral-100" style={{ fontSize: 28, fontWeight: 600, marginBottom: 6 }}>Sign up</h1>
            <p className="text-neutral-500 dark:text-neutral-400" style={{ fontSize: 14, marginBottom: 28 }}>Start your 30-day free trial.</p>
            <FormInput label="Name" placeholder="Enter your name" />
            <FormInput label="Email" placeholder="Enter your email" />
            <FormInput label="Password" placeholder="Create a password" type="password" hint="Must be at least 8 characters." />
            <PrimaryBtn>Get started</PrimaryBtn>
            <div style={{ height: 12 }} />
            <SecondaryBtn><GoogleIcon /> Sign up with Google</SecondaryBtn>
            <FooterLink />
          </div>
        </div>
        <PageFooter />
      </div>
      <div className="bg-neutral-100 dark:bg-neutral-900" style={{ width: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800" style={{ width: 280, height: 360, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span className="text-neutral-300 dark:text-neutral-600" style={{ fontSize: 13 }}>App preview</span>
        </div>
      </div>
    </div>
  );
}

// ── Pattern 3: Split with testimonial ────────────
function SplitWithTestimonial() {
  return (
    <div className="bg-white dark:bg-neutral-950" style={{ height: "100%", display: "flex" }}>
      <div style={{ width: "50%", background: colors.brand[800], display: "flex", flexDirection: "column", justifyContent: "center", padding: 48, color: "#fff" }}>
        <div style={{ fontSize: 20, lineHeight: 1.5, fontWeight: 500, marginBottom: 32 }}>
          &ldquo;Octopus has saved us thousands of hours. We&apos;re able to ship features much faster.&rdquo;
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Alex Morgan</div>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Lead Designer, Acme Corp</div>
        </div>
        <div style={{ display: "flex", gap: 3, marginTop: 16 }}>
          {[1,2,3,4,5].map(i => (
            <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#FDB022"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 24, display: "flex", justifyContent: "flex-end" }}><Logo /></div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ maxWidth: 360, width: "100%" }}>
            <h1 className="text-neutral-900 dark:text-neutral-100" style={{ fontSize: 28, fontWeight: 600, marginBottom: 6 }}>Sign up</h1>
            <p className="text-neutral-500 dark:text-neutral-400" style={{ fontSize: 14, marginBottom: 28 }}>Start your 30-day free trial.</p>
            <FormInput label="Name" placeholder="Enter your name" />
            <FormInput label="Email" placeholder="Enter your email" />
            <FormInput label="Password" placeholder="Create a password" type="password" hint="Must be at least 8 characters." />
            <PrimaryBtn>Get started</PrimaryBtn>
            <div style={{ height: 12 }} />
            <SecondaryBtn><GoogleIcon /> Sign up with Google</SecondaryBtn>
            <FooterLink />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Pattern 4: Multi-step with sidebar ───────────
function MultiStep() {
  const [step, setStep] = useState(1);
  const steps = [
    { label: "Your details", description: "Provide your name and email" },
    { label: "Choose a password", description: "Choose a secure password" },
    { label: "Invite your team", description: "Start collaborating together" },
    { label: "Add your socials", description: "Share to your social accounts" },
  ];

  return (
    <div className="bg-white dark:bg-neutral-950" style={{ height: "100%", display: "flex" }}>
      {/* Step sidebar */}
      <div className="border-r border-neutral-200 dark:border-neutral-800" style={{ width: 280, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 24 }}><Logo /></div>
        <div style={{ padding: "16px 24px", flex: 1 }}>
          {steps.map((s, i) => {
            const isActive = step === i + 1;
            const isDone = step > i + 1;
            return (
              <button
                key={i}
                onClick={() => setStep(i + 1)}
                style={{
                  display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 0",
                  background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left",
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  border: `2px solid ${isActive ? colors.brand[600] : isDone ? colors.success[500] : "transparent"}`,
                  background: isDone ? colors.success[50] : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isDone ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.success[500]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  ) : (
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: isActive ? colors.brand[600] : colors.gray[300] }} />
                  )}
                </div>
                <div>
                  <div className={isActive ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-500 dark:text-neutral-400"} style={{ fontSize: 14, fontWeight: 600 }}>{s.label}</div>
                  <div className="text-neutral-400 dark:text-neutral-500" style={{ fontSize: 13 }}>{s.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form area */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: 360, width: "100%", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: colors.brand[50], border: `1px solid ${colors.brand[100]}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, background: colors.brand[600] }} />
            </div>
          </div>
          <h1 className="text-neutral-900 dark:text-neutral-100" style={{ fontSize: 24, fontWeight: 600, marginBottom: 6 }}>{steps[step - 1].label}</h1>
          <p className="text-neutral-500 dark:text-neutral-400" style={{ fontSize: 14, marginBottom: 28 }}>{steps[step - 1].description}</p>

          {step === 1 && (
            <>
              <FormInput label="Name" placeholder="Enter your name" />
              <FormInput label="Email" placeholder="Enter your email" />
            </>
          )}
          {step === 2 && (
            <>
              <FormInput label="Password" placeholder="Choose a password" type="password" />
              <FormInput label="Confirm" placeholder="Confirm password" type="password" />
            </>
          )}
          {step === 3 && (
            <>
              <FormInput label="Email 1" placeholder="teammate@company.com" />
              <FormInput label="Email 2" placeholder="teammate@company.com" />
            </>
          )}
          {step === 4 && (
            <>
              <FormInput label="Twitter" placeholder="@handle" />
              <FormInput label="LinkedIn" placeholder="linkedin.com/in/..." />
            </>
          )}

          <PrimaryBtn>{step < 4 ? "Continue" : "Complete"}</PrimaryBtn>

          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 24 }}>
            {steps.map((_, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: step === i + 1 ? colors.brand[600] : colors.gray[200], cursor: "pointer" }} onClick={() => setStep(i + 1)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab selector ─────────────────────────────────
const patterns = [
  { id: "centered", label: "Centered" },
  { id: "split-preview", label: "Split + Preview" },
  { id: "split-testimonial", label: "Split + Testimonial" },
  { id: "multi-step", label: "Multi-step" },
] as const;

type PatternId = typeof patterns[number]["id"];

function FullscreenOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [handleEsc]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", flexDirection: "column",
      }}
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          padding: "12px 16px", flexShrink: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 12px", borderRadius: 6,
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
          Close
          <span style={{ opacity: 0.4, fontSize: 11, marginLeft: 4 }}>ESC</span>
        </button>
      </div>

      {/* Content */}
      <div
        style={{ flex: 1, margin: "0 16px 16px", borderRadius: 12, overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function ExpandIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}

export default function ExamplesPage() {
  const [active, setActive] = useState<PatternId>("centered");
  const [fullscreen, setFullscreen] = useState(false);

  const activePattern = (
    <>
      {active === "centered" && <CenteredMinimal />}
      {active === "split-preview" && <SplitWithPreview />}
      {active === "split-testimonial" && <SplitWithTestimonial />}
      {active === "multi-step" && <MultiStep />}
    </>
  );

  return (
    <div className="px-10 py-14 max-w-5xl">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
        Sign Up Pages
      </h1>
      <p className="text-[14px] text-neutral-500 dark:text-neutral-400 leading-relaxed mb-8 max-w-lg">
        Reference patterns for authentication pages — built with Octopus tokens
        and components. Use these as starting points for your own flows.
      </p>

      {/* Pattern tabs + fullscreen button */}
      <div className="flex items-center gap-2 mb-6 border-b border-neutral-100 dark:border-neutral-800 pb-2">
        <div className="flex gap-1 flex-1">
          {patterns.map((p) => (
            <button
              key={p.id}
              onClick={() => setActive(p.id)}
              className={`px-3 py-1.5 rounded-md text-[13px] transition-colors cursor-pointer ${
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
          className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors cursor-pointer"
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "5px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500,
            background: "none", border: "1px solid transparent",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "currentColor"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "transparent"; }}
        >
          <ExpandIcon />
          View full
        </button>
      </div>

      {/* Active pattern */}
      <ExampleFrame height={active === "centered" ? 520 : 600}>
        {activePattern}
      </ExampleFrame>

      {/* Fullscreen overlay */}
      {fullscreen && (
        <FullscreenOverlay onClose={() => setFullscreen(false)}>
          {activePattern}
        </FullscreenOverlay>
      )}

      {/* Pattern descriptions */}
      <div className="mt-10 space-y-6">
        <Section
          title="Centered minimal"
          description="Single centered column. Logo/icon, heading, email field, CTA, social login divider. Best for simple email-first signups."
        >
          <pre className="text-[12px]"><code>{`// Layout: single centered column, max-width 360px
// Components: Input, Button (primary), SocialButton, Divider
// Tokens: brand/600 CTA, text-secondary for body, bg-primary`}</code></pre>
        </Section>

        <Section
          title="Split with preview"
          description="Form on the left, product screenshot or mockup on the right. Shows users what they'll get after signing up."
        >
          <pre className="text-[12px]"><code>{`// Layout: 50/50 split, form left, preview right
// Left: Logo top, vertically centered form, footer bottom
// Right: bg-secondary with centered app preview card`}</code></pre>
        </Section>

        <Section
          title="Split with testimonial"
          description="Branded panel with customer quote on the left, form on the right. Builds trust during signup."
        >
          <pre className="text-[12px]"><code>{`// Layout: 50/50 split, testimonial left, form right
// Left: brand/800 background, white text, star rating
// Right: standard form layout with logo top-right`}</code></pre>
        </Section>

        <Section
          title="Multi-step"
          description="Sidebar with step indicator, centered form area that changes per step. Good for onboarding flows that collect information progressively."
        >
          <pre className="text-[12px]"><code>{`// Layout: sidebar (280px) + centered form
// Sidebar: Logo, step list with active/done/pending states
// Form: icon, heading, description, inputs, CTA, dot indicators
// Steps: details → password → invite → socials`}</code></pre>
        </Section>
      </div>
    </div>
  );
}
