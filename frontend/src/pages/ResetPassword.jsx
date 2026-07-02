import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { api, formatApiErrorDetail } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Gavel, ShieldCheck } from "lucide-react";

export default function ResetPassword() {
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const [token, setToken] = useState(sp.get("token") || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setToken(sp.get("token") || "");
  }, [sp]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, new_password: password });
      setDone(true);
      toast.success("Password updated", { description: "You can now log in with your new password." });
      setTimeout(() => nav("/login", { replace: true }), 1800);
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid min-h-[80vh] max-w-7xl grid-cols-1 items-center gap-12 px-5 py-12 md:grid-cols-2 md:px-8">
      <div className="hidden md:block">
        <div className="mb-6 flex items-center gap-2 font-display text-3xl font-black">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-[#1C3F35] text-white"><Gavel className="h-5 w-5" /></span>
          BidBridge
        </div>
        <h1 className="font-display text-5xl font-black tracking-tight">
          Set a new <span className="text-[#1C3F35]">password.</span>
        </h1>
        <p className="mt-4 text-[#5C5C5C]">Choose something strong you'll remember. Six characters minimum.</p>
      </div>

      <form onSubmit={submit} className="card-surface mx-auto w-full max-w-md p-8" data-testid="reset-form">
        <div className="mb-6">
          <div className="overline mb-1 text-[#8A8A8A]">RESET PASSWORD</div>
          <h2 className="font-display text-3xl font-bold">Choose a new password</h2>
        </div>
        {done ? (
          <div className="rounded-md bg-[#2E6D4E]/10 p-4 text-center" data-testid="reset-success">
            <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-[#2E6D4E]/20 text-[#2E6D4E]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="font-semibold text-[#2E6D4E]">Password updated!</div>
            <div className="mt-1 text-sm text-[#5C5C5C]">Redirecting you to sign in...</div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="rp-token">Reset token</Label>
              <Input
                id="rp-token"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="mono text-xs"
                data-testid="reset-token"
              />
              <div className="mt-1 text-xs text-[#8A8A8A]">Prefilled from your reset link.</div>
            </div>
            <div>
              <Label htmlFor="rp-pass">New password</Label>
              <Input
                id="rp-pass"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="reset-password"
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label htmlFor="rp-confirm">Confirm password</Label>
              <Input
                id="rp-confirm"
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                data-testid="reset-confirm"
                autoComplete="new-password"
              />
            </div>
            {error && <div className="rounded-md bg-[#CB5A3C]/10 px-3 py-2 text-sm text-[#CB5A3C]" data-testid="reset-error">{error}</div>}
            <Button type="submit" disabled={loading} className="w-full bg-[#1C3F35] hover:bg-[#142D26]" data-testid="reset-submit">
              {loading ? "Updating..." : "Update password"}
            </Button>
            <div className="text-center text-sm text-[#5C5C5C]">
              <Link to="/login" className="font-semibold text-[#1C3F35] hover:underline">Back to sign in</Link>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
