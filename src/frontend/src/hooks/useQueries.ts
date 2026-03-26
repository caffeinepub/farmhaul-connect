import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Message, UserProfile, UserRole, VehicleInfo } from "../backend.d";
import type { PickupRequest } from "../backend.d";
import { useActor } from "./useActor";

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegister() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      phone,
      role,
    }: {
      name: string;
      phone: string;
      role: UserRole;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.register(name, phone, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useMyRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<PickupRequest[]>({
    queryKey: ["myRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyRequests();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useAvailableRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<PickupRequest[]>({
    queryKey: ["availableRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableRequests();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useMyTrips() {
  const { actor, isFetching } = useActor();
  return useQuery<PickupRequest[]>({
    queryKey: ["myTrips"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyTrips();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useCreateRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      cropType: string;
      quantity: string;
      pickupLocation: string;
      destination: string;
      preferredDate: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createRequest(
        data.cropType,
        data.quantity,
        data.pickupLocation,
        data.destination,
        data.preferredDate,
        data.notes,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myRequests"] });
    },
  });
}

export function useAcceptRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.acceptRequest(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availableRequests"] });
      queryClient.invalidateQueries({ queryKey: ["myTrips"] });
    },
  });
}

export function useStartDelivery() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.startDelivery(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTrips"] });
    },
  });
}

export function useCompleteDelivery() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.completeDelivery(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTrips"] });
    },
  });
}

export function useCancelRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.cancelRequest(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myRequests"] });
    },
  });
}

export function useGetMessages(requestId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Message[]>({
    queryKey: ["messages", requestId?.toString()],
    queryFn: async () => {
      if (!actor || requestId === null) return [];
      return actor.getMessagesByRequest(requestId);
    },
    enabled: !!actor && !isFetching && requestId !== null,
    refetchInterval: 4000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requestId,
      text,
    }: { requestId: bigint; text: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.sendMessage(requestId, text);
    },
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", requestId.toString()],
      });
    },
  });
}

export function useVehicleInfo() {
  const { actor, isFetching } = useActor();
  return useQuery<VehicleInfo | null>({
    queryKey: ["vehicleInfo"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerVehicleInfo();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveVehicleInfo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      vehicleType,
      vehicleCapacity,
    }: { vehicleType: string; vehicleCapacity: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveVehicleInfo(vehicleType, vehicleCapacity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicleInfo"] });
    },
  });
}
