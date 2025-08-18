import { studentNav } from "../navigation"
export default studentNav
export { studentNav }
export const STUDENT_NAV = studentNav.map(({ label, icon, href }) => ({ label, icon, href }))
