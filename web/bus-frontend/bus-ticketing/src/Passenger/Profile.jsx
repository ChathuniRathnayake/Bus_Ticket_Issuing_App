// src/Passenger/Profile.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Save, Camera } from "lucide-react";

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

    } catch (error) {
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-blue-50 to-violet-50 dark:from-zinc-950 dark:to-zinc-900 p-6">
      <div className="max-w-4xl mx-auto">
        
        <Button
          variant="ghost"
          onClick={() => navigate("/passenger-dashboard")}
          className="mb-6 gap-2 hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" /> Back to Dashboard
        </Button>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-violet-100 dark:from-zinc-800 dark:to-zinc-700 rounded-full flex items-center justify-center mb-4 relative overflow-hidden">
              {profile.profilePic ? (
                <img
                  src={profile.profilePic}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-zinc-800"
                />
              ) : (
                <User className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              )}

              <label 
                htmlFor="profile-upload"
                className="absolute bottom-1 right-1 bg-white dark:bg-zinc-700 p-2 rounded-full shadow cursor-pointer hover:bg-blue-50 transition-colors"
              >
                <Camera className="h-5 w-5 text-blue-600" />
              </label>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <CardTitle className="text-3xl font-bold">My Profile</CardTitle>
            <p className="text-muted-foreground mt-1">Update your personal information</p>
          </CardHeader>

          <CardContent className="px-8 pb-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="Enter name"
                  className="h-12"
                />
              </div>

             

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="h-12 bg-muted cursor-not-allowed"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="phone">Phone Number</Label>
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
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-6">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 px-10 py-6 text-lg font-medium min-w-[180px]"
              >
                {saving ? "Saving Changes..." : "Save & Return to Dashboard"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}