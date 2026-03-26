import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Migration "migration";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

// Apply migration using with-clauses
(with migration = Migration.run)
actor {
  // Types
  type UserRole = AccessControl.UserRole;

  type UserProfile = {
    name : Text;
    phone : Text;
    userRole : UserRole;
  };

  type RequestStatus = {
    #pending;
    #accepted;
    #inProgress;
    #delivered;
    #cancelled;
  };

  type PickupRequest = {
    id : Nat;
    farmerId : Principal;
    farmerName : Text;
    cropType : Text;
    quantity : Text;
    pickupLocation : Text;
    destination : Text;
    preferredDate : Text;
    notes : Text;
    status : RequestStatus;
    transporterId : ?Principal;
    transporterName : ?Text;
    createdAt : Int;
    updatedAt : Int;
  };

  type Message = {
    id : Nat;
    fromPrincipal : Principal;
    fromName : Text;
    requestId : Nat;
    text : Text;
    timestamp : Int;
  };

  module PickupRequest {
    public func compare(req1 : PickupRequest, req2 : PickupRequest) : Order.Order {
      Nat.compare(req1.id, req2.id);
    };
  };

  module UserProfile {
    public func compare(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      Text.compare(profile1.name, profile2.name);
    };
  };

  module Message {
    public func compare(msg1 : Message, msg2 : Message) : Order.Order {
      Nat.compare(msg1.id, msg2.id);
    };
  };

  // State
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();
  let pickupRequests = Map.empty<Nat, PickupRequest>();
  let messages = Map.empty<Nat, Message>();

  var nextRequestId = 1;
  var nextMessageId = 1;

  // Profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { ?profile };
    };
  };

  // Pickup requests
  public query ({ caller }) func getAvailableRequests() : async [PickupRequest] {
    pickupRequests.values().toArray().filter(func(r) { r.status == #pending }).sort();
  };

  public shared ({ caller }) func createRequest(
    cropType : Text,
    quantity : Text,
    pickupLocation : Text,
    destination : Text,
    preferredDate : Text,
    notes : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create requests");
    };

    let farmer = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not registered") };
      case (?profile) { profile };
    };

    let id = nextRequestId;
    nextRequestId += 1;

    let now = Time.now();

    let request : PickupRequest = {
      id;
      farmerId = caller;
      farmerName = farmer.name;
      cropType;
      quantity;
      pickupLocation;
      destination;
      preferredDate;
      notes;
      status = #pending;
      transporterId = null;
      transporterName = null;
      createdAt = now;
      updatedAt = now;
    };

    pickupRequests.add(id, request);
    id;
  };

  public query ({ caller }) func getMyRequests() : async [PickupRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their requests");
    };
    pickupRequests.values().toArray().filter(func(r) { r.farmerId == caller }).sort();
  };

  public query ({ caller }) func getMyTrips() : async [PickupRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their trips");
    };
    pickupRequests.values().toArray().filter(func(r) {
      switch (r.transporterId) {
        case (null) { false };
        case (?id) { id == caller };
      }
    }).sort();
  };

  public query ({ caller }) func getRequestById(id : Nat) : async ?PickupRequest {
    pickupRequests.get(id);
  };

  // Transporter actions
  public shared ({ caller }) func acceptRequest(requestId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can accept requests");
    };

    let transporter = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not registered") };
      case (?profile) { profile };
    };

    let request = switch (pickupRequests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?req) { req };
    };

    if (request.status != #pending) {
      Runtime.trap("Request is not pending");
    };

    let updatedRequest = {
      request with
      status = #accepted;
      transporterId = ?caller;
      transporterName = ?transporter.name;
      updatedAt = Time.now();
    };

    pickupRequests.add(requestId, updatedRequest);
  };

  public shared ({ caller }) func startDelivery(requestId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can start delivery");
    };

    let request = switch (pickupRequests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?req) { req };
    };

    if (request.status != #accepted) {
      Runtime.trap("Request is not in accepted state");
    };

    switch (request.transporterId) {
      case (null) {
        Runtime.trap("Request has no assigned transporter");
      };
      case (?id) {
        if (id != caller) {
          Runtime.trap("Only the assigned transporter can start delivery");
        };
      };
    };

    let updatedRequest = {
      request with
      status = #inProgress;
      updatedAt = Time.now();
    };

    pickupRequests.add(requestId, updatedRequest);
  };

  public shared ({ caller }) func completeDelivery(requestId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete delivery");
    };

    let request = switch (pickupRequests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?req) { req };
    };

    if (request.status != #inProgress) {
      Runtime.trap("Request is not in progress");
    };

    switch (request.transporterId) {
      case (null) {
        Runtime.trap("Request has no assigned transporter");
      };
      case (?id) {
        if (id != caller) {
          Runtime.trap("Only the assigned transporter can complete delivery");
        };
      };
    };

    let updatedRequest = {
      request with
      status = #delivered;
      updatedAt = Time.now();
    };

    pickupRequests.add(requestId, updatedRequest);
  };

  public shared ({ caller }) func cancelRequest(requestId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel requests");
    };

    let request = switch (pickupRequests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?req) { req };
    };

    if (request.farmerId != caller) {
      Runtime.trap("Only the owner can cancel");
    };

    if (request.status != #pending) {
      Runtime.trap("Cannot cancel non-pending requests");
    };

    let updatedRequest = {
      request with
      status = #cancelled;
      updatedAt = Time.now();
    };

    pickupRequests.add(requestId, updatedRequest);
  };

  // Admin views
  public query ({ caller }) func getAllRequests() : async [PickupRequest] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all requests");
    };
    pickupRequests.values().toArray().sort();
  };

  // Custom registration with phone number
  public shared ({ caller }) func register(name : Text, phone : Text, role : UserRole) : async UserProfile {
    if (role == #admin and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("You are not authorized to register as admin");
    };
    let profile : UserProfile = {
      name;
      phone;
      userRole = role;
    };
    userProfiles.add(caller, profile);
    profile;
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Messaging system
  public shared ({ caller }) func sendMessage(requestId : Nat, text : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    let user = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    let request = switch (pickupRequests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?req) { req };
    };

    let isFarmer = request.farmerId == caller;
    let isTransporter = switch (request.transporterId) {
      case (null) { false };
      case (?id) { id == caller };
    };

    if (not (isFarmer or isTransporter)) {
      Runtime.trap("Unauthorized: Only involved parties can send messages");
    };

    let id = nextMessageId;
    nextMessageId += 1;

    let message : Message = {
      id;
      fromPrincipal = caller;
      fromName = user.name;
      requestId;
      text;
      timestamp = Time.now();
    };

    messages.add(id, message);
  };

  public query ({ caller }) func getMessagesByRequest(requestId : Nat) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };

    let request = switch (pickupRequests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?req) { req };
    };

    let isFarmer = request.farmerId == caller;
    let isTransporter = switch (request.transporterId) {
      case (null) { false };
      case (?id) { id == caller };
    };

    if (not (isFarmer or isTransporter)) {
      Runtime.trap("Unauthorized: Only involved parties can view messages");
    };

    messages.values().toArray().filter(func(m) { m.requestId == requestId }).sort();
  };
};
