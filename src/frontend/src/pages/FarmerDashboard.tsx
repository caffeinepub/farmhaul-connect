import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Bot,
  ClipboardList,
  History,
  Leaf,
  Loader2,
  LogOut,
  MessageCircle,
  Phone,
  Plus,
  Wheat,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { PickupRequest, UserProfile } from "../backend.d";
import { RequestStatus } from "../backend.d";
import CallManager from "../components/CallManager";
import FarmerVoiceAssistant from "../components/FarmerVoiceAssistant";
import LanguageSwitcher from "../components/LanguageSwitcher";
import MessagingPanel from "../components/MessagingPanel";
import RequestCard from "../components/RequestCard";
import { useLanguage } from "../contexts/LanguageContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCancelRequest,
  useCreateRequest,
  useMyRequests,
} from "../hooks/useQueries";

export default function FarmerDashboard({ profile }: { profile: UserProfile }) {
  const { clear, identity } = useInternetIdentity();
  const { data: requests, isLoading } = useMyRequests();
  const createRequest = useCreateRequest();
  const cancelRequest = useCancelRequest();
  const { t } = useLanguage();
  const [messagingRequest, setMessagingRequest] =
    useState<PickupRequest | null>(null);
  const [callingRequest, setCallingRequest] = useState<{
    request: PickupRequest;
    type: "audio" | "video";
  } | null>(null);
  const [callPickerRequest, setCallPickerRequest] =
    useState<PickupRequest | null>(null);

  const [form, setForm] = useState({
    cropType: "",
    quantity: "",
    pickupLocation: "",
    destination: "",
    preferredDate: "",
    notes: "",
  });

  const activeRequests = (requests ?? []).filter((r) =>
    [
      RequestStatus.pending,
      RequestStatus.accepted,
      RequestStatus.inProgress,
    ].includes(r.status),
  );
  const historyRequests = (requests ?? []).filter((r) =>
    [RequestStatus.delivered, RequestStatus.cancelled].includes(r.status),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { cropType, quantity, pickupLocation, destination, preferredDate } =
      form;
    if (
      !cropType ||
      !quantity ||
      !pickupLocation ||
      !destination ||
      !preferredDate
    ) {
      toast.error(t("farmer.form.required"));
      return;
    }
    try {
      await createRequest.mutateAsync(form);
      setForm({
        cropType: "",
        quantity: "",
        pickupLocation: "",
        destination: "",
        preferredDate: "",
        notes: "",
      });
      toast.success(t("farmer.form.success"));
    } catch {
      toast.error(t("farmer.form.failed"));
    }
  };

  const handleCancel = async (id: bigint) => {
    try {
      await cancelRequest.mutateAsync(id);
      toast.success(t("farmer.cancel.success"));
    } catch {
      toast.error(t("farmer.cancel.failed"));
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
              <span className="ml-2 text-xs bg-accent text-brand-dark px-2 py-0.5 rounded-pill font-semibold">
                {t("badge.farmer")}
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
            {t("farmer.title")}
          </h1>
          <p className="text-muted-foreground">{t("farmer.subtitle")}</p>
        </div>

        <Tabs defaultValue="new" className="w-full">
          <TabsList
            className="mb-6 bg-white border border-border rounded-xl p-1"
            data-ocid="farmer.tabs.tab"
          >
            <TabsTrigger
              value="new"
              className="rounded-lg gap-2 data-[state=active]:bg-brand-green data-[state=active]:text-white"
            >
              <Plus className="w-4 h-4" /> {t("farmer.tab.new")}
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="rounded-lg gap-2 data-[state=active]:bg-brand-green data-[state=active]:text-white"
            >
              <ClipboardList className="w-4 h-4" /> {t("farmer.tab.active")}
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-lg gap-2 data-[state=active]:bg-brand-green data-[state=active]:text-white"
            >
              <History className="w-4 h-4" /> {t("farmer.tab.history")}
            </TabsTrigger>
            <TabsTrigger
              value="ai"
              className="rounded-lg gap-2 data-[state=active]:bg-brand-green data-[state=active]:text-white"
              data-ocid="ai_assistant.tab"
            >
              <Bot className="w-4 h-4" /> {t("farmer.tab.ai")}
            </TabsTrigger>
          </TabsList>

          {/* New Request */}
          <TabsContent value="new">
            <div className="bg-white rounded-2xl shadow-card p-6 max-w-xl">
              <h2 className="text-lg font-bold text-brand-dark mb-5">
                {t("farmer.form.title")}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cropType">{t("farmer.form.crop")}</Label>
                    <Input
                      id="cropType"
                      placeholder="e.g. Maize, Tomatoes"
                      value={form.cropType}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, cropType: e.target.value }))
                      }
                      data-ocid="request.crop_type.input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">
                      {t("farmer.form.quantity")}
                    </Label>
                    <Input
                      id="quantity"
                      placeholder="e.g. 50 kg, 10 sacks"
                      value={form.quantity}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, quantity: e.target.value }))
                      }
                      data-ocid="request.quantity.input"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickupLocation">
                    {t("farmer.form.pickup")}
                  </Label>
                  <Input
                    id="pickupLocation"
                    placeholder="e.g. Kiambu Farm, Nairobi"
                    value={form.pickupLocation}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, pickupLocation: e.target.value }))
                    }
                    data-ocid="request.pickup_location.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">
                    {t("farmer.form.destination")}
                  </Label>
                  <Input
                    id="destination"
                    placeholder="e.g. Wakulima Market, Nairobi"
                    value={form.destination}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, destination: e.target.value }))
                    }
                    data-ocid="request.destination.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferredDate">{t("farmer.form.date")}</Label>
                  <Input
                    id="preferredDate"
                    type="date"
                    value={form.preferredDate}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, preferredDate: e.target.value }))
                    }
                    data-ocid="request.preferred_date.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">{t("farmer.form.notes")}</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions or additional information..."
                    rows={3}
                    value={form.notes}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, notes: e.target.value }))
                    }
                    data-ocid="request.notes.textarea"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-pill bg-brand-green text-white hover:opacity-90"
                  disabled={createRequest.isPending}
                  data-ocid="request.submit_button"
                >
                  {createRequest.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                      {t("farmer.form.submitting")}
                    </>
                  ) : (
                    t("farmer.form.submit")
                  )}
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* My Requests */}
          <TabsContent value="active">
            {isLoading ? (
              <div className="space-y-4" data-ocid="requests.loading_state">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-40 rounded-2xl" />
                ))}
              </div>
            ) : activeRequests.length === 0 ? (
              <div
                className="text-center py-16 bg-white rounded-2xl shadow-card"
                data-ocid="requests.empty_state"
              >
                <ClipboardList className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-brand-dark">
                  {t("farmer.empty.title")}
                </h3>
                <p className="text-muted-foreground mt-2">
                  {t("farmer.empty.desc")}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {activeRequests.map((req, i) => (
                  <RequestCard
                    key={String(req.id)}
                    request={req}
                    index={i + 1}
                    actions={
                      <>
                        {req.transporterId && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-pill border-brand-green text-brand-green hover:bg-brand-green hover:text-white gap-1.5"
                              onClick={() => setMessagingRequest(req)}
                              data-ocid={`request.open_modal_button.${i + 1}`}
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              Message
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-pill border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white gap-1.5"
                              onClick={() => setCallPickerRequest(req)}
                              data-ocid={`request.secondary_button.${i + 1}`}
                            >
                              <Phone className="w-3.5 h-3.5" />
                              Call
                            </Button>
                          </>
                        )}
                        {req.status === RequestStatus.pending && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-pill border-destructive text-destructive hover:bg-destructive hover:text-white"
                            onClick={() => handleCancel(req.id)}
                            disabled={cancelRequest.isPending}
                            data-ocid={`request.delete_button.${i + 1}`}
                          >
                            {t("farmer.cancel")}
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
            {isLoading ? (
              <div className="space-y-4" data-ocid="history.loading_state">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-40 rounded-2xl" />
                ))}
              </div>
            ) : historyRequests.length === 0 ? (
              <div
                className="text-center py-16 bg-white rounded-2xl shadow-card"
                data-ocid="history.empty_state"
              >
                <Wheat className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-brand-dark">
                  {t("farmer.history.empty.title")}
                </h3>
                <p className="text-muted-foreground mt-2">
                  {t("farmer.history.empty.desc")}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {historyRequests.map((req, i) => (
                  <RequestCard
                    key={String(req.id)}
                    request={req}
                    index={i + 1}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* AI Assistant */}
          <TabsContent value="ai">
            <FarmerVoiceAssistant />
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

      {/* Call type picker */}
      {callPickerRequest && !callingRequest && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop dismiss is supplementary
        <div
          className="fixed inset-0 z-[90] bg-black/60 flex items-center justify-center"
          onClick={() => setCallPickerRequest(null)}
          data-ocid="call.dialog"
        >
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: inner stop-propagation */}
          <div
            className="bg-white rounded-2xl p-6 shadow-xl w-72 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-brand-dark text-center">
              Start a Call
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              with {callPickerRequest.transporterName ?? "Transporter"}
            </p>
            <Button
              className="rounded-pill bg-brand-green text-white gap-2"
              onClick={() => {
                setCallingRequest({
                  request: callPickerRequest,
                  type: "audio",
                });
                setCallPickerRequest(null);
              }}
              data-ocid="call.primary_button"
            >
              <Phone className="w-4 h-4" /> Audio Call
            </Button>
            <Button
              variant="outline"
              className="rounded-pill border-brand-green text-brand-green gap-2"
              onClick={() => {
                setCallingRequest({
                  request: callPickerRequest,
                  type: "video",
                });
                setCallPickerRequest(null);
              }}
              data-ocid="call.secondary_button"
            >
              <Phone className="w-4 h-4" /> Video Call
            </Button>
            <Button
              variant="ghost"
              className="rounded-pill text-muted-foreground"
              onClick={() => setCallPickerRequest(null)}
              data-ocid="call.cancel_button"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {callingRequest && (
        <CallManager
          open={!!callingRequest}
          onClose={() => setCallingRequest(null)}
          request={callingRequest.request}
          currentUserPrincipal={identity?.getPrincipal().toString() ?? ""}
          isInitiator={false}
          callType={callingRequest.type}
        />
      )}
    </div>
  );
}
