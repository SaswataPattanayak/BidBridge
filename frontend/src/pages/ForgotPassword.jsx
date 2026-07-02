import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api, formatApiErrorDetail } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Gavel, Copy, Check, KeyRound } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { message, dev_reset_url, dev_token }
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setResult(data);
      toast.success("Reset link generated", { description: "Check the details below to continue." });
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!result?.dev_reset_url) return;
    try {
      await navigator.clipboard.writeText(result.dev_reset_url);
      setCopied(true);
      toast.message("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
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
          Locked out? <span className="text-[#1C3F35]">Let's get you back in.</span>
        </h1>
        <p className="mt-4 text-[#5C5C5C]">
          Enter your account email — bidder, seller or admin — and we'll generate a one-time reset link valid for 30 minutes.
        </p>
      </div>

      {!result ? (
        <form onSubmit={submit} className="card-surface mx-auto w-full max-w-md p-8" data-testid="forgot-form">
          <div className="mb-6">
            <div className="overline mb-1 text-[#8A8A8A]">FORGOT PASSWORD</div>
            <h2 className="font-display text-3xl font-bold">Reset your password</h2>
            <p className="mt-2 text-sm text-[#5C5C5C]">Works for bidder, seller, and admin accounts.</p>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fp-email">Account email</Label>
              <Input
                id="fp-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="forgot-email"
                autoComplete="email"
              />
            </div>
            {error && <div className="rounded-md bg-[#CB5A3C]/10 px-3 py-2 text-sm text-[#CB5A3C]" data-testid="forgot-error">{error}</div>}
            <Button type="submit" disabled={loading} className="w-full bg-[#1C3F35] hover:bg-[#142D26]" data-testid="forgot-submit">
              {loading ? "Generating..." : "Send reset link"}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm text-[#5C5C5C]">
            Remembered it?{" "}
            <Link to="/login" className="font-semibold text-[#1C3F35] hover:underline" data-testid="forgot-to-login">Back to sign in</Link>
          </div>
        </form>
      ) : (
        <div className="card-surface mx-auto w-full max-w-md p-8" data-testid="forgot-result">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-[#1C3F35]/10 text-[#1C3F35]">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="font-display text-2xl font-bold">Reset link ready</h2>
          <p className="mt-2 text-sm text-[#5C5C5C]">
            {result.message}
          </p>
          {result.dev_reset_url ? (
            <>
              <div className="mt-6 rounded-md border border-dashed border-[#1C3F35]/40 bg-[#F0EDE6]/60 p-4">
                <div className="overline mb-2 text-[#8A8A8A]">DEV MODE — NO EMAIL PROVIDER WIRED</div>
                <p className="mb-3 text-xs text-[#5C5C5C]">
                  Copy the link below or click it to jump straight to the reset page. Token expires in {result.expires_minutes} minutes.
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded-md bg-white px-2 py-1 mono text-[11px] text-[#111]" data-testid="forgot-reset-url">
                    {result.dev_reset_url}
                  </code>
                  <Button type="button" size="sm" variant="outline" onClick={copyLink} data-testid="forgot-copy">
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button asChild className="flex-1 bg-[#1C3F35] hover:bg-[#142D26]" data-testid="forgot-open-reset">
                  <Link to={new URL(result.dev_reset_url).pathname + new URL(result.dev_reset_url).search}>Open reset page →</Link>
                </Button>
                <Button variant="outline" onClick={() => { setResult(null); setEmail(""); }} data-testid="forgot-restart">
                  Try another email
                </Button>
              </div>
            </>
          ) : (
            <Button asChild className="mt-6 bg-[#1C3F35] hover:bg-[#142D26]">
              <Link to="/login">Back to sign in</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
