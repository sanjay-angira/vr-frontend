import type { RazorpayCheckoutPayload } from "@/services/website/checkoutService";

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: RazorpayCheckoutPayload["prefill"];
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
};

type RazorpayInstance = {
  open: () => void;
  on: (
    event: "payment.failed",
    handler: (response: {
      error?: { description?: string; reason?: string };
    }) => void,
  ) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay requires a browser"));
  }
  if (window.Razorpay) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );
    if (existing) {
      if (window.Razorpay) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Razorpay")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(
  payload: RazorpayCheckoutPayload,
): Promise<RazorpaySuccessResponse> {
  await loadRazorpayScript();

  if (!window.Razorpay) {
    throw new Error("Razorpay SDK unavailable");
  }

  return new Promise((resolve, reject) => {
    let settled = false;

    const finish = (
      type: "resolve" | "reject",
      value: RazorpaySuccessResponse | Error,
    ) => {
      if (settled) return;
      settled = true;
      if (type === "resolve") {
        resolve(value as RazorpaySuccessResponse);
      } else {
        reject(value);
      }
    };

    const rzp = new window.Razorpay!({
      key: payload.keyId,
      amount: payload.amount,
      currency: payload.currency || "INR",
      name: payload.name || "Vrindavan Rasa",
      description: payload.description,
      order_id: payload.orderId,
      prefill: payload.prefill,
      theme: { color: "#0A2A1B" },
      handler: (response) => finish("resolve", response),
      modal: {
        // Razorpay often fires ondismiss after success when the modal closes.
        // Delay so a successful `handler` can settle the promise first.
        ondismiss: () => {
          window.setTimeout(() => {
            finish("reject", new Error("Payment cancelled"));
          }, 400);
        },
      },
    });

    rzp.on("payment.failed", (response) => {
      finish(
        "reject",
        new Error(
          response.error?.description ||
            response.error?.reason ||
            "Payment failed",
        ),
      );
    });

    rzp.open();
  });
}
