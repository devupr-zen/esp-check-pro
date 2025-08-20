// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import RouteGuard from "@/components/auth/RouteGuard";
import { MainLayout } from "@/components/layout/MainLayout";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { supabaseEnvOk } from "@/lib/supabase";
import OnboardingSurvey from "@/pages/OnboardingSurvey";
import OnboardingTrack from "@/pages/OnboardingTrack";
import AssessmentRunner from "@/pages/student/AssessmentRunner";
import SuperadminInvites from "@/pages/superadmin/SuperadminInvites";

// Lazy imports
const Landing = React.lazy(() => import("./pages/Landing"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const StudentAuth = React.lazy(() => import("./pages/auth/StudentAuth"));
const TeacherAuth = React.lazy(() => import("./pages/auth/TeacherAuth"));
const SuperAdminAuth = React.lazy(() => import("./pages/auth/SuperAdminAuth"));

const StudentDashboard = React.lazy(() => import("./pages/student/StudentDashboard"));
const StudentAssessments = React.lazy(() => import("./pages/student/StudentAssessments"));
const StudentAssessmentDetail = React.lazy(() => import("./pages/student/StudentAssessmentDetail"));
const StudentActivities = React.lazy(() => import("./pages/student/StudentActivities"));
const StudentProgress = React.lazy(() => import("./pages/student/StudentProgress"));

const TeacherDashboard = React.lazy(() => import("./pages/teacher/TeacherDashboard"));
const ClassesList = React.lazy(() => import("./pages/teacher/ClassesList"));
const ClassEdit = React.lazy(() => import("./pages/teacher/ClassEdit"));
const TeacherStudents = React.lazy(() => import("./pages/teacher/TeacherStudents"));
const TeacherAssessments = React.lazy(() => import("./pages/teacher/TeacherAssessments"));
const TeacherAssessmentNew = React.lazy(() => import("./pages/teacher/TeacherAssessmentNew"));
const TeacherAssignmentDetail = React.lazy(() => import("./pages/teacher/TeacherAssignmentDetail"));
const AssessmentAuthoring = React.lazy(() => import("./pages/teacher/AssessmentAuthoring"));
const TeacherLessons = React.lazy(() => import("./pages/teacher/TeacherLessons"));
const TeacherReports = React.lazy(() => import("./pages/teacher/TeacherReports"));
const TeacherBilling = React.lazy(() => import("./pages/teacher/TeacherBilling"));
const TeacherInvites = React.lazy(() => import("./pages/teacher/TeacherInvites"));

const RedeemInvite = React.lazy(() => import("./pages/redeem/RedeemInvite"));
const Settings = React.lazy(() => import("./pages/Settings"));
const AdminHub = React.lazy(() => import("./pages/admin"));
const SuperAdminOverview = React.lazy(() => import("./pages/superadmin/SuperAdminOverview"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {!supabaseEnvOk && (
        <div className="bg-red-600 text-white text-sm px-4 py-2 text-center">
          Supabase env vars missing. Set <code>VITE_SUPABASE_URL</code> and{" "}
          <code>VITE_SUPABASE_ANON_KEY</code> in Vercel.
        </div>
      )}
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<div className="p-6">Loading…</div>}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/auth/student" element={<StudentAuth />} />
              <Route path="/auth/teacher" element={<TeacherAuth />} />
              <Route path="/auth/superadmin" element={<SuperAdminAuth />} />
              <Route path="/onboarding/track" element={<OnboardingTrack />} />
              <Route path="/onboarding/survey" element={<OnboardingSurvey />} />
              <Route path="/student/assessment/run" element={<AssessmentRunner />} />

              {/* Protected (any signed-in role) */}
              <Route
                path="/dashboard"
                element={
                  <RouteGuard>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </RouteGuard>
                }
              />
              <Route
                path="/settings"
                element={
                  <RouteGuard>
                    <MainLayout>
                      <Settings />
                    </MainLayout>
                  </RouteGuard>
                }
              />

              {/* ✅ Redirect bare /student → /student/dashboard */}
              <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
              {/* Student-only */}
              <Route
                path="/student/dashboard"
                element={
                  <RouteGuard requireRole="student">
                    <MainLayout>
                      <StudentDashboard />
                    </MainLayout>
                  </RouteGuard>
                }
              />
              <Route
                path="/student/assessments"
                element={
                  <RouteGuard requireRole="student">
                    <MainLayout>
                      <StudentAssessments />
                    </MainLayout>
                  </RouteGuard>
                }
              />
              <Route
                path="/student/assessments/:assignmentId"
                element={
                  <RouteGuard requireRole="student">
                    <MainLayout>
                      <StudentAssessmentDetail />
                    </MainLayout>
                  </RouteGuard>
                }
              />
              <Route
                path="/student/activities"
                element={
                  <RouteGuard requireRole="student">
                    <MainLayout>
                      <StudentActivities />
                    </MainLayout>
                  </RouteGuard>
                }
              />
              <Route
                path="/student/progress"
                element={
                  <RouteGuard requireRole="student">
                    <MainLayout>
                      <StudentProgress />
                    </MainLayout>
                  </RouteGuard>
                }
              />

              {/* ✅ Redirect bare /teacher → /teacher/dashboard */}
              <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
              {/* Teacher-only */}
              <Route
                path="/teacher/dashboard"
                element={
                  <RouteGuard requireRole="teacher">
                    <MainLayout>
                      <TeacherDashboard />
                    </MainLayout>
                  </RouteGuard>
                }
              />
              <Route
                path="/teacher/classes"
                element={
                  <RouteGuard requireRole="teacher">
                    <MainLayout>
                      <ClassesList />
                    </MainLayout>
                  </RouteGuard>
                }
              />
              <Route
                path="/teacher/classes/:id/edit"
                element={
                  <RouteGuard requireRole="teacher">
                    <MainLayout>
                      <ClassEdit />
                    </MainLayout>
                  </RouteGuard>
                }
              />
              <Route
                path="/teacher/students"
                element={
                  <RouteGuard requireRole="teacher">
                    <MainLayout>
                      <TeacherStudents />
                    </MainLayout>
                  </RouteGuard>
                }
              />
              <Route
                path="/teacher/assessments"
                element={
                  <RouteGuard requireRole="teacher">
                    <MainLayout>
                      <TeacherAssessments />
                    </MainLayout>
                  </RouteGuard>
                }
              />
              <Route
                path="/teacher/assessments/new"
                element={
                  <RouteGuard requireRole="teacher">
                    <MainLayout>
                      <TeacherAssessmentNew />
                    </MainLayout>
                  </RouteGuard>
                }
              />
              <Route
                path="/teacher/assessments/:assignmentId"
                element={
                  <RouteGuard requireRole="teacher">
                    <MainLayout>
                      <TeacherAssignmentDetail />
                    </MainLayout>
                  </RouteGuard>
                }
              />
              <Route
                path="/teacher/assessments/author"
                element={
                  <RouteGuard requireRole="teacher">
                    <MainLayout>
                      <AssessmentAuthoring />
                    </MainLayout>
                  </RouteGuard>
                }
              />
              <Route
                path="/teacher/lessons"
                element={
                  <RouteGuard requireRole="teacher">
                    <MainLayout>
                      <TeacherLessons />
                    </MainLayout>
                  </RouteGuard>
                }
              />
              <Route
                path="/teacher/reports"
                element={
                  <RouteGuard requireRole="teacher">
                    <MainLayout>
                      <TeacherReports />
                    </MainLayout>
                  </RouteGuard>
                }
              />
              <Route
                path="/teacher/billing"
                element={
                  <RouteGuard requireRole="teacher">
                    <MainLayout>
                      <TeacherBilling />
                    </MainLayout>
                  </RouteGuard>
                }
              />
              <Route
                path="/teacher/invites"
                element={
                  <RouteGuard requireRole="teacher">
                    <MainLayout>
                      <TeacherInvites />
                    </MainLayout>
                  </RouteGuard>
                }
              />

              {/* Superadmin-only */}
              <Route
                path="/admin"
                element={
                  <RouteGuard requireRole="superadmin">
                    <MainLayout>
                      <AdminHub />
                    </MainLayout>
                  </RouteGuard>
                }
              />
              <Route
                path="/superadmin"
                element={
                  <RouteGuard requireRole="superadmin">
                    <MainLayout>
                      <SuperAdminOverview />
                    </MainLayout>
                  </RouteGuard>
                }
              />
              <Route
                path="/superadmin/invites"
                element={
                  <RouteGuard requireRole="superadmin">
                    <MainLayout>
                      <SuperadminInvites />
                    </MainLayout>
                  </RouteGuard>
                }
              />

              {/* Public utility */}
              <Route path="/redeem/:code" element={<RedeemInvite />} />

              {/* CATCH-ALL */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
