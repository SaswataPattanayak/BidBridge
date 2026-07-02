import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import AuctionCard from "@/components/AuctionCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";

export default function Auctions() {
  const [sp, setSp] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const q = sp.get("q") || "";
  const category = sp.get("category") || "All";
  const status = sp.get("status") || "all";
  const sort = sp.get("sort") || "ending_soon";
  const minPrice = sp.get("min_price") || "";
  const maxPrice = sp.get("max_price") || "";

  const [qLocal, setQLocal] = useState(q);
  const [minLocal, setMinLocal] = useState(minPrice);
  const [maxLocal, setMaxLocal] = useState(maxPrice);

  useEffect(() => { api.get("/categories").then(({ data }) => setCategories(data)).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    const params = { sort };
    if (q) params.q = q;
    if (category && category !== "All") params.category = category;
    if (status && status !== "all") params.status = status;
    if (minPrice) params.min_price = Number(minPrice);
    if (maxPrice) params.max_price = Number(maxPrice);
    api.get("/auctions", { params })
      .then(({ data }) => setItems(data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [q, category, status, sort, minPrice, maxPrice]);

  const applySearch = (e) => {
    e?.preventDefault?.();
    const next = new URLSearchParams(sp);
    if (qLocal) next.set("q", qLocal); else next.delete("q");
    if (minLocal) next.set("min_price", minLocal); else next.delete("min_price");
    if (maxLocal) next.set("max_price", maxLocal); else next.delete("max_price");
    setSp(next);
  };

  const setParam = (key, value) => {
    const next = new URLSearchParams(sp);
    if (value && value !== "All" && value !== "all") next.set(key, value);
    else next.delete(key);
    setSp(next);
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
      <div className="mb-8 flex items-baseline justify-between">
        <div>
          <div className="overline mb-1 text-[#8A8A8A]">BROWSE</div>
          <h1 className="font-display text-4xl font-black md:text-5xl">All auctions</h1>
        </div>
        <span className="mono text-sm text-[#5C5C5C]" data-testid="auctions-count">
          {items.length} RESULTS
        </span>
      </div>

      <form onSubmit={applySearch} className="mb-6 grid gap-3 lg:grid-cols-[1fr,180px,180px,180px,140px,140px,auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A8A8A]" />
          <Input
            value={qLocal}
            onChange={(e) => setQLocal(e.target.value)}
            placeholder="Search auctions..."
            className="pl-10"
            data-testid="filter-search-input"
          />
        </div>
        <Select value={category} onValueChange={(v) => setParam("category", v)}>
          <SelectTrigger data-testid="filter-category"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All categories</SelectItem>
            {categories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setParam("status", v)}>
          <SelectTrigger data-testid="filter-status"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any status</SelectItem>
            <SelectItem value="live">Live</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="ended">Ended</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setParam("sort", v)}>
          <SelectTrigger data-testid="filter-sort"><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ending_soon">Ending soon</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price_asc">Price ↑</SelectItem>
            <SelectItem value="price_desc">Price ↓</SelectItem>
          </SelectContent>
        </Select>
        <Input type="number" placeholder="Min $" value={minLocal} onChange={(e) => setMinLocal(e.target.value)} data-testid="filter-min-price" />
        <Input type="number" placeholder="Max $" value={maxLocal} onChange={(e) => setMaxLocal(e.target.value)} data-testid="filter-max-price" />
        <Button type="submit" className="bg-[#1C3F35] hover:bg-[#142D26]" data-testid="filter-apply">Apply</Button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-[#8A8A8A]">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading auctions...
        </div>
      ) : items.length === 0 ? (
        <div className="card-surface p-16 text-center">
          <div className="overline mb-2 text-[#8A8A8A]">NO RESULTS</div>
          <p className="text-[#5C5C5C]">Try adjusting your filters, or check back later for new listings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="auctions-grid">
          {items.map((a) => <AuctionCard key={a.id} a={a} />)}
        </div>
      )}
    </div>
  );
}
