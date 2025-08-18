import { teacherNav } from "../navigation"
export default teacherNav
export { teacherNav }
export const TEACHER_NAV = teacherNav.map(({ label, icon, href }) => ({ label, icon, href }))
