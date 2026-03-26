import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  History,
  Leaf,
  Loader2,
  LogOut,
  MessageCircle,
  Package,
  Search,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { PickupRequest, UserProfile } from "../backend.d";
import { RequestStatus } from "../backend.d";
import LanguageSwitcher from "../components/LanguageSwitcher";
import MessagingPanel from "../components/MessagingPanel";
import RequestCard from "../components/RequestCard";
import { useLanguage } from "../contexts/LanguageContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAcceptRequest,
  useAvailableRequests,
  useCompleteDelivery,
  useMyTrips,
  useStartDelivery,
} from "../hooks/useQueries";

export default function TransporterDashboard({
  profile,
}: { profile: UserProfile }) {
  const { clear, identity } = useInternetIdentity();
  const { data: available, isLoading: loadingAvailable } =
    useAvailableRequests();
  const { data: trips, isLoading: loadingTrips } = useMyTrips();
  const acceptRequest = useAcceptRequest();
  const startDelivery = useStartDelivery();
  const completeDelivery = useCompleteDelivery();
  const { t } = useLanguage();
  const [messagingRequest, setMessagingRequest] =
    useState<PickupRequest | null>(null);

  const activeTrips = (trips ?? []).filter((r) =>
    [RequestStatus.accepted, RequestStatus.inProgress].includes(r.status),
  );
  const deliveredTrips = (trips ?? []).filter(
    (r) => r.status === RequestStatus.delivered,
  );

  const handleAccept = async (id: bigint) => {
    try {
      await acceptRequest.mutateAsync(id);
      toast.success(t("transporter.accept.success"));
    } catch {
      toast.error(t("transporter.accept.failed"));
    }
  };

  const handleStart = async (id: bigint) => {
    try {
      await startDelivery.mutateAsync(id);
      toast.success(t("transporter.start.success"));
    } catch {
      toast.error(t("transporter.start.failed"));
    }
  };

  const handleComplete = async (id: bigint) => {
    try {
      await completeDelivery.mutateAsync(id);
      toast.success(t("transporter.complete.success"));
    } catch {
      toast.error(t("transporter.complete.failed"));
    }
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-xs">
        <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-brand-green" />
            <span className="text-lg font-bold text-brand-dark font-jakarta">
              {t("app.name")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {profile.name}
              </span>
              <span className="ml-2 text-xs bg-brand-dark text-white px-2 py-0.5 rounded-pill font-semibold">
                {t("badge.transporter")}
              </span>
            </div>
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              className="text-muted-foreground hover:text-foreground"
              data-ocid="header.logout.button"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-brand-dark">
            {t("transporter.title")}
          </h1>
          <p className="text-muted-foreground">{t("transporter.subtitle")}</p>
        </div>

        <Tabs defaultValue="available" className="w-full">
          <TabsList
            className="mb-6 bg-white border border-border rounded-xl p-1"
            data-ocid="transporter.tabs.tab"
          >
            <TabsTrigger
              value="available"
              className="rounded-lg gap-2 data-[state=active]:bg-brand-green data-[state=active]:text-white"
            >
              <Search className="w-4 h-4" /> {t("transporter.tab.available")}
            </TabsTrigger>
            <TabsTrigger
              value="trips"
              className="rounded-lg gap-2 data-[state=active]:bg-brand-green data-[state=active]:text-white"
            >
              <Truck className="w-4 h-4" /> {t("transporter.tab.trips")}
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-lg gap-2 data-[state=active]:bg-brand-green data-[state=active]:text-white"
            >
              <History className="w-4 h-4" /> {t("transporter.tab.history")}
            </TabsTrigger>
          </TabsList>

          {/* Available Pickups */}
          <TabsContent value="available">
            {loadingAvailable ? (
              <div className="space-y-4" data-ocid="available.loading_state">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-40 rounded-2xl" />
                ))}
              </div>
            ) : (available ?? []).length === 0 ? (
              <div
                className="text-center py-16 bg-white rounded-2xl shadow-card"
                data-ocid="available.empty_state"
              >
                <Search className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-brand-dark">
                  {t("transporter.available.empty.title")}
                </h3>
                <p className="text-muted-foreground mt-2">
                  {t("transporter.available.empty.desc")}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {(available ?? []).map((req, i) => (
                  <RequestCard
                    key={String(req.id)}
                    request={req}
                    index={i + 1}
                    actions={
                      <Button
                        size="sm"
                        className="rounded-pill bg-brand-green text-white hover:opacity-90"
                        onClick={() => handleAccept(req.id)}
                        disabled={acceptRequest.isPending}
                        data-ocid={`available.primary_button.${i + 1}`}
                      >
                        {acceptRequest.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          t("transporter.accept")
                        )}
                      </Button>
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Trips */}
          <TabsContent value="trips">
            {loadingTrips ? (
              <div className="space-y-4" data-ocid="trips.loading_state">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-40 rounded-2xl" />
                ))}
              </div>
            ) : activeTrips.length === 0 ? (
              <div
                className="text-center py-16 bg-white rounded-2xl shadow-card"
                data-ocid="trips.empty_state"
              >
                <Package className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-brand-dark">
                  {t("transporter.trips.empty.title")}
                </h3>
                <p className="text-muted-foreground mt-2">
                  {t("transporter.trips.empty.desc")}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {activeTrips.map((req, i) => (
                  <RequestCard
                    key={String(req.id)}
                    request={req}
                    index={i + 1}
                    actions={
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-pill border-brand-green text-brand-green hover:bg-brand-green hover:text-white gap-1.5"
                          onClick={() => setMessagingRequest(req)}
                          data-ocid={`trips.open_modal_button.${i + 1}`}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Message
                        </Button>
                        {req.status === RequestStatus.accepted && (
                          <Button
                            size="sm"
                            className="rounded-pill bg-brand-dark text-white hover:opacity-90"
                            onClick={() => handleStart(req.id)}
                            disabled={startDelivery.isPending}
                            data-ocid={`trips.primary_button.${i + 1}`}
                          >
                            {startDelivery.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              t("transporter.start")
                            )}
                          </Button>
                        )}
                        {req.status === RequestStatus.inProgress && (
                          <Button
                            size="sm"
                            className="rounded-pill bg-brand-green text-white hover:opacity-90"
                            onClick={() => handleComplete(req.id)}
                            disabled={completeDelivery.isPending}
                            data-ocid={`trips.secondary_button.${i + 1}`}
                          >
                            {completeDelivery.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              t("transporter.complete")
                            )}
                          </Button>
                        )}
                      </>
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* History */}
          <TabsContent value="history">
            {loadingTrips ? (
              <div className="space-y-4" data-ocid="history.loading_state">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-40 rounded-2xl" />
                ))}
              </div>
            ) : deliveredTrips.length === 0 ? (
              <div
                className="text-center py-16 bg-white rounded-2xl shadow-card"
                data-ocid="history.empty_state"
              >
                <History className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-brand-dark">
                  {t("transporter.history.empty.title")}
                </h3>
                <p className="text-muted-foreground mt-2">
                  {t("transporter.history.empty.desc")}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {deliveredTrips.map((req, i) => (
                  <RequestCard
                    key={String(req.id)}
                    request={req}
                    index={i + 1}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border bg-white">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-green hover:underline"
        >
          caffeine.ai
        </a>
      </footer>

      {messagingRequest && (
        <MessagingPanel
          open={!!messagingRequest}
          onClose={() => setMessagingRequest(null)}
          request={messagingRequest}
          currentUserPrincipal={identity?.getPrincipal().toString() ?? ""}
          currentUserName={profile.name}
        />
      )}
    </div>
  );
}
