import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, formatApiErrorDetail } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  if (!user) return null;

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch("/auth/profile", { name, bio, avatar });
      setUser(data);
      toast.success("Profile saved");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 md:px-8">
      <div className="mb-8">
        <div className="overline mb-1 text-[#8A8A8A]">ACCOUNT</div>
        <h1 className="font-display text-4xl font-black">Profile</h1>
      </div>
      <form onSubmit={save} className="card-surface space-y-4 p-6" data-testid="profile-form">
        <div>
          <Label>Email</Label>
          <Input value={user.email} disabled className="mono" />
        </div>
        <div>
          <Label>Role</Label>
          <Input value={user.role} disabled />
        </div>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} data-testid="profile-name" />
        </div>
        <div>
          <Label htmlFor="avatar">Avatar URL</Label>
          <Input id="avatar" value={avatar} onChange={(e) => setAvatar(e.target.value)} data-testid="profile-avatar" />
        </div>
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} data-testid="profile-bio" />
        </div>
        <Button type="submit" disabled={saving} className="bg-[#1C3F35] hover:bg-[#142D26]" data-testid="profile-save">
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
