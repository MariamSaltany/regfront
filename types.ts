
export enum UserRole {
  GUEST = 'guest',
  PARENT = 'parent',
  SCHOOL_ADMIN = 'school_admin',
  SUPER_ADMIN = 'super_admin'
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  city?: string;
}

export interface School {
  id: number;
  slug: string;
  name: string;
  logo?: string;
  email: string;
  phone: string;
  address: string;
  area: string;
  category: string;
  level: string;
  gender_type: string;
  president_name: string;
  fees_range: string;
  curriculum: string;
}

export interface Review {
  id: number;
  school_id: number;
  school?: School;
  parent_id: number;
  parent_name?: string;
  parent_email?: string;
  student_number: string;
  hygiene: number;
  management: number;
  education_quality: number;
  parent_communication: number;
  comment?: string;
  status: 'pending' | 'approved' | 'rejected' | 'reported';
  created_at: string;
  rejection_reason?: string;
}

export interface Photo {
  id: number;
  url: string;
}

export interface Report {
  id: number;
  review_id: number;
  review: Review;
  reporter_id: number;
  reporter_name: string;
  reporter_email: string;
  reporter_role: string;
  reason: string;
  created_at: string;
  school_managed_name?: string;
}
