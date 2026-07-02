import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/notifications");
      setItems(data);
    } catch {
      /* ignore */
    }
  }, [user]);

  useEffect(() => {
    if (!user) { setItems([]); return; }
    fetchAll();
    const s = getSocket();
    const handler = (n) => {
      setItems((prev) => [n, ...prev]);
      const flavor = n.kind === "outbid" ? "warning" : n.kind === "won" ? "success" : "info";
      toast[flavor === "warning" ? "warning" : flavor === "success" ? "success" : "message"](
        n.title,
        { description: n.message }
      );
    };
    s.on("notification", handler);
    return () => { s.off("notification", handler); };
  }, [user, fetchAll]);

  const markRead = async (id) => {
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    try { await api.post(`/notifications/${id}/read`); } catch {}
  };

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try { await api.post(`/notifications/read-all`); } catch {}
  };

  const unread = items.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider value={{ items, unread, markRead, markAllRead, refresh: fetchAll }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);
