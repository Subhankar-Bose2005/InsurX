import axios, { AxiosInstance, AxiosError } from 'axios';
import { auth } from './firebase'; // ✅ IMPORTANT

const BASE_URL = 'http://10.3.180.205:3001';

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Auth Token Interceptor (FIXED) ───────────────────────────────────────────
api.interceptors.request.use(async (config) => {
  try {
    let token = null;

    if (auth.currentUser) {
      token = await auth.currentUser.getIdToken(true); // 🔥 ALWAYS FRESH TOKEN
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('❌ No Firebase user found');
    }

  } catch (err) {
    console.log('❌ Token error:', err);
  }

  return config;
});

// ─── Response Error Interceptor ───────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; errors?: { msg: string }[] }>) => {
    if (error.response) {
      const data = error.response.data;
      const message =
        data?.error ||
        data?.errors?.map((e) => e.msg).join(', ') ||
        `Request failed with status ${error.response.status}`;
      return Promise.reject(new Error(message));
    }

    if (error.request) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    return Promise.reject(error);
  }
);

// ─── Auth (Firebase OTP flow) ─────────────────────────────────────────────────
export const sendOtp = (phone: string) =>
  api.post('/auth/send-otp', { phone }).then((r) => r.data);

// ✅ ONLY idToken
export const verifyOtp = (idToken: string) =>
  api.post('/auth/verify-otp', { idToken }).then((r) => r.data);

export const getMe = () => api.get('/auth/me').then((r) => r.data);

// ─── Workers ──────────────────────────────────────────────────────────────────
export interface WorkerPayload {
  name: string;
  pincode: string;
  platform: string;
  weeklyEarnings: number;
  workingHours: number;
  upiId?: string;
  partnerId?: string;
  aadhaarLast4?: string;
  gpsLat?: number;
  gpsLon?: number;
  primaryShift?: string;
  avgOrdersPerWeek?: number;
  experienceYears?: string;
  dob?: string;
  gender?: string;
  bankAccount?: string;
  ifscCode?: string;
  documentType?: string;
  selfieUrl?: string;
  documentFrontUrl?: string;
  documentBackUrl?: string;
  registrationTimestamp?: string;
  deviceId?: string;
}

export const createWorker = (payload: WorkerPayload) =>
  api.post('/workers', payload).then((r) => r.data);

export const getWorker = (id: string) =>
  api.get(`/workers/${id}`).then((r) => r.data);

export const updateWorker = (id: string, payload: Partial<WorkerPayload>) =>
  api.patch(`/workers/${id}`, payload).then((r) => r.data);

// ─── Policies ─────────────────────────────────────────────────────────────────
export const createPolicy = (plan: string, razorpayPaymentId?: string) =>
  api.post('/policies', { plan, razorpayPaymentId }).then((r) => r.data);

export const getPolicies = (workerId: string) =>
  api.get(`/policies/${workerId}`).then((r) => r.data);

export const updatePolicy = (policyId: string, payload: { plan?: string; action?: 'cancel' }) =>
  api.patch(`/policies/${policyId}`, payload).then((r) => r.data);

// ─── Premium ──────────────────────────────────────────────────────────────────
export const calculatePremium = (pincode: string, plan: string) =>
  api.post('/premium/calculate', { pincode, plan }).then((r) => r.data);

export const getPlans = () => api.get('/premium/plans').then((r) => r.data);

// ─── Triggers ─────────────────────────────────────────────────────────────────
export const getActiveTriggers = (pincode?: string) =>
  api.get('/triggers/active', { params: pincode ? { pincode } : {} }).then((r) => r.data);

export const fireDemoTrigger = (type?: string) =>
  api.post('/triggers/demo/fire', type ? { type } : {}).then((r) => r.data);

// ─── Claims ───────────────────────────────────────────────────────────────────
export const getClaims = (workerId: string) =>
  api.get(`/claims/${workerId}`).then((r) => r.data);

export const adminReviewClaim = (claimId: string, action: 'approve' | 'reject') =>
  api.patch(`/claims/${claimId}/review`, { action }).then((r) => r.data);

// ─── Weather ──────────────────────────────────────────────────────────────────
export const getZoneWeather = (pincode: string) =>
  api.get(`/weather/zone/${pincode}`).then((r) => r.data);

// ─── Payouts ──────────────────────────────────────────────────────────────────
export const getPayouts = (workerId: string) =>
  api.get(`/payouts/${workerId}`).then((r) => r.data);

export const seedDemoPayout = () =>
  api.post('/payouts/demo/seed').then((r) => r.data);

// ─── Payment ──────────────────────────────────────────────────────────────────
export const createPaymentOrder = (amount: number, plan: string) =>
  api.post('/payment/create-order', { amount, plan }).then((r) => r.data);

export const verifyPayment = (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
) =>
  api.post('/payment/verify', {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  }).then((r) => r.data);

// ─── Upload ───────────────────────────────────────────────────────────────────
export const uploadFile = (base64: string, filename: string, contentType: string) =>
  api.post('/upload', { base64, filename, contentType }).then((r) => r.data);

export default api;