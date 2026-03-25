"use client";

import { useState } from "react";
import { Input, type InputSize } from "@/components/ui/input";
import { Textarea, type TextareaSize } from "@/components/ui/textarea";
import { VerificationCodeInput, type VerificationCodeSize } from "@/components/ui/verification-code-input";

const inputSizes: InputSize[] = ["sm", "md"];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Preview({ children, col }: { children: React.ReactNode; col?: boolean }) {
  return (
    <div
      className="border border-neutral-100 dark:border-neutral-800 rounded-lg p-6 mb-3"
      style={{
        display: "flex",
        flexDirection: col ? "column" : "row",
        flexWrap: "wrap",
        alignItems: col ? "stretch" : "flex-start",
        gap: 16,
      }}
    >
      {children}
    </div>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="text-[12px]">
      <code>{children}</code>
    </pre>
  );
}

const MailIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="16" height="12" rx="2" />
    <path d="M2 6l8 5 8-5" />
  </svg>
);

const SearchIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="6" />
    <path d="M13.5 13.5L17 17" />
  </svg>
);

const HelpIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
);

const CountryDropdown = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#717680", cursor: "pointer", whiteSpace: "nowrap" }}>
    <span>🇺🇸</span>
    <span>US</span>
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4.5l3 3 3-3" />
    </svg>
  </div>
);

export default function InputsPage() {
  const [code4, setCode4] = useState("");
  const [code6, setCode6] = useState("");

  return (
    <div className="px-10 py-14 max-w-4xl">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Input</h1>
      <p className="text-[14px] text-neutral-500 dark:text-neutral-400 leading-relaxed mb-10 max-w-lg">
        Input fields allow users to enter text. They come in 2 sizes and support
        labels, hints, errors, icons, text addons, and dropdown addons.
      </p>

      {/* Sizes */}
      <Section title="Sizes">
        <Preview>
          {inputSizes.map((s) => (
            <div key={s} style={{ width: 320 }}>
              <Input inputSize={s} placeholder={`Size ${s}`} />
            </div>
          ))}
        </Preview>
        <div className="text-[12px] text-neutral-400 dark:text-neutral-500 font-mono mb-3 flex gap-6">
          <span>sm — 40px</span>
          <span>md — 44px</span>
        </div>
        <Code>{`<Input inputSize="sm" placeholder="Small" />
<Input inputSize="md" placeholder="Medium" />`}</Code>
      </Section>

      {/* With label & hint */}
      <Section title="Label & hint">
        <Preview>
          <div style={{ width: 320 }}>
            <Input label="Email" hint="This is a hint text to help the user." placeholder="olivia@untitledui.com" />
          </div>
          <div style={{ width: 320 }}>
            <Input label="Email" hint="This is a hint text to help the user." placeholder="olivia@untitledui.com" inputSize="md" />
          </div>
        </Preview>
        <Code>{`<Input label="Email" hint="This is a hint text." placeholder="olivia@untitledui.com" />`}</Code>
      </Section>

      {/* With leading icon */}
      <Section title="Leading icon">
        <Preview>
          <div style={{ width: 320 }}>
            <Input label="Email" leadingIcon={<MailIcon />} placeholder="olivia@untitledui.com" hint="This is a hint text to help the user." />
          </div>
          <div style={{ width: 320 }}>
            <Input label="Search" leadingIcon={<SearchIcon />} placeholder="Search..." />
          </div>
        </Preview>
        <Code>{`<Input label="Email" leadingIcon={<MailIcon />} placeholder="olivia@untitledui.com" />`}</Code>
      </Section>

      {/* With trailing icon */}
      <Section title="Trailing icon">
        <Preview>
          <div style={{ width: 320 }}>
            <Input label="Email" trailingIcon={<HelpIcon />} placeholder="olivia@untitledui.com" hint="This is a hint text to help the user." />
          </div>
        </Preview>
        <Code>{`<Input label="Email" trailingIcon={<HelpIcon />} placeholder="olivia@untitledui.com" />`}</Code>
      </Section>

      {/* With both icons */}
      <Section title="Both icons">
        <Preview>
          <div style={{ width: 320 }}>
            <Input label="Email" leadingIcon={<MailIcon />} trailingIcon={<HelpIcon />} placeholder="olivia@untitledui.com" hint="This is a hint text to help the user." />
          </div>
        </Preview>
        <Code>{`<Input leadingIcon={<MailIcon />} trailingIcon={<HelpIcon />} placeholder="olivia@untitledui.com" />`}</Code>
      </Section>

      {/* Text addons */}
      <Section title="Text addons">
        <Preview>
          <div style={{ width: 320 }}>
            <Input label="Website" leadingText="https://" placeholder="www.untitledui.com" hint="This is a hint text to help the user." />
          </div>
          <div style={{ width: 320 }}>
            <Input label="Website" trailingText=".com" placeholder="untitledui" hint="This is a hint text to help the user." />
          </div>
        </Preview>
        <Code>{`<Input label="Website" leadingText="https://" placeholder="www.untitledui.com" />
<Input label="Website" trailingText=".com" placeholder="untitledui" />`}</Code>
      </Section>

      {/* Leading dropdown */}
      <Section title="Leading dropdown">
        <Preview>
          <div style={{ width: 320 }}>
            <Input label="Phone number" leadingDropdown={<CountryDropdown />} placeholder="+1 (555) 000-0000" hint="This is a hint text to help the user." />
          </div>
        </Preview>
        <Code>{`<Input label="Phone number" leadingDropdown={<CountryDropdown />} placeholder="+1 (555) 000-0000" />`}</Code>
      </Section>

      {/* Error states */}
      <Section title="Error states">
        <Preview>
          <div style={{ width: 320 }}>
            <Input label="Email" placeholder="olivia@untitledui.com" error="This is an error message." />
          </div>
          <div style={{ width: 320 }}>
            <Input label="Email" leadingIcon={<MailIcon />} placeholder="olivia@untitledui.com" error="This is an error message." />
          </div>
        </Preview>
        <Preview>
          <div style={{ width: 320 }}>
            <Input label="Website" leadingText="https://" placeholder="www.untitledui.com" error="Please enter a valid URL." />
          </div>
          <div style={{ width: 320 }}>
            <Input label="Phone number" leadingDropdown={<CountryDropdown />} placeholder="+1 (555) 000-0000" error="Please enter a valid phone number." />
          </div>
        </Preview>
        <Code>{`<Input label="Email" error="This is an error message." placeholder="olivia@untitledui.com" />`}</Code>
      </Section>

      {/* Disabled */}
      <Section title="Disabled">
        <Preview>
          <div style={{ width: 320 }}>
            <Input label="Email" placeholder="olivia@untitledui.com" disabled hint="This is a hint text to help the user." />
          </div>
          <div style={{ width: 320 }}>
            <Input label="Email" leadingIcon={<MailIcon />} placeholder="olivia@untitledui.com" disabled />
          </div>
        </Preview>
        <Code>{`<Input label="Email" placeholder="olivia@untitledui.com" disabled />`}</Code>
      </Section>

      {/* Filled */}
      <Section title="Filled">
        <Preview>
          <div style={{ width: 320 }}>
            <Input label="Email" defaultValue="olivia@untitledui.com" hint="This is a hint text to help the user." />
          </div>
          <div style={{ width: 320 }}>
            <Input label="Email" leadingIcon={<MailIcon />} trailingIcon={<HelpIcon />} defaultValue="olivia@untitledui.com" />
          </div>
        </Preview>
      </Section>

      {/* ── Textarea ────────────────────────────── */}
      <div className="pt-10 mt-10 border-t border-neutral-100 dark:border-neutral-800">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Textarea</h1>
        <p className="text-[14px] text-neutral-500 dark:text-neutral-400 leading-relaxed mb-10 max-w-lg">
          Multiline text input. Supports labels, hints, error messages,
          and resizing. Available in 2 sizes.
        </p>
      </div>

      {/* Textarea sizes */}
      <Section title="Textarea — Sizes">
        <Preview col>
          {(["sm", "md"] as TextareaSize[]).map((s) => (
            <div key={s} style={{ width: 400 }}>
              <Textarea textareaSize={s} label={`Size ${s}`} placeholder="Enter a description..." hint="This is a hint text to help the user." />
            </div>
          ))}
        </Preview>
        <Code>{`<Textarea textareaSize="sm" label="Description" placeholder="Enter a description..." />`}</Code>
      </Section>

      {/* Textarea error */}
      <Section title="Textarea — Error">
        <Preview>
          <div style={{ width: 400 }}>
            <Textarea label="Description" placeholder="Enter a description..." error="This field is required." />
          </div>
        </Preview>
        <Code>{`<Textarea label="Description" error="This field is required." />`}</Code>
      </Section>

      {/* Textarea disabled */}
      <Section title="Textarea — Disabled">
        <Preview>
          <div style={{ width: 400 }}>
            <Textarea label="Description" placeholder="Enter a description..." disabled hint="This is a hint text to help the user." />
          </div>
        </Preview>
        <Code>{`<Textarea label="Description" disabled />`}</Code>
      </Section>

      {/* Textarea filled */}
      <Section title="Textarea — Filled">
        <Preview>
          <div style={{ width: 400 }}>
            <Textarea label="Description" defaultValue="This is a sample description that has been pre-filled." hint="This is a hint text to help the user." />
          </div>
        </Preview>
      </Section>

      {/* ── Verification Code Input ────────────────────────────── */}
      <div className="pt-10 mt-10 border-t border-neutral-100 dark:border-neutral-800">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Verification Code Input</h1>
        <p className="text-[14px] text-neutral-500 dark:text-neutral-400 leading-relaxed mb-10 max-w-lg">
          Single-digit code inputs for OTP, 2FA, and verification flows.
          Supports auto-advance, paste, and backspace navigation.
        </p>
      </div>

      {/* Verification — 6 digits */}
      <Section title="Verification — 6 digits">
        <Preview>
          <VerificationCodeInput length={6} value={code6} onChange={setCode6} hint="We sent a code to your email." />
        </Preview>
        <Code>{`<VerificationCodeInput length={6} value={code} onChange={setCode} />`}</Code>
      </Section>

      {/* Verification — 4 digits */}
      <Section title="Verification — 4 digits">
        <Preview>
          <VerificationCodeInput length={4} value={code4} onChange={setCode4} hint="Enter your 4-digit code." />
        </Preview>
        <Code>{`<VerificationCodeInput length={4} value={code} onChange={setCode} />`}</Code>
      </Section>

      {/* Verification — Sizes */}
      <Section title="Verification — Sizes">
        <Preview col>
          <VerificationCodeInput length={6} size="sm" label="Small (sm)" hint="48×48px digit boxes." />
          <VerificationCodeInput length={6} size="md" label="Medium (md)" hint="64×64px digit boxes." />
        </Preview>
        <Code>{`<VerificationCodeInput size="sm" />
<VerificationCodeInput size="md" />`}</Code>
      </Section>

      {/* Verification — Error */}
      <Section title="Verification — Error">
        <Preview>
          <VerificationCodeInput length={6} error="Verification code is invalid." value="123456" />
        </Preview>
        <Code>{`<VerificationCodeInput error="Verification code is invalid." />`}</Code>
      </Section>

      {/* Verification — Disabled */}
      <Section title="Verification — Disabled">
        <Preview>
          <VerificationCodeInput length={6} disabled hint="Code entry is currently disabled." />
        </Preview>
        <Code>{`<VerificationCodeInput disabled />`}</Code>
      </Section>

      {/* Verification — Filled */}
      <Section title="Verification — Filled">
        <Preview>
          <VerificationCodeInput length={6} value="328591" hint="Code entered successfully." />
        </Preview>
      </Section>

      {/* Usage */}
      <section className="pt-8 border-t border-neutral-100 dark:border-neutral-800">
        <h2 className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-3">
          Usage
        </h2>
        <Code>{`import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { VerificationCodeInput } from "@/components/ui/verification-code-input"

// Basic input
<Input label="Email" placeholder="you@example.com" />

// With icons
<Input leadingIcon={<MailIcon />} trailingIcon={<HelpIcon />} placeholder="olivia@untitledui.com" />

// Text addon
<Input leadingText="https://" placeholder="www.example.com" />

// Error state
<Input label="Email" error="Invalid email address." />

// Textarea
<Textarea label="Description" rows={4} />

// Verification code
<VerificationCodeInput length={6} value={code} onChange={setCode} onComplete={handleSubmit} />`}</Code>
      </section>
    </div>
  );
}
