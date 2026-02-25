import React from "react";

type UserRole = "buyer" | "seller" | "driver";
type UserStatus = "Active" | "Pending" | "Suspended";

interface User {
  id: string;
  name: string;
  role: UserRole;
  city: string;
  status: UserStatus;
}

const mockUsers: User[] = [
  { id: "U-1001", name: "John Perera", role: "buyer", city: "Colombo", status: "Active" },
  { id: "U-1002", name: "Green Market", role: "seller", city: "Kandy", status: "Pending" },
  { id: "U-1003", name: "Daily Dairy", role: "seller", city: "Galle", status: "Active" },
  { id: "U-1004", name: "Rider Tharindu", role: "driver", city: "Colombo", status: "Suspended" },
];

const UserManagementPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-50">User management</h1>
      <p className="text-sm text-slate-300">
        Sample view of how admins can manage buyers, sellers and drivers: filter by role, see status
        and perform basic actions.
      </p>

      <div className="flex flex-wrap gap-3 text-xs">
        <button className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-slate-100 hover:border-supply-teal">
          All roles
        </button>
        <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300 hover:border-supply-teal">
          Buyers
        </button>
        <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300 hover:border-supply-teal">
          Sellers
        </button>
        <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300 hover:border-supply-teal">
          Drivers
        </button>
      </div>

      <div className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-supply-deep/80 p-4 text-xs text-slate-100 backdrop-blur-xl">
        <table className="min-w-full text-left">
          <thead className="border-b border-white/10 text-[11px] uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-3 py-2 font-medium">ID</th>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Role</th>
              <th className="px-3 py-2 font-medium">City</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mockUsers.map((u) => (
              <tr key={u.id} className="hover:bg-white/5">
                <td className="px-3 py-2">{u.id}</td>
                <td className="px-3 py-2">{u.name}</td>
                <td className="px-3 py-2 capitalize">{u.role}</td>
                <td className="px-3 py-2">{u.city}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      u.status === "Active"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : u.status === "Pending"
                        ? "bg-amber-500/15 text-amber-300"
                        : "bg-red-500/10 text-red-300"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-2 text-[11px]">
                    <button className="text-supply-teal hover:text-supply-peach">View</button>
                    <button className="text-slate-400 hover:text-slate-200">Change role</button>
                    <button className="text-red-300 hover:text-red-200">Suspend</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementPage;