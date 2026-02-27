import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { ArrowLeft, User, Save, Upload } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profilePic: "",
  });

  const token = localStorage.getItem("token");

  // =========================
  // LOAD PROFILE FROM BACKEND
  // =========================
  useEffect(() => {
    if (!token) {
      navigate("/passenger-login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/passenger/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message);
        }

        setProfile(data);

        // Cache locally for dashboard use
        localStorage.setItem(
          "passengerProfile",
          JSON.stringify(data)
        );

      } catch (error) {
        console.error(error);
        alert("Failed to load profile");
      }
    };

    fetchProfile();
  }, [token, navigate]);

  // =========================
  // HANDLE INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // IMAGE UPLOAD (BASE64)
  // =========================
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

  // =========================
  // SAVE PROFILE TO BACKEND
  // =========================
  const handleSave = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/passenger/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profile),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      // Update cache
      localStorage.setItem(
        "passengerProfile",
        JSON.stringify(profile)
      );

      alert("Profile saved successfully!");

    } catch (error) {
      console.error(error);
      alert("Failed to save profile");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-background/50 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/passenger-dashboard")}
          className="h-10 gap-2 hover:bg-muted transition-all duration-300 cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </Button>

        <h2 className="text-3xl font-bold tracking-tight">
          My Profile
        </h2>
      </div>

      <Card className="shadow-lg rounded-2xl border-border">
        <CardHeader>
          <CardTitle className="text-2xl">
            Personal Information
          </CardTitle>

          <CardDescription>
            Update your profile details
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 pt-6">

          {/* Profile Picture */}
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            
            <div className="relative w-32 h-32">
              {profile.profilePic ? (
                <img
                  src={profile.profilePic}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-4 border-background shadow-lg"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-lg">
                  <User className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <Label htmlFor="profilePic">
                Profile Picture
              </Label>

              <div className="flex items-center gap-4 flex-wrap">
                
                <label
                  htmlFor="profilePic"
                  className="cursor-pointer px-4 py-2 bg-muted hover:bg-muted/80 rounded-md transition-colors flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Photo
                </label>

                <Input
                  id="profilePic"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {profile.profilePic && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setProfile((prev) => ({
                        ...prev,
                        profilePic: "",
                      }))
                    }
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="space-y-2">
              <Label>First Name</Label>
              <Input
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
                className="h-11"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Email</Label>
              <Input
                value={profile.email}
                disabled
                className="h-11"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Phone</Label>
              <Input
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className="h-11"
              />
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end mt-8">
            <Button
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-700 px-8 py-6 text-lg font-medium"
            >
              <Save className="mr-2 h-5 w-5" />
              Save Profile
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}