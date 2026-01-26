import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { School, SchoolAdminMini } from "../../services/types";

type FormState = {
  id?: number;
  slug?: string; 
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

  logo: File | null;
  photos: FileList | null;

  currentLogo?: string;
  currentPhotos: { id: number; url: string; name: string }[];

  // admin assignment
  existing_admin_id: string; 
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

  logo: null,
  photos: null,
  currentLogo: undefined,
  currentPhotos: [],

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
    // We use the slug because your model uses getRouteKeyName() = 'slug'
    const identifier = s.slug || s.id;
    api.get(`/admin/schools/${identifier}`).then(res => {
      const school = res.data.school;

      const logoMedia = school.media?.find((m: any) => m.collection_name === 'logo');
      const photoMedia = school.media?.filter((m: any) => m.collection_name === 'photos') || [];

      setForm({
        ...emptyForm, 
        id: school.id,
        slug: school.slug,
        name: school.name || "",
        email: school.email || "",
        phone: school.phone || "",
        address: school.address || "",
        area: school.area || "",
        category: school.category || "",
        level: school.level || "",
        gender_type: (school.gender_type as any) || "mixed",
        president_name: school.president_name || "",
        fees_range: school.fees_range || "",
        curriculum: school.curriculum || "",
        currentLogo: logoMedia ? logoMedia.original_url : undefined,
        currentPhotos: photoMedia.map((m: any) => ({
          id: m.id,
          url: m.original_url,
          name: m.file_name
        })),
        existing_admin_id: school.admin?.id ? String(school.admin.id) : "",
      });
      setModalOpen(true);
    }).catch(e => {
      alert("Failed to load school details: " + (e.response?.data?.message || e.message));
      fetchSchools();
    });
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
      // Use slug for deletion
      await api.delete(`/admin/schools/${s.slug || s.id}`);
      setSchools((prev) => prev.filter((x) => x.id !== s.id));
      alert("School deleted.");
    } catch (e: any) {
      alert(e.response?.data?.message || "Delete failed");
    }
  };

  const saveSchool = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('area', form.area);
      formData.append('category', form.category);
      formData.append('level', form.level);
      formData.append('gender_type', form.gender_type);
      
      if (form.email) formData.append('email', form.email);
      if (form.phone) formData.append('phone', form.phone);
      if (form.address) formData.append('address', form.address);
      if (form.president_name) formData.append('president_name', form.president_name);
      if (form.fees_range) formData.append('fees_range', form.fees_range);
      if (form.curriculum) formData.append('curriculum', form.curriculum);

      if (form.logo) formData.append('logo', form.logo);
      if (form.photos) {
        Array.from(form.photos).forEach((file) => {
          formData.append('photos[]', file);
        });
      }

      if (isEdit && form.slug) {

        const res = await api.post(`/admin/schools/${form.slug}?_method=PATCH`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const updated: School = res.data?.school;
        setSchools((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      } else {
        const res = await api.post(`/admin/schools`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const created: School = res.data?.school;
        setSchools((prev) => [created, ...prev]);
      }

      alert("School saved.");
      await fetchAdmins();
      await fetchSchools();
      closeModal();
    } catch (e: any) {
      const msg = e.response?.data?.message || "Save failed";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const assignAdmin = async () => {
    if (!form.slug) return;

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

      const res = await api.post(`/admin/schools/${form.slug}/assign-admin`, payload);

      const updated: School = res.data?.school;
      setSchools((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));

      alert("Admin assigned.");
      await fetchAdmins();
      await fetchSchools();
    } catch (e: any) {
      alert(e.response?.data?.message || "Assign failed");
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
                      <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-[10px] font-bold">
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
                        className="text-red-500 hover:text-red-700 font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
              {/* Form inputs exactly as you had them, using setForm ... */}
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

              {/* ... Other input fields continue here ... */}
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
                  >
                    <option value="mixed">mixed</option>
                    <option value="boys">boys</option>
                    <option value="girls">girls</option>
                  </select>
                </div>
              </div>

              {/* FILE UPLOADERS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                {/* Logo Section */}
                <div>
                    <label className="block text-xs font-bold text-textLight uppercase mb-2">School Logo</label>
                    <div className="relative group border-2 border-dashed border-neutral-200 rounded-xl p-4 transition hover:border-primary flex flex-col items-center justify-center min-h-[160px] bg-neutral-50">
                        {(form.logo || form.currentLogo) ? (
                            <div className="relative w-24 h-24">
                                <img 
                                    src={form.logo ? URL.createObjectURL(form.logo) : form.currentLogo} 
                                    className="w-full h-full object-contain" 
                                    alt="Preview" 
                                />
                                <button type="button" onClick={() => setForm(p => ({...p, logo: null}))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ) : <span className="text-xs text-textLight">Click to upload</span>}
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setForm(p => ({...p, logo: e.target.files?.[0] || null}))} />
                    </div>
                </div>

                {/* Gallery Section */}
                <div>
                    <label className="block text-xs font-bold text-textLight uppercase mb-2">Gallery</label>
                    <div className="border-2 border-dashed border-neutral-200 rounded-xl p-4 bg-neutral-50 min-h-[160px]">
                        <div className="flex flex-wrap gap-2">
                            {form.currentPhotos.map(p => (
                                <img key={p.id} src={p.url} className="w-12 h-12 object-cover rounded border" alt="Gallery" />
                            ))}
                            {form.photos && Array.from(form.photos).map((f, i) => (
                                <img key={i} src={URL.createObjectURL(f)} className="w-12 h-12 object-cover rounded border border-primary" alt="New" />
                            ))}
                            <label className="w-12 h-12 flex items-center justify-center border-2 border-dashed border-neutral-300 rounded cursor-pointer hover:border-primary">
                                <span className="text-xl">+</span>
                                <input type="file" multiple hidden onChange={(e) => setForm(p => ({...p, photos: e.target.files}))} />
                            </label>
                        </div>
                    </div>
                </div>
              </div>

              {/* ADMIN ASSIGNMENT SECTION */}
              {isEdit && (
                <div className="bg-neutral-50 p-4 rounded-lg border mt-4">
                  <label className="block text-xs font-bold text-secondary uppercase mb-2">Assign School Admin</label>
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={form.create_new_admin}
                      onChange={(e) => setForm((p) => ({ ...p, create_new_admin: e.target.checked, existing_admin_id: "" }))}
                    />
                    <span className="text-sm">Create a new admin account</span>
                  </div>

                  {!form.create_new_admin ? (
                    <select
                      value={form.existing_admin_id}
                      onChange={(e) => setForm((p) => ({ ...p, existing_admin_id: e.target.value }))}
                      className="w-full border p-2 rounded bg-white"
                    >
                      <option value="">Select existing admin...</option>
                      {admins.map((a) => (
                        <option key={a.id} value={String(a.id)}>
                          {a.name} ({a.email}){a.adminSchool ? ` — assigned to ${a.adminSchool.name}` : ""}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="space-y-3">
                      <input placeholder="Name" value={form.new_admin_name} onChange={(e) => setForm(p => ({...p, new_admin_name: e.target.value}))} className="w-full border p-2 rounded" />
                      <input placeholder="Email" value={form.new_admin_email} onChange={(e) => setForm(p => ({...p, new_admin_email: e.target.value}))} className="w-full border p-2 rounded" />
                      <input placeholder="Password" type="password" value={form.new_admin_password} onChange={(e) => setForm(p => ({...p, new_admin_password: e.target.value}))} className="w-full border p-2 rounded" />
                    </div>
                  )}
                  <button onClick={assignAdmin} disabled={saving} className="mt-3 px-4 py-2 bg-secondary text-white rounded font-bold w-full disabled:opacity-50">
                    {saving ? "Processing..." : "Assign Admin"}
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-4 justify-end">
              <button type="button" onClick={closeModal} className="px-6 py-2 text-textLight hover:bg-neutral-100 rounded-lg">Cancel</button>
              <button disabled={saving} type="button" onClick={saveSchool} className="px-8 py-2 bg-primary text-secondary font-bold rounded-lg hover:bg-yellow-500 shadow transition disabled:opacity-60">
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