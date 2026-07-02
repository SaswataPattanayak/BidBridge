import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Gavel } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) nav(loc.state?.from || "/dashboard");
    else setError(res.error);
  };

  return (
    <div className="mx-auto grid min-h-[80vh] max-w-7xl grid-cols-1 items-center gap-12 px-5 py-12 md:grid-cols-2 md:px-8">
      <div className="hidden md:block">
        <div className="mb-6 flex items-center gap-2 font-display text-3xl font-black">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-[#1C3F35] text-white"><Gavel className="h-5 w-5" /></span>
          BidBridge
        </div>
        <h1 className="font-display text-5xl font-black tracking-tight">
          Welcome back to the <span className="text-[#1C3F35]">saleroom.</span>
        </h1>
        <p className="mt-4 text-[#5C5C5C]">
          Sign in to place bids, list items, and track your active auctions.
        </p>
        <div className="mt-8 card-surface p-4 text-sm">
          <div className="overline mb-2 text-[#8A8A8A]">TRY IT INSTANTLY</div>
          <div className="grid grid-cols-1 gap-2 mono text-xs">
            <div>admin@bidbridge.com / Admin@12345</div>
            <div>seller@bidbridge.com / Seller@12345</div>
            <div>bidder@bidbridge.com / Bidder@12345</div>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="card-surface mx-auto w-full max-w-md p-8" data-testid="login-form">
        <div className="mb-6">
          <div className="overline mb-1 text-[#8A8A8A]">SIGN IN</div>
          <h2 className="font-display text-3xl font-bold">Welcome back</h2>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="login-email" autoComplete="email" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required data-testid="login-password" autoComplete="current-password" />
          </div>
          {error && <div className="rounded-md bg-[#CB5A3C]/10 px-3 py-2 text-sm text-[#CB5A3C]" data-testid="login-error">{error}</div>}
          <Button type="submit" disabled={loading} className="w-full bg-[#1C3F35] hover:bg-[#142D26]" data-testid="login-submit">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </div>
        <div className="mt-4 text-center text-sm text-[#5C5C5C]">
          New to BidBridge?{" "}
          <Link to="/register" className="font-semibold text-[#1C3F35] hover:underline" data-testid="login-to-register">
            Create an account
          </Link>
        </div>
      </form>
    </div>
  );
}
