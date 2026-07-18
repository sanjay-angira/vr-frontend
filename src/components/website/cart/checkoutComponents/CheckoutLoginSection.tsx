"use client";

/**
 * Checkout login step — same role as tid-web `LogInSection`:
 * inline WhatsApp OTP (not only a modal), advantages list, then Continue.
 */

import Link from "next/link";
import { Bell, Check, Star, Truck } from "lucide-react";
import { useAppSelector } from "@/services/redux/hooks";
import { useUserAuth } from "@/services/website/useUserAuth";
import { usePlaceOrderContext } from "@/components/website/cart/PlaceOrderFlowWrapper";
import LogInForm from "@/components/website/auth/LogInForm";

type CheckoutLoginSectionProps = {
  confirmed: boolean;
  onChange: () => void;
  onContinue: () => void;
};

const ADVANTAGES = [
  {
    icon: Truck,
    title: "Manage your orders",
    desc: "Track delivery and reorder faster next time",
  },
  {
    icon: Star,
    title: "Personalized experience",
    desc: "Saved addresses and wishlist on your account",
  },
  {
    icon: Bell,
    title: "Order updates",
    desc: "Get timely alerts on WhatsApp & SMS",
  },
] as const;

export function CheckoutLoginSection({
  confirmed,
  onChange,
  onContinue,
}: CheckoutLoginSectionProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.userAuth);
  const { logout } = useUserAuth();
  const { setConfirmDeliveryAddress } = usePlaceOrderContext();

  const handleLogout = () => {
    logout();
    setConfirmDeliveryAddress(null);
    onChange();
  };

  // Logged in + step confirmed → collapsed summary (tid "continue checkout" done)
  if (isAuthenticated && user && confirmed) {
    return (
      <div className="checkout-step checkout-step--done">
        <div className="checkout-step-head">
          <span className="checkout-step-num">1</span>
          <div className="checkout-step-title-row">
            <h3>Login or Signup</h3>
            <Check size={18} className="checkout-step-check" aria-hidden />
          </div>
          <button
            type="button"
            className="cart-clear-btn"
            onClick={() => {
              onChange();
              setConfirmDeliveryAddress(null);
            }}
          >
            Change
          </button>
        </div>
        <p className="checkout-step-meta">
          Hi <strong>{user.name || user.phone || user.email}</strong>
          {user.phone ? ` · ${user.phone}` : null}
        </p>
      </div>
    );
  }

  // Logged in but editing / not yet continued
  if (isAuthenticated && user) {
    return (
      <div className="checkout-step checkout-step--open">
        <div className="checkout-step-head">
          <span className="checkout-step-num">1</span>
          <h3>Login or Signup</h3>
        </div>
        <div className="checkout-login-panel">
          <div className="checkout-login-signed-in">
            <p className="checkout-step-meta">
              Signed in as{" "}
              <strong>{user.name || user.phone || user.email}</strong>
              {user.phone ? (
                <>
                  <br />
                  Phone: {user.phone}
                </>
              ) : null}
            </p>
            <button
              type="button"
              className="checkout-login-switch"
              onClick={handleLogout}
            >
              Logout &amp; sign in to another account
            </button>
            <button
              type="button"
              className="cart-btn cart-btn-primary"
              onClick={onContinue}
            >
              Continue Checkout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Guest — inline OTP login (tid LogInSection)
  return (
    <div className="checkout-step checkout-step--open">
      <div className="checkout-step-head">
        <span className="checkout-step-num">1</span>
        <h3>Login or Signup</h3>
      </div>

      <div className="checkout-login-panel">
        <div className="checkout-login-form-col">
          <p className="checkout-step-copy">
            Enter your mobile number to receive a WhatsApp OTP.
          </p>
          <LogInForm variant="inline" onSuccess={onContinue} />
          <div className="checkout-login-guest">
            <span>or</span>
            <button
              type="button"
              className="cart-btn cart-btn-secondary"
              onClick={onContinue}
            >
              Continue as guest
            </button>
          </div>
        </div>

        <aside className="checkout-login-advantages">
          <h4>Advantages of secure login</h4>
          <ul>
            {ADVANTAGES.map(({ icon: Icon, title, desc }) => (
              <li key={title}>
                <span className="checkout-login-advantage-icon" aria-hidden>
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                <div>
                  <strong>{title}</strong>
                  <p>{desc}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="checkout-login-new">
            New here?{" "}
            <Link href="/signup">Create an account</Link>
          </p>
        </aside>
      </div>
    </div>
  );
}
