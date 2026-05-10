export type Tier = "free" | "verified" | "premier";

export type ClinicCardData = {
  id: string;
  name: string;
  tier: Tier;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  distanceKm: number;
  district: string;
  tags: string[];
  badges: ClinicBadge[];
  imageGradient: string;
};

export type ClinicBadge =
  | { kind: "hot" }
  | { kind: "installment"; months: number }
  | { kind: "book-today" };

export type Category = {
  slug: string;
  label: string;
  icon: string;
};
