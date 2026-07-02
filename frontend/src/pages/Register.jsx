import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Gavel } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", name: "", role: "bidder" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await register(form);
    setLoading(false);
    if (res.ok) nav("/dashboard");
    else setError(res.error);
  };

  const upd = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="mx-auto grid min-h-[80vh] max-w-7xl grid-cols-1 items-center gap-12 px-5 py-12 md:grid-cols-2 md:px-8">
      <div className="hidden md:block">
        <div className="mb-6 flex items-center gap-2 font-display text-3xl font-black">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-[#1C3F35] text-white"><Gavel className="h-5 w-5" /></span>
          BidBridge
        </div>
        <h1 className="font-display text-5xl font-black tracking-tight">
          Join the <span className="text-[#1C3F35]">marketplace</span> collectors trust.
        </h1>
        <p className="mt-4 text-[#5C5C5C]">
          Sign up in seconds. Bid, watch, or list your own items — all under one account.
        </p>
      </div>

      <form onSubmit={submit} className="card-surface mx-auto w-full max-w-md p-8" data-testid="register-form">
        <div className="mb-6">
          <div className="overline mb-1 text-[#8A8A8A]">CREATE ACCOUNT</div>
          <h2 className="font-display text-3xl font-bold">Join BidBridge</h2>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={form.name} onChange={upd("name")} required data-testid="register-name" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={upd("email")} required data-testid="register-email" />
          </div>
          <div>
            <Label htmlFor="password">Password (min 6 characters)</Label>
            <Input id="password" type="password" value={form.password} onChange={upd("password")} minLength={6} required data-testid="register-password" />
          </div>
          <div>
            <Label>I want to</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                { v: "bidder", label: "Bid on items" },
                { v: "seller", label: "Sell items" },
              ].map((opt) => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, role: opt.v }))}
                  className={`rounded-md border p-3 text-sm font-semibold transition ${
                    form.role === opt.v
                      ? "border-[#1C3F35] bg-[#1C3F35]/5 text-[#1C3F35]"
                      : "border-black/10 hover:border-black/30"
                  }`}
                  data-testid={`register-role-${opt.v}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {error && <div className="rounded-md bg-[#CB5A3C]/10 px-3 py-2 text-sm text-[#CB5A3C]" data-testid="register-error">{error}</div>}
          <Button type="submit" disabled={loading} className="w-full bg-[#1C3F35] hover:bg-[#142D26]" data-testid="register-submit">
            {loading ? "Creating..." : "Create account"}
          </Button>
        </div>
        <div className="mt-4 text-center text-sm text-[#5C5C5C]">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-[#1C3F35] hover:underline" data-testid="register-to-login">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
