import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/app/layouts/AppLayout'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { RequireAuth, RequireGuest, RequireAdmin } from '@/app/guards'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage'
import { HomePage } from '@/features/home/HomePage'
import { ProfilePage } from '@/features/profile/ProfilePage'
import { StudyPage } from '@/features/study/StudyPage'
import { PyqListPage } from '@/features/study/PyqListPage'
import { PyqDetailPage } from '@/features/study/PyqDetailPage'
import { SyllabusPage } from '@/features/study/SyllabusPage'
import { CalendarPage } from '@/features/study/CalendarPage'
import { CoursesPage } from '@/features/study/CoursesPage'
import { SubjectDetailPage } from '@/features/study/SubjectDetailPage'
import { ToolsPage } from '@/features/tools/ToolsPage'
import { ResultsPage } from '@/features/tools/ResultsPage'
import { PortalsPage } from '@/features/tools/PortalsPage'
import { GovExamsPage } from '@/features/tools/GovExamsPage'
import { GovExamDetailPage } from '@/features/tools/GovExamDetailPage'
import { CollegesPage } from '@/features/tools/CollegesPage'
import { ToolboxPage } from '@/features/tools/toolbox/ToolboxPage'
import { ToolboxRouter } from '@/features/tools/toolbox/ToolboxRouter'
import { ResourcesPage } from '@/features/resources/ResourcesPage'
import { UploadResourcePage } from '@/features/resources/UploadResourcePage'
import { MyResourcesPage } from '@/features/resources/MyResourcesPage'
import { SupportHomePage } from '@/features/support/SupportHomePage'
import { SupportThreadPage } from '@/features/support/SupportThreadPage'
import { MyReportsPage } from '@/features/support/MyReportsPage'
import { SavedPage } from '@/features/saved/SavedPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { AboutPage } from '@/features/about/AboutPage'
import { AboutDeveloperPage } from '@/features/about/AboutDeveloperPage'
import { PrivacyPolicyPage } from '@/features/about/PrivacyPolicyPage'
import { SearchPage } from '@/features/search/SearchPage'
import { NotificationsPage } from '@/features/notifications/NotificationsPage'
import { AdminHomePage } from '@/features/admin/AdminHomePage'
import { AdminResourcesPage } from '@/features/admin/AdminResourcesPage'
import { AdminReportsPage } from '@/features/admin/AdminReportsPage'
import { AdminAcademicPage } from '@/features/admin/AdminAcademicPage'
import { AdminImportPage } from '@/features/admin/AdminImportPage'
import { AdminHeroPage } from '@/features/admin/AdminHeroPage'
import { QuizHomePage } from '@/features/quiz/QuizHomePage'
import { QuizDetailPage } from '@/features/quiz/QuizDetailPage'
import { AttemptPage } from '@/features/quiz/AttemptPage'
import { ResultPage } from '@/features/quiz/ResultPage'
import { ReviewPage } from '@/features/quiz/ReviewPage'
import { HistoryPage } from '@/features/quiz/HistoryPage'

export const router = createBrowserRouter([
  {
    element: (
      <RequireGuest>
        <AuthLayout />
      </RequireGuest>
    ),
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
    ],
  },
  {
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/search', element: <SearchPage /> },
      {
        path: '/study',
        element: <StudyPage />,
        children: [
          { index: true, element: <PyqListPage /> },
          { path: 'syllabus', element: <SyllabusPage /> },
          { path: 'calendar', element: <CalendarPage /> },
          { path: 'courses', element: <CoursesPage /> },
        ],
      },
      { path: '/study/pyq/:id', element: <PyqDetailPage /> },
      { path: '/study/subject/:id', element: <SubjectDetailPage /> },
      { path: '/quiz', element: <QuizHomePage /> },
      { path: '/quiz/history', element: <HistoryPage /> },
      { path: '/quiz/:quizId', element: <QuizDetailPage /> },
      { path: '/quiz/:quizId/attempt/:attemptId', element: <AttemptPage /> },
      { path: '/quiz/:quizId/result/:attemptId', element: <ResultPage /> },
      { path: '/quiz/:quizId/review/:attemptId', element: <ReviewPage /> },
      { path: '/tools', element: <ToolsPage /> },
      { path: '/tools/results', element: <ResultsPage /> },
      { path: '/tools/portals', element: <PortalsPage /> },
      { path: '/tools/exams', element: <GovExamsPage /> },
      { path: '/tools/exams/:id', element: <GovExamDetailPage /> },
      { path: '/tools/colleges', element: <CollegesPage /> },
      { path: '/tools/toolbox', element: <ToolboxPage /> },
      { path: '/tools/toolbox/:slug', element: <ToolboxRouter /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/resources', element: <ResourcesPage /> },
      { path: '/resources/upload', element: <UploadResourcePage /> },
      { path: '/resources/edit/:id', element: <UploadResourcePage /> },
      { path: '/resources/mine', element: <MyResourcesPage /> },
      { path: '/support', element: <SupportHomePage /> },
      { path: '/support/reports', element: <MyReportsPage /> },
      { path: '/support/:convId', element: <SupportThreadPage /> },
      { path: '/saved', element: <SavedPage /> },
      { path: '/notifications', element: <NotificationsPage /> },
      {
        path: '/admin',
        element: (
          <RequireAdmin>
            <AdminHomePage />
          </RequireAdmin>
        ),
      },
      {
        path: '/admin/resources',
        element: (
          <RequireAdmin>
            <AdminResourcesPage />
          </RequireAdmin>
        ),
      },
      {
        path: '/admin/hero',
        element: (
          <RequireAdmin>
            <AdminHeroPage />
          </RequireAdmin>
        ),
      },
      {
        path: '/admin/import',
        element: (
          <RequireAdmin>
            <AdminImportPage />
          </RequireAdmin>
        ),
      },
      {
        path: '/admin/academic',
        element: (
          <RequireAdmin>
            <AdminAcademicPage />
          </RequireAdmin>
        ),
      },
      {
        path: '/admin/reports',
        element: (
          <RequireAdmin>
            <AdminReportsPage />
          </RequireAdmin>
        ),
      },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/about/developer', element: <AboutDeveloperPage /> },
      { path: '/privacy', element: <PrivacyPolicyPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
