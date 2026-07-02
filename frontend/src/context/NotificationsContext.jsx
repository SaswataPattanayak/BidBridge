import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const NotificationsContext = createContext(null);

function toastForKind(n) {
  if (n.kind === "outbid") toast.warning(n.title, { description: n.message });
  else if (n.kind === "won") toast.success(n.title, { description: n.message });
  else toast.message(n.title, { description: n.message });
}

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/notifications");
      setItems(data);
    } catch (err) {
      console.warn("failed to fetch notifications:", err.message);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    fetchAll();
    const s = getSocket();
    const handler = (n) => {
      setItems((prev) => [n, ...prev]);
      toastForKind(n);
    };
    s.on("notification", handler);
    return () => {
      s.off("notification", handler);
    };
  }, [user, fetchAll]);

  const markRead = useCallback(async (id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await api.post(`/notifications/${id}/read`);
    } catch (err) {
      console.warn("mark-read failed:", err.message);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api.post(`/notifications/read-all`);
    } catch (err) {
      console.warn("mark-all-read failed:", err.message);
    }
  }, []);

  const unread = items.filter((n) => !n.read).length;

  const value = useMemo(
    () => ({ items, unread, markRead, markAllRead, refresh: fetchAll }),
    [items, unread, markRead, markAllRead, fetchAll]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export const useNotifications = () => useContext(NotificationsContext);
