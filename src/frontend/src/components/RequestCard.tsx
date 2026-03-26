import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, MapPin, Package, User } from "lucide-react";
import type { PickupRequest } from "../backend.d";
import { RequestStatus } from "../backend.d";
import { useLanguage } from "../contexts/LanguageContext";

const statusClassName: Record<RequestStatus, string> = {
  [RequestStatus.pending]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [RequestStatus.accepted]: "bg-blue-100 text-blue-800 border-blue-200",
  [RequestStatus.inProgress]: "bg-orange-100 text-orange-800 border-orange-200",
  [RequestStatus.delivered]: "bg-green-100 text-green-800 border-green-200",
  [RequestStatus.cancelled]: "bg-red-100 text-red-800 border-red-200",
};

const statusKey: Record<RequestStatus, string> = {
  [RequestStatus.pending]: "status.pending",
  [RequestStatus.accepted]: "status.accepted",
  [RequestStatus.inProgress]: "status.inProgress",
  [RequestStatus.delivered]: "status.delivered",
  [RequestStatus.cancelled]: "status.cancelled",
};

interface Props {
  request: PickupRequest;
  index: number;
  actions?: React.ReactNode;
}

export default function RequestCard({ request, index, actions }: Props) {
  const { t } = useLanguage();
  const className =
    statusClassName[request.status] ?? "bg-gray-100 text-gray-800";
  const key = statusKey[request.status];
  const label = key ? t(key) : String(request.status);

  return (
    <div
      className="bg-white rounded-2xl border border-border shadow-card p-5 flex flex-col gap-4"
      data-ocid={`request.item.${index}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-green" />
            <span className="font-bold text-brand-dark text-lg">
              {request.cropType}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">
            {request.quantity}
          </p>
        </div>
        <Badge
          className={`${className} border rounded-pill text-xs font-semibold px-3 py-1`}
        >
          {label}
        </Badge>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="w-4 h-4 flex-shrink-0 text-brand-green" />
        <span className="font-medium text-foreground">
          {request.pickupLocation}
        </span>
        <ArrowRight className="w-4 h-4 flex-shrink-0" />
        <span className="font-medium text-foreground">
          {request.destination}
        </span>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          <span>{request.farmerName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{request.preferredDate}</span>
        </div>
        {request.transporterName && (
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-brand-green" />
            <span className="text-brand-dark">{request.transporterName}</span>
          </div>
        )}
      </div>

      {request.notes && (
        <p className="text-sm text-muted-foreground italic border-t border-border pt-3">
          {request.notes}
        </p>
      )}

      {actions && (
        <div className="flex gap-2 pt-1 border-t border-border">{actions}</div>
      )}
    </div>
  );
}
