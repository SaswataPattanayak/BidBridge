import React, { useState } from "react";
import { api, formatApiErrorDetail } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Check } from "lucide-react";
import { toast } from "sonner";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const upd = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/contact", form);
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      toast.success("Message sent", { description: "Thanks — we'll get back to you shortly." });
    } catch (err) {
      const msg = formatApiErrorDetail(err.response?.data?.detail) || err.message;
      setError(msg);
      toast.error("Could not send", { description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="card-surface p-6 text-center" data-testid="contact-form-success">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[#2E6D4E]/10 text-[#2E6D4E]">
          <Check className="h-6 w-6" />
        </div>
        <h3 className="font-display text-xl font-bold">Message received</h3>
        <p className="mt-1 text-sm text-[#5C5C5C]">We'll email you back at the address you provided within one business day.</p>
        <Button variant="outline" className="mt-4" onClick={() => setSent(false)} data-testid="contact-form-send-another">
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card-surface p-6 space-y-4" data-testid="contact-form">
      <div>
        <h3 className="mb-1 font-display text-xl font-bold">Send us a message</h3>
        <p className="text-sm text-[#5C5C5C]">Not urgent? Drop us a note — we typically reply within a business day.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="c-name">Your name</Label>
          <Input id="c-name" required minLength={2} value={form.name} onChange={upd("name")} data-testid="contact-form-name" />
        </div>
        <div>
          <Label htmlFor="c-email">Email</Label>
          <Input id="c-email" type="email" required value={form.email} onChange={upd("email")} data-testid="contact-form-email" />
        </div>
      </div>
      <div>
        <Label htmlFor="c-subject">Subject</Label>
        <Input id="c-subject" required minLength={3} value={form.subject} onChange={upd("subject")} data-testid="contact-form-subject" />
      </div>
      <div>
        <Label htmlFor="c-message">Message</Label>
        <Textarea id="c-message" required minLength={10} rows={5} value={form.message} onChange={upd("message")} data-testid="contact-form-message" />
      </div>
      {error && <div className="rounded-md bg-[#CB5A3C]/10 px-3 py-2 text-sm text-[#CB5A3C]" data-testid="contact-form-error">{error}</div>}
      <Button type="submit" disabled={submitting} className="w-full bg-[#1C3F35] hover:bg-[#142D26]" data-testid="contact-form-submit">
        <Send className="mr-2 h-4 w-4" />
        {submitting ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
