import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { School, SchoolAdminMini } from "../../services/types";

type FormState = {
  id?: number;
  name: string;
  email: string;
  phone: string;
  address: string;

  area: string;
  category: string;
  level: string;
  gender_type: "boys" | "girls" | "mixed";
  president_name: string;
  fees_range: string;
  curriculum: string;

  // admin assignment
  existing_admin_id: string; // keep as string for <select>
  create_new_admin: boolean;
  new_admin_name: string;
  new_admin_email: string;
  new_admin_password: string;
};

const emptyForm: FormState = {
  name: "",
  email: "",
  phone: "",
  address: "",
  area: "",
  category: "",
  level: "",
  gender_type: "mixed",
  president_name: "",
  fees_range: "",
  curriculum: "",

  existing_admin_id: "",
  create_new_admin: false,
  new_admin_name: "",
  new_admin_email: "",
  new_admin_password: "",
};

const AdminSchools: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [admins, setAdmins] = useState<SchoolAdminMini[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const isEdit = useMemo(() => !!form.id, [form.id]);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/schools");
      setSchools(res.data?.data || []);
    } catch (e: any) {
      console.error("fetchSchools error", e?.response || e);
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await api.get("/admin/school-admins");
      setAdmins(res.data?.admins || []);
    } catch (e: any) {
      console.error("fetchAdmins error", e?.response || e);
      setAdmins([]);
    }
  };

  useEffect(() => {
    fetchSchools();
    fetchAdmins();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (s: School) => {
    setForm({
      id: s.id,
      name: s.name || "",
      email: s.email || "",
      phone: s.phone || "",
      address: s.address || "",
      area: s.area || "",
      category: s.category || "",
      level: s.level || "",
      gender_type: (s.gender_type as any) || "mixed",
      president_name: s.president_name || "",
      fees_range: s.fees_range || "",
      curriculum: s.curriculum || "",
      existing_admin_id: s.admin?.id ? String(s.admin.id) : "",
      create_new_admin: false,
      new_admin_name: "",
      new_admin_email: "",
      new_admin_password: "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSaving(false);
    setForm(emptyForm);
  };

  const handleDelete = async (s: School) => {
    const ok = confirm(`Delete school "${s.name}"?`);
    if (!ok) return;

    try {
      await api.delete(`/admin/schools/${s.id}`);
      setSchools((prev) => prev.filter((x) => x.id !== s.id));
      alert("School deleted.");
    } catch (e: any) {
      alert(e.response?.data?.message || "Delete failed");
    }
  };

  const saveSchool = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        address: form.address || null,
        area: form.area,
        category: form.category,
        level: form.level,
        gender_type: form.gender_type,
        president_name: form.president_name || null,
        fees_range: form.fees_range || null,
        curriculum: form.curriculum || null,
      };

      if (isEdit && form.id) {
        const res = await api.put(`/admin/schools/${form.id}`, payload);
        const updated: School = res.data?.school;
        setSchools((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      } else {
        const res = await api.post(`/admin/schools`, payload);
        const created: School = res.data?.school;
        setSchools((prev) => [created, ...prev]);
      }

      alert("School saved.");
      await fetchAdmins(); // refresh admin assignment state
      closeModal();
    } catch (e: any) {
      console.error("saveSchool", e?.response || e);
      const msg =
        e.response?.data?.message ||
        e.response?.data?.error ||
        Object.values(e.response?.data?.errors || {})?.[0]?.[0] ||
        "Save failed";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const assignAdmin = async () => {
    if (!form.id) return;

    setSaving(true);
    try {
      let payload: any = {};

      if (form.create_new_admin) {
        payload = {
          new_admin_name: form.new_admin_name,
          new_admin_email: form.new_admin_email,
          new_admin_password: form.new_admin_password,
        };
      } else if (form.existing_admin_id) {
        payload = {
          existing_admin_id: Number(form.existing_admin_id),
        };
      } else {
        alert("Select an existing admin OR create a new one.");
        setSaving(false);
        return;
      }

      const res = await api.post(`/admin/schools/${form.id}/assign-admin`, payload);

      const updated: School = res.data?.school;
      setSchools((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));

      alert("Admin assigned.");
      await fetchAdmins();
    } catch (e: any) {
      console.error("assignAdmin", e?.response || e);
      const msg =
        e.response?.data?.message ||
        Object.values(e.response?.data?.errors || {})?.[0]?.[0] ||
        "Assign failed";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-secondary">Manage Schools</h1>
        <button
          onClick={openCreate}
          className="bg-primary text-secondary px-6 py-2 rounded-lg font-bold hover:bg-yellow-500 shadow-sm transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add New School
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">Loading schools...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 text-xs font-bold text-textLight uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">School Name</th>
                <th className="px-6 py-4">Area / Level</th>
                <th className="px-6 py-4">Current Admin</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100 text-sm">
              {schools.map((s) => (
                <tr key={s.id} className="hover:bg-neutral-50 transition">
                  <td className="px-6 py-4 font-bold text-secondary">{s.name}</td>
                  <td className="px-6 py-4 text-textLight">
                    {s.area || "-"} • {s.level || "-"}
                  </td>
                  <td className="px-6 py-4">
                    {s.admin ? (
                      <div>
                        <p className="font-semibold text-textDark">{s.admin.name}</p>
                        <p className="text-xs text-textLight">{s.admin.email}</p>
                      </div>
                    ) : (
                      <span className="bg-warning/10 text-warning px-2 py-1 rounded text-[10px] font-bold">
                        No Admin
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => openEdit(s)}
                        className="text-secondary hover:text-secondary/80 font-bold"
                      >
                        Edit / Assign
                      </button>
                      <button
                        onClick={() => handleDelete(s)}
                        className="text-warning hover:text-warning/80 font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {schools.length === 0 && (
                <tr>
                  <td className="px-6 py-10 text-center text-textLight" colSpan={4}>
                    No schools found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white w-full max-w-2xl p-8 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-secondary mb-6">
              {isEdit ? "Edit School" : "Create School"}
            </h2>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-textLight uppercase mb-1">School Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-textLight uppercase mb-1">Area *</label>
                  <input
                    value={form.area}
                    onChange={(e) => setForm((p) => ({ ...p, area: e.target.value }))}
                    className="w-full border p-2 rounded outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-textLight uppercase mb-1">Level *</label>
                  <input
                    value={form.level}
                    onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}
                    className="w-full border p-2 rounded outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-textLight uppercase mb-1">Category *</label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full border p-2 rounded outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-textLight uppercase mb-1">Gender Type *</label>
                  <select
                    value={form.gender_type}
                    onChange={(e) => setForm((p) => ({ ...p, gender_type: e.target.value as any }))}
                    className="w-full border p-2 rounded outline-none bg-white"
                    required
                  >
                    <option value="mixed">mixed</option>
                    <option value="boys">boys</option>
                    <option value="girls">girls</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-textLight uppercase mb-1">Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full border p-2 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-textLight uppercase mb-1">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full border p-2 rounded outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-textLight uppercase mb-1">Address</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  className="w-full border p-2 rounded outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-textLight uppercase mb-1">President Name</label>
                  <input
                    value={form.president_name}
                    onChange={(e) => setForm((p) => ({ ...p, president_name: e.target.value }))}
                    className="w-full border p-2 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-textLight uppercase mb-1">Fees Range</label>
                  <input
                    value={form.fees_range}
                    onChange={(e) => setForm((p) => ({ ...p, fees_range: e.target.value }))}
                    className="w-full border p-2 rounded outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-textLight uppercase mb-1">Curriculum</label>
                <input
                  value={form.curriculum}
                  onChange={(e) => setForm((p) => ({ ...p, curriculum: e.target.value }))}
                  className="w-full border p-2 rounded outline-none"
                />
              </div>

              {/* ASSIGN ADMIN */}
              {isEdit && (
                <div className="bg-neutral-50 p-4 rounded-lg border mt-4">
                  <label className="block text-xs font-bold text-secondary uppercase mb-2">
                    Assign School Admin
                  </label>

                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={form.create_new_admin}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          create_new_admin: e.target.checked,
                          existing_admin_id: "",
                        }))
                      }
                    />
                    <span className="text-sm text-textDark">
                      Create a new admin account instead of selecting existing
                    </span>
                  </div>

                  {!form.create_new_admin ? (
                    <select
                      value={form.existing_admin_id}
                      onChange={(e) => setForm((p) => ({ ...p, existing_admin_id: e.target.value }))}
                      className="w-full border p-2 rounded bg-white outline-none"
                    >
                      <option value="">Select existing school admin...</option>
                      {admins.map((a) => (
                        <option key={a.id} value={String(a.id)}>
                          {a.name} ({a.email}){a.adminSchool ? ` — assigned to ${a.adminSchool.name}` : ""}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      <input
                        placeholder="New admin name"
                        value={form.new_admin_name}
                        onChange={(e) => setForm((p) => ({ ...p, new_admin_name: e.target.value }))}
                        className="w-full border p-2 rounded outline-none"
                      />
                      <input
                        placeholder="New admin email"
                        value={form.new_admin_email}
                        onChange={(e) => setForm((p) => ({ ...p, new_admin_email: e.target.value }))}
                        className="w-full border p-2 rounded outline-none"
                      />
                      <input
                        placeholder="New admin password (min 8)"
                        type="password"
                        value={form.new_admin_password}
                        onChange={(e) => setForm((p) => ({ ...p, new_admin_password: e.target.value }))}
                        className="w-full border p-2 rounded outline-none"
                      />
                    </div>
                  )}

                  <div className="flex justify-end mt-3">
                    <button
                      disabled={saving}
                      onClick={assignAdmin}
                      className="px-5 py-2 bg-secondary text-white rounded font-bold hover:bg-secondary/90 disabled:opacity-60"
                      type="button"
                    >
                      {saving ? "Working..." : "Assign Admin"}
                    </button>
                  </div>

                  <p className="text-[10px] text-textLight mt-2 italic">
                    * The assigned user will have exclusive access to manage this school's profile and verifications.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-2 text-textLight hover:bg-neutral-100 rounded-lg"
              >
                Cancel
              </button>

              <button
                disabled={saving}
                type="button"
                onClick={saveSchool}
                className="px-8 py-2 bg-primary text-secondary font-bold rounded-lg hover:bg-yellow-500 shadow transition disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save School Data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSchools;
