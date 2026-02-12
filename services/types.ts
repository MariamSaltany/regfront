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
  adminSchool?: { id: number; name: string } | null;
};

export type School = {
  id: number;
  name: string;
  slug: string;

  email?: string | null;
  phone?: string | null;
  address?: string | null;

  description?: string | null; 

  area?: string | null;
  category?: string | null;
  level?: string | null;

  gender_type?: "boys" | "girls" | "mixed" | string;
  president_name?: string | null;
  fees_range?: string | null;
  curriculum?: string | null;

  logo?: string;
  logo_path?: string | null;

  details?: School;
  gallery?: { id: number; url: string; thumb: string; name: string }[];

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

  user?: { id: number; name: string };
};

export type PublicReview = ReviewBase & {
  parent_name?: string | null;
};

export type Review = ReviewBase & {
  student_number: string;
};

export type SchoolAdminPublishedReview = ReviewBase & {
  is_reported?: boolean;
  report_status?: string | null;

  hygiene?: number | null;
  management?: number | null;
  education_quality?: number | null;
  parent_communication?: number | null;
};

export type SchoolPhoto = {
  id: number;
  file_path?: string;
  url: string;
  caption?: string | null;
  created_at?: string;
};
