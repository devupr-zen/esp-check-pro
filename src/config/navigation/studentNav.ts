import { 
  BarChart2,
  BookOpen,
  Activity,
  FileText,
  User
} from "lucide-react"

export const STUDENT_NAV = [
  { label: 'Dashboard', icon: BarChart2, href: '/student/dashboard' },
  { label: 'Assessments', icon: BookOpen, href: '/student/assessments' },
  { label: 'Activities', icon: Activity, href: '/student/activities' },
  { label: 'Reports', icon: FileText, href: '/student/reports' },
  { label: 'Profile', icon: User, href: '/student/profile' },
]