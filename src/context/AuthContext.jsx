import { createContext, useContext, useEffect, useState } from "react";
import { getUserProfile, onAuthChange, signOut } from "../lib/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cleanUp = onAuthChange(async (user) => {
      console.log("Auth state changed, user:", user);
      setUser(user);

      if (user) {
        try {
          console.log("Fetching profile for user ID:", user.id);
          const userProfile = await getUserProfile(user.id);
          console.log("Fetched profile:", userProfile);
          setProfile(userProfile);
        } catch (error) {
          console.error("Error fetching profile:", error);
          setProfile(null);
        }
      } else {
        console.log("No user, setting profile to null");
        setProfile(null);
      }

      setIsLoading(false);
    });

    return cleanUp;
  }, []);

  const logout = async  () => {
    try {
        await signOut()
    } catch (error) {
        console.error("Error signing ouut", error)
    }
  }
  const value = {
    user,
    profile,
    isLoading,
    isLoggedIn: !!user,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}