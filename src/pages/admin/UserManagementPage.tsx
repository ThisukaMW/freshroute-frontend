import React, { useState } from "react";

type UserRole = "buyer" | "seller" | "driver";
type UserStatus = "Active" | "Suspended";

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
  action: "suspend" | "activate" | null;
}

const initialUsers: User[] = [
  { id: "U-1001", name: "John Perera", role: "buyer", city: "Colombo", status: "Active" },
  { id: "U-1002", name: "Green Market", role: "seller", city: "Kandy", status: "Active" },
  { id: "U-1003", name: "Daily Dairy", role: "seller", city: "Galle", status: "Active" },
  { id: "U-1004", name: "Rider Tharindu", role: "driver", city: "Colombo", status: "Suspended" },
];

const statusColors: Record<UserStatus, string> = {
  Active: "bg-emerald-500/20 text-emerald-400",
  Suspended: "bg-red-500/20 text-red-400",
};

const ConfirmationModal: React.FC<{
  dialog: ConfirmDialog;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ dialog, onConfirm, onCancel }) => {
  if (!dialog.isOpen) return null;

  const isSuspend = dialog.action === "suspend";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50 p-6 space-y-4">
        {/* Icon */}
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

        {/* Title */}
        <div className="text-center space-y-1">
          <h2 className="text-white font-semibold text-base">
            {isSuspend ? "Suspend User?" : "Activate User?"}
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            {isSuspend
              ? `Do you want to suspend user ${dialog.userId}? They will lose access to the platform.`
              : `Do you want to activate user ${dialog.userId}? They will regain access to the platform.`}
          </p>
          <p className={`text-xs font-medium mt-1 ${isSuspend ? "text-red-400" : "text-emerald-400"}`}>
            {dialog.userName}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition ${
              isSuspend
                ? "bg-red-500 hover:bg-red-600"
                : "bg-emerald-500 hover:bg-emerald-600"
            }`}
          >
            {isSuspend ? "Yes, Suspend" : "Yes, Activate"}
          </button>
        </div>
      </div>
    </div>
  );
};

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<"all" | UserRole>("all");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    isOpen: false,
    userId: "",
    userName: "",
    action: null,
  });

  const filteredUsers =
    selectedRoleFilter === "all"
      ? users
      : users.filter((u) => u.role === selectedRoleFilter);

  const handleRoleChange = (id: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, role: newRole } : user))
    );
    setEditingUserId(null);
  };

  const openSuspendDialog = (user: User) => {
    setConfirmDialog({ isOpen: true, userId: user.id, userName: user.name, action: "suspend" });
  };

  const openActivateDialog = (user: User) => {
    setConfirmDialog({ isOpen: true, userId: user.id, userName: user.name, action: "activate" });
  };

  const handleConfirm = () => {
    const { userId, action } = confirmDialog;
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, status: action === "suspend" ? "Suspended" : "Active" }
          : user
      )
    );
    setConfirmDialog({ isOpen: false, userId: "", userName: "", action: null });
  };

  const handleCancel = () => {
    setConfirmDialog({ isOpen: false, userId: "", userName: "", action: null });
  };

  const handleFilterChange = (role: "all" | UserRole) => {
    setSelectedRoleFilter(role);
    setEditingUserId(null);
  };

  const filterButtons: { label: string; value: "all" | UserRole }[] = [
    { label: "All roles", value: "all" },
    { label: "Buyers", value: "buyer" },
    { label: "Sellers", value: "seller" },
    { label: "Drivers", value: "driver" },
  ];

  return (
    <>
      <ConfirmationModal
        dialog={confirmDialog}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      <div className="min-h-screen bg-slate-950 p-6">
        <div className="space-y-4 max-w-5xl mx-auto">
          <h1 className="text-xl font-semibold text-slate-50">User Management</h1>

          {/* FILTER BUTTONS */}
          <div className="flex gap-3 text-xs flex-wrap">
            {filterButtons.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => handleFilterChange(value)}
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

          {/* TABLE */}
          <div className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-slate-900 p-4 text-sm text-white">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-slate-500 py-6">No users found.</p>
            ) : (
              <table className="min-w-full text-left">
                <thead className="border-b border-white/10 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-3 py-2">ID</th>
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
                      <td className="px-3 py-3 text-slate-400">{user.id}</td>
                      <td className="px-3 py-3 font-medium">{user.name}</td>

                      {/* ROLE */}
                      <td className="px-3 py-3 capitalize">
                        {editingUserId === user.id ? (
                          <select
                            autoFocus
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(user.id, e.target.value as UserRole)
                            }
                            onBlur={() => setEditingUserId(null)}
                            className="bg-slate-800 border border-white/20 rounded px-2 py-1 text-white outline-none"
                          >
                            <option value="buyer">Buyer</option>
                            <option value="seller">Seller</option>
                            <option value="driver">Driver</option>
                          </select>
                        ) : (
                          user.role
                        )}
                      </td>

                      <td className="px-3 py-3">{user.city}</td>

                      {/* STATUS BADGE */}
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[user.status]}`}
                        >
                          {user.status}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-3 py-3">
                        <div className="flex gap-3 text-xs flex-wrap">
                          <button
                            onClick={() => alert(`Viewing user: ${user.name}`)}
                            className="text-teal-400 hover:text-teal-300 transition"
                          >
                            View
                          </button>

                          <button
                            onClick={() => setEditingUserId(user.id)}
                            className="text-yellow-400 hover:text-yellow-300 transition"
                          >
                            Change role
                          </button>

                          {user.status !== "Active" && (
                            <button
                              onClick={() => openActivateDialog(user)}
                              className="text-emerald-400 hover:text-emerald-300 transition"
                            >
                              Activate
                            </button>
                          )}

                          {user.status !== "Suspended" && (
                            <button
                              onClick={() => openSuspendDialog(user)}
                              className="text-red-400 hover:text-red-300 transition"
                            >
                              Suspend
                            </button>
                          )}
                        </div>
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