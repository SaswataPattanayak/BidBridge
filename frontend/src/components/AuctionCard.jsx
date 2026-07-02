import React from "react";
import { Link } from "react-router-dom";
import CountdownTimer from "./CountdownTimer";

export default function AuctionCard({ a }) {
  const img = a.images?.[0] || "https://images.pexels.com/photos/31513715/pexels-photo-31513715.jpeg";
  const badge =
    a.status === "live" ? { text: "LIVE", cls: "text-[#2E6D4E]", dot: "live-dot" }
    : a.status === "upcoming" ? { text: "UPCOMING", cls: "text-[#5C5C5C]", dot: "" }
    : { text: "ENDED", cls: "text-[#8A8A8A]", dot: "" };

  return (
    <Link
      to={`/auctions/${a.id}`}
      data-testid={`auction-card-${a.id}`}
      className="group block card-surface overflow-hidden transition-all hover:-translate-y-[2px] hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)]"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-[#F0EDE6]">
        <img
          src={img}
          alt={a.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>
      <div className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="overline flex items-center gap-2 text-[#5C5C5C]">
            {badge.dot && <span className={badge.dot} />}
            <span className={badge.cls}>{badge.text}</span>
          </span>
          <span className="overline text-[#8A8A8A]">{a.category}</span>
        </div>
        <h3 className="mb-3 line-clamp-2 font-display text-lg font-bold text-[#111] group-hover:text-[#1C3F35]">
          {a.title}
        </h3>
        <div className="flex items-end justify-between">
          <div>
            <div className="overline mb-1 text-[#8A8A8A]">
              {a.bid_count > 0 ? "Current Bid" : "Starting Bid"}
            </div>
            <div className="mono text-xl font-bold text-[#111]" data-testid={`auction-price-${a.id}`}>
              ${Number(a.current_bid).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-right">
            <div className="overline mb-1 text-[#8A8A8A]">
              {a.status === "upcoming" ? "Starts In" : a.status === "live" ? "Ends In" : "Closed"}
            </div>
            <CountdownTimer endTime={a.end_time} startTime={a.start_time} status={a.status} size="sm" />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3 text-xs text-[#5C5C5C]">
          <span>{a.bid_count} bids</span>
          <span>by {a.seller_name}</span>
        </div>
      </div>
    </Link>
  );
}
