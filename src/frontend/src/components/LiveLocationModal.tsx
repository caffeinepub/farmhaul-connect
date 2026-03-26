import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, Navigation, Truck, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { PickupRequest } from "../backend.d";
import { RequestStatus } from "../backend.d";

interface LiveLocationModalProps {
  open: boolean;
  onClose: () => void;
  activeRequests: PickupRequest[];
}

interface DriverLocation {
  lat: number;
  lng: number;
  requestId: string;
  updatedAt: number;
}

export default function LiveLocationModal({
  open,
  onClose,
  activeRequests,
}: LiveLocationModalProps) {
  const trackedRequest = activeRequests.find(
    (r) =>
      r.transporterId &&
      (r.status === RequestStatus.accepted ||
        r.status === RequestStatus.inProgress),
  );

  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(
    null,
  );
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Poll localStorage every 5 seconds for driver's real GPS position
  useEffect(() => {
    if (!open || !trackedRequest) return;

    const requestId = trackedRequest.id.toString();

    const poll = () => {
      const raw = localStorage.getItem("farmhaul_driver_location");
      if (!raw) {
        setDriverLocation(null);
        return;
      }
      try {
        const entry: DriverLocation = JSON.parse(raw);
        if (entry.requestId === requestId) {
          setDriverLocation(entry);
          setLastUpdated(new Date(entry.updatedAt));
        } else {
          setDriverLocation(null);
        }
      } catch {
        setDriverLocation(null);
      }
    };

    poll(); // immediate first check
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [open, trackedRequest]);

  // Derive map pin position from real coords
  const BASE_LAT = driverLocation?.lat ?? 0;
  const BASE_LNG = driverLocation?.lng ?? 0;
  // We use a fixed anchor for the map centre and shift the pin relative to it
  // Since we only show one pin, simply place it at 50/50 when real data exists
  const pinX = 50;
  const pinY = 40;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-md rounded-2xl p-0 overflow-hidden"
        data-ocid="live_location.dialog"
      >
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-brand-dark">
              <MapPin className="w-5 h-5 text-brand-green" />
              Live Location Tracker
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full w-8 h-8 p-0"
              data-ocid="live_location.close_button"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6">
          {!trackedRequest ? (
            <div
              className="text-center py-10"
              data-ocid="live_location.empty_state"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-brand-dark mb-1">
                No Active Transport
              </h3>
              <p className="text-sm text-muted-foreground">
                You'll be able to track your transporter's location once they
                accept your pickup request.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Transporter info */}
              <div className="flex items-center gap-3 bg-muted rounded-xl p-3">
                <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-brand-green" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-brand-dark">
                    {trackedRequest.transporterName ?? "Your Transporter"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {trackedRequest.cropType} · {trackedRequest.quantity}
                  </p>
                </div>
                <Badge
                  className="text-xs bg-brand-green/10 text-brand-green border-brand-green/20"
                  variant="outline"
                >
                  {trackedRequest.status === RequestStatus.inProgress
                    ? "In Transit"
                    : "Accepted"}
                </Badge>
              </div>

              {/* Waiting state — driver hasn't shared yet */}
              {!driverLocation ? (
                <div
                  className="flex flex-col items-center justify-center h-52 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200 gap-3"
                  data-ocid="live_location.loading_state"
                >
                  <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center">
                    <Navigation className="w-6 h-6 text-brand-green animate-pulse" />
                  </div>
                  <p className="text-sm font-medium text-brand-dark">
                    Waiting for driver's location…
                  </p>
                  <p className="text-xs text-muted-foreground text-center px-4">
                    The driver's position will appear here once they start
                    sharing their GPS.
                  </p>
                </div>
              ) : (
                <>
                  {/* Map area */}
                  <div className="relative w-full h-52 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl overflow-hidden border border-green-200">
                    {/* Grid lines */}
                    <svg
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full opacity-20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <pattern
                          id="grid"
                          width="24"
                          height="24"
                          patternUnits="userSpaceOnUse"
                        >
                          <path
                            d="M 24 0 L 0 0 0 24"
                            fill="none"
                            stroke="#16a34a"
                            strokeWidth="0.5"
                          />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>

                    {/* Route line */}
                    <svg
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <line
                        x1="15%"
                        y1="80%"
                        x2={`${pinX}%`}
                        y2={`${pinY}%`}
                        stroke="#16a34a"
                        strokeWidth="2"
                        strokeDasharray="6 3"
                        opacity="0.5"
                      />
                    </svg>

                    {/* Origin pin */}
                    <div className="absolute bottom-4 left-4 flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow" />
                      <span className="text-[10px] text-blue-700 font-medium mt-0.5">
                        Origin
                      </span>
                    </div>

                    {/* Driver pin */}
                    <div
                      className="absolute transition-all duration-1000 ease-out flex flex-col items-center"
                      style={{
                        left: `${pinX}%`,
                        top: `${pinY}%`,
                        transform: "translate(-50%, -100%)",
                      }}
                    >
                      <div className="relative">
                        <div className="absolute -inset-2 rounded-full bg-brand-green/30 animate-ping" />
                        <div className="relative w-8 h-8 rounded-full bg-brand-green border-2 border-white shadow-lg flex items-center justify-center">
                          <Navigation className="w-4 h-4 text-white fill-white" />
                        </div>
                      </div>
                      <div className="mt-1 bg-white/90 backdrop-blur-sm text-[10px] font-semibold text-brand-dark px-2 py-0.5 rounded-full shadow">
                        Driver
                      </div>
                    </div>
                  </div>

                  {/* Coordinates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted rounded-xl p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Latitude
                      </p>
                      <p className="font-mono text-sm font-semibold text-brand-dark">
                        {BASE_LAT.toFixed(5)}
                      </p>
                    </div>
                    <div className="bg-muted rounded-xl p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Longitude
                      </p>
                      <p className="font-mono text-sm font-semibold text-brand-dark">
                        {BASE_LNG.toFixed(5)}
                      </p>
                    </div>
                  </div>

                  {/* Last updated */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse inline-block" />
                      Live tracking active
                    </span>
                    <span>
                      Updated{" "}
                      {lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    Location updates every 5 seconds
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
