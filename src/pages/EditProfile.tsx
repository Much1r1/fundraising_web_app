import React, { useEffect, useRef, useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Save, Upload, LogOut } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

type FormState = {
  full_name: string;
  bio: string;
  location: string;
  avatar_url: string;
};

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  const [form, setForm] = useState<FormState>({
    full_name: "",
    bio: "",
    location: "",
    avatar_url: "",
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("getUser error:", error);
          navigate("/auth");
          return;
        }
        const user = data.user;
        if (!user) {
          navigate("/auth");
          return;
        }

        const meta = (user.user_metadata as any) || {};
        setForm({
          full_name: meta.full_name || meta.name || (user.email ? user.email.split("@")[0] : ""),
          bio: meta.bio || "",
          location: meta.location || "",
          avatar_url: meta.avatar_url || meta.picture || "",
        });
      } catch (err) {
        console.error("Unexpected error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  const handleInput =
    (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      // get current user
      const { data, error: getUserError } = await supabase.auth.getUser();
      if (getUserError) throw getUserError;
      const user = data.user;
      if (!user) throw new Error("No user session.");

      // Build file path: avatars/<user-id>/<timestamp>-<originalName>
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `avatars/${user.id}/${fileName}`;

      // upload
      const { error: uploadError } = await supabase.storage
         .from("profile-photos")
         .upload(`avatars/${user.id}.png`, file, {
             cacheControl: "3600",
             upsert: true,
      });


      // get public URL (assuming the bucket allows public urls)
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = urlData?.publicUrl;
      if (!publicUrl) throw new Error("Could not get public URL after upload.");

      // update auth metadata with new avatar_url
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });
      if (updateError) {
        // Not fatal for UX; show message but keep avatar url locally
        console.error("Failed to update user metadata:", updateError);
        toast({ title: "Uploaded", description: "Avatar uploaded but metadata update failed." });
      } else {
        toast({ title: "Uploaded", description: "Avatar uploaded and profile updated." });
      }

      // update local form state
      setForm((prev) => ({ ...prev, avatar_url: publicUrl }));
    } catch (err: any) {
      console.error("Upload error:", err);
      toast({ title: "Upload failed", description: err?.message || "Could not upload file." });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    // reset input so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!form.full_name?.trim()) {
        toast({ title: "Validation", description: "Please enter your name." });
        setSaving(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: form.full_name,
          bio: form.bio,
          location: form.location,
          avatar_url: form.avatar_url,
        },
      });

      if (error) {
        console.error("updateUser error:", error);
        toast({ title: "Save failed", description: error.message || "Could not update profile." });
        setSaving(false);
        return;
      }

      toast({ title: "Saved", description: "Profile updated successfully." });
      navigate("/profile");
    } catch (err) {
      console.error("Unexpected save error:", err);
      toast({ title: "Save failed", description: "Unexpected error." });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (newPassword: string, confirmPassword: string) => {
    if (!newPassword) {
      toast({ title: "Validation", description: "Please enter a new password." });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Validation", description: "Passwords do not match." });
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        console.error("Password change error:", error);
        toast({ title: "Failed", description: error.message || "Could not change password." });
        return;
      }
      toast({ title: "Success", description: "Password updated." });
    } catch (err) {
      console.error("Unexpected password change error:", err);
      toast({ title: "Failed", description: "Unexpected error." });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return <div className="p-12 text-center text-muted-foreground">Loading profile...</div>;
  }

  // compute initials for fallback (first letters of first two names)
  const initials = (() => {
    if (!form.full_name) return "U";
    const parts = form.full_name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  })();

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Card className="border-2 shadow-md animate-fade-in">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Edit Profile</CardTitle>
            {/* intentionally left blank here for visual parity with profile header */}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24 border-4 border-primary/20">
                {form.avatar_url ? (
                  <AvatarImage src={form.avatar_url} />
                ) : (
                  <AvatarFallback className="text-2xl gradient-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Avatar URL"
                  value={form.avatar_url}
                  onChange={(e) => setForm((p) => ({ ...p, avatar_url: e.target.value }))}
                  className="w-72"
                />

                {/* hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <Button variant="outline" type="button" onClick={triggerFilePicker} disabled={uploading}>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" value={form.full_name} onChange={handleInput("full_name")} />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" rows={4} value={form.bio} onChange={handleInput("bio")} />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={form.location} onChange={handleInput("location")} />
              </div>
            </div>

            {/* Buttons Row: Back next to Save */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => navigate("/profile")} disabled={saving || uploading}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button onClick={handleSave} disabled={saving || uploading}>
                <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>

            <hr className="my-6" />

            {/* Password Section (inline small UI) */}
            <ChangePasswordSection onChangePassword={handlePasswordChange} />

            <hr className="my-6" />

            {/* Logout */}
            <div className="text-center">
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile;

/* -------------------------
   Small inner component used above
   Keeps main file tidy — same file is fine.
   ------------------------- */
function ChangePasswordSection({ onChangePassword }: { onChangePassword: (newPassword: string, confirmPassword: string) => void }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Change Password</h3>
      <div className="space-y-4 max-w-xl mx-auto">
        <div>
          <Label>New Password</Label>
          <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>
        <div>
          <Label>Confirm New Password</Label>
          <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => {
              onChangePassword(newPassword, confirmPassword);
              setNewPassword("");
              setConfirmPassword("");
            }}
          >
            Update Password
          </Button>
        </div>
      </div>
    </div>
  );
}
