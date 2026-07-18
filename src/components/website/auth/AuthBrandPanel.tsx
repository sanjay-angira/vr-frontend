"use client";

import { ShoppingBag, Heart, Gift } from "lucide-react";

const FEATURES = [
  {
    icon: ShoppingBag,
    title: "Quick & Easy Shopping",
    desc: "Save time and shop faster",
  },
  {
    icon: Heart,
    title: "Wishlist & Favorites",
    desc: "Keep track of what you love",
  },
  {
    icon: Gift,
    title: "Exclusive Offers",
    desc: "Get access to special deals",
  },
] as const;

const COPY = {
  login: {
    heading: "Welcome Back!",
    sub: (
      <>
        Login to explore a world of <strong>authentic products</strong> and{" "}
        <strong>divine experiences.</strong>
      </>
    ),
  },
  signup: {
    heading: "Looks like you're new here!",
    sub: (
      <>
        Sign up with your mobile number to get started with{" "}
        <strong>authentic products</strong> from Vrindavan.
      </>
    ),
  },
} as const;

type AuthBrandPanelProps = {
  variant?: "login" | "signup";
};

function MandalaCorner({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden
    >
      <circle cx="60" cy="60" r="54" stroke="currentColor" strokeWidth="0.6" opacity="0.35" />
      <circle cx="60" cy="60" r="40" stroke="currentColor" strokeWidth="0.5" opacity="0.28" />
      <circle cx="60" cy="60" r="26" stroke="currentColor" strokeWidth="0.5" opacity="0.22" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * Math.PI * 2) / 12;
        const x2 = 60 + Math.cos(a) * 54;
        const y2 = 60 + Math.sin(a) * 54;
        return (
          <line
            key={i}
            x1="60"
            y1="60"
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="0.4"
            opacity="0.2"
          />
        );
      })}
    </svg>
  );
}

function PeacockFeather({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 140" fill="none" aria-hidden>
      <path
        d="M40 8 C52 28 58 48 56 72 C54 96 48 118 40 132 C32 118 26 96 24 72 C22 48 28 28 40 8Z"
        fill="#0a5c3a"
        opacity="0.9"
      />
      <path
        d="M40 18 C48 34 52 50 50 70 C48 90 44 108 40 120 C36 108 32 90 30 70 C28 50 32 34 40 18Z"
        fill="#1a8f5a"
      />
      <ellipse cx="40" cy="52" rx="14" ry="18" fill="#0d3d28" />
      <ellipse cx="40" cy="50" rx="9" ry="12" fill="#2bb673" />
      <ellipse cx="40" cy="48" rx="5" ry="7" fill="#f0c14a" />
      <ellipse cx="40" cy="47" rx="2.5" ry="3.5" fill="#1a1a1a" />
      <path
        d="M40 68 L40 128"
        stroke="#0a2a1b"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M36 80 Q28 92 34 104 M44 80 Q52 92 46 104 M34 100 Q26 110 32 118 M46 100 Q54 110 48 118"
        stroke="#145c38"
        strokeWidth="1"
        fill="none"
        opacity="0.7"
      />
    </svg>
  );
}

function TempleSkyline({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 420 90" fill="none" aria-hidden>
      <path
        d="M0 90 L0 70 L18 70 L18 55 L28 48 L38 55 L38 70 L52 70 L52 48 L62 38 L72 48 L72 70 L88 70 L88 58 L98 50 L108 58 L108 70 L128 70 L128 42 L140 28 L152 42 L152 70 L170 70 L170 52 L182 40 L194 52 L194 70 L210 70 L210 35 L222 18 L234 35 L234 70 L255 70 L255 48 L268 32 L281 48 L281 70 L300 70 L300 55 L312 42 L324 55 L324 70 L345 70 L345 50 L358 36 L371 50 L371 70 L390 70 L390 58 L400 50 L410 58 L410 70 L420 70 L420 90 Z"
        fill="#c4a574"
        opacity="0.55"
      />
      <ellipse cx="95" cy="82" rx="28" ry="6" fill="#7eb8d4" opacity="0.45" />
      <ellipse cx="200" cy="84" rx="20" ry="5" fill="#7eb8d4" opacity="0.35" />
    </svg>
  );
}

export default function AuthBrandPanel({
  variant = "login",
}: AuthBrandPanelProps) {
  const copy = COPY[variant];

  return (
    <aside className="auth-brand-panel">
      <MandalaCorner className="auth-brand-mandala auth-brand-mandala--tl" />
      <MandalaCorner className="auth-brand-mandala auth-brand-mandala--br" />

      <div className="auth-brand-content">
        <div className="auth-brand-logo">
          <span className="auth-brand-mark" aria-hidden>
            <PeacockFeather className="auth-brand-logo-feather" />
          </span>
          <div className="auth-brand-logo-text">
            <span className="auth-brand-name">Vrindavan Rasa</span>
            <span className="auth-brand-tagline">Taste of Brij</span>
          </div>
        </div>

        <h2 className="auth-brand-heading">{copy.heading}</h2>
        <p className="auth-brand-sub">{copy.sub}</p>

        <ul className="auth-brand-features">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <li key={title} className="auth-brand-feature">
              <span className="auth-brand-feature-icon">
                <Icon size={16} strokeWidth={2} />
              </span>
              <span>
                <span className="auth-brand-feature-title">{title}</span>
                <span className="auth-brand-feature-desc">{desc}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="auth-brand-art" aria-hidden>
        <TempleSkyline className="auth-brand-skyline" />
        <PeacockFeather className="auth-brand-peacock" />
      </div>
    </aside>
  );
}
