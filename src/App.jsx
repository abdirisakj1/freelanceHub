import React from "react";
import { Route, Routes } from "react-router";
import { Toaster } from "react-hot-toast";
import { Header } from "./Components/Header";
import { Footer } from "./Components/Footer";
import { AuthProvider } from "./context/AuthContext";
import UnAuthenticatedRoute from "./Components/UnAuthenticatedRoute";
import ProtectedRoute from "./Components/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { JobsPage } from "./pages/JobsPage";
import { JobDetailsPage } from "./pages/JobDetailsPage";
import { MyJobsPage } from "./pages/MyJobsPage";
import { ApplicantsPage } from "./pages/ApplicantsPage";
import { MyApplicationsPage } from "./pages/MyApplicationsPage";
import { PublicProfilePage } from "./pages/PublicProfilePage";
import { ProfilePage } from "./pages/ProfilePage";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";

const App = () => {
  return (
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
            <Route path="/profile/:id" element={<PublicProfilePage />} />

            <Route
              path="/signin"
              element={
                <UnAuthenticatedRoute>
                  <SignInPage />
                </UnAuthenticatedRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <UnAuthenticatedRoute>
                  <SignUpPage />
                </UnAuthenticatedRoute>
              }
            />

            <Route
              path="/my-jobs"
              element={
                <ProtectedRoute>
                  <MyJobsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applicants"
              element={
                <ProtectedRoute>
                  <ApplicantsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-applications"
              element={
                <ProtectedRoute>
                  <MyApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster position="top-center" />
      </AuthProvider>
   
  );
};

export default App;
