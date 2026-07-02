import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { NotificationsProvider } from "@/context/NotificationsContext";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Auctions from "@/pages/Auctions";
import AuctionDetail from "@/pages/AuctionDetail";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import CreateAuction from "@/pages/CreateAuction";
import Admin from "@/pages/Admin";
import Profile from "@/pages/Profile";
import Checkout from "@/pages/Checkout";

function Protected({ children }) {
  const { user, initialized } = useAuth();
  if (!initialized) return <div className="mx-auto max-w-2xl px-5 py-20 text-center text-[#8A8A8A]">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <NotificationsProvider>
            <Toaster position="top-right" richColors closeButton />
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auctions" element={<Auctions />} />
                <Route path="/auctions/new" element={<Protected><CreateAuction /></Protected>} />
                <Route path="/auctions/:id" element={<AuctionDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
                <Route path="/profile" element={<Protected><Profile /></Protected>} />
                <Route path="/checkout/:id" element={<Protected><Checkout /></Protected>} />
                <Route path="/admin" element={<Protected><Admin /></Protected>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </NotificationsProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
