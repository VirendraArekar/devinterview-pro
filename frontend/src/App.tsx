import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppLayout } from './components/layout/AppLayout';

import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { QuestionsPage } from './pages/Questions/QuestionsPage';
import { QuestionDetailPage } from './pages/Questions/QuestionDetailPage';
import { CodingListPage } from './pages/Coding/CodingListPage';
import { CodingWorkspacePage } from './pages/Coding/CodingWorkspacePage';
import { DSARoadmapPage } from './pages/DSARoadmap/DSARoadmapPage';
import { SystemDesignListPage } from './pages/SystemDesign/SystemDesignListPage';
import { SystemDesignDetailPage } from './pages/SystemDesign/SystemDesignDetailPage';
import { MockInterviewSetupPage } from './pages/MockInterview/MockInterviewSetupPage';
import { MockInterviewSessionPage } from './pages/MockInterview/MockInterviewSessionPage';
import { MockInterviewReportPage } from './pages/MockInterview/MockInterviewReportPage';
import { QuizListPage } from './pages/Quizzes/QuizListPage';
import { QuizSessionPage } from './pages/Quizzes/QuizSessionPage';
import { DailyPage } from './pages/Daily/DailyPage';
import { BookmarksPage } from './pages/Bookmarks/BookmarksPage';
import { AnalyticsPage } from './pages/Analytics/AnalyticsPage';
import { ProfilePage } from './pages/Profile/ProfilePage';
import { LoginPage } from './pages/Auth/LoginPage';
import { RegisterPage } from './pages/Auth/RegisterPage';
import { ForgotPasswordPage } from './pages/Auth/ForgotPasswordPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        {/* Auth standalone pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Main Application with AppLayout */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/questions" element={<QuestionsPage />} />
          <Route path="/questions/:idOrSlug" element={<QuestionDetailPage />} />
          <Route path="/coding" element={<CodingListPage />} />
          <Route path="/coding/:slug" element={<CodingWorkspacePage />} />
          <Route path="/dsa" element={<DSARoadmapPage />} />
          <Route path="/system-design" element={<SystemDesignListPage />} />
          <Route path="/system-design/:slug" element={<SystemDesignDetailPage />} />
          <Route path="/mock-interviews" element={<MockInterviewSetupPage />} />
          <Route path="/mock-interviews/:id" element={<MockInterviewSessionPage />} />
          <Route path="/mock-interviews/:id/report" element={<MockInterviewReportPage />} />
          <Route path="/quizzes" element={<QuizListPage />} />
          <Route path="/quizzes/:idOrSlug" element={<QuizSessionPage />} />
          <Route path="/daily" element={<DailyPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
