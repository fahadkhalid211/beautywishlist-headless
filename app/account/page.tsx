"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/components/account/AuthProvider";

export default function AccountPage() {
  const { user, loading, logout, refreshUser } = useAuth();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    address_1: "",
    address_2: "",
    city: "",
    state: "",
    postcode: "",
    country: "",
    phone: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/account/login");
    }
    if (user) {
      setForm({
        first_name: user.billing.first_name || user.first_name || "",
        last_name: user.billing.last_name || user.last_name || "",
        address_1: user.billing.address_1 || "",
        address_2: user.billing.address_2 || "",
        city: user.billing.city || "",
        state: user.billing.state || "",
        postcode: user.billing.postcode || "",
        country: user.billing.country || "",
        phone: user.billing.phone || "",
      });
    }
  }, [loading, user, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/account/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          billing: form,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Unable to save changes");
      }
      await refreshUser();
      setEditing(false);
    } catch (err: any) {
      setError(err.message || "Unable to save changes");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  function updateField(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-bg">
        <section className="mx-auto max-w-4xl px-6 py-24 text-center text-sm text-ink-soft">Loading...</section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg">
      <section className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-purple-600">Beauty Wishlist</p>
            <h1 className="mt-2 font-display text-4xl italic tracking-tight text-ink md:text-5xl">
              Hi, {user.first_name || user.billing.first_name || "there"}
            </h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-line px-4 py-2 text-xs font-medium text-ink-soft transition hover:border-rose-300 hover:text-rose-500"
          >
            Log Out
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/account/orders"
            className="flex items-center justify-between rounded-3xl border border-line bg-white p-6 transition hover:border-purple-300"
          >
            <div>
              <h2 className="font-display text-xl italic text-ink">Order History</h2>
              <p className="mt-1 text-sm text-ink-soft">View your past orders and their status</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>

          <div className="rounded-3xl border border-line bg-white p-6">
            <h2 className="font-display text-xl italic text-ink">Account Details</h2>
            <p className="mt-1 text-sm text-ink-soft">{user.email}</p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-line bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl italic text-ink">Default Address</h2>
            {!editing && (
              <button type="button" onClick={() => setEditing(true)} className="text-xs font-medium text-purple-700 hover:underline">
                Edit
              </button>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-600">
              {error}
            </div>
          )}

          {!editing ? (
            <div className="mt-4 space-y-1 text-sm text-ink-soft">
              {form.address_1 ? (
                <>
                  <p className="text-ink">{form.first_name} {form.last_name}</p>
                  <p>{form.address_1}{form.address_2 ? `, ${form.address_2}` : ""}</p>
                  <p>{form.city}, {form.state} {form.postcode}</p>
                  <p>{form.country} &middot; {form.phone}</p>
                </>
              ) : (
                <p>No address saved yet.</p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <TextField label="First name" value={form.first_name} onChange={(v) => updateField("first_name", v)} />
                <TextField label="Last name" value={form.last_name} onChange={(v) => updateField("last_name", v)} />
              </div>
              <TextField label="Address line 1" value={form.address_1} onChange={(v) => updateField("address_1", v)} />
              <TextField label="Address line 2" value={form.address_2} onChange={(v) => updateField("address_2", v)} />
              <div className="grid grid-cols-2 gap-4">
                <TextField label="City" value={form.city} onChange={(v) => updateField("city", v)} />
                <TextField label="Province / State" value={form.state} onChange={(v) => updateField("state", v)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <TextField label="Postcode" value={form.postcode} onChange={(v) => updateField("postcode", v)} />
                <TextField label="Country code" value={form.country} onChange={(v) => updateField("country", v.toUpperCase())} />
              </div>
              <TextField label="Phone" value={form.phone} onChange={(v) => updateField("phone", v)} />

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-full bg-purple-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-purple-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-full border border-line px-6 py-3 text-sm font-medium text-ink-soft transition hover:border-purple-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-soft">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line px-4 py-2.5 text-sm text-ink outline-none focus:border-purple-400"
      />
    </div>
  );
}
