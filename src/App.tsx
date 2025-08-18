import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthProvider } from "@/components/auth/AuthProvider";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import StudentAuth from "./pages/auth/StudentAuth";
import TeacherAuth from "./pages/auth/TeacherAuth";
import SuperAdminAuth from "./pages/auth/SuperAdminAuth";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentAssessments from "./pages/student/StudentAssessments";
import StudentAssessmentDetail from "./pages/student/StudentAssessmentDetail"; // NEW
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import ClassesList from "./pages/teacher/ClassesList";
import ClassEdit from "./pages/teacher/ClassEdit";
import TeacherStudents from "./pages/teacher/TeacherStudents";
import TeacherAssessments from "./pages/teacher/TeacherAssessments";
import TeacherAssessmentNew from "./pages/teacher/TeacherAssessmentNew"; // NEW
import TeacherAssignmentDetail from "./pages/teacher/TeacherAssignmentDetail";
import TeacherLessons from "./pages/teacher/TeacherLessons";
import TeacherReports from "./pages/teacher/TeacherReports";
import TeacherBilling from "./pages/teacher/TeacherBilling";
import TeacherInvites from "./pages/teacher/TeacherInvites";
import RedeemInvite from "./pages/redeem/RedeemInvite";
import StudentActivities from "./pages/student/StudentActivities";
import StudentProgress from "./pages/student/StudentProgress";
import Settings from "./pages/Settings";
import AdminHub from "./pages/admin";
import SuperAdminOverview from "./pages/superadmin/SuperAdminOverview";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
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
            {/* NEW: student assessment detail */}
            <Route path="/student/assessments/:assignmentId" element={<MainLayout><StudentAssessmentDetail /></MainLayout>} />
            <Route path="/student/activities" element={<MainLayout><StudentActivities /></MainLayout>} />
            <Route path="/student/progress" element={<MainLayout><StudentProgress /></MainLayout>} />
            <Route path="/teacher/dashboard" element={<MainLayout><TeacherDashboard /></MainLayout>} />
            <Route path="/teacher/classes" element={<MainLayout><ClassesList /></MainLayout>} />
            <Route path="/teacher/classes/:id/edit" element={<MainLayout><ClassEdit /></MainLayout>} />
            <Route path="/teacher/students" element={<MainLayout><TeacherStudents /></MainLayout>} />
            <Route path="/teacher/assessments" element={<MainLayout><TeacherAssessments /></MainLayout>} />
            {/* NEW: teacher create assignment */}
            <Route path="/teacher/assessments/new" element={<MainLayout><TeacherAssessmentNew /></MainLayout>} />
            <Route path="/teacher/lessons" element={<MainLayout><TeacherLessons /></MainLayout>} />
            <Route path="/teacher/assessments/:assignmentId" element={<MainLayout><TeacherAssignmentDetail /></MainLayout>} />
            <Route path="/teacher/reports" element={<MainLayout><TeacherReports /></MainLayout>} />
            <Route path="/teacher/billing" element={<MainLayout><TeacherBilling /></MainLayout>} />
            <Route path="/teacher/invites" element={<MainLayout><TeacherInvites /></MainLayout>} />
            <Route path="/redeem/:code" element={<RedeemInvite />} />
            <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
            <Route path="/admin" element={<MainLayout><AdminHub /></MainLayout>} />
            <Route path="/superadmin" element={<MainLayout><SuperAdminOverview /></MainLayout>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
