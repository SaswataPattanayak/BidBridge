import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, formatApiErrorDetail } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_IMAGES = [
  "https://images.pexels.com/photos/31513715/pexels-photo-31513715.jpeg",
  "https://images.pexels.com/photos/15074402/pexels-photo-15074402.jpeg",
  "https://images.pexels.com/photos/32562036/pexels-photo-32562036.jpeg",
  "https://images.pexels.com/photos/11591259/pexels-photo-11591259.jpeg",
  "https://images.pexels.com/photos/30287465/pexels-photo-30287465.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  "https://images.pexels.com/photos/35505802/pexels-photo-35505802.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
];

export default function CreateAuction() {
  const nav = useNavigate();
  const { user, initialized } = useAuth();
  const [categories, setCategories] = useState([]);
  const [imgUrl, setImgUrl] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const now = new Date();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    images: [],
    starting_price: "",
    min_increment: "10",
    start_time: toLocalInput(now),
    end_time: toLocalInput(new Date(now.getTime() + 24 * 60 * 60 * 1000)),
    condition: "Used",
  });

  useEffect(() => {
    if (initialized && (!user || (user.role !== "seller" && user.role !== "admin"))) {
      toast.error("Only sellers can create auctions");
      nav("/register");
    }
  }, [initialized, user, nav]);

  useEffect(() => { api.get("/categories").then(({ data }) => setCategories(data)).catch(() => {}); }, []);

  const upd = (k) => (v) => setForm((p) => ({ ...p, [k]: v?.target ? v.target.value : v }));

  const addImage = () => {
    if (!imgUrl) return;
    setForm((p) => ({ ...p, images: [...p.images, imgUrl] }));
    setImgUrl("");
  };
  const removeImage = (i) => setForm((p) => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }));

  const addSample = (url) => {
    if (form.images.includes(url)) return;
    setForm((p) => ({ ...p, images: [...p.images, url] }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        starting_price: Number(form.starting_price),
        min_increment: Number(form.min_increment),
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
      };
      const { data } = await api.post("/auctions", payload);
      toast.success("Auction created!", { description: `'${data.title}' is now listed.` });
      nav(`/auctions/${data.id}`);
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 md:px-8">
      <div className="mb-8">
        <div className="overline mb-1 text-[#8A8A8A]">NEW LISTING</div>
        <h1 className="font-display text-4xl font-black md:text-5xl">Create auction</h1>
      </div>
      <form onSubmit={submit} className="space-y-6" data-testid="create-auction-form">
        <div className="card-surface p-6">
          <h2 className="mb-4 font-display text-xl font-bold">Item details</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={form.title} onChange={upd("title")} required minLength={3} data-testid="create-title" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={upd("description")} required rows={6} minLength={10} data-testid="create-description" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={upd("category")}>
                  <SelectTrigger data-testid="create-category"><SelectValue placeholder="Choose category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Condition</Label>
                <Select value={form.condition} onValueChange={upd("condition")}>
                  <SelectTrigger data-testid="create-condition"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["New", "Like New", "Used", "Refurbished"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="card-surface p-6">
          <h2 className="mb-4 font-display text-xl font-bold">Photos</h2>
          <div className="flex gap-2">
            <Input value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} placeholder="Paste image URL..." data-testid="create-image-url" />
            <Button type="button" onClick={addImage} variant="outline" data-testid="create-image-add">
              <Plus className="mr-2 h-4 w-4" />Add
            </Button>
          </div>
          {form.images.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-6">
              {form.images.map((img, i) => (
                <div key={img} className="relative aspect-square overflow-hidden rounded-md border border-black/10">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white/90 hover:bg-white" data-testid={`create-image-remove-${i}`}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <div className="overline mb-2 flex items-center gap-2 text-[#8A8A8A]"><ImageIcon className="h-3 w-3" />OR PICK A SAMPLE</div>
            <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
              {DEFAULT_IMAGES.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => addSample(url)}
                  className="aspect-square overflow-hidden rounded-md border border-black/10 opacity-80 transition hover:opacity-100 hover:border-[#1C3F35]"
                  data-testid={`create-sample-${i}`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card-surface p-6">
          <h2 className="mb-4 font-display text-xl font-bold">Pricing & schedule</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="sp">Starting price ($)</Label>
              <Input id="sp" type="number" step="0.01" min="0.01" value={form.starting_price} onChange={upd("starting_price")} required data-testid="create-starting-price" />
            </div>
            <div>
              <Label htmlFor="mi">Minimum bid increment ($)</Label>
              <Input id="mi" type="number" step="0.01" min="0.01" value={form.min_increment} onChange={upd("min_increment")} required data-testid="create-min-increment" />
            </div>
            <div>
              <Label htmlFor="st">Start time</Label>
              <Input id="st" type="datetime-local" value={form.start_time} onChange={upd("start_time")} required data-testid="create-start-time" />
            </div>
            <div>
              <Label htmlFor="et">End time</Label>
              <Input id="et" type="datetime-local" value={form.end_time} onChange={upd("end_time")} required data-testid="create-end-time" />
            </div>
          </div>
        </div>

        {error && <div className="rounded-md bg-[#CB5A3C]/10 px-4 py-3 text-sm text-[#CB5A3C]" data-testid="create-error">{error}</div>}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => nav(-1)} data-testid="create-cancel">Cancel</Button>
          <Button type="submit" disabled={submitting} className="bg-[#1C3F35] hover:bg-[#142D26]" data-testid="create-submit">
            {submitting ? "Publishing..." : "Publish auction"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function toLocalInput(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
