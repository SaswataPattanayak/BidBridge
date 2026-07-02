import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api, formatApiErrorDetail } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, Lock } from "lucide-react";
import { toast } from "sonner";
import { firstImage } from "@/lib/images";

export default function Checkout() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [a, setA] = useState(null);
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", card: "4242 4242 4242 4242" });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    api.get(`/auctions/${id}`).then(({ data }) => setA(data)).catch((e) => setError(formatApiErrorDetail(e.response?.data?.detail)));
  }, [id]);

  if (!a) return <div className="mx-auto max-w-3xl px-5 py-20 text-center text-[#8A8A8A]">{error || "Loading..."}</div>;
  const isWinner = user?.id === a.highest_bidder_id;

  const pay = (e) => {
    e.preventDefault();
    setTimeout(() => {
      setPlaced(true);
      toast.success("Payment received!", { description: "This is a mock payment for demo purposes." });
    }, 800);
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    try {
      await api.post("/feedback", {
        auction_id: a.id,
        to_user_id: a.seller_id,
        rating,
        comment,
      });
      setFeedbackSent(true);
      toast.success("Feedback submitted");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    }
  };

  if (!isWinner) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center">
        <p className="text-[#5C5C5C]">Only the winning bidder can access checkout for this auction.</p>
        <Link to="/dashboard" className="mt-4 inline-block text-[#1C3F35] underline">Back to dashboard →</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 md:px-8">
      <div className="mb-6">
        <div className="overline mb-1 text-[#8A8A8A]">CHECKOUT</div>
        <h1 className="font-display text-3xl font-black md:text-4xl">Complete your purchase</h1>
        <p className="mt-1 text-sm text-[#5C5C5C]">This is a <span className="font-semibold">mock checkout</span> — no real payment is processed.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr,380px]">
        <div className="space-y-6">
          {!placed ? (
            <form onSubmit={pay} className="card-surface p-6" data-testid="checkout-form">
              <h2 className="mb-4 font-display text-xl font-bold">Shipping & payment</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} data-testid="checkout-name" />
                </div>
                <div>
                  <Label htmlFor="address">Shipping address</Label>
                  <Textarea id="address" required rows={3} value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} data-testid="checkout-address" />
                </div>
                <div>
                  <Label htmlFor="card">Card number (mock)</Label>
                  <Input id="card" required value={form.card} onChange={(e) => setForm((p) => ({ ...p, card: e.target.value }))} data-testid="checkout-card" />
                </div>
              </div>
              <Button type="submit" className="mt-6 w-full bg-[#1C3F35] hover:bg-[#142D26]" data-testid="checkout-pay">
                <Lock className="mr-2 h-4 w-4" />Pay ${Number(a.current_bid).toLocaleString()} (mock)
              </Button>
            </form>
          ) : (
            <div className="card-surface p-8 text-center" data-testid="checkout-success">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#2E6D4E]/10 text-[#2E6D4E]">
                <Check className="h-7 w-7" />
              </div>
              <h2 className="font-display text-2xl font-bold">Payment received</h2>
              <p className="mt-2 text-sm text-[#5C5C5C]">Your order for {a.title} is confirmed.</p>
            </div>
          )}

          {placed && !feedbackSent && (
            <form onSubmit={submitFeedback} className="card-surface p-6" data-testid="feedback-form">
              <h2 className="mb-3 font-display text-xl font-bold">Rate the seller</h2>
              <div className="mb-4 flex gap-1 text-3xl">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={n <= rating ? "text-[#CB5A3C]" : "text-[#8A8A8A]/40"}
                    onClick={() => setRating(n)}
                    data-testid={`feedback-star-${n}`}
                  >★</button>
                ))}
              </div>
              <Textarea placeholder="Leave a comment for the seller..." value={comment} onChange={(e) => setComment(e.target.value)} data-testid="feedback-comment" />
              <Button type="submit" className="mt-4 bg-[#1C3F35] hover:bg-[#142D26]" data-testid="feedback-submit">Submit feedback</Button>
            </form>
          )}

          {feedbackSent && (
            <div className="card-surface p-6 text-center" data-testid="feedback-done">
              <p className="text-[#5C5C5C]">Thanks for your feedback!</p>
            </div>
          )}
        </div>

        <aside className="card-surface h-fit p-6">
          <h3 className="mb-4 font-display text-lg font-bold">Order summary</h3>
          <div className="mb-4 overflow-hidden rounded-md">
            <img src={firstImage(a)} alt="" className="aspect-video w-full object-cover" />
          </div>
          <div className="mb-2 font-semibold">{a.title}</div>
          <div className="mb-4 text-xs text-[#8A8A8A]">Sold by {a.seller_name}</div>
          <div className="space-y-2 border-t border-black/5 pt-4 text-sm">
            <Row label="Winning bid" value={`$${Number(a.current_bid).toLocaleString()}`} />
            <Row label="Buyer's premium (5%)" value={`$${(Number(a.current_bid) * 0.05).toFixed(2)}`} />
            <Row label="Shipping" value="—" />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4">
            <span className="overline text-[#8A8A8A]">TOTAL</span>
            <span className="mono text-2xl font-bold" data-testid="checkout-total">
              ${(Number(a.current_bid) * 1.05).toFixed(2)}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#5C5C5C]">{label}</span>
      <span className="mono">{value}</span>
    </div>
  );
}
