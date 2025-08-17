// src/components/shell/TopBar.tsx
import { useState } from "react"
import { Search, Bell, HelpCircle, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth/AuthProvider"

interface TopBarProps {
  onMenuToggle: () => void
  isMenuOpen: boolean
}

export function TopBar({ onMenuToggle, isMenuOpen }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { profile, signOut } = useAuth()

  const initials = (profile?.first_name?.[0] || "") + (profile?.last_name?.[0] || "")
  const displayName = profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : "User"

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 items-center gap-3 px-3">
        {/* Left */}
        <Button variant="ghost" size="icon" onClick={onMenuToggle} aria-label="Toggle menu" aria-expanded={isMenuOpen}>
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search…"
            className="pl-10"
            aria-label="Search"
          />
        </div>

        {/* Right */}
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-[10px]" variant="default">3</Badge>
        </Button>

        <Button variant="ghost" size="icon" aria-label="Help">
          <HelpCircle className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback>{(initials || "U").toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline">{displayName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="text-sm font-medium">{displayName}</div>
              <div className="text-xs text-muted-foreground">{profile?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => signOut()}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
