export type UserRole = "buyer" | "seller" | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_owner: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  emoji: string | null;
}

export interface Store {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  stock_quantity: number;
  image_urls: string[];
  is_approved: boolean;
  created_at: string;
  store?: Store;
}

export interface SellerApplication {
  id: string;
  user_id: string;
  store_name: string;
  store_description: string;
  what_they_sell: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  profile?: Profile;
}
