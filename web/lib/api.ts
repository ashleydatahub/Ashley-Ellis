const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface Industry {
  id: number;
  name: string;
  saturation: number;
  note: string;
}

export interface MentorOut {
  id: number;
  display_name: string;
  bio: string;
  session_price_cents: number;
  is_verified: boolean;
  is_active: boolean;
  pseudonym_only: boolean;
  industries: Industry[];
  created_at: string;
}

export async function getIndustries(): Promise<Industry[]> {
  const res = await fetch(`${API_BASE}/api/industries`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch industries");
  return res.json();
}

export async function getMentors(industryId?: number): Promise<MentorOut[]> {
  const url = industryId
    ? `${API_BASE}/api/mentors?industry_id=${industryId}`
    : `${API_BASE}/api/mentors`;
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error("Failed to fetch mentors");
  return res.json();
}

export async function healthCheck(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/api/health`, { cache: "no-store" });
  if (!res.ok) throw new Error("API health check failed");
  return res.json();
}
