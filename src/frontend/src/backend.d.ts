import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PickupRequest {
    id: bigint;
    status: RequestStatus;
    destination: string;
    farmerId: Principal;
    createdAt: bigint;
    updatedAt: bigint;
    preferredDate: string;
    notes: string;
    quantity: string;
    cropType: string;
    transporterId?: Principal;
    transporterName?: string;
    farmerName: string;
    pickupLocation: string;
}
export interface Message {
    id: bigint;
    requestId: bigint;
    text: string;
    fromPrincipal: Principal;
    timestamp: bigint;
    fromName: string;
}
export interface UserProfile {
    userRole: UserRole;
    name: string;
    phone: string;
}
export enum RequestStatus {
    cancelled = "cancelled",
    pending = "pending",
    delivered = "delivered",
    accepted = "accepted",
    inProgress = "inProgress"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptRequest(requestId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelRequest(requestId: bigint): Promise<void>;
    completeDelivery(requestId: bigint): Promise<void>;
    createRequest(cropType: string, quantity: string, pickupLocation: string, destination: string, preferredDate: string, notes: string): Promise<bigint>;
    getAllRequests(): Promise<Array<PickupRequest>>;
    getAvailableRequests(): Promise<Array<PickupRequest>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMessagesByRequest(requestId: bigint): Promise<Array<Message>>;
    getMyRequests(): Promise<Array<PickupRequest>>;
    getMyTrips(): Promise<Array<PickupRequest>>;
    getRequestById(id: bigint): Promise<PickupRequest | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    register(name: string, phone: string, role: UserRole): Promise<UserProfile>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(requestId: bigint, text: string): Promise<void>;
    startDelivery(requestId: bigint): Promise<void>;
}
