import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  children,
  redirectedTo = "/signin",
}) {
  const { isLoggedIn, isLoading } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-green-500" />
      </div>
    );
  }

  // If user is already logged in → redirect
  if (!isLoggedIn) {
    return <Navigate to={redirectedTo} replace />;
  }

  // Otherwise → show page (login, signup, etc.)
  return children;
}