import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { FiMail, FiUser } from "react-icons/fi";
import { DEFAULT_AVATAR } from "../lib/constants";
import { getUserProfile } from "../lib/auth";

export const PublicProfilePage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getUserProfile(id);
        setProfile(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Profile not found</h2>
          <Link to="/" className="btn-primary mt-4 inline-flex">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
          <div className="gradient-hero px-6 py-10">
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/30 shadow-xl">
                <img
                  src={profile.avatar_url || DEFAULT_AVATAR}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-white">
                {profile.username}
              </h2>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
              <FiUser className="w-5 h-5 text-brand-500" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Full Name</p>
                <p className="font-semibold text-gray-900">{profile.username}</p>
              </div>
            </div>

            {profile.email && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                <FiMail className="w-5 h-5 text-brand-500" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                  <p className="font-semibold text-gray-900">{profile.email}</p>
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-brand-50/50 border border-brand-100">
              <p className="text-xs text-brand-600 uppercase tracking-wide font-semibold mb-2">Bio</p>
              <p className="text-gray-700 leading-relaxed">
                {profile.bio || "This user hasn't added a bio yet."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
