import { 
  BarChart2,
  Users,
  UserPlus,
  BookOpen,
  CalendarCheck2,
  Library,
  FileText,
  CreditCard
} from "lucide-react"

export const TEACHER_NAV = [
  { label: 'Dashboard', icon: BarChart2, href: '/teacher/dashboard' },
  { label: 'Classes', icon: Users, href: '/teacher/classes' },
  { label: 'Students', icon: UserPlus, href: '/teacher/students' },
  { label: 'Assessments', icon: BookOpen, href: '/teacher/assessments' },
  { label: 'Plan', icon: CalendarCheck2, href: '/teacher/plan' },
  { label: 'Resources', icon: Library, href: '/teacher/resources' },
  { label: 'Reports', icon: FileText, href: '/teacher/reports' },
  { label: 'Billing', icon: CreditCard, href: '/teacher/billing' },
]