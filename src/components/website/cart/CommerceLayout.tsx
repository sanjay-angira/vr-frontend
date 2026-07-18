"use client";

import type { ReactNode } from "react";

type CommerceEmptyState = {
  icon: ReactNode;
  title: string;
  description: string;
  action: ReactNode;
};

type CommerceLayoutProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  headerAction?: ReactNode;
  error?: string | null;
  loadingMessage?: string | null;
  empty?: CommerceEmptyState | null;
  children?: ReactNode;
};

/**
 * Left-column chrome only (header / empty / loading).
 * Outer 2-col shell + OrderSummary come from PlaceOrderFlowWrapper (tid pattern).
 */
export function CommerceLayout({
  eyebrow,
  title,
  subtitle,
  headerAction,
  error,
  loadingMessage,
  empty,
  children,
}: CommerceLayoutProps) {
  if (loadingMessage) {
    return (
      <div className="place-order-main-loading">
        <p className="commerce-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="commerce-muted">{loadingMessage}</p>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="commerce-empty cart-empty">
        <span className="cart-empty-icon" aria-hidden>
          {empty.icon}
        </span>
        <h1>{empty.title}</h1>
        <p>{empty.description}</p>
        {empty.action}
      </div>
    );
  }

  return (
    <>
      <header className="commerce-header cart-header">
        <div>
          <p className="commerce-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {subtitle ? <p className="commerce-muted">{subtitle}</p> : null}
        </div>
        {headerAction}
      </header>

      {error ? <p className="commerce-alert error">{error}</p> : null}

      {children}
    </>
  );
}
