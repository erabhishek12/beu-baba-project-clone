import { createBrowserRouter } from 'react-router-dom'
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
import { AdminReviewPage } from '@/features/admin/AdminReviewPage'
import { AdminBulkReviewPage } from '@/features/admin/AdminBulkReviewPage'
import { AdminBannersPage } from '@/features/admin/AdminBannersPage'
import { VerifyEmailPage } from '@/features/auth/VerifyEmailPage'
import { CompleteProfilePage } from '@/features/auth/CompleteProfilePage'
import { NotFoundPage } from '@/features/misc/NotFoundPage'
import { AdminUsersPage } from '@/features/admin/AdminUsersPage'
import { AdminQuestionsPage } from '@/features/admin/AdminQuestionsPage'
import { AdminSupportPage } from '@/features/admin/AdminSupportPage'
import { AdminAssistantPage } from '@/features/admin/AdminAssistantPage'
import { AdminAcademicCmsPage } from '@/features/admin/AdminAcademicCmsPage'
import { AdminAnalyticsPage } from '@/features/admin/AdminAnalyticsPage'
import { AdminSystemPage } from '@/features/admin/AdminSystemPage'
import { AdminNoticesPage } from '@/features/admin/AdminNoticesPage'
import { CollaboratePage } from '@/features/tools/CollaboratePage'
import { MathMindPage } from '@/features/mathmind/MathMindPage'
import { RevisionPage } from '@/features/revision/RevisionPage'
import { FocusGamesPage } from '@/features/games/FocusGamesPage'
import { StudyPlannerPage } from '@/features/study/StudyPlannerPage'
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
    // Signed in but missing branch/semester (typical after Google sign-in).
    // Deliberately NOT under RequireGuest: that guard bounces authenticated
    // users to "/", and RequireAuth would bounce them straight back here —
    // an infinite redirect. It sits outside the app shell too, so the nav is
    // hidden until setup is finished.
    path: '/complete-profile',
    element: (
      <RequireAuth>
        <AuthLayout />
      </RequireAuth>
    ),
    children: [{ index: true, element: <CompleteProfilePage /> }],
  },
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
      { path: '/verify-email', element: <VerifyEmailPage /> },
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
      // External study sites (spec §22) — clearly labelled, open in a new tab.
      { path: '/tools/collaborate', element: <CollaboratePage /> },
      // Spec §19-§21: Math Mind, Revision Center and focus games.
      { path: '/tools/math-mind', element: <MathMindPage /> },
      { path: '/revision', element: <RevisionPage /> },
      { path: '/tools/games', element: <FocusGamesPage /> },
      // Syllabus progress + exam planner.
      { path: '/study/planner', element: <StudyPlannerPage /> },
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
        // MCQ review desk. RequireAdmin keeps it off students' screens; the
        // database re-checks the `review_questions` permission on every call.
        path: '/admin/review',
        element: (
          <RequireAdmin>
            <AdminReviewPage />
          </RequireAdmin>
        ),
      },
      {
        // Bulk review (Phase 4). Same admin guard; the database re-checks the
        // review permission and the strict safety gate on every call.
        path: '/admin/bulk-review',
        element: (
          <RequireAdmin>
            <AdminBulkReviewPage />
          </RequireAdmin>
        ),
      },
      {
        // Banners / announcements (spec §34-§39). Admin-guarded; the database
        // re-checks permissions on every write.
        path: '/admin/banners',
        element: (
          <RequireAdmin>
            <AdminBannersPage />
          </RequireAdmin>
        ),
      },
      {
        path: '/admin/users',
        element: (
          <RequireAdmin>
            <AdminUsersPage />
          </RequireAdmin>
        ),
      },
      {
        path: '/admin/questions',
        element: (
          <RequireAdmin>
            <AdminQuestionsPage />
          </RequireAdmin>
        ),
      },
      {
        path: '/admin/support',
        element: (
          <RequireAdmin>
            <AdminSupportPage />
          </RequireAdmin>
        ),
      },
      {
        path: '/admin/assistant',
        element: (
          <RequireAdmin>
            <AdminAssistantPage />
          </RequireAdmin>
        ),
      },
      {
        path: '/admin/content',
        element: (
          <RequireAdmin>
            <AdminAcademicCmsPage />
          </RequireAdmin>
        ),
      },
      {
        path: '/admin/analytics',
        element: (
          <RequireAdmin>
            <AdminAnalyticsPage />
          </RequireAdmin>
        ),
      },
      {
        path: '/admin/notices',
        element: (
          <RequireAdmin>
            <AdminNoticesPage />
          </RequireAdmin>
        ),
      },
      {
        path: '/admin/system',
        element: (
          <RequireAdmin>
            <AdminSystemPage />
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
  { path: '*', element: <NotFoundPage /> },
])
