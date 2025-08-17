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
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherStudents from "./pages/teacher/TeacherStudents";
import TeacherAssessments from "./pages/teacher/TeacherAssessments";
import TeacherBilling from "./pages/teacher/TeacherBilling";
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
            <Route path="/teacher/dashboard" element={<MainLayout><TeacherDashboard /></MainLayout>} />
            <Route path="/teacher/students" element={<MainLayout><TeacherStudents /></MainLayout>} />
            <Route path="/teacher/assessments" element={<MainLayout><TeacherAssessments /></MainLayout>} />
            <Route path="/teacher/billing" element={<MainLayout><TeacherBilling /></MainLayout>} />
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
