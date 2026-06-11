import React, { useEffect, useState } from "react";
import { FaCamera } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { FiMail, FiUser, FiEdit3 } from "react-icons/fi";
import toast from "react-hot-toast";
import { getUserProfile } from "../lib/auth";
import supabase from "../lib/supabase";
import { DEFAULT_AVATAR } from "../lib/constants";

export const ProfilePage = () => {
  const [username, setUserName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await getUserProfile(user.id);
      if (profile) {
        setUserName(profile.username || "");
        setAvatarUrl(profile.avatar_url);
        setBio(profile.bio || "");
      }
    } catch (error) {
      console.error("error getting user profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size is too large (max 2MB)", { position: "top-center" });
        return;
      }
      setAvatar(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let updates = { username, bio };

      if (avatar) {
        const fileEx = avatar.name.split(".").pop();
        const fileName = `${user.id}-${Math.random().toString(32).substring(2)}`;
        const filePath = `avatars/${fileName}.${fileEx}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatar);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
        updates.avatar_url = data.publicUrl;
        setAvatarUrl(data.publicUrl);
      }

      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id)
        .select("username, avatar_url, bio")
        .single();

      if (error) throw error;

      setUserName(data.username);
      setAvatarUrl(data.avatar_url);
      setBio(data.bio || "");
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
          <div className="gradient-hero px-6 py-10">
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/30 shadow-xl">
                  <img
                    src={avatarUrl || DEFAULT_AVATAR}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <label
                  className="absolute bottom-0 right-0 bg-white rounded-full p-2.5 shadow-lg cursor-pointer hover:scale-110 transition-transform"
                  htmlFor="avatar-upload"
                >
                  <FaCamera className="w-5 h-5 text-brand-600" />
                </label>
                <input
                  className="hidden"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  id="avatar-upload"
                />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-white">
                {username || "Your Profile"}
              </h2>
              <p className="text-brand-100">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  className="input-field !pl-12"
                  value={username}
                  required
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  className="input-field !pl-12 !bg-gray-50"
                  value={user?.email || ""}
                  disabled
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
              <div className="relative">
                <FiEdit3 className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                <textarea
                  className="input-field !pl-12 min-h-[120px] resize-y"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell others about yourself, your skills, and experience..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
