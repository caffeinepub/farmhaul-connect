# FarmHaul Connect

## Current State
The app has Farmer and Transporter dashboards with pickup request management. Each PickupRequest has a farmerId and optional transporterId. There is no messaging between users. The backend has user profiles, pickup requests, and authorization. The frontend uses React + Tailwind + lucide-react + shadcn.

## Requested Changes (Diff)

### Add
- Backend: Message type with fields (id, fromPrincipal, fromName, requestId, text, timestamp)
- Backend: `sendMessage(requestId: Nat, text: Text)` — stores a message tied to a pickup request
- Backend: `getMessagesByRequest(requestId: Nat)` — returns all messages for a request (query)
- Frontend: A "Message" button on each RequestCard (shown when a transporter is assigned or from the transporter side)
- Frontend: MessagingPanel component — a drawer/sheet that opens showing message history for a request
  - Scrollable message bubbles (self = right/green, other = left/muted)
  - Text input with send button
  - Mic button for voice-to-text (SpeechRecognition) that auto-sends on result
  - Polls for new messages every 4 seconds while open
- Frontend: Messaging button visible on RequestCards in both Farmer active requests and Transporter trips tabs (only when transporter is assigned)

### Modify
- RequestCard.tsx: accept optional `onMessage` prop to render a Message button
- FarmerDashboard.tsx: pass `onMessage` handler to RequestCards in active requests tab
- TransporterDashboard.tsx: pass `onMessage` handler to RequestCards in trips tab

### Remove
- Nothing

## Implementation Plan
1. Update backend main.mo: add Message type, messages map, nextMessageId, sendMessage, getMessagesByRequest
2. Regenerate bindings (handled automatically)
3. Create `src/frontend/src/components/MessagingPanel.tsx` — drawer-based messaging UI
4. Update `src/frontend/src/components/RequestCard.tsx` — add optional onMessage prop
5. Update `src/frontend/src/pages/FarmerDashboard.tsx` — open MessagingPanel from active requests
6. Update `src/frontend/src/pages/TransporterDashboard.tsx` — open MessagingPanel from trips
7. Update `src/frontend/src/hooks/useQueries.ts` — add useSendMessage and useGetMessages hooks
