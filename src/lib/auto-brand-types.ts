export interface AutoBrandField<T> {
  value: T;
  confidence: number; // 0-1
  source: string; // where it was found
}

export interface AutoBrandResult {
  logo: AutoBrandField<string> | null;
  primaryColor: AutoBrandField<string> | null;
  secondaryColor: AutoBrandField<string> | null;
  businessName: AutoBrandField<string> | null;
  phone: AutoBrandField<string> | null;
  googleReviewUrl: AutoBrandField<string> | null;
}
