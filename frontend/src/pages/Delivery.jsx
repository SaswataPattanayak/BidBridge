import React from "react";
import { Link } from "react-router-dom";
import { Truck, Package, ShieldCheck, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Delivery() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
      <div className="mb-8">
        <div className="overline mb-2 text-[#8A8A8A]">SHIPPING & LOGISTICS</div>
        <h1 className="font-display text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">
          Delivery, <span className="text-[#1C3F35]">handled with care.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-[#5C5C5C] md:text-lg">
          From the moment an auction closes to the moment the parcel lands at your door, we make sure everything is tracked, insured, and on schedule.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="card-surface p-6 md:col-span-2">
          <h2 className="mb-3 font-display text-2xl font-bold">How delivery works</h2>
          <p className="mb-3 text-[#111]">
            Once an auction closes, the buyer completes payment via BidBridge checkout. The seller then has 3 business days
            to hand the item to a partner courier, and every parcel ships with door-to-door tracking that both buyer and
            seller can see from their dashboards.
          </p>
          <p className="text-[#111]">
            We support two flavours of delivery — <span className="font-semibold">Standard Courier</span> for most items,
            and <span className="font-semibold">White-Glove</span> for high-value or fragile lots (cars, art, furniture) where
            a two-person team handles pickup, transit and setup at your address.
          </p>
        </div>
        <div className="space-y-4">
          <TierCard label="STANDARD SHIPPING" title="4–7 business days" text="Within India, insured up to ₹50,000." />
          <TierCard label="EXPRESS" title="2–3 business days" text="Metro cities. Additional courier fee applies." />
          <TierCard label="WHITE-GLOVE" title="7–14 days" text="For high-value & oversized lots." />
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <DeliveryStep n="1" icon={Package} title="Seller packs & ships"
          text="Within 3 business days of payment, the seller hands the parcel to a partner courier and uploads a tracking number." />
        <DeliveryStep n="2" icon={Truck} title="In transit"
          text="Both buyer and seller see live tracking on their dashboards. We insure most parcels up to ₹50,000." />
        <DeliveryStep n="3" icon={ShieldCheck} title="Delivered & released"
          text="Once you confirm receipt (or 48 hours after delivery), BidBridge releases funds to the seller." />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="card-surface p-6">
          <h3 className="mb-2 font-display text-lg font-bold">Shipping fees</h3>
          <table className="w-full text-sm" data-testid="delivery-fees-table">
            <thead className="text-[#5C5C5C]">
              <tr><th className="pb-2 text-left">Zone</th><th className="pb-2 text-right">Standard</th><th className="pb-2 text-right">Express</th></tr>
            </thead>
            <tbody>
              <tr className="border-t border-black/5"><td className="py-2">Local (same state)</td><td className="mono text-right">₹120</td><td className="mono text-right">₹280</td></tr>
              <tr className="border-t border-black/5"><td className="py-2">Regional</td><td className="mono text-right">₹220</td><td className="mono text-right">₹420</td></tr>
              <tr className="border-t border-black/5"><td className="py-2">National</td><td className="mono text-right">₹380</td><td className="mono text-right">₹680</td></tr>
              <tr className="border-t border-black/5"><td className="py-2">Remote (NE / islands)</td><td className="mono text-right">₹520</td><td className="mono text-right">—</td></tr>
            </tbody>
          </table>
          <p className="mt-3 text-xs text-[#8A8A8A]">Fees shown are indicative — final courier fee is calculated at checkout based on parcel weight and destination pin code.</p>
        </div>
        <div className="card-surface p-6">
          <h3 className="mb-3 font-display text-lg font-bold">Return & refund policy</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2"><RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-[#1C3F35]" /> <span><span className="font-semibold">7-day return window</span> if item materially differs from listing description or arrives damaged.</span></li>
            <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#1C3F35]" /> <span>Refunds are processed to the original payment method within 5 business days of return receipt.</span></li>
            <li className="flex gap-2"><Package className="mt-0.5 h-4 w-4 shrink-0 text-[#1C3F35]" /> <span>Return shipping is <span className="font-semibold">free</span> when the fault lies with the seller.</span></li>
          </ul>
          <div className="mt-4 rounded-md bg-[#F0EDE6] p-3 text-xs text-[#5C5C5C]">
            Disputes are handled by the BidBridge moderation team — email <a className="font-semibold text-[#1C3F35] underline" href="mailto:disputes@bidbridge.com">disputes@bidbridge.com</a> with your auction ID.
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-[#1C3F35] p-6 text-white md:p-8">
        <div>
          <div className="overline mb-1 text-white/60">READY TO SELL?</div>
          <div className="font-display text-2xl font-bold">List an item — we'll handle the delivery flow.</div>
        </div>
        <Button asChild className="bg-[#CB5A3C] hover:bg-[#a94b32]" data-testid="delivery-cta-sell">
          <Link to="/register"><Sparkles className="mr-2 h-4 w-4" /> Start selling</Link>
        </Button>
      </div>
    </div>
  );
}

function TierCard({ label, title, text }) {
  return (
    <div className="card-surface p-5">
      <div className="overline mb-1 text-[#8A8A8A]">{label}</div>
      <div className="font-display text-lg font-bold">{title}</div>
      <p className="mt-1 text-sm text-[#5C5C5C]">{text}</p>
    </div>
  );
}

function DeliveryStep({ n, icon: Icon, title, text }) {
  return (
    <div className="card-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="mono text-3xl font-black text-[#1C3F35]">{n}</span>
        <span className="grid h-9 w-9 place-items-center rounded-md bg-[#F0EDE6] text-[#1C3F35]">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <h4 className="mb-1 font-display font-bold">{title}</h4>
      <p className="text-sm text-[#5C5C5C]">{text}</p>
    </div>
  );
}
