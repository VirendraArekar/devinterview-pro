import axios from 'axios';
import {
  User,
  AuthTokens,
  Question,
  CodingProblem,
  ExecutionResult,
  SystemDesignTopic,
  Quiz,
  MockInterview,
  MockInterviewAnswer,
} from '../types';

const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor attaches JWT access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('devinterview_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor handles refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('devinterview_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh', { refreshToken });
          const newTokens: AuthTokens = res.data.tokens;
          localStorage.setItem('devinterview_token', newTokens.accessToken);
          localStorage.setItem('devinterview_refresh_token', newTokens.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('devinterview_token');
          localStorage.removeItem('devinterview_refresh_token');
          localStorage.removeItem('devinterview_user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  },
);

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post<{ user: User; tokens: AuthTokens }>('/auth/login', {
      email,
      password,
    });
    return res.data;
  },
  register: async (data: {
    email: string;
    password: string;
    name: string;
    experienceLevel?: string;
    targetCompensation?: string;
  }) => {
    const res = await api.post<{ user: User; tokens: AuthTokens }>('/auth/register', data);
    return res.data;
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('devinterview_token');
      localStorage.removeItem('devinterview_refresh_token');
      localStorage.removeItem('devinterview_user');
    }
  },
  getMe: async () => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },
  forgotPassword: async (email: string) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },
  resetPassword: async (token: string, newPassword: string) => {
    const res = await api.post('/auth/reset-password', { token, newPassword });
    return res.data;
  },
};

export const questionService = {
  getQuestions: async (params?: {
    category?: string;
    difficulty?: string;
    experienceLevel?: string;
    targetCompensation?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await api.get<{
      items: Question[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>('/questions', { params });
    return res.data;
  },
  getCategories: async () => {
    const res = await api.get<{ name: string; count: number }[]>('/questions/categories');
    return res.data;
  },
  getQuestion: async (idOrSlug: string) => {
    const res = await api.get<Question>(`/questions/${idOrSlug}`);
    return res.data;
  },
  getRecommended: async (category?: string, limit?: number) => {
    const res = await api.get<Question[]>('/questions/recommended', {
      params: { category, limit },
    });
    return res.data;
  },
};

export const codingService = {
  getProblems: async (params?: {
    category?: string;
    difficulty?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await api.get<{
      items: CodingProblem[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>('/coding/problems', { params });
    return res.data;
  },
  getCategories: async () => {
    const res = await api.get<{ name: string; count: number }[]>('/coding/categories');
    return res.data;
  },
  getProblem: async (idOrSlug: string) => {
    const res = await api.get<CodingProblem>(`/coding/problems/${idOrSlug}`);
    return res.data;
  },
  runCode: async (problemId: number, data: { language: string; code: string; customInput?: string }) => {
    const res = await api.post<ExecutionResult>(`/coding/problems/${problemId}/run`, data);
    return res.data;
  },
  submitCode: async (problemId: number, data: { language: string; code: string }) => {
    const res = await api.post<ExecutionResult>(`/coding/problems/${problemId}/submit`, data);
    return res.data;
  },
  getMySubmissions: async (problemId?: number) => {
    const res = await api.get('/coding/submissions/my', { params: { problemId } });
    return res.data;
  },
};

export const systemDesignService = {
  getTopics: async (type?: string) => {
    const res = await api.get<SystemDesignTopic[]>('/system-design', { params: { type } });
    return res.data;
  },
  getTopic: async (idOrSlug: string) => {
    const res = await api.get<SystemDesignTopic>(`/system-design/${idOrSlug}`);
    return res.data;
  },
};

export const mockInterviewService = {
  create: async (data: {
    roleCategory: string;
    experienceLevel?: string;
    difficulty?: string;
    durationMinutes?: number;
    totalQuestions?: number;
  }) => {
    const res = await api.post<{
      interview: MockInterview;
      questions: Question[];
    }>('/mock-interviews/create', data);
    return res.data;
  },
  getInterview: async (id: number) => {
    const res = await api.get<{
      interview: MockInterview;
      questions: Question[];
      answers: MockInterviewAnswer[];
    }>(`/mock-interviews/${id}`);
    return res.data;
  },
  complete: async (
    id: number,
    answers: { questionId: number; userAnswer: string }[],
  ) => {
    const res = await api.post<{
      interview: MockInterview;
      answers: MockInterviewAnswer[];
      questions: Question[];
    }>(`/mock-interviews/${id}/complete`, { answers });
    return res.data;
  },
  getHistory: async () => {
    const res = await api.get<MockInterview[]>('/mock-interviews/history');
    return res.data;
  },
};

export const quizService = {
  getQuizzes: async (category?: string) => {
    const res = await api.get<Quiz[]>('/quizzes', { params: { category } });
    return res.data;
  },
  getQuiz: async (idOrSlug: string, includeAnswers = false) => {
    const res = await api.get<{ quiz: Quiz; questions: any[] }>(
      `/quizzes/${idOrSlug}`,
      { params: { includeAnswers } },
    );
    return res.data;
  },
  submitQuiz: async (
    id: number,
    data: { userAnswers: Record<string, string[]>; timeTakenSeconds: number },
  ) => {
    const res = await api.post(`/quizzes/${id}/submit`, data);
    return res.data;
  },
  getLeaderboard: async (quizId?: number) => {
    const res = await api.get('/quizzes/leaderboard', { params: { quizId } });
    return res.data;
  },
  getHistory: async () => {
    const res = await api.get('/quizzes/history');
    return res.data;
  },
};

export const dailyService = {
  getHighlights: async () => {
    const res = await api.get('/daily/highlights');
    return res.data;
  },
  getWeeklyReport: async () => {
    const res = await api.get('/daily/weekly-report');
    return res.data;
  },
};

export const dsaService = {
  getDashboard: async () => {
    const res = await api.get('/dsa/dashboard');
    return res.data;
  },
};

export const bookmarkService = {
  getBookmarks: async (itemType?: string) => {
    const res = await api.get('/bookmarks', { params: { itemType } });
    return res.data;
  },
  toggleBookmark: async (itemType: string, itemId: number) => {
    const res = await api.post('/bookmarks/toggle', { itemType, itemId });
    return res.data;
  },
  getNotes: async (itemType?: string, itemId?: number) => {
    const res = await api.get('/bookmarks/notes', { params: { itemType, itemId } });
    return res.data;
  },
  saveNote: async (data: { itemType: string; itemId?: number; title?: string; content: string }) => {
    const res = await api.post('/bookmarks/notes', data);
    return res.data;
  },
  deleteNote: async (id: number) => {
    const res = await api.delete(`/bookmarks/notes/${id}`);
    return res.data;
  },
};

export const analyticsService = {
  getOverview: async () => {
    const res = await api.get('/analytics/overview');
    return res.data;
  },
};

export default api;
