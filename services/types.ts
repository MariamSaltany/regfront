export enum UserRole {
  PARENT = "parent",
  SCHOOL_ADMIN = "school_admin",
  SUPER_ADMIN = "super_admin",
}

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  adminSchool?: School | null;
};

export type SchoolAdminMini = {
  id: number;
  name: string;
  email: string;
  role?: string;
  adminSchool?: { id: number; name: string } | null; // from backend schoolAdmins endpoint
};

export type School = {
  id: number;
  name: string;
  slug: string;

  email?: string | null;
  phone?: string | null;
  address?: string | null;

  area?: string | null;
  category?: string | null;
  level?: string | null;

  gender_type?: "boys" | "girls" | "mixed" | string;
  president_name?: string | null;
  fees_range?: string | null;
  curriculum?: string | null;

  logo?: string;
  logo_path?: string | null;

  // ✅ admin relation returned by backend
  admin?: SchoolAdminMini | null;
};

// --- reviews ---
export type ReviewBase = {
  id: number;
  school_id: number;

  hygiene?: number | null;
  management?: number | null;
  education_quality?: number | null;
  parent_communication?: number | null;

  overall_rating?: number | null;
  comment?: string | null;

  status?: string;
  created_at: string;
};

export type PublicReview = ReviewBase & {
  parent_name?: string | null;
};

export type Review = ReviewBase & {
  student_number: string;
};

export type SchoolPhoto = {
  id: number;
  file_path: string;
  url: string;
  caption?: string | null;
  created_at?: string;
};
