import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { School, SchoolAdminPublishedReview, SchoolPhoto } from "../../services/types";

const SchoolAdminProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"info" | "photos" | "reviews">("info");

  const [school, setSchool] = useState<School | null>(null);
  const [reviews, setReviews] = useState<SchoolAdminPublishedReview[]>([]);
  const [photos, setPhotos] = useState<SchoolPhoto[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);

  const extractSchool = (data: any): School | null => {
    const s = data?.school ?? data;
    return s && typeof s === "object" ? (s as School) : null;
  };

  const extractPhotos = (data: any): SchoolPhoto[] => {
    const list = data?.photos ?? data;
    return Array.isArray(list) ? (list as SchoolPhoto[]) : [];
  };

  const extractReviews = (data: any): SchoolAdminPublishedReview[] => {
    const list = data?.reviews ?? data;
    return Array.isArray(list) ? (list as SchoolAdminPublishedReview[]) : [];
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sRes, pRes, rRes] = await Promise.all([
        api.get("/school-admin/profile"),
        api.get("/school-admin/photos"),
        api.get("/school-admin/published-reviews"),
      ]);

      const s = extractSchool(sRes.data);
      if (!s) throw new Error("School data missing from API response");

      setSchool(s);
      setPhotos(extractPhotos(pRes.data));
      setReviews(extractReviews(rRes.data));
    } catch (err: any) {
      console.error("SchoolAdminProfile crash:", err);
      setSchool(null);
      setPhotos([]);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school) return;

    setSaving(true);
    try {
      const form = new FormData();
      form.append("_method", "PATCH");

      form.append("name", school.name ?? "");
      form.append("email", school.email ?? "");
      form.append("phone", school.phone ?? "");
      form.append("address", school.address ?? "");
      form.append("description", (school as any).description ?? ""); // ✅ NEW

      form.append("area", school.area ?? "");
      form.append("category", school.category ?? "");
      form.append("level", school.level ?? "");
      form.append("gender_type", String(school.gender_type ?? "mixed"));
      form.append("president_name", school.president_name ?? "");
      form.append("fees_range", school.fees_range ?? "");
      form.append("curriculum", school.curriculum ?? "");

      if (logoFile) {
        form.append("logo", logoFile);
      }

      const res = await api.post("/school-admin/profile", form);

      const updated = extractSchool(res.data);
      if (updated) setSchool(updated);

      alert("Profile updated successfully!");
      setLogoFile(null);
    } catch (e: any) {
      alert(e.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    try {
      await api.delete(`/school-admin/photos/${photoId}`);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch (e: any) {
      alert(e.response?.data?.message || "Delete failed");
    }
  };

  const handleUploadPhotos = async (files: File[]) => {
    if (!files.length) return;

    setUploadFiles(files);

    const formData = new FormData();
    files.forEach((file) => formData.append("photos[]", file));

    try {
      const res = await api.post("/school-admin/photos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newPhotos = extractPhotos(res.data);
      setPhotos((prev) => [...newPhotos, ...prev]);
      alert("Photos uploaded successfully!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setUploadFiles([]);
    }
  };

  const handleReport = async (reviewId: number) => {
    const reason = prompt("Enter report reason:");
    if (!reason?.trim()) return;

    try {
      await api.post(`/school-admin/reviews/${reviewId}/report`, { report_reason: reason });
      alert("Report sent to Super Admin");
    } catch (e: any) {
      alert(e.response?.data?.message || "Report failed");
    }
  };

  const getLogoSrc = (s: any) => {
    if (typeof s?.logo === "string" && s.logo.trim() !== "") return s.logo;

    const lp = s?.logo_path;
    if (typeof lp === "string" && lp.trim() !== "") {
      const clean = lp.replace(/^\/+/, "");
      return `http://127.0.0.1:8000/storage/${clean}`;
    }

    return "";
  };

  const logoPreview = logoFile ? URL.createObjectURL(logoFile) : "";

  const RatingChip = ({ label, value }: { label: string; value: any }) => (
    <div className="flex items-center justify-between gap-2 bg-white border rounded px-3 py-2 text-xs">
      <span className="text-textLight">{label}</span>
      <span className="font-bold text-secondary">{value ?? "-"}/5</span>
    </div>
  );

  if (loading) {
    return <div className="text-center py-20">Loading your school admin console...</div>;
  }

  if (!school) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <p className="text-textLight">School data could not be loaded. Open Console (F12) to see the error.</p>
        <button onClick={fetchAll} className="mt-4 px-4 py-2 border rounded font-semibold hover:bg-neutral-50">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 border-b border-neutral-200">
        <h1 className="text-3xl font-bold text-secondary mb-2">School Administration</h1>
        <p className="text-textLight mb-6">Manage your school profile, media gallery, and track reviews.</p>

        <div className="flex gap-8 overflow-x-auto no-scrollbar">
          {[
            { id: "info", label: "School Info" },
            { id: "photos", label: "Photos" },
            { id: "reviews", label: "Published Reviews" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 px-2 font-semibold text-sm transition-all border-b-2 ${
                activeTab === tab.id
                  ? "border-primary text-secondary"
                  : "border-transparent text-textLight hover:text-textDark"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-8 min-h-[500px]">
        {activeTab === "info" && (
          <form onSubmit={handleSaveInfo} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full mb-4">
              <label className="block text-sm font-bold text-textDark mb-2">School Logo</label>

              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-neutral-100 rounded border flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo Preview" className="object-contain w-full h-full" />
                  ) : getLogoSrc(school as any) ? (
                    <img src={getLogoSrc(school as any)} alt="Logo" className="object-contain w-full h-full" />
                  ) : (
                    <span className="text-xs text-textLight">No Logo</span>
                  )}
                </div>

                <input
                  type="file"
                  className="text-xs text-textLight"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            {[
              { label: "School Name", key: "name" },
              { label: "Email", key: "email", type: "email" },
              { label: "Phone", key: "phone" },
              { label: "Address", key: "address" },
              { label: "Area", key: "area" },
              { label: "Category", key: "category" },
              { label: "Level", key: "level" },
              { label: "Gender Type", key: "gender_type" },
              { label: "President Name", key: "president_name" },
              { label: "Fees Range", key: "fees_range" },
              { label: "Curriculum", key: "curriculum" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-bold text-textDark mb-1">{field.label}</label>
                <input
                  type={field.type || "text"}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none text-sm"
                  value={(school as any)[field.key] || ""}
                  onChange={(e) => setSchool({ ...school, [field.key]: e.target.value } as any)}
                />
              </div>
            ))}

            {/* ✅ NEW: Description section (optional) */}
            <div className="col-span-full">
              <label className="block text-sm font-bold text-textDark mb-1">School Description (Optional)</label>
              <textarea
                className="w-full border p-3 rounded focus:ring-2 focus:ring-primary outline-none text-sm min-h-[140px]"
                placeholder="Write a short description about the school (mission, environment, values, activities, etc.)"
                value={(school as any).description || ""}
                onChange={(e) => setSchool({ ...school, description: e.target.value } as any)}
              />
              <p className="text-xs text-textLight mt-1">Max 5000 characters.</p>
            </div>

            <div className="col-span-full pt-4 flex justify-end">
              <button
                disabled={saving}
                className="bg-primary text-secondary px-10 py-3 rounded-lg font-bold shadow hover:bg-yellow-500 transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}

        {activeTab === "photos" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-secondary">Photo Gallery ({photos.length}/8)</h3>

              <label className="bg-secondary text-white px-4 py-2 rounded-md text-sm cursor-pointer hover:bg-secondary/90 font-semibold">
                {uploadFiles.length ? "Uploading..." : "Upload New Photo"}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files: File[] = e.target.files ? Array.from(e.target.files) : [];
                    e.target.value = "";
                    handleUploadPhotos(files);
                  }}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {photos.map((p) => (
                <div
                  key={p.id}
                  className="relative group overflow-hidden rounded-lg shadow-sm border h-40 bg-neutral-100"
                >
                  <img src={(p as any).url} className="w-full h-full object-cover" alt="School" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(p.id)}
                      className="bg-warning text-white p-2 rounded-full hover:bg-red-600 transition"
                      title="Delete photo"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}

              {photos.length === 0 && (
                <div className="col-span-full text-center py-10 text-textLight italic">No photos uploaded yet.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-6">
            <h3 className="font-bold text-secondary mb-4">Published Reviews</h3>

            {reviews.length > 0 ? (
              reviews.map((r) => (
                <div key={r.id} className="bg-neutral-50 p-6 rounded-lg border">
                  <p className="text-xs text-textLight">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : "-"}
                  </p>

                  <p className="text-sm font-bold text-textDark mt-2">
                    Overall rating: {r.overall_rating ?? "-"} / 5
                  </p>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <RatingChip label="Hygiene" value={r.hygiene} />
                    <RatingChip label="Management" value={r.management} />
                    <RatingChip label="Education Quality" value={r.education_quality} />
                    <RatingChip label="Parent Communication" value={r.parent_communication} />
                  </div>

                  {r.comment ? (
                    <p className="text-sm italic mt-4">"{r.comment}"</p>
                  ) : (
                    <p className="text-sm text-textLight italic mt-4">No comment.</p>
                  )}

                  <button
                    onClick={() => handleReport(r.id)}
                    className="mt-4 text-warning text-xs font-bold border border-warning/20 px-3 py-1 rounded hover:bg-warning/5"
                    type="button"
                  >
                    Report to Super Admin
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-textLight italic">No published reviews yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolAdminProfile;
