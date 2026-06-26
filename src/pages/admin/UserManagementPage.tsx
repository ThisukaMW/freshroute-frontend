import React, { useState, useEffect } from "react";

type UserRole = "BUYER" | "SELLER" | "DRIVER" | "ADMIN" | "FIELD_ADMIN";
type UserStatus = "ACTIVE" | "SUSPENDED";

const API_BASE = "http://localhost:5009";

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

const statusColors: Record<UserStatus, string> = {
  ACTIVE: "bg-emerald-500/20 text-emerald-400",
  SUSPENDED: "bg-red-500/20 text-red-400",
};

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

  return (
    <>
      <ConfirmationModal dialog={confirmDialog} onConfirm={handleConfirm} onCancel={handleCancel} />

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
                    <th className="px-3 py-2">City</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition">
                      {/* ID */}
                      {/*<td className="px-3 py-3 text-slate-400 font-mono text-xs">{user.id}</td>*/}
                      <td className="px-3 py-3 font-medium">{user.name}</td>

                      {/* ROLE */}
                      <td className="px-3 py-3 capitalize">
                        {/* Only show role editor for non-admin users */}
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

                      <td className="px-3 py-3">{user.city ?? "—"}</td>

                      {/* STATUS */}
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[user.status]}`}>
                          {user.status}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-3 py-3">
                        {isProtected(user) ? (
                          // Admin/Field Admin — no actions allowed
                          <span className="text-xs text-slate-600 italic">Protected</span>
                        ) : (
                          <div className="flex gap-3 text-xs flex-wrap">
                            {/* <button
                              onClick={() => (window.location.href = `/admin/users/${user.id}`)}
                              className="text-teal-400 hover:text-teal-300 transition"
                            >
                              View
                            </button> */}

                            <button
                              onClick={() => setEditingUserId(user.id)}
                              className="text-yellow-400 hover:text-yellow-300 transition"
                            >
                              Change role
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