import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Zap, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { firstImage } from "@/lib/images";
import AuctionCard from "@/components/AuctionCard";
import CountdownTimer from "@/components/CountdownTimer";

export default function Home() {
  const [live, setLive] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get("/auctions", { params: { status: "live", limit: 8, sort: "ending_soon" } })
      .then(({ data }) => setLive(data)).catch(() => {});
    api.get("/auctions", { params: { status: "upcoming", limit: 4, sort: "ending_soon" } })
      .then(({ data }) => setUpcoming(data)).catch(() => {});
    api.get("/categories").then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  const featured = live[0];

  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8">
      {/* HERO */}
      <section className="grid gap-8 py-14 md:grid-cols-12 md:gap-12 md:py-24">
        <div className="md:col-span-6 lg:col-span-7">
          <div className="mb-6 flex items-center gap-3">
            <span className="live-dot" />
            <span className="overline text-[#5C5C5C]" data-testid="hero-live-count">
              {live.length} AUCTIONS LIVE RIGHT NOW
            </span>
          </div>
          <h1 className="font-display text-4xl font-black leading-[0.95] tracking-tight text-[#111] sm:text-6xl lg:text-7xl">
            Where collectors <br />
            <span className="text-[#1C3F35]">bid in real-time.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-[#5C5C5C] md:text-lg">
            Curated auctions for watches, cars, art, and design objects. Live bids, instant outbid alerts, and a marketplace built for people who care about provenance.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="bg-[#1C3F35] hover:bg-[#142D26]" data-testid="hero-cta-browse">
              <Link to="/auctions">Browse auctions<ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-black/20" data-testid="hero-cta-sell">
              <Link to="/register">Sell an item</Link>
            </Button>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-black/10 pt-6">
            <Stat label="Live bids/sec" value="12+" />
            <Stat label="Trusted sellers" value="240" />
            <Stat label="Items sold" value="4.2K" />
          </div>
        </div>

        {featured && (
          <Link
            to={`/auctions/${featured.id}`}
            className="relative overflow-hidden rounded-lg border border-black/10 md:col-span-6 lg:col-span-5"
            data-testid="hero-featured-auction"
          >
            <div className="absolute inset-0">
              <img src={firstImage(featured)} alt={featured.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111]/85 via-[#111]/20 to-transparent" />
            </div>
            <div className="relative flex h-[440px] flex-col justify-between p-6 md:h-[520px]">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 backdrop-blur">
                  <span className="live-dot" />
                  <span className="overline text-white">LIVE NOW</span>
                </span>
                <span className="mono rounded-full bg-white/20 px-3 py-1 text-xs text-white backdrop-blur">
                  {featured.bid_count} BIDS
                </span>
              </div>
              <div className="text-white">
                <div className="overline mb-2 text-white/80">{featured.category}</div>
                <h3 className="mb-4 font-display text-2xl font-bold md:text-3xl">{featured.title}</h3>
                <div className="flex items-end justify-between border-t border-white/20 pt-4">
                  <div>
                    <div className="overline text-white/70">Current Bid</div>
                    <div className="mono text-3xl font-bold">${Number(featured.current_bid).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="overline text-white/70">Ends In</div>
                    <CountdownTimer endTime={featured.end_time} startTime={featured.start_time} status={featured.status} size="lg" className="!text-white" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}
      </section>

      {/* CATEGORIES */}
      <section className="py-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-bold">Browse by category</h2>
          <Link to="/auctions" className="text-sm text-[#1C3F35] underline-offset-4 hover:underline">All auctions →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/auctions?category=${encodeURIComponent(c.name)}`}
              data-testid={`category-${c.name}`}
              className="card-surface flex flex-col items-center justify-center gap-2 p-4 text-center transition hover:border-[#1C3F35]/40 hover:bg-[#F0EDE6]/50"
            >
              <span className="text-sm font-semibold">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* LIVE AUCTIONS */}
      <section className="py-14">
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <div className="overline mb-1 text-[#8A8A8A]">HAPPENING NOW</div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">Live auctions</h2>
          </div>
          <Link to="/auctions?status=live" className="text-sm text-[#1C3F35] underline-offset-4 hover:underline" data-testid="see-all-live">See all →</Link>
        </div>
        {live.length === 0 ? (
          <div className="card-surface p-10 text-center text-[#5C5C5C]">No live auctions right now — check back soon.</div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {live.slice(0, 8).map((a) => <AuctionCard key={a.id} a={a} />)}
          </div>
        )}
      </section>

      {/* WHY BIDBRIDGE */}
      <section className="grid gap-6 py-14 md:grid-cols-3">
        <Feature icon={<Zap />} title="Real-time bidding" text="Bids appear the instant they happen. No refreshes, no ghost prices." />
        <Feature icon={<Shield />} title="Verified sellers" text="Every listing carries the seller's reputation, feedback and history." />
        <Feature icon={<TrendingUp />} title="Fair, transparent" text="Every bid is logged and visible. No shill bids. No hidden reserves." />
      </section>

      {/* UPCOMING */}
      {upcoming.length > 0 && (
        <section className="py-8">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-bold">Starting soon</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {upcoming.map((a) => <AuctionCard key={a.id} a={a} />)}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="my-16 rounded-lg bg-[#1C3F35] p-10 text-white md:p-16">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="overline mb-2 text-white/60">FOR SELLERS</div>
            <h3 className="font-display text-3xl font-bold md:text-4xl">Turn your collection into cash.</h3>
            <p className="mt-2 max-w-xl text-white/70">List an item in minutes. Watch buyers bid in real-time. Get notified the moment your auction closes.</p>
          </div>
          <Button asChild size="lg" className="bg-[#CB5A3C] hover:bg-[#a94b32]" data-testid="cta-list-item">
            <Link to="/register">
              <Sparkles className="mr-2 h-4 w-4" /> Start selling
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="mono text-2xl font-bold text-[#111]">{value}</div>
      <div className="overline mt-1 text-[#8A8A8A]">{label}</div>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="card-surface p-6">
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-md bg-[#1C3F35] text-white">{icon}</div>
      <h4 className="mb-2 font-display text-lg font-bold">{title}</h4>
      <p className="text-sm text-[#5C5C5C]">{text}</p>
    </div>
  );
}
