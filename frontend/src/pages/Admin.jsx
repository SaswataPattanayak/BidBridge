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

  const load = () => {
    api.get("/admin/stats").then(({ data }) => setStats(data)).catch(() => {});
    api.get("/admin/users").then(({ data }) => setUsers(data)).catch(() => {});
    api.get("/admin/auctions").then(({ data }) => setAuctions(data)).catch(() => {});
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

  if (user?.role !== "admin") {
    return <div className="mx-auto max-w-3xl px-5 py-20 text-center text-[#8A8A8A]" data-testid="admin-forbidden">Admin access only.</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
      <div className="mb-8">
        <div className="overline mb-1 flex items-center gap-2 text-[#8A8A8A]"><ShieldCheck className="h-3 w-3" />ADMIN CONSOLE</div>
        <h1 className="font-display text-4xl font-black md:text-5xl">Platform overview</h1>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Users" value={stats?.users ?? "—"} />
        <Stat label="Auctions" value={stats?.auctions ?? "—"} />
        <Stat label="Live" value={stats?.live_auctions ?? "—"} accent="success" />
        <Stat label="Bids" value={stats?.bids ?? "—"} />
        <Stat label="Notifications" value={stats?.notifications ?? "—"} />
      </div>

      <Tabs defaultValue="users">
        <TabsList data-testid="admin-tabs">
          <TabsTrigger value="users" data-testid="admin-tab-users">Users</TabsTrigger>
          <TabsTrigger value="auctions" data-testid="admin-tab-auctions">Auctions</TabsTrigger>
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
