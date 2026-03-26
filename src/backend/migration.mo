import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";

module {
  type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    userProfiles : Map.Map<Principal.Principal, OldUserProfile>;
    pickupRequests : Map.Map<Nat, OldPickupRequest>;
    nextRequestId : Nat;
  };

  type OldUserProfile = {
    name : Text;
    phone : Text;
    userRole : AccessControl.UserRole;
  };

  type OldPickupRequest = {
    id : Nat;
    farmerId : Principal.Principal;
    farmerName : Text;
    cropType : Text;
    quantity : Text;
    pickupLocation : Text;
    destination : Text;
    preferredDate : Text;
    notes : Text;
    status : OldRequestStatus;
    transporterId : ?Principal.Principal;
    transporterName : ?Text;
    createdAt : Int.Int;
    updatedAt : Int.Int;
  };

  type OldRequestStatus = {
    #pending;
    #accepted;
    #inProgress;
    #delivered;
    #cancelled;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    userProfiles : Map.Map<Principal.Principal, NewUserProfile>;
    pickupRequests : Map.Map<Nat, NewPickupRequest>;
    nextRequestId : Nat;
    messages : Map.Map<Nat, NewMessage>;
    nextMessageId : Nat;
  };

  type NewUserProfile = OldUserProfile;
  type NewRequestStatus = OldRequestStatus;
  type NewPickupRequest = OldPickupRequest;
  type NewMessage = {
    id : Nat;
    fromPrincipal : Principal.Principal;
    fromName : Text;
    requestId : Nat;
    text : Text;
    timestamp : Int.Int;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      messages = Map.empty<Nat, NewMessage>();
      nextMessageId = 1;
    };
  };
};
