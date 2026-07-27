"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { AccountAddressesSkeleton } from "@/components/website/account/AccountSkeletons";
import {
  createUserAddress,
  deleteUserAddress,
  listUserAddresses,
  setDefaultUserAddress,
  updateUserAddress,
  type UserAddress,
  type UserAddressPayload,
} from "@/services/website/addressService";

const EMPTY_FORM: UserAddressPayload = {
  label: "",
  fullName: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

export function AccountAddressesContent() {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<UserAddressPayload>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  const loadAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listUserAddresses();
      setAddresses(rows);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load addresses",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAddresses();
  }, [loadAddresses]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const startCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const startEdit = (address: UserAddress) => {
    setEditingId(address.id);
    setForm({
      label: address.label || "",
      fullName: address.fullName,
      phone: address.phone,
      email: address.email || "",
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault,
    });
    setShowForm(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload: UserAddressPayload = {
        label: form.label?.trim() || undefined,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email?.trim() || undefined,
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2?.trim() || undefined,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        isDefault: Boolean(form.isDefault),
      };

      if (editingId) {
        await updateUserAddress(editingId, payload);
        toast.success("Address updated");
      } else {
        await createUserAddress(payload);
        toast.success("Address saved");
      }

      resetForm();
      await loadAddresses();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save address",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await deleteUserAddress(id);
      toast.success("Address deleted");
      await loadAddresses();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete address",
      );
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultUserAddress(id);
      toast.success("Default address updated");
      await loadAddresses();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update default",
      );
    }
  };

  return loading ? (
    <AccountAddressesSkeleton />
  ) : (
      <div className="account-addresses">
        <div className="account-addresses-toolbar">
          <p className="commerce-muted">
            Save multiple delivery addresses. Each can have a different name,
            phone, and email — useful when ordering for a relative.
          </p>
          <button
            type="button"
            className="cart-btn cart-btn-primary"
            onClick={startCreate}
          >
            Add address
          </button>
        </div>

        {showForm ? (
          <form className="commerce-form-grid account-address-form" onSubmit={handleSubmit}>
            <label>
              Label
              <input
                value={form.label || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="Home / Office / Relative"
              />
            </label>
            <label>
              Recipient full name
              <input
                required
                value={form.fullName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, fullName: e.target.value }))
                }
              />
            </label>
            <label>
              Phone
              <input
                required
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phone: e.target.value }))
                }
                inputMode="tel"
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email || ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </label>
            <label className="span-2">
              Address line 1
              <input
                required
                value={form.addressLine1}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, addressLine1: e.target.value }))
                }
              />
            </label>
            <label className="span-2">
              Address line 2
              <input
                value={form.addressLine2 || ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, addressLine2: e.target.value }))
                }
              />
            </label>
            <label>
              City
              <input
                required
                value={form.city}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, city: e.target.value }))
                }
              />
            </label>
            <label>
              State
              <input
                required
                value={form.state}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, state: e.target.value }))
                }
              />
            </label>
            <label>
              PIN code
              <input
                required
                value={form.pincode}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, pincode: e.target.value }))
                }
                inputMode="numeric"
              />
            </label>
            <label className="account-address-default">
              <input
                type="checkbox"
                checked={Boolean(form.isDefault)}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isDefault: e.target.checked }))
                }
              />
              Set as default address
            </label>
            <div className="span-2 account-address-form-actions">
              <button
                type="submit"
                className="cart-btn cart-btn-primary"
                disabled={saving}
              >
                {saving ? "Saving..." : editingId ? "Update address" : "Save address"}
              </button>
              <button
                type="button"
                className="cart-clear-btn"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        {addresses.length === 0 ? (
          <p className="commerce-muted">No saved addresses yet.</p>
        ) : (
          <ul className="account-address-list">
            {addresses.map((address) => (
              <li key={address.id} className="account-address-card">
                <div>
                  <strong>
                    {address.fullName}
                    {address.label ? ` · ${address.label}` : ""}
                    {address.isDefault ? " · Default" : ""}
                  </strong>
                  <p>
                    {address.phone}
                    {address.email ? ` · ${address.email}` : ""}
                  </p>
                  <p>
                    {address.addressLine1}
                    {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                    <br />
                    {address.city}, {address.state} — {address.pincode}
                  </p>
                </div>
                <div className="account-address-actions">
                  <button type="button" onClick={() => startEdit(address)}>
                    Edit
                  </button>
                  {!address.isDefault ? (
                    <button
                      type="button"
                      onClick={() => void handleSetDefault(address.id)}
                    >
                      Make default
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void handleDelete(address.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
  );
}
