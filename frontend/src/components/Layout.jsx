import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bell, Gavel, LogOut, Menu, Plus, Search, ShieldCheck, User, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationsContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const doLogout = async () => {
    await logout();
    nav("/");
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))] text-[#111]">
      <header className="glass-nav sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-6 md:gap-8">
            <Link to="/" className="flex items-center gap-2 font-display text-xl font-black tracking-tight" data-testid="brand-link">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-[#1C3F35] text-white">
                <Gavel className="h-4 w-4" />
              </span>
              BidBridge
            </Link>
          </div>

          <nav className="hidden items-center gap-7 md:flex">
            <NavLink to="/about" className={({ isActive }) => `text-sm font-semibold ${isActive ? "text-[#1C3F35]" : "text-[#111] hover:text-[#1C3F35]"}`} data-testid="nav-about">
              About
            </NavLink>
            <NavLink to="/auctions" end className={({ isActive }) => `text-sm font-semibold ${isActive ? "text-[#1C3F35]" : "text-[#111] hover:text-[#1C3F35]"}`} data-testid="nav-auctions">
              Auctions
            </NavLink>
            <NavLink to="/auctions?status=live" className="text-sm font-semibold text-[#111] hover:text-[#1C3F35]" data-testid="nav-live">
              Live Now
            </NavLink>
            <NavLink to="/delivery" className={({ isActive }) => `text-sm font-semibold ${isActive ? "text-[#1C3F35]" : "text-[#111] hover:text-[#1C3F35]"}`} data-testid="nav-delivery">
              Delivery
            </NavLink>
            <NavLink to="/payment" className={({ isActive }) => `text-sm font-semibold ${isActive ? "text-[#1C3F35]" : "text-[#111] hover:text-[#1C3F35]"}`} data-testid="nav-payment">
              Payment
            </NavLink>
            {user && (
              <NavLink to="/dashboard" className={({ isActive }) => `text-sm font-semibold ${isActive ? "text-[#1C3F35]" : "text-[#111] hover:text-[#1C3F35]"}`} data-testid="nav-dashboard">
                Dashboard
              </NavLink>
            )}
            {user?.role === "admin" && (
              <NavLink to="/admin" className={({ isActive }) => `text-sm font-semibold ${isActive ? "text-[#1C3F35]" : "text-[#111] hover:text-[#1C3F35]"}`} data-testid="nav-admin">
                Admin
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {user && <NotifBell />}
            {!user && (
              <>
                <Button asChild variant="ghost" className="hidden md:inline-flex" data-testid="cta-login">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild className="bg-[#1C3F35] hover:bg-[#142D26]" data-testid="cta-register">
                  <Link to="/register">Join</Link>
                </Button>
              </>
            )}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="ml-1 grid h-9 w-9 place-items-center rounded-full bg-[#1C3F35] text-sm font-bold text-white transition hover:bg-[#142D26]"
                    data-testid="user-menu-trigger"
                  >
                    {(user.name?.[0] || user.email?.[0] || "U").toUpperCase()}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-xs">
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-[#5C5C5C]">{user.email}</div>
                    <div className="mt-1 overline text-[#8A8A8A]">{user.role}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild data-testid="menu-profile">
                    <Link to="/profile"><User className="mr-2 h-4 w-4" />Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild data-testid="menu-dashboard">
                    <Link to="/dashboard"><Gavel className="mr-2 h-4 w-4" />Dashboard</Link>
                  </DropdownMenuItem>
                  {(user.role === "seller" || user.role === "admin") && (
                    <DropdownMenuItem asChild data-testid="menu-create">
                      <Link to="/auctions/new"><Plus className="mr-2 h-4 w-4" />Create Auction</Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild data-testid="menu-admin">
                      <Link to="/admin"><ShieldCheck className="mr-2 h-4 w-4" />Admin</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={doLogout} data-testid="menu-logout">
                    <LogOut className="mr-2 h-4 w-4" />Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <button className="md:hidden" onClick={() => setMobileOpen(true)} data-testid="mobile-menu-open">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-white p-5 md:hidden" data-testid="mobile-menu-panel">
          <div className="mb-8 flex items-center justify-between">
            <span className="font-display text-xl font-black">BidBridge</span>
            <button onClick={() => setMobileOpen(false)}><X className="h-6 w-6" /></button>
          </div>
          <div className="flex flex-col gap-4 text-lg">
            <Link to="/about" onClick={() => setMobileOpen(false)} data-testid="mobile-nav-about">About</Link>
            <Link to="/auctions" onClick={() => setMobileOpen(false)}>Auctions</Link>
            <Link to="/auctions?status=live" onClick={() => setMobileOpen(false)}>Live Now</Link>
            <Link to="/delivery" onClick={() => setMobileOpen(false)} data-testid="mobile-nav-delivery">Delivery</Link>
            <Link to="/payment" onClick={() => setMobileOpen(false)} data-testid="mobile-nav-payment">Payment</Link>
            {user && <Link to="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</Link>}
            {(user?.role === "seller" || user?.role === "admin") && (
              <Link to="/auctions/new" onClick={() => setMobileOpen(false)}>Create Auction</Link>
            )}
            {user?.role === "admin" && <Link to="/admin" onClick={() => setMobileOpen(false)}>Admin</Link>}
            {!user && <Link to="/login" onClick={() => setMobileOpen(false)}>Log in</Link>}
            {!user && <Link to="/register" onClick={() => setMobileOpen(false)}>Register</Link>}
          </div>
        </div>
      )}

      <main>{children}</main>

      <footer className="mt-20 border-t border-black/10 bg-[#F0EDE6]">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="py-6" data-testid="footer-brand-strip">
            <div className="overline mb-3 text-[#8A8A8A]">FEATURED IN</div>
            <div
              className="rounded-lg border border-white/10 px-6 py-6 md:py-8"
              style={{
                background: "linear-gradient(120deg, #0F1720 0%, #1A2532 60%, #0F1720 100%)",
              }}
            >
              <div
                className="grid grid-cols-2 items-center justify-items-center gap-y-4 sm:grid-cols-3 md:grid-cols-5"
                data-testid="footer-media-logos"
              >
                <MediaLogo name="The Hindu" font="serif" testId="media-logo-1" />
                <MediaLogo name="Business Standard" font="sans" testId="media-logo-2" />
                <MediaLogo name="YourStory" font="display" testId="media-logo-3" />
                <MediaLogo name="Inc42" font="mono" testId="media-logo-4" />
                <MediaLogo name="ECONOMIC TIMES" font="serif" testId="media-logo-5" />
              </div>
            </div>
          </div>

          <div className="grid gap-8 py-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="mb-2 flex items-center gap-2 font-display text-lg font-black">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-[#1C3F35] text-white">
                  <Gavel className="h-3.5 w-3.5" />
                </span>
                BidBridge
              </div>
              <div className="max-w-md text-sm text-[#5C5C5C]">
                Real-time auctions for collectors, curators & sellers. Curated marketplace, transparent bidding, soft-close protection.
              </div>
              <div className="mono mt-4 text-xs text-[#8A8A8A]">
                037, 96(C), Charigharia Sahi · Athmallik (NAC), Athmallik<br />
                Angul, Odisha 759 125 · India
              </div>
            </div>
            <div>
              <div className="overline mb-3 text-[#8A8A8A]">Platform</div>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-[#1C3F35]" data-testid="footer-about">About BidBridge</Link></li>
                <li><Link to="/delivery" className="hover:text-[#1C3F35]" data-testid="footer-delivery">Delivery details</Link></li>
                <li><Link to="/payment" className="hover:text-[#1C3F35]" data-testid="footer-payment">Payment details</Link></li>
                <li><Link to="/auctions" className="hover:text-[#1C3F35]">Browse auctions</Link></li>
                <li><Link to="/auctions?status=live" className="hover:text-[#1C3F35]">Live now</Link></li>
                <li><Link to="/register" className="hover:text-[#1C3F35]">Sell an item</Link></li>
              </ul>
            </div>
            <div>
              <div className="overline mb-3 text-[#8A8A8A]">Contact</div>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:contact@bidbridge.com" className="mono hover:text-[#1C3F35]">contact@bidbridge.com</a></li>
                <li><a href="mailto:help@bidbridge.com" className="mono hover:text-[#1C3F35]">help@bidbridge.com</a></li>
                <li><a href="tel:+918260665966" className="mono hover:text-[#1C3F35]">+91 82606 65966</a></li>
                <li><Link to="/about" className="hover:text-[#1C3F35]" data-testid="footer-contact">All contact details →</Link></li>
                <li><Link to="/forgot-password" className="hover:text-[#1C3F35]" data-testid="footer-forgot">Forgot password?</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-2 flex flex-col items-center justify-between gap-2 border-t border-black/10 py-5 md:flex-row" data-testid="footer-copyright">
            <div className="mono overline text-[#8A8A8A]">
              © BIDBRIDGE 2023–2026 · ALL RIGHTS RESERVED
            </div>
            <div className="mono overline text-[#8A8A8A]" data-testid="footer-madein">MADE IN ODISHA</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MediaLogo({ name, font, testId }) {
  const fontClass =
    font === "serif" ? "font-serif italic" :
    font === "mono" ? "mono" :
    font === "display" ? "font-display" :
    "font-sans";
  return (
    <span
      className={`${fontClass} whitespace-nowrap text-lg font-black tracking-tight text-white/85 transition hover:text-white md:text-xl`}
      data-testid={testId}
    >
      {name}
    </span>
  );
}

function NotifBell() {
  const { items, unread, markRead, markAllRead } = useNotifications();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative grid h-9 w-9 place-items-center rounded-md border border-black/10 hover:bg-black/5" data-testid="notifications-bell">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#CB5A3C] px-1 text-[10px] font-bold text-white" data-testid="notifications-count">
              {unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-[420px] w-[360px] overflow-y-auto">
        <div className="flex items-center justify-between px-2 py-2">
          <span className="font-display text-sm font-bold">Notifications</span>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-xs text-[#1C3F35] hover:underline" data-testid="notifications-mark-all">
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {items.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-[#8A8A8A]">You're all caught up.</div>
        )}
        {items.map((n) => (
          <div
            key={n.id}
            onClick={() => markRead(n.id)}
            className={`cursor-pointer border-b border-black/5 px-3 py-3 text-sm last:border-0 hover:bg-black/[0.02] ${!n.read ? "bg-[#F0EDE6]/60" : ""}`}
            data-testid={`notification-item-${n.id}`}
          >
            <div className="mb-0.5 flex items-center justify-between gap-2">
              <span className="font-semibold">{n.title}</span>
              {!n.read && <Badge variant="secondary" className="bg-[#CB5A3C] text-white">NEW</Badge>}
            </div>
            <div className="text-[13px] text-[#5C5C5C]">{n.message}</div>
            <div className="mono mt-1 text-[11px] text-[#8A8A8A]">
              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
            </div>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
