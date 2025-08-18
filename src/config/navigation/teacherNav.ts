// src/config/navigation/teacherNav.ts
import { teacherNav } from "../navigation"
export default teacherNav
export { teacherNav }

// Legacy shape for older code: [{ label, icon, href }]
export const TEACHER_NAV = teacherNav.map(({ label, icon, href }) => ({ label, icon, href }))
