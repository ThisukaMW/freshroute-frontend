// Admin page where admins can approve or reject users waiting to join the platform

import { useEffect, useState } from "react";
import { LocalStorageService } from "../../services/storage/LocalStorageService";

// The 3 possible roles a user can have on the platform
type UserRole = "BUYER" | "SELLER" | "DRIVER";

// Shape of a single pending user object coming from the API
interface PendingUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  city: string | null;
  createdAt: string;
  // Only sellers have this extra profile info — buyers and drivers won't have it
  sellerProfile?: {
    id: string;
    businessName: string;
    businessAddress: string;
    isApproved: boolean;
  } | null;
}

// Filter options for the tabs — either show all users or only one specific role
type RoleFilter = "ALL" | UserRole;

// Converts an ISO date string into a human-friendly "3h ago" or "2d ago" style string
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime(); // difference in milliseconds
  const m = Math.floor(diff / 60000); // convert ms to minutes
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); // convert minutes to hours
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`; // convert hours to days
}

// Lookup table — given a role, get its emoji, display label, text color, and background color
const roleConfig: Record<UserRole, { emoji: string; label: string; color: string; bg: string }> = {
  BUYER:  { emoji: "🛒", label: "Buyer",  color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/20" },
  SELLER: { emoji: "🏪", label: "Seller", color: "text-sky-400",     bg: "bg-sky-500/15 border-sky-500/20"         },
  DRIVER: { emoji: "🚚", label: "Driver", color: "text-violet-400",  bg: "bg-violet-500/15 border-violet-500/20"   },
};

const getRoleConfig = (role: string) =>
  roleConfig[role as UserRole] ?? {
    emoji: "👤",
    label: role,
    color: "text-slate-300",
    bg: "bg-white/10 border-white/10",
  };

// Pre-written list of reasons an admin can pick when rejecting someone
const REJECT_REASONS = [
  "Incomplete or suspicious registration details",
  "Business address could not be verified",
  "Duplicate account detected",
  "Does not meet platform requirements",
  "Invalid or unrecognized business",
  "Other (specify below)",
];

// ─── Reject Modal ─────────────────────────────────────────────────────────────

// Popup dialog that appears when admin clicks Reject — lets them pick a reason before confirming
const RejectModal = ({
  user,         // the user being rejected
  onConfirm,    // called with the final reason string when admin confirms
  onCancel,     // called when admin clicks Cancel or closes the modal
  isSubmitting, // true while the reject API call is in progress
}: {
  user: PendingUser;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) => {
  // Tracks which reason button the admin clicked
  const [selectedReason, setSelectedReason] = useState("");

  // Holds the typed text if admin picks "Other (specify below)"
  const [customReason, setCustomReason] = useState("");

  // True when the admin picked the "Other" option — shows the textarea
  const isOther = selectedReason === "Other (specify below)";

  // The actual reason string to send to the API — custom text if Other, otherwise the selected button
  const finalReason = isOther ? customReason.trim() : selectedReason;

  // Confirm button is only enabled if a reason is selected AND if Other, at least 6 characters typed
  const canSubmit = selectedReason && (!isOther || customReason.trim().length > 5);

  return (
    // Dark full-screen overlay behind the modal
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-gray-950 p-6 space-y-5 shadow-2xl">

        {/* Who is being rejected */}
        <div>
          <h2 className="text-base font-semibold text-slate-50">Reject Registration</h2>
          <p className="text-sm text-slate-400 mt-1">
            You are rejecting <span className="text-slate-200 font-medium">{user.name}</span> ({user.email}). Please select a reason.
          </p>
        </div>

        {/* One button for each pre-written reason — clicking selects it and highlights it red */}
        <div className="space-y-2">
          {REJECT_REASONS.map((reason) => (
            <button
              key={reason}
              onClick={() => setSelectedReason(reason)}
              className={`w-full text-left rounded-xl border px-4 py-2.5 text-sm transition-all ${
                selectedReason === reason
                  ? "border-red-500/40 bg-red-500/10 text-red-300"
                  : "border-white/10 bg-white/3 text-slate-300 hover:bg-white/5"
              }`}
            >
              {reason}
            </button>
          ))}
        </div>

        {/* Only shows up if admin picked "Other" — free text area to type a custom reason */}
        {isOther && (
          <textarea
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Describe the reason for rejection..."
            rows={3}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-red-500/40 resize-none"
          />
        )}

        {/* Cancel and Confirm buttons at the bottom */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            // Only fires if canSubmit is true — passes the final reason up to the parent
            onClick={() => canSubmit && onConfirm(finalReason)}
            disabled={!canSubmit || isSubmitting}
            className="flex-1 rounded-xl bg-red-500/20 border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Rejecting..." : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const PendingApprovalsPage = () => {
  // Full list of pending users fetched from the API
  const [users, setUsers] = useState<PendingUser[]>([]);

  // True while the initial fetch is happening — shows skeleton loaders
  const [loading, setLoading] = useState(true);

  // Holds error message string if any API call fails
  const [error, setError] = useState<string | null>(null);

  // Stores the ID of the user currently being approved — shows "Approving..." on their button
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Set of user IDs that were just approved — used to briefly show the green "Approved!" badge
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());

  // Set of user IDs that were just rejected — used to briefly show the red "Rejected" badge
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());

  // The user whose reject modal is currently open — null means modal is closed
  const [rejectTarget, setRejectTarget] = useState<PendingUser | null>(null);

  // True while the reject API call is in progress — disables the confirm button
  const [isRejecting, setIsRejecting] = useState(false);

  // Which role tab is active — "ALL", "BUYER", "SELLER", or "DRIVER"
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");

  // Get the admin's auth token from local storage to attach to API requests
  const token = LocalStorageService.get("fr_token");

  // Fetches all users waiting for approval from the backend API
  const fetchPending = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/v1/admin/users/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) throw new Error("Session expired. Please sign in again as admin.");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to fetch pending users");
      }
      const data = await res.json();
      // Use empty array as fallback if data.data is missing
      setUsers(data.data ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending users once when the page first loads
  useEffect(() => { fetchPending(); }, []);

  // Sends an approve request for one user, then removes them from the list after a short delay
  const handleApprove = async (userId: string) => {
    setApprovingId(userId); // mark this user as being approved right now
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to approve user");

      // Add to approvedIds so their card turns green with "Approved!" badge
      setApprovedIds((prev) => new Set(prev).add(userId));

      // After 1.5 seconds, remove the user from the list entirely (they're done)
      setTimeout(() => {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setApprovedIds((prev) => {
          const next = new Set(prev);
          next.delete(userId); // clean up approvedIds too
          return next;
        });
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setApprovingId(null); // no longer in the middle of approving
    }
  };

  // Called by the modal when admin clicks "Confirm Reject" with a reason — sends reject to API
  const handleRejectConfirm = async (reason: string) => {
    if (!rejectTarget) return; // safety check — do nothing if no target is set
    setIsRejecting(true);
    try {
      const res = await fetch(`/api/v1/admin/users/${rejectTarget.id}/reject`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }), // send the rejection reason to the backend
      });
      if (!res.ok) throw new Error("Failed to reject user");

      // Add to rejectedIds so their card turns red with "Rejected" badge
      setRejectedIds((prev) => new Set(prev).add(rejectTarget.id));

      // After 1.5 seconds, remove the user from the list entirely
      setTimeout(() => {
        setUsers((prev) => prev.filter((u) => u.id !== rejectTarget.id));
        setRejectedIds((prev) => {
          const next = new Set(prev);
          next.delete(rejectTarget.id);
          return next;
        });
      }, 1500);

      setRejectTarget(null); // close the modal
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRejecting(false);
    }
  };

  // Returns only the users that match the selected role tab (or all if "ALL" is selected)
  const filtered = roleFilter === "ALL" ? users : users.filter((u) => u.role === roleFilter);

  // Counts how many pending users exist for a specific role — used in the tab labels
  const countByRole = (role: UserRole) => users.filter((u) => u.role === role).length;

  // Data for each filter tab button — label includes the live count in brackets
  const filterTabs: { key: RoleFilter; label: string }[] = [
    { key: "ALL",    label: `All (${users.length})` },
    { key: "BUYER",  label: `Buyers (${countByRole("BUYER")})` },
    { key: "SELLER", label: `Sellers (${countByRole("SELLER")})` },
    { key: "DRIVER", label: `Drivers (${countByRole("DRIVER")})` },
  ];

  return (
    <>
      {/* Reject modal — only renders when rejectTarget is not null */}
      {rejectTarget && (
        <RejectModal
          user={rejectTarget}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTarget(null)} // clicking Cancel clears the target, closing the modal
          isSubmitting={isRejecting}
        />
      )}

      <div className="space-y-6">

        {/* ── Header — title and total pending count badge ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-50">Pending Approvals</h1>
            <p className="mt-0.5 text-sm text-slate-400">
              {loading
                ? "Loading..."
                : users.length === 0
                ? "No users awaiting approval"
                : `${users.length} user${users.length !== 1 ? "s" : ""} awaiting approval`}
            </p>
          </div>
          {/* Only show the amber badge if there are pending users */}
          {users.length > 0 && (
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
              {users.length} pending
            </span>
          )}
        </div>

        {/* ── Error banner — only appears if something went wrong ── */}
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* ── Role filter tabs — All / Buyers / Sellers / Drivers ── */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key)}
              className={`flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition-all border ${
                roleFilter === tab.key
                  ? "bg-teal-500/20 text-teal-300 border-teal-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── User list — skeleton / empty state / actual cards ── */}
        {loading ? (
          // Show 3 pulsing placeholder boxes while data is loading
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          // Show empty state if no users match the current filter
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/3 py-20 gap-4">
            <span className="text-5xl opacity-40">✅</span>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-400">No pending approvals</p>
              <p className="text-xs text-slate-500 mt-1">All registrations have been reviewed.</p>
            </div>
          </div>
        ) : (
          // Render a card for each filtered user
          <div className="space-y-3">
            {filtered.map((user) => {
              const config = getRoleConfig(user.role);
              const isApproved  = approvedIds.has(user.id);  // was this user just approved?
              const isRejected  = rejectedIds.has(user.id);  // was this user just rejected?
              const isApproving = approvingId === user.id;   // is this user's approve in progress?

              return (
                <div
                  key={user.id}
                  // Card border/background changes to green if approved, red if rejected
                  className={`rounded-2xl border px-5 py-4 transition-all ${
                    isApproved
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : isRejected
                      ? "border-red-500/40 bg-red-500/10"
                      : "border-white/10 bg-white/3 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">

                    {/* Left side — avatar initial, name, role badge, email, seller info, time */}
                    <div className="flex items-start gap-4">
                      {/* Avatar circle showing first letter of user's name */}
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/30 to-sky-500/20 text-sm font-bold text-teal-300">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-100">{user.name}</p>
                          {/* Role badge with the right emoji and color from roleConfig */}
                          <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${config.bg} ${config.color}`}>
                            {config.emoji} {config.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                        {/* Only shows for sellers — displays business name and address */}
                        {user.sellerProfile && (
                          <p className="text-xs text-slate-500 mt-1">
                            🏪 {user.sellerProfile.businessName} · {user.sellerProfile.businessAddress}
                          </p>
                        )}
                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                          {user.city && <span>🌆 {user.city}</span>}
                          <span>🕐 Registered {relativeTime(user.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right side — action buttons or status badge */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                      {isApproved ? (
                        // Green "Approved!" badge shown briefly after approving
                        <span className="flex items-center gap-1.5 rounded-xl bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-400">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          Approved!
                        </span>
                      ) : isRejected ? (
                        // Red "Rejected" badge shown briefly after rejecting
                        <span className="flex items-center gap-1.5 rounded-xl bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-400">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Rejected
                        </span>
                      ) : (
                        // Default state — show both Reject and Approve buttons
                        <>
                          <button
                            onClick={() => setRejectTarget(user)} // opens the modal for this user
                            disabled={isApproving}
                            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-medium text-red-400 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApprove(user.id)}
                            disabled={isApproving}
                            className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-medium text-teal-400 transition-all hover:bg-teal-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isApproving ? "Approving..." : "Approve"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer count — only shows when there are filtered results (If on the "Sellers" tab with 2 sellers out of 7 total, it shows "Showing 2 of 7 pending users")*/}
        {filtered.length > 0 && (
          <p className="text-center text-[11px] text-slate-600">
            Showing {filtered.length} of {users.length} pending user{users.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </>
  );
};

export default PendingApprovalsPage;