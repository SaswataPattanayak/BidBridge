import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api, formatApiErrorDetail } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CountdownTimer from "@/components/CountdownTimer";
import { toast } from "sonner";
import { Heart, Gavel, User as UserIcon, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AuctionDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [a, setA] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [placing, setPlacing] = useState(false);
  const [feedback, setFeedback] = useState([]);
  const [watchlisted, setWatchlisted] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [extendedFlash, setExtendedFlash] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/auctions/${id}`)
      .then(({ data }) => setA(data))
      .catch((e) => setError(formatApiErrorDetail(e.response?.data?.detail) || e.message))
      .finally(() => setLoading(false));
  }, [id]);

  // load seller feedback
  useEffect(() => {
    if (a?.seller_id) {
      api.get(`/feedback/user/${a.seller_id}`).then(({ data }) => setFeedback(data)).catch(() => {});
    }
  }, [a?.seller_id]);

  // load watchlist state
  useEffect(() => {
    if (!user) return;
    api
      .get("/watchlist")
      .then(({ data }) => {
        setWatchlisted(data.some((x) => x.id === id));
      })
      .catch((err) => console.warn("watchlist fetch failed:", err.message));
  }, [user, id]);

  // Socket.IO real-time
  useEffect(() => {
    const s = getSocket();
    s.emit("join_auction", { auction_id: id });
    const handler = (payload) => {
      if (payload.auction_id !== id) return;
      setA((prev) => prev ? {
        ...prev,
        current_bid: payload.current_bid,
        bid_count: payload.bid_count,
        highest_bidder_id: payload.user_id,
        highest_bidder_name: payload.user_name,
        end_time: payload.end_time || prev.end_time,
        recent_bids: [{
          id: payload.id,
          user_id: payload.user_id,
          user_name: payload.user_name,
          amount: payload.amount,
          created_at: payload.created_at,
        }, ...(prev.recent_bids || [])].slice(0, 30),
      } : prev);
      setPulse(true);
      setTimeout(() => setPulse(false), 900);
      if (payload.extended) {
        setExtendedFlash(true);
        setTimeout(() => setExtendedFlash(false), 4500);
        toast.warning("Auction extended", {
          description: `Bid landed in the final ${payload.extension_seconds}s — end time pushed out by ${payload.extension_seconds}s.`,
        });
      }
    };
    const statusHandler = (payload) => {
      if (payload.auction_id !== id) return;
      setA((prev) => prev ? { ...prev, status: payload.status } : prev);
    };
    s.on("new_bid", handler);
    s.on("auction_status", statusHandler);
    return () => {
      s.emit("leave_auction", { auction_id: id });
      s.off("new_bid", handler);
      s.off("auction_status", statusHandler);
    };
  }, [id]);

  const minNextBid = useMemo(() => {
    if (!a) return 0;
    return a.bid_count > 0 ? Number(a.current_bid) + Number(a.min_increment) : Number(a.starting_price);
  }, [a]);

  useEffect(() => { setBidAmount(String(minNextBid)); }, [minNextBid]);

  const placeBid = async (e) => {
    e.preventDefault();
    if (!user) { nav("/login"); return; }
    setPlacing(true);
    try {
      await api.post(`/auctions/${id}/bids`, { amount: Number(bidAmount) });
      toast.success("Bid placed!", { description: `You bid $${Number(bidAmount).toLocaleString()}` });
    } catch (err) {
      toast.error("Bid failed", { description: formatApiErrorDetail(err.response?.data?.detail) || err.message });
    } finally {
      setPlacing(false);
    }
  };

  const toggleWatch = async () => {
    if (!user) { nav("/login"); return; }
    try {
      if (watchlisted) {
        await api.delete(`/watchlist/${id}`);
        setWatchlisted(false);
      } else {
        await api.post(`/watchlist/${id}`);
        setWatchlisted(true);
      }
    } catch {}
  };

  if (loading) return <div className="mx-auto max-w-7xl px-5 py-20 text-center text-[#8A8A8A]">Loading auction...</div>;
  if (error || !a) return <div className="mx-auto max-w-7xl px-5 py-20 text-center text-[#CB5A3C]">{error || "Auction not found"}</div>;

  const isEnded = a.status === "ended";
  const isLive = a.status === "live";
  const isUpcoming = a.status === "upcoming";
  const isSeller = user?.id === a.seller_id;
  const isWinner = user?.id === a.highest_bidder_id;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
      <nav className="mb-4 text-sm text-[#8A8A8A]">
        <Link to="/auctions" className="hover:text-[#1C3F35]">Auctions</Link> / <span>{a.category}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <div className="aspect-[4/3] overflow-hidden rounded-lg border border-black/10 bg-[#F0EDE6]">
            <img src={a.images?.[activeImage] || a.images?.[0]} alt={a.title} className="h-full w-full object-cover" data-testid="auction-main-image" />
          </div>
          {a.images?.length > 1 && (
            <div className="mt-3 grid grid-cols-6 gap-2">
              {a.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className={`aspect-square overflow-hidden rounded-md border ${activeImage === i ? "border-[#1C3F35]" : "border-black/10"}`}
                  data-testid={`auction-thumb-${i}`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <Tabs defaultValue="description" className="mt-8">
            <TabsList data-testid="auction-tabs">
              <TabsTrigger value="description" data-testid="tab-description">Description</TabsTrigger>
              <TabsTrigger value="bids" data-testid="tab-bids">Bid History ({a.bid_count})</TabsTrigger>
              <TabsTrigger value="seller" data-testid="tab-seller">Seller</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4">
              <div className="card-surface p-6">
                <div className="mb-4 grid grid-cols-2 gap-4 border-b border-black/5 pb-4 md:grid-cols-4">
                  <MetaItem label="Condition" value={a.condition} />
                  <MetaItem label="Category" value={a.category} />
                  <MetaItem label="Starting Price" value={`$${Number(a.starting_price).toLocaleString()}`} />
                  <MetaItem label="Min Increment" value={`$${Number(a.min_increment).toLocaleString()}`} />
                </div>
                <p className="whitespace-pre-wrap text-[#111]">{a.description}</p>
              </div>
            </TabsContent>
            <TabsContent value="bids" className="mt-4">
              <div className="card-surface p-2">
                {a.recent_bids?.length === 0 && (
                  <div className="p-8 text-center text-[#8A8A8A]">No bids yet. Be the first.</div>
                )}
                <div className="divide-y divide-black/5" data-testid="bid-history">
                  {a.recent_bids?.map((b) => (
                    <div key={b.id} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-8 w-8 place-items-center rounded-full bg-[#F0EDE6] text-xs font-bold text-[#1C3F35]">
                          {b.user_name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{b.user_name}</div>
                          <div className="mono text-xs text-[#8A8A8A]">
                            {formatDistanceToNow(new Date(b.created_at), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      <div className="mono text-lg font-bold">${Number(b.amount).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="seller" className="mt-4">
              <div className="card-surface p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-[#1C3F35] text-lg font-bold text-white">
                    {a.seller_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-display text-lg font-bold">{a.seller_name}</div>
                    <div className="text-xs text-[#8A8A8A]">Verified seller · {feedback.length} reviews</div>
                  </div>
                </div>
                {feedback.length === 0 && <div className="text-sm text-[#8A8A8A]">No reviews yet.</div>}
                <div className="mt-2 divide-y divide-black/5">
                  {feedback.map((f) => (
                    <div key={f.id} className="py-3">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="mono text-sm font-bold">{"★".repeat(f.rating)}<span className="text-[#8A8A8A]">{"★".repeat(5 - f.rating)}</span></span>
                        <span className="text-sm font-semibold">{f.from_user_name}</span>
                      </div>
                      <div className="text-sm text-[#5C5C5C]">{f.comment}</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar: bid panel */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-4">
            <div className={`card-surface p-6 ${pulse ? "bid-pulse" : ""}`}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isLive && <><span className="live-dot" /><span className="overline text-[#2E6D4E]">LIVE AUCTION</span></>}
                  {isUpcoming && <span className="overline text-[#5C5C5C]">UPCOMING</span>}
                  {isEnded && <span className="overline text-[#8A8A8A]">ENDED</span>}
                </div>
                <Badge variant="outline" className="mono">{a.bid_count} BIDS</Badge>
              </div>

              <h1 className="mb-4 font-display text-2xl font-black tracking-tight md:text-3xl">{a.title}</h1>

              <div className="mb-4 rounded-md bg-[#F0EDE6]/50 p-4">
                <div className="overline mb-1 text-[#5C5C5C]">
                  {a.bid_count > 0 ? "Current Bid" : "Starting Price"}
                </div>
                <div className="mono text-4xl font-bold text-[#111]" data-testid="auction-current-bid">
                  ${Number(a.current_bid).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                {a.highest_bidder_name && (
                  <div className="mt-1 text-xs text-[#5C5C5C]">
                    High bidder: <span className="font-semibold">{a.highest_bidder_name}</span>
                    {isWinner && <Badge className="ml-2 bg-[#2E6D4E]" data-testid="high-bidder-you">You</Badge>}
                  </div>
                )}
              </div>

              <div className="mb-6 flex items-center justify-between border-y border-black/5 py-3">
                <div>
                  <div className="overline mb-1 flex items-center gap-2 text-[#8A8A8A]">
                    <span>{isUpcoming ? "Starts In" : isLive ? "Ends In" : "Closed"}</span>
                    {extendedFlash && (
                      <span
                        className="mono inline-flex items-center gap-1 rounded-full bg-[#CB5A3C]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#CB5A3C]"
                        data-testid="soft-close-badge"
                      >
                        <span className="urgent-dot live-dot" />
                        +60s Extended
                      </span>
                    )}
                  </div>
                  <CountdownTimer endTime={a.end_time} startTime={a.start_time} status={a.status} size="lg" />
                </div>
                <button
                  onClick={toggleWatch}
                  className={`grid h-11 w-11 place-items-center rounded-md border transition ${watchlisted ? "border-[#CB5A3C] bg-[#CB5A3C]/10 text-[#CB5A3C]" : "border-black/10 hover:bg-black/5"}`}
                  data-testid="watchlist-toggle"
                  aria-label="Watchlist"
                >
                  <Heart className={`h-5 w-5 ${watchlisted ? "fill-[#CB5A3C]" : ""}`} />
                </button>
              </div>

              {isLive && !isSeller && (
                <form onSubmit={placeBid} className="space-y-3">
                  <div>
                    <label className="overline mb-2 block text-[#5C5C5C]">Your Bid (min ${minNextBid.toLocaleString()})</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="mono absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          min={minNextBid}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="mono pl-7 text-lg font-bold"
                          data-testid="bid-amount-input"
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={placing}
                        className="bg-[#1C3F35] px-6 hover:bg-[#142D26]"
                        data-testid="place-bid-button"
                      >
                        <Gavel className="mr-2 h-4 w-4" />
                        {placing ? "Placing..." : "Place Bid"}
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 5].map((mult) => {
                      const amt = Math.round((minNextBid + Number(a.min_increment) * (mult - 1)) * 100) / 100;
                      return (
                        <button
                          key={mult}
                          type="button"
                          onClick={() => setBidAmount(String(amt))}
                          className="mono rounded-md border border-black/10 py-2 text-xs font-semibold hover:border-[#1C3F35] hover:bg-[#1C3F35]/5"
                          data-testid={`quick-bid-${mult}`}
                        >
                          ${amt.toLocaleString()}
                        </button>
                      );
                    })}
                  </div>
                  {!user && (
                    <div className="text-center text-xs text-[#5C5C5C]">
                      <Link to="/login" className="font-semibold text-[#1C3F35] underline">Sign in</Link> to place bids.
                    </div>
                  )}
                </form>
              )}

              {isSeller && isLive && (
                <div className="rounded-md bg-[#F0EDE6] p-4 text-sm text-[#5C5C5C]" data-testid="seller-notice">
                  You are the seller of this auction. You can watch bids come in real-time.
                </div>
              )}
              {isUpcoming && (
                <div className="rounded-md bg-[#F0EDE6] p-4 text-sm text-[#5C5C5C]" data-testid="upcoming-notice">
                  Auction hasn't started yet. Bidding will open when the countdown hits zero.
                </div>
              )}
              {isEnded && (
                <div className="rounded-md bg-[#F0EDE6] p-4 text-sm text-[#5C5C5C]" data-testid="ended-notice">
                  Auction has ended.
                  {isWinner && (
                    <div className="mt-3">
                      <Button asChild className="bg-[#1C3F35] hover:bg-[#142D26]" data-testid="checkout-button">
                        <Link to={`/checkout/${a.id}`}>Complete purchase →</Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="card-surface p-4">
              <div className="mb-2 flex items-center gap-2 overline text-[#8A8A8A]"><TrendingUp className="h-3 w-3" />ACTIVITY</div>
              <div className="text-sm text-[#5C5C5C]">
                {a.bid_count} bids since listing. Highest bidder wins when the timer hits zero.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div>
      <div className="overline mb-1 text-[#8A8A8A]">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
