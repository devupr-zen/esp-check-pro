import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { supabase } from '@/lib/supabase';

// Lazy pages (so a bug in one page can’t crash everything)
import React, { Suspense } from "react";
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

              {/* Protected routes */}
              <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
              <Route path="/student/dashboard" element={<MainLayout><StudentDashboard /></MainLayout>} />
              <Route path="/student/assessments" element={<MainLayout><StudentAssessments /></MainLayout>} />
              <Route path="/student/assessments/:assignmentId" element={<MainLayout><StudentAssessmentDetail /></MainLayout>} />
              <Route path="/student/activities" element={<MainLayout><StudentActivities /></MainLayout>} />
              <Route path="/student/progress" element={<MainLayout><StudentProgress /></MainLayout>} />

              <Route path="/teacher/dashboard" element={<MainLayout><TeacherDashboard /></MainLayout>} />
              <Route path="/teacher/classes" element={<MainLayout><ClassesList /></MainLayout>} />
              <Route path="/teacher/classes/:id/edit" element={<MainLayout><ClassEdit /></MainLayout>} />
              <Route path="/teacher/students" element={<MainLayout><TeacherStudents /></MainLayout>} />
              <Route path="/teacher/assessments" element={<MainLayout><TeacherAssessments /></MainLayout>} />
              <Route path="/teacher/assessments/new" element={<MainLayout><TeacherAssessmentNew /></MainLayout>} />
              <Route path="/teacher/assessments/:assignmentId" element={<MainLayout><TeacherAssignmentDetail /></MainLayout>} />
              <Route path="/teacher/assessments/author" element={<MainLayout><AssessmentAuthoring /></MainLayout>} />
              <Route path="/teacher/lessons" element={<MainLayout><TeacherLessons /></MainLayout>} />
              <Route path="/teacher/reports" element={<MainLayout><TeacherReports /></MainLayout>} />
              <Route path="/teacher/billing" element={<MainLayout><TeacherBilling /></MainLayout>} />
              <Route path="/teacher/invites" element={<MainLayout><TeacherInvites /></MainLayout>} />

              <Route path="/redeem/:code" element={<RedeemInvite />} />
              <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
              <Route path="/admin" element={<MainLayout><AdminHub /></MainLayout>} />
              <Route path="/superadmin" element={<MainLayout><SuperAdminOverview /></MainLayout>} />

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
