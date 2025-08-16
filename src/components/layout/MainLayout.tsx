import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { TopBar } from "./TopBar"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="flex-1 p-6 overflow-auto scrollbar-thin">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}