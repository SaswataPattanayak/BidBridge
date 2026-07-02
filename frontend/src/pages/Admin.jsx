import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function Admin() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [messages, setMessages] = useState([]);

  const load = () => {
    api.get("/admin/stats").then(({ data }) => setStats(data)).catch(() => {});
    api.get("/admin/users").then(({ data }) => setUsers(data)).catch(() => {});
    api.get("/admin/auctions").then(({ data }) => setAuctions(data)).catch(() => {});
    api.get("/admin/contact").then(({ data }) => setMessages(data)).catch(() => {});
  };
  useEffect(() => { if (user?.role === "admin") load(); }, [user]);

  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || e.message);
    }
  };

  const deleteAuction = async (id) => {
    if (!confirm("Delete this auction?")) return;
    try {
      await api.delete(`/auctions/${id}`);
      toast.success("Auction removed");
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || e.message);
    }
  };

  const markMessageRead = async (id) => {
    try {
      await api.post(`/admin/contact/${id}/read`);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
    } catch (e) {
      toast.error(e.response?.data?.detail || e.message);
    }
  };

  const unreadMessages = messages.filter((m) => !m.read).length;

  if (user?.role !== "admin") {
    return <div className="mx-auto max-w-3xl px-5 py-20 text-center text-[#8A8A8A]" data-testid="admin-forbidden">Admin access only.</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
      <div className="mb-8">
        <div className="overline mb-1 flex items-center gap-2 text-[#8A8A8A]"><ShieldCheck className="h-3 w-3" />ADMIN CONSOLE</div>
        <h1 className="font-display text-4xl font-black md:text-5xl">Platform overview</h1>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-6">
        <Stat label="Users" value={stats?.users ?? "—"} />
        <Stat label="Auctions" value={stats?.auctions ?? "—"} />
        <Stat label="Live" value={stats?.live_auctions ?? "—"} accent="success" />
        <Stat label="Bids" value={stats?.bids ?? "—"} />
        <Stat label="Notifications" value={stats?.notifications ?? "—"} />
        <Stat label="Msg. unread" value={unreadMessages} accent={unreadMessages ? "urgent" : undefined} />
      </div>

      <Tabs defaultValue="users">
        <TabsList data-testid="admin-tabs">
          <TabsTrigger value="users" data-testid="admin-tab-users">Users</TabsTrigger>
          <TabsTrigger value="auctions" data-testid="admin-tab-auctions">Auctions</TabsTrigger>
          <TabsTrigger value="messages" data-testid="admin-tab-messages">
            Messages{unreadMessages > 0 ? ` (${unreadMessages})` : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="card-surface overflow-hidden" data-testid="admin-users-table">
            <table className="w-full text-sm">
              <thead className="bg-[#F0EDE6]/60 text-[#5C5C5C]">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-left">Joined</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-black/5">
                    <td className="p-3 font-semibold">{u.name}</td>
                    <td className="p-3 mono text-xs">{u.email}</td>
                    <td className="p-3"><Badge variant="outline">{u.role}</Badge></td>
                    <td className="p-3 text-xs text-[#8A8A8A]">
                      {u.created_at ? formatDistanceToNow(new Date(u.created_at), { addSuffix: true }) : "—"}
                    </td>
                    <td className="p-3 text-right">
                      {u.id !== user.id && (
                        <Button size="sm" variant="ghost" onClick={() => deleteUser(u.id)} data-testid={`admin-delete-user-${u.id}`}>
                          <Trash2 className="h-4 w-4 text-[#CB5A3C]" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="auctions">
          <div className="card-surface overflow-hidden" data-testid="admin-auctions-table">
            <table className="w-full text-sm">
              <thead className="bg-[#F0EDE6]/60 text-[#5C5C5C]">
                <tr>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Seller</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Current</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Bids</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {auctions.map((a) => (
                  <tr key={a.id} className="border-t border-black/5">
                    <td className="p-3 font-semibold">{a.title}</td>
                    <td className="p-3 text-xs">{a.seller_name}</td>
                    <td className="p-3 text-xs">{a.category}</td>
                    <td className="p-3 mono">${Number(a.current_bid).toLocaleString()}</td>
                    <td className="p-3"><Badge variant="outline">{a.status}</Badge></td>
                    <td className="p-3 mono">{a.bid_count}</td>
                    <td className="p-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => deleteAuction(a.id)} data-testid={`admin-delete-auction-${a.id}`}>
                        <Trash2 className="h-4 w-4 text-[#CB5A3C]" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="messages">
          {messages.length === 0 ? (
            <div className="card-surface p-16 text-center text-[#8A8A8A]" data-testid="admin-messages-empty">
              No contact submissions yet.
            </div>
          ) : (
            <div className="space-y-3" data-testid="admin-messages-list">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`card-surface p-5 ${m.read ? "" : "border-[#1C3F35]/40 bg-[#F0EDE6]/40"}`}
                  data-testid={`admin-message-${m.id}`}
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg font-bold">{m.subject}</span>
                      {!m.read && <Badge className="bg-[#CB5A3C]">NEW</Badge>}
                    </div>
                    <span className="mono text-xs text-[#8A8A8A]">
                      {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-semibold">{m.name}</span>
                    <a href={`mailto:${m.email}`} className="mono text-[#1C3F35] hover:underline">{m.email}</a>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-[#111]">{m.message}</p>
                  <div className="mt-3 flex justify-end gap-2">
                    <Button asChild size="sm" variant="outline" data-testid={`admin-message-reply-${m.id}`}>
                      <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`}>Reply by email</a>
                    </Button>
                    {!m.read && (
                      <Button size="sm" className="bg-[#1C3F35] hover:bg-[#142D26]" onClick={() => markMessageRead(m.id)} data-testid={`admin-message-mark-read-${m.id}`}>
                        Mark read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value, accent }) {
  const color = accent === "success" ? "text-[#2E6D4E]" : "text-[#111]";
  return (
    <div className="card-surface p-4">
      <div className="overline mb-1 text-[#8A8A8A]">{label}</div>
      <div className={`mono text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
