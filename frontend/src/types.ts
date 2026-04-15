export interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'athlete' | 'coach' | 'recruiter';
}

export interface SavedAthleteProfile {
  position: string;
  grad_year: number | null;
  height: string;
  weight: number | null;
  forty: number | null;
  bench: number | null;
  gpa: number | null;
  sat: number | null;
  act: number | null;
  intended_major: string;
  state: string;
  high_school: string;
  career_summary: string;
  film_url: string;
  region_pref: string;
  distance_pref: string;
  school_size_pref: string;
  priorities: string;
}

export interface AthleteProfile {
  // Required
  firstName: string;
  lastName: string;
  position: string;
  gradYear: number;
  height: string;
  weight: number;
  gpa: number;
  state: string;
  // Optional
  forty?: number;
  bench?: number;
  sat?: number;
  act?: number;
  highSchool?: string;
  major?: string;
  career?: string;
  film?: string;
  region?: string;
  distance?: string;
  schoolSize?: string;
  priorities?: string;
}

export interface School {
  name: string;
  abbr: string;
  division: string;
  conference: string;
  location: string;
  state: string;
  distance: string;
  fitScore: number;
  enrollment: string;
  avgGpa: string;
  coachName: string;
  coachEmail: string;
  emailDate: string;
  campName: string;
  campDate: string;
  followDate: string;
  primaryColor: string;
  secondaryColor: string;
  fitReason: string;
  concern: string;
}

export interface MatchResult {
  divisions: Record<string, number>;
  topDivision: string;
  insight: string;
  schools: School[];
}
