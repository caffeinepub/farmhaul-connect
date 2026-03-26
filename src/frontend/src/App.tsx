import { Toaster } from "@/components/ui/sonner";
import { Leaf, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import ChatBot from "./components/ChatBot";
import { LanguageProvider } from "./contexts/LanguageContext";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useUserProfile } from "./hooks/useQueries";
import FarmerDashboard from "./pages/FarmerDashboard";
import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import TransporterDashboard from "./pages/TransporterDashboard";

export type AppRole = "farmer" | "transporter";

function AppInner() {
  const { identity, isInitializing } = useInternetIdentity();
  const { isFetching: actorFetching } = useActor();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const [storedRole, setStoredRole] = useState<AppRole | null>(null);

  const principalId = identity?.getPrincipal().toString();

  useEffect(() => {
    if (principalId) {
      const r = localStorage.getItem(
        `farmhaul_role_${principalId}`,
      ) as AppRole | null;
      setStoredRole(r);
    } else {
      setStoredRole(null);
    }
  }, [principalId]);

  const handleRoleSet = (role: AppRole) => {
    if (principalId) {
      localStorage.setItem(`farmhaul_role_${principalId}`, role);
      setStoredRole(role);
    }
  };

  if (isInitializing || (identity && (actorFetching || profileLoading))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-brand-green" />
            <span className="text-2xl font-bold text-brand-dark">
              FarmHaul Connect
            </span>
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <>
        <LandingPage />
        <Toaster />
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <RegisterPage onRoleSet={handleRoleSet} />
        <Toaster />
      </>
    );
  }

  if (!storedRole) {
    return (
      <>
        <RegisterPage onRoleSet={handleRoleSet} existingProfile={profile} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      {storedRole === "farmer" ? (
        <FarmerDashboard profile={profile} />
      ) : (
        <TransporterDashboard profile={profile} />
      )}
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
      <ChatBot />
    </LanguageProvider>
  );
}
