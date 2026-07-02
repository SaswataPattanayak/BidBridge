import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AuctionCard from "@/components/AuctionCard";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "@/context/NotificationsContext";

export default function Dashboard() {
  const { user } = useAuth();
  const { items: notifs } = useNotifications();
  const [myAuctions, setMyAuctions] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [won, setWon] = useState([]);
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    if (!user) return;
    api.get("/auctions", { params: { seller_id: user.id, limit: 100 } }).then(({ data }) => setMyAuctions(data));
    api.get("/my/bids").then(({ data }) => setMyBids(data));
    api.get("/my/won").then(({ data }) => setWon(data));
    api.get("/watchlist").then(({ data }) => setWatchlist(data));
  }, [user]);

  if (!user) return null;

  const isSeller = user.role === "seller" || user.role === "admin";

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
      <div className="mb-8 flex items-baseline justify-between">
        <div>
          <div className="overline mb-1 text-[#8A8A8A]">DASHBOARD</div>
          <h1 className="font-display text-4xl font-black md:text-5xl">Hi, {user.name.split(" ")[0]}</h1>
        </div>
        {isSeller && (
          <Button asChild className="bg-[#1C3F35] hover:bg-[#142D26]" data-testid="dashboard-create-cta">
            <Link to="/auctions/new">+ New auction</Link>
          </Button>
        )}
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Active bids" value={myBids.filter((b) => b.status === "live").length} />
        <StatCard label="Won auctions" value={won.length} accent="success" />
        <StatCard label="Watching" value={watchlist.length} />
        {isSeller ? (
          <StatCard label="My listings" value={myAuctions.length} />
        ) : (
          <StatCard label="Notifications" value={notifs.filter((n) => !n.read).length} accent="urgent" />
        )}
      </div>

      <Tabs defaultValue="bids" className="w-full">
        <TabsList className="mb-4" data-testid="dashboard-tabs">
          <TabsTrigger value="bids" data-testid="tab-bids">My Bids</TabsTrigger>
          <TabsTrigger value="won" data-testid="tab-won">Won</TabsTrigger>
          <TabsTrigger value="watchlist" data-testid="tab-watchlist">Watchlist</TabsTrigger>
          {isSeller && <TabsTrigger value="listings" data-testid="tab-listings">My Listings</TabsTrigger>}
          <TabsTrigger value="activity" data-testid="tab-activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="bids">
          {myBids.length === 0 ? (
            <Empty msg="You haven't placed any bids yet." />
          ) : (
            <div className="card-surface divide-y divide-black/5" data-testid="my-bids-list">
              {myBids.map((a) => (
                <Link key={a.id} to={`/auctions/${a.id}`} className="flex items-center gap-4 p-4 hover:bg-black/[0.02]">
                  <img src={a.images?.[0]} alt="" className="h-16 w-16 rounded-md object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="truncate font-semibold">{a.title}</span>
                      {a.is_winning ? <Badge className="bg-[#2E6D4E]">Winning</Badge> : <Badge className="bg-[#CB5A3C]">Outbid</Badge>}
                      <Badge variant="outline">{a.status}</Badge>
                    </div>
                    <div className="mono text-xs text-[#5C5C5C]">
                      Your bid: ${Number(a.my_bid).toLocaleString()} · Current: ${Number(a.current_bid).toLocaleString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="won">
          {won.length === 0 ? <Empty msg="You haven't won any auctions yet." />
            : <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="won-grid">
                {won.map((a) => <AuctionCard key={a.id} a={a} />)}
              </div>}
        </TabsContent>

        <TabsContent value="watchlist">
          {watchlist.length === 0 ? <Empty msg="Your watchlist is empty. Tap the heart on any auction to watch it." />
            : <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="watchlist-grid">
                {watchlist.map((a) => <AuctionCard key={a.id} a={a} />)}
              </div>}
        </TabsContent>

        {isSeller && (
          <TabsContent value="listings">
            {myAuctions.length === 0 ? <Empty msg="You haven't listed any items yet." action={<Link to="/auctions/new" className="text-[#1C3F35] underline">Create your first auction</Link>} />
              : <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="listings-grid">
                  {myAuctions.map((a) => <AuctionCard key={a.id} a={a} />)}
                </div>}
          </TabsContent>
        )}

        <TabsContent value="activity">
          {notifs.length === 0 ? <Empty msg="No activity yet." /> : (
            <div className="card-surface divide-y divide-black/5" data-testid="activity-list">
              {notifs.map((n) => (
                <div key={n.id} className="p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-semibold">{n.title}</span>
                    <span className="mono text-xs text-[#8A8A8A]">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="text-sm text-[#5C5C5C]">{n.message}</div>
                  {n.auction_id && (
                    <Link to={`/auctions/${n.auction_id}`} className="mt-1 inline-block text-xs text-[#1C3F35] underline">View auction →</Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  const color = accent === "success" ? "text-[#2E6D4E]" : accent === "urgent" ? "text-[#CB5A3C]" : "text-[#111]";
  return (
    <div className="card-surface p-5">
      <div className="overline mb-2 text-[#8A8A8A]">{label}</div>
      <div className={`mono text-3xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function Empty({ msg, action }) {
  return (
    <div className="card-surface p-16 text-center">
      <p className="text-[#5C5C5C]">{msg}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
