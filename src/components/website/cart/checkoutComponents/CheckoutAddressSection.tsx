"use client";

import { FormEvent, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useAppSelector } from "@/services/redux/hooks";
import {
  usePlaceOrderContext,
  type DeliveryAddress,
} from "@/components/website/cart/PlaceOrderFlowWrapper";
import {
  addressToDeliveryFields,
  listUserAddresses,
  type UserAddress,
} from "@/services/website/addressService";

type CheckoutAddressSectionProps = {
  enabled: boolean;
  onEdit: () => void;
};

const EMPTY: DeliveryAddress = {
  customerName: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  notes: "",
};

export function CheckoutAddressSection({
  enabled,
  onEdit,
}: CheckoutAddressSectionProps) {
  const user = useAppSelector((state) => state.userAuth.user);
  const isAuthenticated = useAppSelector(
    (state) => state.userAuth.isAuthenticated,
  );
  const { confirmDeliveryAddress, setConfirmDeliveryAddress } =
    usePlaceOrderContext();
  const [form, setForm] = useState<DeliveryAddress>(EMPTY);
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    if (confirmDeliveryAddress) {
      setForm(confirmDeliveryAddress);
      return;
    }
    setForm((prev) => ({
      ...prev,
      customerName: prev.customerName || user?.name || "",
      phone: prev.phone || user?.phone || "",
      email: prev.email || user?.email || "",
    }));
  }, [user, confirmDeliveryAddress]);

  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      setSavedAddresses([]);
      return;
    }

    let cancelled = false;
    listUserAddresses()
      .then((rows) => {
        if (!cancelled) {
          setSavedAddresses(rows);
          setShowNewForm(rows.length === 0);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSavedAddresses([]);
          setShowNewForm(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, isAuthenticated]);

  const update = <K extends keyof DeliveryAddress>(
    key: K,
    value: DeliveryAddress[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value, addressId: undefined }));
  };

  const handleDeliverHere = (event: FormEvent) => {
    event.preventDefault();
    setConfirmDeliveryAddress({
      ...form,
      addressId: undefined,
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      email: form.email?.trim() || "",
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2?.trim() || "",
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      notes: form.notes?.trim() || "",
    });
  };

  const handleSelectSaved = (address: UserAddress) => {
    setConfirmDeliveryAddress({
      ...addressToDeliveryFields(address),
    });
  };

  const canSave =
    form.customerName.trim().length >= 2 &&
    form.phone.trim().length >= 10 &&
    form.addressLine1.trim().length >= 5 &&
    form.city.trim().length >= 2 &&
    form.state.trim().length >= 2 &&
    form.pincode.trim().length >= 6;

  if (!enabled && !confirmDeliveryAddress) {
    return (
      <div className="checkout-step checkout-step--locked">
        <div className="checkout-step-head">
          <span className="checkout-step-num">2</span>
          <h3>Delivery address</h3>
        </div>
        <p className="checkout-step-copy">Complete step 1 to continue.</p>
      </div>
    );
  }

  if (confirmDeliveryAddress) {
    const a = confirmDeliveryAddress;
    return (
      <div className="checkout-step checkout-step--done">
        <div className="checkout-step-head">
          <span className="checkout-step-num">2</span>
          <div className="checkout-step-title-row">
            <h3>Delivery address</h3>
            <Check size={18} className="checkout-step-check" aria-hidden />
          </div>
          <button type="button" className="cart-clear-btn" onClick={onEdit}>
            Change
          </button>
        </div>
        <div className="checkout-address-preview">
          <strong>{a.customerName}</strong>
          <span>{a.phone}</span>
          {a.email ? <span>{a.email}</span> : null}
          <p>
            {a.addressLine1}
            {a.addressLine2 ? `, ${a.addressLine2}` : ""}
            <br />
            {a.city}, {a.state} — {a.pincode}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-step checkout-step--open">
      <div className="checkout-step-head">
        <span className="checkout-step-num">2</span>
        <h3>Delivery address</h3>
      </div>

      {isAuthenticated && savedAddresses.length > 0 ? (
        <div className="checkout-saved-addresses">
          <p className="checkout-step-copy">
            Choose a saved address, or add a new one for a relative.
          </p>
          <ul className="checkout-saved-address-list">
            {savedAddresses.map((address) => (
              <li key={address.id}>
                <button
                  type="button"
                  className="checkout-saved-address-card"
                  onClick={() => handleSelectSaved(address)}
                >
                  <strong>
                    {address.fullName}
                    {address.label ? ` · ${address.label}` : ""}
                    {address.isDefault ? " · Default" : ""}
                  </strong>
                  <span>{address.phone}</span>
                  <span>
                    {address.addressLine1}
                    {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                  </span>
                  <span>
                    {address.city}, {address.state} — {address.pincode}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {!showNewForm ? (
            <button
              type="button"
              className="cart-clear-btn"
              onClick={() => setShowNewForm(true)}
            >
              Add new address
            </button>
          ) : null}
        </div>
      ) : null}

      {(!isAuthenticated || showNewForm || savedAddresses.length === 0) && (
        <form className="commerce-form-grid" onSubmit={handleDeliverHere}>
          <label>
            Recipient full name
            <input
              required
              value={form.customerName}
              onChange={(e) => update("customerName", e.target.value)}
              placeholder="Your name or relative name"
            />
          </label>
          <label>
            Phone
            <input
              required
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="10-digit mobile"
              inputMode="tel"
            />
          </label>
          <label className="span-2">
            Email (optional)
            <input
              type="email"
              value={form.email || ""}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label className="span-2">
            Address line 1
            <input
              required
              value={form.addressLine1}
              onChange={(e) => update("addressLine1", e.target.value)}
              placeholder="House / street"
            />
          </label>
          <label className="span-2">
            Address line 2
            <input
              value={form.addressLine2 || ""}
              onChange={(e) => update("addressLine2", e.target.value)}
              placeholder="Landmark (optional)"
            />
          </label>
          <label>
            City
            <input
              required
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            />
          </label>
          <label>
            State
            <input
              required
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
            />
          </label>
          <label>
            PIN code
            <input
              required
              value={form.pincode}
              onChange={(e) => update("pincode", e.target.value)}
              inputMode="numeric"
            />
          </label>
          <label className="span-2">
            Order notes
            <textarea
              rows={2}
              value={form.notes || ""}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Delivery instructions (optional)"
            />
          </label>
          <div className="span-2">
            <button
              type="submit"
              className="cart-btn cart-btn-primary"
              disabled={!canSave}
            >
              Deliver here
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
