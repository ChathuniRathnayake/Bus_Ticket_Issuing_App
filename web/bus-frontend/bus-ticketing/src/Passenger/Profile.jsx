// src/Passenger/Profile.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Save, Camera, LoaderCircle, CheckCircle } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    profilePic: "",
  });

  const [saving, setSaving] = useState(false);

  // Load profile
  useEffect(() => {
    if (!token) {
      navigate("/passenger-login");
      return;
    }

    const savedProfile = localStorage.getItem("passengerProfile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((prev) => ({
        ...prev,
        profilePic: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!profile.name) {
      alert("Please fill at least your name");
      return;
    }

    setSaving(true);

    try {
      // Save to localStorage
      localStorage.setItem("passengerProfile", JSON.stringify(profile));

      alert("Profile updated successfully!");

      // Automatically navigate to dashboard after save
      setTimeout(() => {
        navigate("/passenger-dashboard");
      }, 800); // Small delay so user can see the success message

    } catch {
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-blue-50 to-violet-50 dark:from-zinc-950 dark:to-zinc-900 p-6">
      <div className="max-w-2xl mx-auto">

        <Button
          variant="ghost"
          onClick={() => navigate("/passenger-dashboard")}
          className="mb-6 gap-2 hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" /> Back to Dashboard
        </Button>

        {/* Hero strip */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-8 py-7 text-white shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-1">Passenger</p>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="mt-1 text-sm text-blue-200">Manage your personal information</p>
        </div>

        <Card className="shadow-xl border-0 rounded-2xl overflow-hidden">

          {/* Profile picture area */}
          <CardHeader className="text-center pb-6 bg-gradient-to-b from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-800 border-b">
            <div className="mx-auto w-28 h-28 bg-gradient-to-br from-blue-100 to-violet-100 dark:from-zinc-800 dark:to-zinc-700 rounded-full flex items-center justify-center mb-4 relative shadow-lg ring-4 ring-white dark:ring-zinc-800 overflow-hidden">
              {profile.profilePic ? (
                <img
                  src={profile.profilePic}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover"
                />
              ) : (
                <User className="w-14 h-14 text-blue-400 dark:text-blue-300" />
              )}

              <label
                htmlFor="profile-upload"
                className="absolute bottom-0 inset-x-0 flex items-center justify-center bg-black/40 h-9 cursor-pointer hover:bg-black/55 transition-colors"
                title="Change photo"
              >
                <Camera className="h-4 w-4 text-white" />
              </label>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <CardTitle className="text-2xl font-bold">{profile.name || "Your Name"}</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">{profile.email || "—"}</p>
          </CardHeader>

          <CardContent className="px-8 pb-10 pt-8 space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="font-medium">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="h-12"
              />
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                disabled
                className="h-12 bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="font-medium">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={profile.phone}
                onChange={handleChange}
                placeholder="+94 71 234 5678"
                className="h-12"
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 px-8 h-12 text-base font-semibold min-w-[220px] gap-2"
              >
                {saving ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Saving..." : "Save & Return"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}