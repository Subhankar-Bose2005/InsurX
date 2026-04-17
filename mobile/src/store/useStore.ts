import { create } from 'zustand';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Worker {
  uid: string;
  name: string | null;
  phone: string | null;
  pincode: string | null;
  zone: string | null;
  state?: string | null;
  platform: 'zomato' | 'swiggy' | 'zepto' | 'other' | null;
  weeklyEarnings: number | null;
  workingHours: number | null;
  upiId: string | null;
  onboardingComplete: boolean;
  createdAt?: string;
  // KYC & fraud-detection fields
  aadhaarLast4?: string | null;
  documentType?: string | null;
  selfieUrl?: string | null;
  partnerId?: string | null;
  fraudScore?: number | null;
  fraudRiskLevel?: string | null;
}

export interface Policy {
  id: string;
  workerId: string;
  plan: 'basic' | 'shield' | 'shield+';
  planName: string;
  premium: number;
  coveragePercent: number;
  maxPayout: number;
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface Claim {
  id: string;
  workerId: string;
  policyId: string;
  triggerId: string;
  triggerType: string;
  triggerLabel: string;
  disruptedHours: number;
  shiftMultiplier: number;
  shiftLabel: string;
  basePayout: number;
  finalPayout: number;
  status: 'approved' | 'flagged' | 'paid' | 'rejected';
  fraudScore: number;
  fraudRiskLevel: string;
  razorpayPayoutId: string | null;
  weekBatchDate: string | null;
  createdAt: string;
  paidAt?: string;
}

export interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  rainfall_mm_per_hr: number;
  weatherMain: string;
  weatherDescription: string;
  windSpeed: number;
  city: string;
  aqi: number;
  dominantPollutant?: string;
}

export interface ActiveTrigger {
  id: string;
  type: string;
  zone: string;
  pincode: string;
  severity: number;
  startTime: string;
  status: string;
  weatherData?: WeatherData;
}

export interface ClaimSummary {
  totalProtected: number;
  lastPayout: { amount: number; date: string } | null;
  claimsThisWeek: number;
}

// ─── Store ────────────────────────────────────────────────────────────────────
interface InsurXStore {
  // Auth
  idToken: string | null;
  isAuthenticated: boolean;
  setIdToken: (token: string | null) => void;

  // Worker
  worker: Worker | null;
  setWorker: (worker: Worker | null) => void;
  updateWorker: (partial: Partial<Worker>) => void;

  // Policy
  activePolicy: Policy | null;
  policies: Policy[];
  setActivePolicy: (policy: Policy | null) => void;
  setPolicies: (policies: Policy[]) => void;

  // Claims
  claims: Claim[];
  claimSummary: ClaimSummary;
  setClaims: (claims: Claim[], summary: ClaimSummary) => void;

  // Weather
  weather: WeatherData | null;
  activeTriggers: ActiveTrigger[];
  hasActiveDisruption: boolean;
  setWeather: (weather: WeatherData | null) => void;
  setActiveTriggers: (triggers: ActiveTrigger[]) => void;

  // Loading states
  isLoadingWorker: boolean;
  isLoadingPolicy: boolean;
  isLoadingClaims: boolean;
  isLoadingWeather: boolean;
  setLoading: (key: 'worker' | 'policy' | 'claims' | 'weather', value: boolean) => void;

  // Errors
  errors: Record<string, string | null>;
  setError: (key: string, message: string | null) => void;

  // Reset (logout)
  reset: () => void;
}

const initialState = {
  idToken: null,
  isAuthenticated: false,
  worker: null,
  activePolicy: null,
  policies: [],
  claims: [],
  claimSummary: { totalProtected: 0, lastPayout: null, claimsThisWeek: 0 },
  weather: null,
  activeTriggers: [],
  hasActiveDisruption: false,
  isLoadingWorker: false,
  isLoadingPolicy: false,
  isLoadingClaims: false,
  isLoadingWeather: false,
  errors: {},
};

const useStore = create<InsurXStore>((set, get) => ({
  ...initialState,

  setIdToken: (token) =>
    set({ idToken: token, isAuthenticated: !!token }),

  setWorker: (worker) => set({ worker }),

  updateWorker: (partial) =>
    set((state) => ({
      worker: state.worker ? { ...state.worker, ...partial } : null,
    })),

  setActivePolicy: (policy) => set({ activePolicy: policy }),

  setPolicies: (policies) => {
    const active = policies.find((p) => p.status === 'active') || null;
    set({ policies, activePolicy: active });
  },

  setClaims: (claims, summary) => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const claimsThisWeek = claims.filter((c) => c.createdAt >= weekAgo).length;
    set({ claims, claimSummary: { ...summary, claimsThisWeek } });
  },

  setWeather: (weather) => set({ weather }),

  setActiveTriggers: (triggers) =>
    set({ activeTriggers: triggers, hasActiveDisruption: triggers.length > 0 }),

  setLoading: (key, value) => {
    const keyMap: Record<string, string> = {
      worker: 'isLoadingWorker',
      policy: 'isLoadingPolicy',
      claims: 'isLoadingClaims',
      weather: 'isLoadingWeather',
    };
    set({ [keyMap[key]]: value } as any);
  },

  setError: (key, message) =>
    set((state) => ({ errors: { ...state.errors, [key]: message } })),

  reset: () => set({ ...initialState }),
}));

export default useStore;
