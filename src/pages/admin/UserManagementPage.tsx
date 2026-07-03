import React, { useState, useEffect } from "react";

type UserRole = "BUYER" | "SELLER" | "DRIVER" | "ADMIN" | "FIELD_ADMIN";
type UserStatus = "ACTIVE" | "SUSPENDED";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5001";

interface User {
  id: string;
  name: string;
  role: UserRole;
  city: string;
  status: UserStatus;
}

interface ConfirmDialog {
  isOpen: boolean;
  userId: string;
  userName: string;
  action: "SUSPEND" | "ACTIVATE" | null;
}

interface UserDetails extends User {
  email: string;
  phone?: string;
  address?: string;
  createdAt?: string;

  totalOrders?: number;
  totalProducts?: number;
  totalSpent?: number;
  rating?: number;
}

const statusColors: Record<UserStatus, string> = {
  ACTIVE: "bg-emerald-500/20 text-emerald-400",
  SUSPENDED: "bg-red-500/20 text-red-400",
};

// ---------------------------------------------------------------------------
// Role -> accent theme. This is the one place personality lives: each role
// gets a consistent color identity that shows up in the avatar, badge and
// stat icons, so at a glance you know what kind of account you're looking at.
// ---------------------------------------------------------------------------
const roleAccent: Record<
  UserRole,
  { text: string; soft: string; ring: string; grad: string; label: string }
> = {
  BUYER: {
    text: "text-sky-400",
    soft: "bg-sky-500/10",
    ring: "ring-sky-500/30",
    grad: "from-sky-400 to-sky-600",
    label: "Buyer",
  },
  SELLER: {
    text: "text-emerald-400",
    soft: "bg-emerald-500/10",
    ring: "ring-emerald-500/30",
    grad: "from-emerald-400 to-emerald-600",
    label: "Seller",
  },
  DRIVER: {
    text: "text-amber-400",
    soft: "bg-amber-500/10",
    ring: "ring-amber-500/30",
    grad: "from-amber-400 to-amber-600",
    label: "Driver",
  },
  ADMIN: {
    text: "text-violet-400",
    soft: "bg-violet-500/10",
    ring: "ring-violet-500/30",
    grad: "from-violet-400 to-violet-600",
    label: "Admin",
  },
  FIELD_ADMIN: {
    text: "text-violet-400",
    soft: "bg-violet-500/10",
    ring: "ring-violet-500/30",
    grad: "from-violet-400 to-violet-600",
    label: "Field Admin",
  },
};

// ---------------------------------------------------------------------------
// Small inline icon set (no new dependency — matches the SVGs already used
// elsewhere in this file).
// ---------------------------------------------------------------------------
const IconMail = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 6 9-6M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" />
  </svg>
);
const IconPhone = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2.28a1 1 0 01.97.76l1.1 4.4a1 1 0 01-.5 1.13L7.1 10.4a12 12 0 006.5 6.5l1.1-1.75a1 1 0 011.13-.5l4.4 1.1a1 1 0 01.76.97V19a2 2 0 01-2 2h-1C10.4 21 3 13.6 3 5z" />
  </svg>
);
const IconPin = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s7-6.6 7-12a7 7 0 10-14 0c0 5.4 7 12 7 12z" />
    <circle cx="12" cy="10" r="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconCalendar = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path strokeLinecap="round" d="M16 3v4M8 3v4M3 10h18" />
  </svg>
);
const IconPackage = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8" />
  </svg>
);
const IconBag = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12l1 13H5L6 7zM9 7a3 3 0 016 0" />
  </svg>
);
const IconStar = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...p}>
    <path d="M12 2l2.9 6.4 7 .7-5.3 4.7 1.6 6.9L12 17l-6.2 3.7 1.6-6.9L2.1 9l7-.7L12 2z" />
  </svg>
);
const IconWallet = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...p}>
    <rect x="3" y="6" width="18" height="14" rx="2" />
    <path strokeLinecap="round" d="M3 10h18M16 14h2" />
  </svg>
);
const IconX = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const ConfirmationModal: React.FC<{
  dialog: ConfirmDialog;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ dialog, onConfirm, onCancel }) => {
  if (!dialog.isOpen) return null;

  const isSuspend = dialog.action === "SUSPEND";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50 p-6 space-y-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${isSuspend ? "bg-red-500/20" : "bg-emerald-500/20"}`}>
          {isSuspend ? (
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-white font-semibold text-base">
            {isSuspend ? "Suspend User?" : "Activate User?"}
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            {isSuspend
              ? `Do you want to suspend ${dialog.userName}? They will lose access to the platform.`
              : `Do you want to activate ${dialog.userName}? They will regain access to the platform.`}
          </p>
          <p className={`text-xs font-medium mt-1 ${isSuspend ? "text-red-400" : "text-emerald-400"}`}>
            {dialog.userName}
          </p>
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onCancel} className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition ${isSuspend ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600"}`}
          >
            {isSuspend ? "Yes, Suspend" : "Yes, Activate"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Info row — now icon-led so each fact is scannable at a glance instead of
// reading as an undifferentiated list of label/value pairs.
// ---------------------------------------------------------------------------
const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: (p: React.SVGProps<SVGSVGElement>) => React.ReactElement;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start gap-3 py-2.5">
    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-400">
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-sm font-medium text-white truncate">{value}</div>
    </div>
  </div>
);

// Stat tile — used for the buyer/seller performance numbers. Gives them
// visual weight as headline figures rather than burying them in a table row.
const StatTile = ({
  icon: Icon,
  value,
  label,
  accent,
}: {
  icon: (p: React.SVGProps<SVGSVGElement>) => React.ReactElement;
  value: React.ReactNode;
  label: string;
  accent: { text: string; soft: string };
}) => (
  <div className="rounded-xl border border-white/5 bg-slate-800/60 p-4">
    <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${accent.soft} ${accent.text}`}>
      <Icon className="h-4 w-4" />
    </div>
    <div className="text-xl font-semibold text-white leading-none">{value}</div>
    <div className="mt-1 text-xs text-slate-400">{label}</div>
  </div>
);

const SkeletonModal = () => (
  <div className="animate-pulse">
    <div className="flex flex-col items-center py-8">
      <div className="h-24 w-24 rounded-full bg-slate-800" />
      <div className="mt-4 h-5 w-40 rounded bg-slate-800" />
      <div className="mt-3 h-5 w-20 rounded-full bg-slate-800" />
    </div>
    <div className="px-8 pb-8 space-y-6">
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-10 rounded-lg bg-slate-800/70" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 rounded-xl bg-slate-800/70" />
        <div className="h-20 rounded-xl bg-slate-800/70" />
      </div>
    </div>
  </div>
);

const UserDetailsModal = ({
  open,
  user,
  loading,
  onClose,
}: {
  open: boolean;
  user: UserDetails | null;
  loading: boolean;
  onClose: () => void;
}) => {
  const [visible, setVisible] = useState(false);

  // Drive the enter/exit transition off a `visible` flag rather than mounting
  // instantly, so the modal scales/fades in instead of just popping in.
  useEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const accent = user ? roleAccent[user.role] : roleAccent.BUYER;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background */}
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative z-10 w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-black/60 transition-all duration-200 ${
          visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-2"
        }`}
      >
        {/* Accent top bar — the one signature flourish, colored by role */}
        <div className={`h-1 w-full bg-gradient-to-r ${accent.grad}`} />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-5 rounded-lg p-1.5 text-slate-500 hover:text-white hover:bg-white/10 transition"
        >
          <IconX className="h-5 w-5" />
        </button>

        {loading ? (
          <SkeletonModal />
        ) : user ? (
          <>
            {/* Profile */}
            <div className="flex flex-col items-center pt-8 pb-6">
              <div
                className={`flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${accent.grad} text-4xl font-bold text-white shadow-lg ring-4 ring-slate-900`}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>

              <h3 className="mt-4 text-2xl font-semibold text-white tracking-tight">
                {user.name}
              </h3>

              <div className="mt-2 flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${accent.soft} ${accent.text}`}>
                  {accent.label}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    user.status === "ACTIVE"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {user.status === "ACTIVE" ? "Active" : "Suspended"}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="px-8 pb-8 space-y-6">
              {/* Contact */}
              <section>
                <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Contact
                </h4>
                <div className="rounded-xl border border-white/5 divide-y divide-white/5 px-3">
                  <InfoRow icon={IconMail} label="Email" value={user.email} />
                  <InfoRow icon={IconPhone} label="Phone" value={user.phone || "Not provided"} />
                  <InfoRow icon={IconPin} label="Address" value={user.address || "Not provided"} />
                  <InfoRow
                    icon={IconCalendar}
                    label="Joined"
                    value={
                      user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Unknown"
                    }
                  />
                </div>
              </section>

              {/* Seller stats */}
              {user.role === "SELLER" && (
                <section>
                  <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Seller performance
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <StatTile icon={IconPackage} value={user.totalProducts ?? 0} label="Products listed" accent={accent} />
                    <StatTile icon={IconBag} value={user.totalOrders ?? 0} label="Orders fulfilled" accent={accent} />
                    <StatTile
                      icon={IconStar}
                      value={user.rating != null ? user.rating.toFixed(1) : "—"}
                      label="Average rating"
                      accent={accent}
                    />
                  </div>
                </section>
              )}

              {/* Buyer stats */}
              {user.role === "BUYER" && (
                <section>
                  <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Buyer activity
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <StatTile icon={IconBag} value={user.totalOrders ?? 0} label="Orders placed" accent={accent} />
                    <StatTile
                      icon={IconWallet}
                      value={`Rs. ${(user.totalSpent ?? 0).toLocaleString()}`}
                      label="Total spent"
                      accent={accent}
                    />
                  </div>
                </section>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-800 px-8 py-5">
              <button
                onClick={onClose}
                className="rounded-lg bg-slate-800 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 p-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <IconX className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium text-red-400">Couldn't load this user</p>
              <p className="mt-1 text-sm text-slate-500">Something went wrong fetching their details. Try again.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Roles that cannot be modified by the admin panel
const PROTECTED_ROLES: UserRole[] = ["ADMIN", "FIELD_ADMIN"];

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<"all" | UserRole>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    isOpen: false,
    userId: "",
    userName: "",
    action: null,
  });
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetch("/api/v1/users")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
      })
      .then((data: User[]) => setUsers(data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesRole = selectedRoleFilter === "all" || u.role === selectedRoleFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const handleRoleChange = async (id: string, newRole: UserRole) => {
    try {
      const res = await fetch(`/api/v1/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? { ...user, role: newRole } : user))
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error";
      setError(message);
    } finally {
      setEditingUserId(null);
    }
  };

  const openSuspendDialog = (user: User) => {
    setConfirmDialog({ isOpen: true, userId: user.id, userName: user.name, action: "SUSPEND" });
  };

  const openActivateDialog = (user: User) => {
    setConfirmDialog({ isOpen: true, userId: user.id, userName: user.name, action: "ACTIVATE" });
  };

  const handleConfirm = async () => {
    const { userId, action } = confirmDialog;
    const newStatus: UserStatus = action === "SUSPEND" ? "SUSPENDED" : "ACTIVE";

    try {
      const res = await fetch(`${API_BASE}/api/v1/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, status: newStatus } : user))
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error";
      setError(message);
    } finally {
      setConfirmDialog({ isOpen: false, userId: "", userName: "", action: null });
    }
  };

  const handleCancel = () => {
    setConfirmDialog({ isOpen: false, userId: "", userName: "", action: null });
  };

  const filterButtons: { label: string; value: "all" | UserRole }[] = [
    { label: "All roles", value: "all" },
    { label: "Buyers", value: "BUYER" },
    { label: "Sellers", value: "SELLER" },
    { label: "Drivers", value: "DRIVER" },
  ];

  const isProtected = (user: User) => PROTECTED_ROLES.includes(user.role);

  const handleViewUser = async (id: string) => {
    try {
      setLoadingDetails(true);
      setViewModalOpen(true);
      const res = await fetch(`${API_BASE}/api/v1/users/${id}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      setSelectedUser(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load user";
      setError(message);
    } finally {
      setLoadingDetails(false);
    }
  };
  return (
    <>
      <ConfirmationModal dialog={confirmDialog} onConfirm={handleConfirm} onCancel={handleCancel} />

      <UserDetailsModal
        open={viewModalOpen}
        user={selectedUser}
        loading={loadingDetails}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedUser(null);
        }}
      />
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="space-y-4 max-w-5xl mx-auto">
          {/* HEADER */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h1 className="text-xl font-semibold text-slate-50">User Management</h1>
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search by name…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-800 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-white/25 w-56"
              />
            </div>
          </div>

          {/* FILTER BUTTONS */}
          <div className="flex gap-3 text-xs flex-wrap">
            {filterButtons.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => { setSelectedRoleFilter(value); setEditingUserId(null); }}
                className={`rounded-lg px-4 py-2 font-medium transition ${
                  selectedRoleFilter === value
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ERROR */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* TABLE */}
          <div className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-slate-900 p-4 text-sm text-white">
            {loading ? (
              <p className="text-center text-slate-500 py-6">Loading users…</p>
            ) : filteredUsers.length === 0 ? (
              <p className="text-center text-slate-500 py-6">No users found.</p>
            ) : (
              <table className="min-w-full text-left">
                <thead className="border-b border-white/10 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition">
                      <td className="px-3 py-3 font-medium">{user.name}</td>

                      <td className="px-3 py-3 capitalize">
                        {!isProtected(user) && editingUserId === user.id ? (
                          <select
                            autoFocus
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                            onBlur={() => setEditingUserId(null)}
                            className="bg-slate-800 border border-white/20 rounded px-2 py-1 text-white outline-none"
                          >
                            <option value="BUYER">Buyer</option>
                            <option value="SELLER">Seller</option>
                            <option value="DRIVER">Driver</option>
                          </select>
                        ) : (
                          <span className={isProtected(user) ? "text-amber-400 font-medium" : ""}>
                            {user.role}
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[user.status]}`}>
                          {user.status}
                        </span>
                      </td>

                      <td className="px-3 py-3">
                        {isProtected(user) ? (
                          <span className="text-xs text-slate-600 italic">Protected</span>
                        ) : (
                          <div className="flex gap-3 text-xs flex-wrap">
                            <button
                              onClick={() => handleViewUser(user.id)}
                              className="text-teal-400 hover:text-teal-300 transition"
                            >
                              View
                            </button>

                            {user.status !== "ACTIVE" && (
                              <button
                                onClick={() => openActivateDialog(user)}
                                className="text-emerald-400 hover:text-emerald-300 transition"
                              >
                                Activate
                              </button>
                            )}

                            {user.status !== "SUSPENDED" && (
                              <button
                                onClick={() => openSuspendDialog(user)}
                                className="text-red-400 hover:text-red-300 transition"
                              >
                                Suspend
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </div>
      </div>
    </>
  );
};

export default UserManagementPage;