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

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<"all" | UserRole>("all");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

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

  const handleSuspend = (id: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, status: "Suspended" } : user
      )
    );
  };

  const handleActivate = (id: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, status: "Active" } : user
      )
    );
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
                            onClick={() => handleActivate(user.id)}
                            className="text-emerald-400 hover:text-emerald-300 transition"
                          >
                            Activate
                          </button>
                        )}

                        {user.status !== "Suspended" && (
                          <button
                            onClick={() => handleSuspend(user.id)}
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
  );
};

export default UserManagementPage;
