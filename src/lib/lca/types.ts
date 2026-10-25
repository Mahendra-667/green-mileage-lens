export type EvidenceStatus = "verified" | "proxy" | "illustrative" | "needs_review";

export type LifecycleCategory =
  | "materials"
  | "components"
  | "manufacturing"
  | "energy"
  | "transport"
  | "vehicle_use"
  | "end_of_life";

export const CATEGORY_LABELS: Record<LifecycleCategory, string> = {
  materials: "Materials",
  components: "Components",
  manufacturing: "Manufacturing",
  energy: "Energy",
  transport: "Transport",
  vehicle_use: "Vehicle use",
  end_of_life: "End of life",
};

export const STATUS_LABELS: Record<EvidenceStatus, string> = {
  verified: "Verified",
  proxy: "Proxy",
  illustrative: "Illustrative",
  needs_review: "Needs review",
};

export interface Source {
  id: string;
  organisation: string;
  title: string;
  publicationYear: number | null;
  geography: string;
  reference: string;
  systemBoundary: string;
  units: string;
  limitations: string;
  status: EvidenceStatus;
}

export interface Factor {
  id: string;
  name: string;
  category: LifecycleCategory;
  geography: string;
  referenceYear: number;
  indicator: "GWP100";
  /** null = factor not available. Never treated as zero. */
  value: number | null;
  /** Impact unit, e.g. "kg CO2e" */
  impactUnit: string;
  /** Activity unit the factor is expressed per, e.g. "kg", "kWh" */
  perUnit: string;
  sourceId: string;
  status: EvidenceStatus;
  notes?: string;
}

export interface Assessment {
  id: string;
  createdAt: string;
  label: string;
  quantity: number;
  activityUnit: string;
  factor: Factor; // snapshot preserved at time of assessment
  sourceTitle: string;
  impact: number;
  impactUnit: string;
}
