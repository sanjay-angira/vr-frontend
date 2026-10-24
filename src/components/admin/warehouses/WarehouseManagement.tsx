"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getData, patchData, postData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";

type WarehouseStatus =
  "PENDING" | "REGISTERED" | "FAILED" | "RECONCILIATION_REQUIRED";

type Warehouse = {
  id: number;
  brandId: number;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  country: string;
  pincode: string;
  registeredName: string;
  returnAddress: string;
  returnPin: string;
  returnCity: string;
  returnState: string;
  returnCountry: string;
  delhiveryWarehouseName: string | null;
  delhiveryWarehouseId: string | null;
  registrationStatus: WarehouseStatus;
  registrationError: string | null;
  registeredAt: string | null;
  isDefault: boolean;
  isActive: boolean;
};

type WarehouseFields = Omit<
  Warehouse,
  | "id"
  | "brandId"
  | "delhiveryWarehouseName"
  | "delhiveryWarehouseId"
  | "registrationStatus"
  | "registrationError"
  | "registeredAt"
  | "isDefault"
  | "isActive"
> & {
  isDefault: boolean;
  isActive: boolean;
};

const emptyFields: WarehouseFields = {
  name: "",
  contactName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  registeredName: "",
  returnAddress: "",
  returnPin: "",
  returnCity: "",
  returnState: "",
  returnCountry: "India",
  isDefault: false,
  isActive: true,
};

const inputClass =
  "mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:bg-zinc-100";

const fieldLabels: Array<{
  key: keyof WarehouseFields;
  label: string;
  type?: string;
  maxLength?: number;
  pattern?: string;
  providerManaged?: boolean;
}> = [
  {
    key: "name",
    label: "Warehouse name",
    maxLength: 120,
    providerManaged: true,
  },
  { key: "contactName", label: "Contact name", maxLength: 120 },
  {
    key: "email",
    label: "Email",
    type: "email",
    maxLength: 254,
    providerManaged: true,
  },
  {
    key: "phone",
    label: "Indian mobile number",
    pattern: "[6-9][0-9]{9}",
    providerManaged: true,
  },
  {
    key: "addressLine1",
    label: "Address line 1",
    maxLength: 255,
    providerManaged: true,
  },
  {
    key: "addressLine2",
    label: "Address line 2",
    maxLength: 255,
    providerManaged: true,
  },
  { key: "city", label: "City", maxLength: 100, providerManaged: true },
  { key: "state", label: "State", maxLength: 100, providerManaged: true },
  { key: "country", label: "Country", maxLength: 100, providerManaged: true },
  {
    key: "pincode",
    label: "PIN code",
    pattern: "[0-9]{6}",
    maxLength: 6,
    providerManaged: true,
  },
  {
    key: "registeredName",
    label: "Registered account name",
    maxLength: 150,
    providerManaged: true,
  },
  {
    key: "returnAddress",
    label: "Return address",
    maxLength: 500,
    providerManaged: true,
  },
  {
    key: "returnPin",
    label: "Return PIN code",
    pattern: "[0-9]{6}",
    maxLength: 6,
    providerManaged: true,
  },
  {
    key: "returnCity",
    label: "Return city",
    maxLength: 100,
    providerManaged: true,
  },
  {
    key: "returnState",
    label: "Return state",
    maxLength: 100,
    providerManaged: true,
  },
  {
    key: "returnCountry",
    label: "Return country",
    maxLength: 100,
    providerManaged: true,
  },
];

function toWarehouseFields(warehouse: Warehouse): WarehouseFields {
  return {
    name: warehouse.name,
    contactName: warehouse.contactName,
    email: warehouse.email,
    phone: warehouse.phone,
    addressLine1: warehouse.addressLine1,
    addressLine2: warehouse.addressLine2,
    city: warehouse.city,
    state: warehouse.state,
    country: warehouse.country,
    pincode: warehouse.pincode,
    registeredName: warehouse.registeredName,
    returnAddress: warehouse.returnAddress,
    returnPin: warehouse.returnPin,
    returnCity: warehouse.returnCity,
    returnState: warehouse.returnState,
    returnCountry: warehouse.returnCountry,
    isDefault: warehouse.isDefault,
    isActive: warehouse.isActive,
  };
}

function errorText(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "The request could not be completed.";
}

function getResult<T>(response: {
  data?: T;
  success?: boolean;
  message?: string;
}) {
  if (response.success === false) {
    throw new Error(response.message || "The request could not be completed.");
  }
  return response.data;
}

export function WarehouseManagement({ brandId }: { brandId: number }) {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [fields, setFields] = useState<WarehouseFields>(emptyFields);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadWarehouses = useCallback(async () => {
    try {
      const response = await getData(
        API_ENDPOINTS.WAREHOUSES.LIST_BY_BRAND(brandId),
      );
      setWarehouses(getResult<Warehouse[]>(response) ?? []);
      setError("");
    } catch (loadError) {
      setError(errorText(loadError));
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadWarehouses(), 0);
    return () => window.clearTimeout(timer);
  }, [loadWarehouses]);

  const registered = editing?.registrationStatus === "REGISTERED";

  const startEdit = (warehouse: Warehouse) => {
    setEditing(warehouse);
    setFields(toWarehouseFields(warehouse));
    setNotice("");
    setError("");
  };

  const resetForm = () => {
    setEditing(null);
    setFields(emptyFields);
    setError("");
    setNotice("");
  };

  const updateField = <K extends keyof WarehouseFields>(
    key: K,
    value: WarehouseFields[K],
  ) => setFields((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      if (editing) {
        await patchData(API_ENDPOINTS.WAREHOUSES.UPDATE(editing.id), fields);
        setNotice(
          registered
            ? "Local warehouse settings saved. Registered Delhivery address details cannot be edited here."
            : "Warehouse details updated.",
        );
      } else {
        const response = await postData(
          API_ENDPOINTS.WAREHOUSES.CREATE_FOR_BRAND(brandId),
          fields,
        );
        const saved = getResult<Warehouse>(response);
        setNotice(
          saved?.registrationStatus === "REGISTERED"
            ? "Warehouse was registered with Delhivery."
            : "Warehouse was saved. Check its registration status below.",
        );
        setFields(emptyFields);
      }
      await loadWarehouses();
    } catch (saveError) {
      setError(errorText(saveError));
      await loadWarehouses();
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (
    id: number,
    action: "default" | "status" | "sync",
    active?: boolean,
  ) => {
    if (actionBusy) return;
    setActionBusy(true);
    setError("");
    setNotice("");
    try {
      if (action === "default") {
        await patchData(API_ENDPOINTS.WAREHOUSES.SET_DEFAULT(id), {});
        setNotice("Default warehouse updated.");
      } else if (action === "status") {
        await patchData(API_ENDPOINTS.WAREHOUSES.STATUS(id), {
          isActive: active,
        });
        setNotice("Warehouse status updated.");
      } else {
        await postData(API_ENDPOINTS.WAREHOUSES.SYNC_DELHIVERY(id), {});
        setNotice("Delhivery registration completed.");
      }
      await loadWarehouses();
    } catch (actionError) {
      setError(errorText(actionError));
      await loadWarehouses();
    } finally {
      setActionBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <button
          type="button"
          onClick={() => router.push(`/admin/brands/edit/${brandId}`)}
          className="mb-2 text-sm font-medium text-zinc-500 hover:text-zinc-800"
        >
          ← Back to brand
        </button>
        <h1 className="text-2xl font-semibold text-zinc-900">
          Warehouse Management
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Create and manage brand dispatch locations. Registered Delhivery
          address fields are locked because no verified provider update endpoint
          is available.
        </p>
      </header>

      {(error || notice) && (
        <div
          role="status"
          className={`rounded-lg border px-4 py-3 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {error || notice}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <form
          onSubmit={submit}
          className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              {editing ? "Edit warehouse" : "Register a warehouse"}
            </h2>
            {registered && (
              <p className="mt-1 text-xs text-amber-800">
                Delhivery registration address fields cannot be changed through
                this form. Create a replacement location to change its address.
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {fieldLabels.map(
              ({ key, label, type, maxLength, pattern, providerManaged }) => {
                const required = key !== "addressLine2";
                return (
                  <label
                    key={key}
                    className="block text-sm font-medium text-zinc-700"
                  >
                    {label}
                    {required && <span className="text-red-500"> *</span>}
                    <input
                      required={required}
                      type={type ?? "text"}
                      value={String(fields[key] ?? "")}
                      onChange={(event) =>
                        updateField(key, event.target.value)
                      }
                      maxLength={maxLength}
                      pattern={pattern}
                      disabled={Boolean(
                        editing && registered && providerManaged,
                      )}
                      className={inputClass}
                    />
                  </label>
                );
              },
            )}
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-zinc-700">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={fields.isDefault}
                onChange={(event) =>
                  updateField("isDefault", event.target.checked)
                }
                disabled={Boolean(editing && registered && !editing.isDefault)}
              />
              Set as default after registration
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={fields.isActive}
                onChange={(event) =>
                  updateField("isActive", event.target.checked)
                }
                disabled={Boolean(editing && registered)}
              />
              Active
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editing
                  ? "Save changes"
                  : "Register warehouse"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">
            Brand warehouses
          </h2>
          {loading ? (
            <p className="text-sm text-zinc-500">Loading warehouses...</p>
          ) : warehouses.length === 0 ? (
            <p className="text-sm text-zinc-500">No warehouses added yet.</p>
          ) : (
            <div className="space-y-4">
              {warehouses.map((warehouse) => (
                <article
                  key={warehouse.id}
                  className="rounded-lg border border-zinc-200 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-zinc-900">
                        {warehouse.name}
                        {warehouse.isDefault && (
                          <span className="ml-2 rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">
                            Default
                          </span>
                        )}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-600">
                        {warehouse.addressLine1}
                        {warehouse.addressLine2
                          ? `, ${warehouse.addressLine2}`
                          : ""}
                        , {warehouse.city}, {warehouse.state}{" "}
                        {warehouse.pincode}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {warehouse.contactName} · {warehouse.phone} ·{" "}
                        {warehouse.email}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        warehouse.registrationStatus === "REGISTERED"
                          ? "bg-emerald-100 text-emerald-800"
                          : warehouse.registrationStatus === "FAILED"
                            ? "bg-red-100 text-red-800"
                            : warehouse.registrationStatus ===
                                "RECONCILIATION_REQUIRED"
                              ? "bg-amber-100 text-amber-900"
                              : "bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      {warehouse.registrationStatus.replaceAll("_", " ")}
                    </span>
                  </div>
                  {warehouse.registrationError && (
                    <p className="mt-2 text-sm text-red-700">
                      {warehouse.registrationError}
                    </p>
                  )}
                  {warehouse.delhiveryWarehouseName && (
                    <p className="mt-2 text-xs text-zinc-500">
                      Delhivery name: {warehouse.delhiveryWarehouseName}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={actionBusy}
                      onClick={() => startEdit(warehouse)}
                      className="rounded border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                    >
                      Edit
                    </button>
                    {warehouse.registrationStatus === "REGISTERED" &&
                      warehouse.isActive &&
                      !warehouse.isDefault && (
                        <button
                          type="button"
                          disabled={actionBusy}
                          onClick={() =>
                            void runAction(warehouse.id, "default")
                          }
                          className="rounded border border-emerald-700 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-50 disabled:opacity-50"
                        >
                          Make default
                        </button>
                      )}
                    {warehouse.registrationStatus === "REGISTERED" && (
                      <button
                        type="button"
                        disabled={actionBusy}
                        onClick={() =>
                          void runAction(
                            warehouse.id,
                            "status",
                            !warehouse.isActive,
                          )
                        }
                        className="rounded border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                      >
                        {warehouse.isActive ? "Deactivate" : "Activate"}
                      </button>
                    )}
                    {warehouse.registrationStatus === "FAILED" && (
                      <button
                        type="button"
                        disabled={actionBusy}
                        onClick={() => void runAction(warehouse.id, "sync")}
                        className="rounded border border-amber-500 px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-50 disabled:opacity-50"
                      >
                        Retry registration
                      </button>
                    )}
                    {warehouse.registrationStatus ===
                      "RECONCILIATION_REQUIRED" && (
                      <p className="self-center text-xs text-amber-900">
                        Check Delhivery before attempting any retry to avoid a
                        duplicate.
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
