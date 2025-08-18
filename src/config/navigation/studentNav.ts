// src/config/navigation/studentNav.ts
// Back-compat shim. Do not remove until all imports point to "@/config/navigation".
// This re-exports the single source of truth from ../navigation
// and also provides a legacy STUDENT_NAV for older code that still expects it.

import { studentNav as nav } from "../navigation"

export default nav
export { nav as studentNav }

// Legacy shape: [{ label, icon, href }]
export const STUDENT_NAV = nav.map(({ label, icon, href }) => ({ label, icon, href }))
