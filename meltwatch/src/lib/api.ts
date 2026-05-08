/**
 * MeltWatch API Service
 * Emotion analysis API client
 */

/// <reference types="vite/client" />

// API Base Configuration
const API_BASE = import.meta.env.VITE_API_BASE || "/api/v1";

// Auth Token Management
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ==================== Emotion Analysis Types ====================

export interface EmotionResult {
  emotion: {
    key: string;
    label: string;
    icon: string;
    category: string;
    score: number;
  };
  all_emotions: Array<{
    key: string;
    label: string;
    icon: string;
    category: string;
    score: number;
  }>;
  content: string;
  suggestion: {
    text: string;
    actions: string[];
    confidence: number;
    level: string;
  };
  source: string;
}

export interface BatchAnalyzeResult {
  success: boolean;
  data: EmotionResult[];
  error?: string;
}

export interface KeywordResult {
  success: boolean;
  data: {
    keywords: Array<{
      word: string;
      weight: number;
      positive_count: number;
      negative_count: number;
      neutral_count: number;
      total: number;
      positive_rate: number;
    }>;
  };
  error?: string;
}

export interface PainPointResult {
  success: boolean;
  data: {
    pain_points: Array<{
      category: string;
      count: number;
      severity: number;
      examples: string[];
    }>;
  };
  error?: string;
}

// ==================== Auth Types ====================

export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  is_premium: boolean;
  subscription_tier: string;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    user: User;
  };
  error?: string;
}

// ==================== Report Types ====================

export interface Report {
  id: number;
  title: string;
  total_reviews: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  created_at: string;
  data_json?: {
    keywords: Array<{
      word: string;
      weight: number;
      total: number;
      positive_rate: number;
    }>;
    pain_points: Array<{
      category: string;
      count: number;
      severity: number;
    }>;
  };
  html_content?: string;
}

export interface ReportListResponse {
  success: boolean;
  data: {
    items: Report[];
    total: number;
    page: number;
    page_size: number;
  };
  error?: string;
}

export interface ReportResponse {
  success: boolean;
  data?: Report;
  error?: string;
}

// ==================== Crawl Types ====================

export interface CrawlResult {
  url: string;
  title: string;
  content: string;
  author?: string;
  rating?: number;
  timestamp?: string;
}

export interface CrawlResponse {
  success: boolean;
  data: {
    total: number;
    results: CrawlResult[];
  };
  error?: string;
}

// ==================== User Types ====================

export interface UserStats {
  success: boolean;
  data?: {
    total_analysis: number;
    positive_count: number;
    negative_count: number;
    monthly_limit: number;
    analysis_count: number;
    subscription_tier: string;
    is_premium: boolean;
  };
  error?: string;
}

export interface AnalysisRecord {
  id: number;
  text: string;
  sentiment: string;
  confidence: number;
  emotion_label: string;
  emotion_icon: string;
  source: string;
  created_at: string;
}

export interface HistoryResponse {
  success: boolean;
  data?: {
    records: AnalysisRecord[];
    total: number;
    page: number;
    per_page: number;
    pages: number;
  };
  error?: string;
}

// ==================== Emotion Analysis APIs ====================

/**
 * Single text emotion analysis
 */
export async function analyzeEmotion(text: string): Promise<EmotionResult> {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || "Analysis failed");
  }

  return result.data;
}

/**
 * Batch text emotion analysis
 */
export async function batchAnalyzeEmotion(texts: string[]): Promise<EmotionResult[]> {
  const response = await fetch(`${API_BASE}/batch_analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ texts }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const result: BatchAnalyzeResult = await response.json();
  if (!result.success) {
    throw new Error(result.error || "Analysis failed");
  }

  return result.data;
}

/**
 * Keyword extraction
 */
export async function extractKeywords(
  texts: string[],
  topN: number = 20
): Promise<KeywordResult["data"]> {
  const response = await fetch(`${API_BASE}/keywords`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ texts, top_n: topN }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const result: KeywordResult = await response.json();
  if (!result.success) {
    throw new Error(result.error || "Keyword extraction failed");
  }

  return result.data;
}

/**
 * Pain point detection
 */
export async function detectPainPoints(
  texts: string[]
): Promise<PainPointResult["data"]> {
  const response = await fetch(`${API_BASE}/pain_points`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ texts }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const result: PainPointResult = await response.json();
  if (!result.success) {
    throw new Error(result.error || "Pain point detection failed");
  }

  return result.data;
}

// ==================== Auth APIs ====================

/**
 * User registration
 */
export async function register(
  email: string,
  password: string,
  username?: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, username }),
  });

  const result: AuthResponse = await response.json();

  if (result.success && result.data) {
    localStorage.setItem("auth_token", result.data.token);
  }

  return result;
}

/**
 * User login
 */
export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const result: AuthResponse = await response.json();

  if (result.success && result.data) {
    localStorage.setItem("auth_token", result.data.token);
  }

  return result;
}

/**
 * Logout
 */
export function logout(): void {
  localStorage.removeItem("auth_token");
}

/**
 * Get current user info
 */
export async function getCurrentUser(): Promise<{
  success: boolean;
  data?: User;
  error?: string;
}> {
  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders(),
  });

  return response.json();
}

/**
 * Update user profile
 */
export async function updateProfile(data: {
  username?: string;
  password?: string;
}): Promise<{
  success: boolean;
  data?: User;
  error?: string;
}> {
  const response = await fetch(`${API_BASE}/auth/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

// ==================== Report APIs ====================

/**
 * Generate report
 */
export async function generateReport(
  title: string,
  details: Array<{ text: string; sentiment: string }>
): Promise<{
  success: boolean;
  data?: {
    report_id: number;
    title: string;
    total_reviews: number;
    positive_rate: number;
  };
  error?: string;
}> {
  const response = await fetch(`${API_BASE}/reports/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ title, details }),
  });

  return response.json();
}

/**
 * Get report list
 */
export async function getReportList(
  page: number = 1,
  pageSize: number = 20
): Promise<ReportListResponse> {
  const response = await fetch(
    `${API_BASE}/reports?page=${page}&page_size=${pageSize}`,
    { headers: getAuthHeaders() }
  );

  return response.json();
}

/**
 * Get report detail
 */
export async function getReportDetail(
  reportId: number
): Promise<ReportResponse> {
  const response = await fetch(`${API_BASE}/reports/${reportId}`, {
    headers: getAuthHeaders(),
  });

  return response.json();
}

/**
 * Download report as HTML
 */
export async function downloadReport(reportId: number): Promise<Blob> {
  const response = await fetch(`${API_BASE}/reports/${reportId}/download`, {
    headers: getAuthHeaders(),
  });

  return response.blob();
}

/**
 * Delete report
 */
export async function deleteReport(
  reportId: number
): Promise<{
  success: boolean;
  data?: { deleted: boolean };
  error?: string;
}> {
  const response = await fetch(`${API_BASE}/reports/${reportId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return response.json();
}

// ==================== Crawl APIs ====================

/**
 * Scrape web pages
 */
export async function scrapePages(
  urls: string[],
  platform: string = "Generic",
  delay: number = 1.0
): Promise<CrawlResponse> {
  const response = await fetch(`${API_BASE}/crawl/scrape`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ urls, platform, delay }),
  });

  return response.json();
}

/**
 * Get supported platforms
 */
export async function getCrawlPlatforms(): Promise<{
  success: boolean;
  data?: { platforms: string[] };
  error?: string;
}> {
  const response = await fetch(`${API_BASE}/crawl/platforms`);
  return response.json();
}

// ==================== User APIs ====================

/**
 * Get analysis history
 */
export async function getAnalysisHistory(
  page: number = 1,
  perPage: number = 20
): Promise<HistoryResponse> {
  const response = await fetch(
    `${API_BASE}/user/history?page=${page}&per_page=${perPage}`,
    { headers: getAuthHeaders() }
  );

  return response.json();
}

/**
 * Get user statistics
 */
export async function getUserStats(): Promise<UserStats> {
  const response = await fetch(`${API_BASE}/user/stats`, {
    headers: getAuthHeaders(),
  });

  return response.json();
}

/**
 * Get subscription info
 */
export async function getSubscription(): Promise<{
  success: boolean;
  data?: {
    tier: string;
    is_premium: boolean;
    expires: string | null;
  };
  error?: string;
}> {
  const response = await fetch(`${API_BASE}/user/subscription`, {
    headers: getAuthHeaders(),
  });

  return response.json();
}

// ==================== Health Check ====================

/**
 * API health check
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get model info
 */
export async function getModelInfo(): Promise<{
  success: boolean;
  data?: {
    current: string;
    description: string;
    labels: string[];
    device: string;
    cuda_available: boolean;
  };
  error?: string;
}> {
  const response = await fetch(`${API_BASE}/models`);
  return response.json();
}
