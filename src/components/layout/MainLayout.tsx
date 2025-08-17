import { AppShell } from "./AppShell"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <AppShell>
      {children}
    </AppShell>
  )
}