import React from "react";
import { Link } from "react-router-dom";
import { Wallet, CreditCard, Banknote, Globe2, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Payment() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
      <div className="mb-8">
        <div className="overline mb-2 text-[#8A8A8A]">PAYMENTS & ESCROW</div>
        <h1 className="font-display text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">
          Payments, <span className="text-[#1C3F35]">held safely.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-[#5C5C5C] md:text-lg">
          Every winning bid runs through a PCI-compliant escrow flow. Buyers only pay when everything checks out. Sellers get paid on time.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="card-surface p-6 md:col-span-2">
          <h2 className="mb-3 font-display text-2xl font-bold">Payment made simple</h2>
          <p className="mb-3 text-[#111]">
            BidBridge holds the buyer's payment in <span className="font-semibold">escrow</span> from the moment the auction closes
            until you confirm the item was delivered as described. That protects buyers from bad listings and pays sellers
            promptly when everything checks out.
          </p>
          <p className="text-[#111]">
            We accept every major payment method used in India — UPI, cards, netbanking, and popular wallets — and every transaction
            runs over a PCI-compliant payment processor. BidBridge never stores your card number.
          </p>
        </div>
        <div className="space-y-4">
          <FeeCard label="BUYER'S PREMIUM" title="5% of hammer price" text="Applied on top of the winning bid at checkout." />
          <FeeCard label="SELLER FEE" title="3% of hammer price" text="Deducted from the payout — no listing fees." />
          <FeeCard label="PAYOUT TIME" title="Within 5 business days" text="After buyer confirms delivery." />
        </div>
      </div>

      <div className="mt-8">
        <h3 className="mb-3 font-display text-lg font-bold">Accepted payment methods</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4" data-testid="payment-methods-grid">
          <PaymentMethod icon={Wallet} label="UPI" tag="Instant" desc="Google Pay, PhonePe, BHIM, Paytm UPI, etc." />
          <PaymentMethod icon={CreditCard} label="Credit / Debit Card" tag="Popular" desc="Visa, Mastercard, RuPay, American Express." />
          <PaymentMethod icon={Banknote} label="Netbanking" tag="All banks" desc="Every major Indian bank supported." />
          <PaymentMethod icon={Globe2} label="International" tag="Coming soon" desc="Cross-border card + wire for global bidders." />
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="card-surface p-6">
          <h3 className="mb-2 font-display text-lg font-bold">How escrow works</h3>
          <ol className="space-y-2 text-sm">
            <li className="flex gap-2"><span className="mono font-bold text-[#1C3F35]">1.</span> <span>Buyer pays at checkout — funds are held by BidBridge, not the seller.</span></li>
            <li className="flex gap-2"><span className="mono font-bold text-[#1C3F35]">2.</span> <span>Seller ships within 3 business days and uploads tracking.</span></li>
            <li className="flex gap-2"><span className="mono font-bold text-[#1C3F35]">3.</span> <span>Buyer receives the parcel, inspects it, and confirms.</span></li>
            <li className="flex gap-2"><span className="mono font-bold text-[#1C3F35]">4.</span> <span>Funds are released to the seller minus the platform fee.</span></li>
          </ol>
        </div>
        <div className="card-surface p-6">
          <h3 className="mb-2 font-display text-lg font-bold">Security</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#2E6D4E]" /> <span>PCI-DSS compliant payment processor.</span></li>
            <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#2E6D4E]" /> <span>No card numbers stored on BidBridge servers.</span></li>
            <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#2E6D4E]" /> <span>3-D Secure (OTP) on every card transaction.</span></li>
            <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#2E6D4E]" /> <span>Buyer protection guarantee up to ₹1,00,000 per order.</span></li>
          </ul>
          <div className="mt-4 rounded-md border border-dashed border-[#CB5A3C]/40 p-3 text-xs text-[#5C5C5C]">
            <span className="font-semibold text-[#CB5A3C]">Note:</span> The current build ships with a <span className="font-semibold">mock checkout</span> for demonstration. Real payment processing will be wired via a PCI-compliant gateway before public launch.
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-[#1C3F35] p-6 text-white md:p-8">
        <div>
          <div className="overline mb-1 text-white/60">READY TO BID?</div>
          <div className="font-display text-2xl font-bold">Sign up in seconds. Bid with confidence.</div>
        </div>
        <Button asChild className="bg-[#CB5A3C] hover:bg-[#a94b32]" data-testid="payment-cta-register">
          <Link to="/register"><Sparkles className="mr-2 h-4 w-4" /> Create account</Link>
        </Button>
      </div>
    </div>
  );
}

function FeeCard({ label, title, text }) {
  return (
    <div className="card-surface p-5">
      <div className="overline mb-1 text-[#8A8A8A]">{label}</div>
      <div className="font-display text-lg font-bold">{title}</div>
      <p className="mt-1 text-sm text-[#5C5C5C]">{text}</p>
    </div>
  );
}

function PaymentMethod({ icon: Icon, label, tag, desc }) {
  return (
    <div className="card-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-[#1C3F35] text-white">
          <Icon className="h-4 w-4" />
        </span>
        <Badge variant="outline" className="text-[10px]">{tag}</Badge>
      </div>
      <div className="font-display font-bold">{label}</div>
      <div className="mt-1 text-xs text-[#5C5C5C]">{desc}</div>
    </div>
  );
}
