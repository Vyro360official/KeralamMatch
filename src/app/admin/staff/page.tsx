"use client";

import React, { useState, useEffect } from "react";
import {
  Plus, Edit3, Trash2, Key, Search, UserCheck, UserX, AlertCircle, X,
  Shield, ClipboardList, Check
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface StaffItem {
  id: string;
  email: string;
  phone: string;
  role: string;
  designation: string | null;
  permissions: string[];
  status: string;
  lastLogin: string | null;
  createdAt: string;
}

const AVAILABLE_PERMISSIONS = [
  { id: "MANAGE_USERS", label: "Manage Users", desc: "View, search, edit, ban, and create member profiles." },
  { id: "VERIFY_PROFILES", label: "Verify Profiles", desc: "Approve or reject KYC documents and selfies." },
  { id: "MANAGE_REPORTS", label: "Review Reports", desc: "Moderate reported user profiles and spam warnings." },
  { id: "VIEW_PAYMENTS", label: "View Payments", desc: "Access the income records and invoice receipts ledger." },
  { id: "VIEW_GROWTH", label: "View Growth Metrics", desc: "Analyze campaign conversions and member growth funnels." },
  { id: "VIEW_AUDIT_LOGS", label: "View Audit Logs", desc: "Access activity records of staff and system changes." },
  { id: "MANAGE_STAFF", label: "Manage Staff", desc: "Add, modify roles, and change access rights of staff." },
  { id: "MANAGE_CMS", label: "Manage Blog & FAQ", desc: "Author and publish blog articles and FAQ guides." },
  { id: "MANAGE_SETTINGS", label: "Manage Site Settings", desc: "Access maintenance triggers and configuration panels." }
];

const STAFF_ROLES = [
  { id: "SUPER_ADMIN", name: "Super Admin" },
  { id: "ADMIN", name: "Administrator" },
  { id: "STAFF", name: "Staff Member" },
  { id: "PROFILE_MANAGER", name: "Profile Manager" },
  { id: "SUPPORT_STAFF", name: "Support Staff" }
];

export default function StaffManager() {
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [editId, setEditId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("STAFF");
  const [designation, setDesignation] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [status, setStatus] = useState("ACTIVE");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/staff");
      const data = await res.json();
      if (data.success) {
        setStaffList(data.staff);
      } else {
        showToast(data.error || "Failed to load staff list", "error");
      }
    } catch (e) {
      showToast("Network error fetching staff", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEmail("");
    setPhone("");
    setRole("STAFF");
    setDesignation("Profile Quality Executive");
    setPermissions(["MANAGE_USERS", "VERIFY_PROFILES"]);
    setStatus("ACTIVE");
    setShowModal(true);
  };

  const handleOpenEdit = (item: StaffItem) => {
    setIsEditing(true);
    setEditId(item.id);
    setEmail(item.email);
    setPhone(item.phone);
    setRole(item.role);
    setDesignation(item.designation || "");
    setPermissions(item.permissions);
    setStatus(item.status);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: editId,
      email,
      phone,
      role,
      designation,
      permissions,
      status
    };

    try {
      const endpoint = "/api/admin/staff";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        showToast(isEditing ? "Staff updated successfully" : "Staff added successfully", "success");
        setShowModal(false);
        fetchStaff();
      } else {
        showToast(data.error || "Failed to save staff record", "error");
      }
    } catch (err) {
      showToast("Error sending update request", "error");
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this staff account?")) return;
    try {
      const res = await fetch(`/api/admin/staff?id=${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        showToast("Staff de-activated successfully", "success");
        fetchStaff();
      } else {
        showToast(data.error || "Failed to deactivate account", "error");
      }
    } catch (err) {
      showToast("Network error deactivating staff", "error");
    }
  };

  const togglePermission = (permId: string) => {
    setPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const filteredStaff = staffList.filter((item) =>
    item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.designation && item.designation.toLowerCase().includes(searchQuery.toLowerCase())) ||
    item.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 transition-transform ${
          toast.type === "success" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
        }`}>
          <AlertCircle className="h-5 w-5" />
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-[rgba(28,28,30,0.06)] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#0A1F44]">Staff Manager</h1>
          <p className="text-xs text-[#636366] mt-1">Configure staff, permissions, security settings, and designations</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="h-10 rounded-full bg-[#C81D45] hover:bg-[#b0173b] text-white px-5 text-xs font-bold flex items-center gap-2 shadow-md transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Staff
        </button>
      </div>

      {/* Search & Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPI: Active Roles */}
        <div className="bg-white p-5 rounded-3xl border border-[rgba(28,28,30,0.06)] shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-[#8E8E93] tracking-widest">Active Staff</div>
            <div className="text-lg font-bold text-[#0A1F44] mt-0.5">{staffList.filter(s => s.status === "ACTIVE").length}</div>
          </div>
        </div>

        {/* Search Input */}
        <div className="md:col-span-3 bg-white p-4 rounded-3xl border border-[rgba(28,28,30,0.06)] shadow-xs flex items-center">
          <Search className="h-4 w-4 text-[#8E8E93] ml-2" />
          <Input
            type="text"
            placeholder="Search staff by email, designation, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-none focus:ring-0 shadow-none text-xs ml-2 bg-transparent text-[#0A1F44]"
          />
        </div>
      </div>

      {/* Staff Table Grid */}
      <div className="bg-white rounded-3xl border border-[rgba(28,28,30,0.06)] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#636366] animate-pulse">Loading staff records...</div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#8E8E93]">No staff members found matching query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FCFBF7] border-b border-[rgba(28,28,30,0.06)] text-[#636366] font-bold">
                  <th className="px-6 py-4">Designation & Role</th>
                  <th className="px-6 py-4">Contact Credentials</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Privileges</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(28,28,30,0.06)] text-[#0A1F44] font-semibold">
                {filteredStaff.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FCFBF7]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#0A1F44]">{item.designation || "Support Executive"}</div>
                      <div className="text-[10px] text-pink-700 font-bold uppercase mt-0.5">{item.role}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{item.email}</div>
                      <div className="text-[10px] text-[#8E8E93] mt-0.5">{item.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${item.status === "ACTIVE" ? "bg-emerald-500" : "bg-rose-500"}`} />
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {item.permissions.map((p) => (
                          <span key={p} className="bg-gray-100 text-gray-700 text-[9px] px-2 py-0.5 rounded">
                            {p.replace("MANAGE_", "").replace("VIEW_", "")}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#636366]">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="h-8 w-8 rounded-full border border-gray-200 inline-flex items-center justify-center hover:bg-gray-100 text-[#0A1F44] transition-colors"
                        title="Edit Permissions"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeactivate(item.id)}
                        className="h-8 w-8 rounded-full border border-rose-100 inline-flex items-center justify-center hover:bg-rose-50 text-rose-600 transition-colors"
                        title="Deactivate Account"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-[rgba(28,28,30,0.06)]">
              <h3 className="text-base font-bold text-[#0A1F44] flex items-center gap-2">
                <Key className="h-4 w-4 text-[#C81D45]" />
                {isEditing ? "Modify Staff Rights" : "Create New Staff Member"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold text-[#0A1F44]">
              {/* Credentials (Editable only when creating) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#636366] uppercase tracking-wider font-bold mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isEditing}
                    placeholder="staff@keralammatch.com"
                    required
                    className="w-full h-10 rounded-xl border border-[rgba(28,28,30,0.12)] px-4 focus:outline-none bg-white text-[#0A1F44] disabled:bg-gray-50 disabled:text-[#8E8E93]"
                  />
                </div>

                <div>
                  <label className="block text-[#636366] uppercase tracking-wider font-bold mb-1.5">Mobile Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isEditing}
                    placeholder="+919988776655"
                    required
                    className="w-full h-10 rounded-xl border border-[rgba(28,28,30,0.12)] px-4 focus:outline-none bg-white text-[#0A1F44] disabled:bg-gray-50 disabled:text-[#8E8E93]"
                  />
                </div>
              </div>

              {/* Roles & Designations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#636366] uppercase tracking-wider font-bold mb-1.5">Designation Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Senior Verification Officer"
                    required
                    className="w-full h-10 rounded-xl border border-[rgba(28,28,30,0.12)] px-4 focus:outline-none bg-white text-[#0A1F44]"
                  />
                </div>

                <div>
                  <label className="block text-[#636366] uppercase tracking-wider font-bold mb-1.5">Core System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-10 rounded-xl border border-[rgba(28,28,30,0.12)] px-4 focus:outline-none bg-white text-[#0A1F44]"
                  >
                    {STAFF_ROLES.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#636366] uppercase tracking-wider font-bold mb-1.5">Operational Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full h-10 rounded-xl border border-[rgba(28,28,30,0.12)] px-4 focus:outline-none bg-white text-[#0A1F44]"
                  >
                    <option value="ACTIVE">ACTIVE (Authorized to log in)</option>
                    <option value="INACTIVE">INACTIVE (Revoked access)</option>
                  </select>
                </div>
              </div>

              {/* Fine-grained Permissions Grid */}
              <div className="space-y-2 pt-2 border-t border-[rgba(28,28,30,0.06)]">
                <label className="block text-[#636366] uppercase tracking-wider font-bold">Fine-Grained Permissions Manager</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1 bg-gray-50/50 rounded-2xl border border-[rgba(28,28,30,0.04)]">
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const checked = permissions.includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => togglePermission(perm.id)}
                        className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-start gap-3 ${
                          checked
                            ? "border-emerald-500/30 bg-emerald-50/40 text-emerald-900"
                            : "border-gray-200 bg-white text-[#0A1F44] hover:bg-gray-50/70"
                        }`}
                      >
                        <div className={`h-4.5 w-4.5 mt-0.5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                          checked ? "bg-emerald-600 text-white" : "border border-gray-300 bg-white"
                        }`}>
                          {checked && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="font-bold text-[11px]">{perm.label}</div>
                          <div className="text-[9px] text-gray-500 font-medium mt-0.5 leading-relaxed">{perm.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-[rgba(28,28,30,0.06)]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-full px-5 py-2 text-xs font-bold text-[#636366] hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#C81D45] text-white px-6 py-2 text-xs font-bold shadow-md hover:bg-[#b0173b] transition-colors"
                >
                  Save staff privileges
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
