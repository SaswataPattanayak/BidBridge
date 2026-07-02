import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Gavel, Building2, Mail, Phone, MapPin, Clock, Users, ShieldCheck,
  Zap, Bell, Heart, Star, ImagePlus, TrendingUp, Sparkles, HandCoins, Timer,
  Truck, CreditCard, Package, Wallet, Banknote, RefreshCw, Globe2,
} from "lucide-react";
import { Link } from "react-router-dom";
import ContactForm from "@/components/ContactForm";

const FEATURES = [
  {
    icon: Zap,
    title: "Real-time bidding",
    desc: "Bids propagate instantly via Socket.IO. Everyone in the auction room sees the current bid, bid count, and highest bidder change without refreshing.",
    tag: "Core",
  },
  {
    icon: Timer,
    title: "Soft-close protection",
    desc: "Any bid that lands in the final 60 seconds pushes the end time out by another 60 seconds — no more last-second sniping.",
    tag: "Fair-play",
  },
  {
    icon: Bell,
    title: "Instant notifications",
    desc: "In-app toasts + a notifications bell with unread count. Get pinged the moment you're outbid, when your item receives a new bid, or when you win.",
    tag: "Core",
  },
  {
    icon: Heart,
    title: "Watchlist",
    desc: "Bookmark auctions you're interested in without committing to a bid. Track them all from your dashboard.",
    tag: "Buyer",
  },
  {
    icon: ImagePlus,
    title: "Rich auction listings",
    desc: "Sellers can add multiple photos, a category, condition, min-bid increment, and precise start/end times.",
    tag: "Seller",
  },
  {
    icon: TrendingUp,
    title: "Smart filters & search",
    desc: "Filter by category, status (live / upcoming / ended), price range, and sort by ending soon, newest, or price.",
    tag: "Buyer",
  },
  {
    icon: Star,
    title: "Ratings & feedback",
    desc: "After winning an auction, buyers rate the seller (1-5 stars) and leave a comment. Reputation stays visible on every listing.",
    tag: "Trust",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    desc: "Three roles — Bidder, Seller, Admin — each with tailored dashboards. Sellers can't bid on their own items; admins can moderate.",
    tag: "Security",
  },
  {
    icon: Users,
    title: "Admin console",
    desc: "A dedicated dashboard for platform stats, user management, and auction moderation.",
    tag: "Admin",
  },
  {
    icon: HandCoins,
    title: "Winner checkout",
    desc: "Auction winners are guided through a mock checkout with buyer's-premium calculation and a post-purchase seller-rating flow.",
    tag: "Post-sale",
  },
];

const CONTACTS = [
  {
    icon: Mail,
    label: "General enquiries",
    value: "contact@bidbridge.com",
    href: "mailto:contact@bidbridge.com",
  },
  {
    icon: Mail,
    label: "Seller support",
    value: "sellers@bidbridge.com",
    href: "mailto:sellers@bidbridge.com",
  },
  {
    icon: Mail,
    label: "Bidder / buyer help",
    value: "help@bidbridge.com",
    href: "mailto:help@bidbridge.com",
  },
  {
    icon: Phone,
    label: "Support line",
    value: "+91 82606 65966",
    href: "tel:+918260665966",
  },
];

export default function About() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
      <div className="mb-8">
        <div className="overline mb-2 text-[#8A8A8A]">ABOUT THE PLATFORM</div>
        <h1 className="font-display text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">
          Everything about <span className="text-[#1C3F35]">BidBridge</span>
        </h1>
        <p className="mt-4 max-w-2xl text-[#5C5C5C] md:text-lg">
          A real-time online auction marketplace built for collectors, curators, and sellers who care about provenance and fairness.
        </p>
      </div>

      <Tabs defaultValue="about" className="w-full">
        <TabsList className="mb-6 h-auto flex-wrap gap-1" data-testid="about-tabs">
          <TabsTrigger value="about" data-testid="about-tab-about"><Building2 className="mr-2 h-4 w-4" />About</TabsTrigger>
          <TabsTrigger value="delivery" data-testid="about-tab-delivery"><Truck className="mr-2 h-4 w-4" />Delivery</TabsTrigger>
          <TabsTrigger value="payment" data-testid="about-tab-payment"><CreditCard className="mr-2 h-4 w-4" />Payment</TabsTrigger>
          <TabsTrigger value="features" data-testid="about-tab-features"><Sparkles className="mr-2 h-4 w-4" />Features</TabsTrigger>
          <TabsTrigger value="contact" data-testid="about-tab-contact"><Mail className="mr-2 h-4 w-4" />Contact</TabsTrigger>
          <TabsTrigger value="address" data-testid="about-tab-address"><MapPin className="mr-2 h-4 w-4" />Address</TabsTrigger>
        </TabsList>

        {/* -------- About tab -------- */}
        <TabsContent value="about" className="mt-2">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="card-surface p-6 md:col-span-2">
              <h2 className="mb-3 font-display text-2xl font-bold">Our story</h2>
              <p className="mb-3 text-[#111]">
                BidBridge started as a 6th-semester capstone project with a simple idea — most online auction platforms feel dated,
                slow, and untrustworthy. Bids arrive with a lag. Sellers gaming last-second snipes. Buyers left refreshing pages.
                We wanted to fix that.
              </p>
              <p className="mb-3 text-[#111]">
                So we built a marketplace where <span className="font-semibold">every bid is real-time</span>, every auction has
                <span className="font-semibold"> anti-sniping soft-close protection</span>, and every seller carries their
                reputation from one listing to the next. Transparent, fair, fast.
              </p>
              <p className="text-[#111]">
                Today BidBridge hosts curated auctions across watches, cars, art, furniture, electronics, and more —
                built on a modern real-time stack (React + FastAPI + MongoDB + Socket.IO) that scales to thousands of concurrent bidders.
              </p>
            </div>

            <div className="space-y-4">
              <div className="card-surface p-5">
                <div className="overline mb-1 text-[#8A8A8A]">MISSION</div>
                <p className="text-sm">Make online auctions <span className="font-semibold">fair, transparent, and exciting</span> for collectors and sellers alike.</p>
              </div>
              <div className="card-surface p-5">
                <div className="overline mb-1 text-[#8A8A8A]">FOUNDED</div>
                <p className="text-sm font-semibold">2023 · Odisha, India</p>
              </div>
              <div className="card-surface p-5">
                <div className="overline mb-1 text-[#8A8A8A]">STACK</div>
                <p className="mono text-xs text-[#5C5C5C]">React · FastAPI · MongoDB · Socket.IO</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Metric label="Auctions hosted" value="4.2K+" />
            <Metric label="Verified sellers" value="240" />
            <Metric label="Live bids / sec" value="12+" />
            <Metric label="Categories" value="8" />
          </div>

          <div className="mt-8 card-surface p-6">
            <h3 className="mb-3 font-display text-lg font-bold">Values we build by</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Value title="Fair by default" text="Every bid is logged, visible, and immutable. Soft-close protection prevents last-second sniping." />
              <Value title="Reputation earned" text="Sellers accumulate reviews from real buyers. No shill accounts, no purchased ratings." />
              <Value title="Real-time everything" text="Bids, notifications, and status transitions propagate instantly — no refreshing." />
            </div>
          </div>
        </TabsContent>

        {/* -------- Delivery tab -------- */}
        <TabsContent value="delivery" className="mt-2">
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
              <div className="card-surface p-5">
                <div className="overline mb-1 text-[#8A8A8A]">STANDARD SHIPPING</div>
                <div className="font-display text-lg font-bold">4–7 business days</div>
                <p className="mt-1 text-sm text-[#5C5C5C]">Within India, insured up to ₹50,000.</p>
              </div>
              <div className="card-surface p-5">
                <div className="overline mb-1 text-[#8A8A8A]">EXPRESS</div>
                <div className="font-display text-lg font-bold">2–3 business days</div>
                <p className="mt-1 text-sm text-[#5C5C5C]">Metro cities. Additional courier fee applies.</p>
              </div>
              <div className="card-surface p-5">
                <div className="overline mb-1 text-[#8A8A8A]">WHITE-GLOVE</div>
                <div className="font-display text-lg font-bold">7–14 days</div>
                <p className="mt-1 text-sm text-[#5C5C5C]">For high-value & oversized lots.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <DeliveryStep n="1" icon={Package} title="Seller packs & ships"
              text="Within 3 business days of payment, the seller hands the parcel to a partner courier and uploads a tracking number." />
            <DeliveryStep n="2" icon={Truck} title="In transit"
              text="Both buyer and seller see live tracking on their dashboards. We insure most parcels up to ₹50,000." />
            <DeliveryStep n="3" icon={ShieldCheck} title="Delivered & released"
              text="Once you confirm receipt (or 48 hours after delivery), BidBridge releases funds to the seller." />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="card-surface p-6">
              <h3 className="mb-2 font-display text-lg font-bold">Shipping fees</h3>
              <table className="w-full text-sm">
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
        </TabsContent>

        {/* -------- Payment tab -------- */}
        <TabsContent value="payment" className="mt-2">
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
              <div className="card-surface p-5">
                <div className="overline mb-1 text-[#8A8A8A]">BUYER'S PREMIUM</div>
                <div className="font-display text-lg font-bold">5% of hammer price</div>
                <p className="mt-1 text-sm text-[#5C5C5C]">Applied on top of the winning bid at checkout.</p>
              </div>
              <div className="card-surface p-5">
                <div className="overline mb-1 text-[#8A8A8A]">SELLER FEE</div>
                <div className="font-display text-lg font-bold">3% of hammer price</div>
                <p className="mt-1 text-sm text-[#5C5C5C]">Deducted from the payout — no listing fees.</p>
              </div>
              <div className="card-surface p-5">
                <div className="overline mb-1 text-[#8A8A8A]">PAYOUT TIME</div>
                <div className="font-display text-lg font-bold">Within 5 business days</div>
                <p className="mt-1 text-sm text-[#5C5C5C]">After buyer confirms delivery.</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="mb-3 font-display text-lg font-bold">Accepted payment methods</h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <PaymentMethod icon={Wallet} label="UPI" tag="Instant" desc="Google Pay, PhonePe, BHIM, Paytm UPI, etc." />
              <PaymentMethod icon={CreditCard} label="Credit / Debit Card" tag="Popular" desc="Visa, Mastercard, RuPay, American Express." />
              <PaymentMethod icon={Banknote} label="Netbanking" tag="All banks" desc="Every major Indian bank supported." />
              <PaymentMethod icon={Globe2} label="International" tag="Coming soon" desc="Cross-border card + wire for global bidders." />
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
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
        </TabsContent>

        {/* -------- Features tab -------- */}
        <TabsContent value="features" className="mt-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="overline mb-1 text-[#8A8A8A]">WHAT YOU GET</div>
              <h2 className="font-display text-2xl font-bold">10 core features</h2>
            </div>
            <Badge variant="outline" className="mono">{FEATURES.length} FEATURES</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="card-surface flex h-full flex-col gap-3 p-5" data-testid={`feature-card-${f.title.replace(/\s+/g, "-").toLowerCase()}`}>
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-md bg-[#1C3F35] text-white">
                      <Icon className="h-4 w-4" />
                    </span>
                    <Badge variant="outline" className="text-[10px]">{f.tag}</Badge>
                  </div>
                  <h3 className="font-display text-lg font-bold">{f.title}</h3>
                  <p className="text-sm text-[#5C5C5C]">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* -------- Contact tab -------- */}
        <TabsContent value="contact" className="mt-2">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="card-surface p-6">
                <h2 className="mb-4 font-display text-2xl font-bold">Get in touch</h2>
                <p className="mb-6 text-[#5C5C5C]">
                  We reply to most enquiries within one business day. For urgent auction issues, use the support line.
                </p>
                <div className="space-y-3">
                  {CONTACTS.map((c) => {
                    const Icon = c.icon;
                    return (
                      <a
                        key={c.value}
                        href={c.href}
                        className="flex items-start gap-3 rounded-md border border-black/10 p-3 transition hover:border-[#1C3F35] hover:bg-[#F0EDE6]/60"
                        data-testid={`contact-${c.label.replace(/\s+/g, "-").toLowerCase()}`}
                      >
                        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#F0EDE6] text-[#1C3F35]">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="overline text-[#8A8A8A]">{c.label}</div>
                          <div className="mono truncate text-sm font-semibold">{c.value}</div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>

              <div className="card-surface p-6">
                <h3 className="mb-4 font-display text-lg font-bold">Support hours</h3>
                <div className="mb-4 space-y-3">
                  <HoursRow icon={Clock} label="Mon – Fri" value="09:00 – 20:00 IST" />
                  <HoursRow icon={Clock} label="Saturday" value="10:00 – 18:00 IST" />
                  <HoursRow icon={Clock} label="Sunday" value="Closed (email only)" />
                </div>

                <h3 className="mb-3 mt-6 font-display text-lg font-bold">Departments</h3>
                <div className="space-y-2">
                  <DeptRow role="Seller onboarding" email="sellers@bidbridge.com" />
                  <DeptRow role="Bidder support" email="help@bidbridge.com" />
                  <DeptRow role="Disputes & moderation" email="disputes@bidbridge.com" />
                  <DeptRow role="Business partnerships" email="partners@bidbridge.com" />
                  <DeptRow role="Press & media" email="press@bidbridge.com" />
                </div>

                <div className="mt-6 rounded-md bg-[#1C3F35] p-4 text-white">
                  <div className="overline mb-1 text-white/70">FOR ADMINS</div>
                  <div className="text-sm">
                    Admin console lives at <Link to="/admin" className="underline">/admin</Link>. Contact submissions are viewable there.
                  </div>
                </div>
              </div>
            </div>

            <div>
              <ContactForm />
            </div>
          </div>
        </TabsContent>

        {/* -------- Address tab -------- */}
        <TabsContent value="address" className="mt-2">
          <div className="grid gap-6 md:grid-cols-5">
            <div className="card-surface p-6 md:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-md bg-[#1C3F35] text-white">
                  <Building2 className="h-4 w-4" />
                </span>
                <div>
                  <div className="overline text-[#8A8A8A]">HEADQUARTERS</div>
                  <div className="font-display text-lg font-bold">BidBridge HQ</div>
                </div>
              </div>
              <address className="not-italic text-[#111]">
                <div>037, 96(C), Charigharia Sahi</div>
                <div>Athmallik (NAC), Athmallik</div>
                <div>Angul, Odisha <span className="mono">759 125</span></div>
                <div>India</div>
              </address>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-[#1C3F35]" />
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Charigharia+Sahi+Athmallik+Angul+Odisha+759125"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#1C3F35] underline underline-offset-4"
                  data-testid="address-map-link"
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>

            <div className="card-surface p-6 md:col-span-3">
              <div className="mb-4">
                <div className="overline mb-1 text-[#8A8A8A]">REGIONAL PRESENCE</div>
                <h3 className="font-display text-lg font-bold">Where we operate</h3>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <RegionCard city="Athmallik" label="Headquarters" note="Engineering + operations" />
                <RegionCard city="Angul" label="Regional office" note="Business partnerships" />
                <RegionCard city="Bhubaneswar" label="Support hub" note="Seller onboarding" />
                <RegionCard city="Remote" label="Distributed" note="Support, moderation, QA" />
              </div>
              <div className="mt-6 rounded-md border border-dashed border-[#1C3F35]/30 p-4">
                <div className="overline mb-1 text-[#1C3F35]">MAILING ADDRESS</div>
                <p className="text-sm">
                  Please address all physical correspondence to the Athmallik HQ.
                  Include your BidBridge username or auction ID on the envelope for faster routing.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 card-surface overflow-hidden">
            <div className="border-b border-black/10 bg-[#F0EDE6]/40 px-6 py-3">
              <div className="overline text-[#8A8A8A]">MAP</div>
            </div>
            <div className="aspect-[16/6] w-full">
              <iframe
                title="BidBridge HQ map"
                src="https://www.google.com/maps?q=Charigharia+Sahi+Athmallik+Angul+Odisha+759125&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-[#1C3F35] p-6 text-white md:p-8">
        <div>
          <div className="overline mb-1 text-white/60">READY TO BID?</div>
          <div className="font-display text-2xl font-bold">Join the marketplace collectors trust.</div>
        </div>
        <div className="flex gap-3">
          <Button asChild className="bg-[#CB5A3C] hover:bg-[#a94b32]" data-testid="about-cta-register">
            <Link to="/register">Create account</Link>
          </Button>
          <Button asChild variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white" data-testid="about-cta-browse">
            <Link to="/auctions">Browse auctions</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="card-surface p-5 text-center">
      <div className="mono text-2xl font-bold text-[#1C3F35]">{value}</div>
      <div className="overline mt-1 text-[#8A8A8A]">{label}</div>
    </div>
  );
}

function Value({ title, text }) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-[#1C3F35] text-white">
          <Gavel className="h-3 w-3" />
        </span>
        <span className="font-display text-sm font-bold">{title}</span>
      </div>
      <p className="text-sm text-[#5C5C5C]">{text}</p>
    </div>
  );
}

function HoursRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm">
        <Icon className="h-4 w-4 text-[#1C3F35]" />
        <span className="font-semibold">{label}</span>
      </div>
      <span className="mono text-sm text-[#5C5C5C]">{value}</span>
    </div>
  );
}

function DeptRow({ role, email }) {
  return (
    <a
      href={`mailto:${email}`}
      className="flex items-center justify-between rounded-md border border-black/5 px-3 py-2 transition hover:border-[#1C3F35] hover:bg-[#F0EDE6]/50"
    >
      <span className="text-sm font-semibold">{role}</span>
      <span className="mono text-xs text-[#5C5C5C]">{email}</span>
    </a>
  );
}

function RegionCard({ city, label, note }) {
  return (
    <div className="rounded-md border border-black/10 p-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-display font-bold">{city}</span>
        <Badge variant="outline" className="text-[10px]">{label}</Badge>
      </div>
      <div className="text-xs text-[#5C5C5C]">{note}</div>
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
