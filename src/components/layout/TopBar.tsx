import { useState, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Bell, HelpCircle, User, Settings, MessageSquare, LogOut, Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/AuthProvider";

interface TopBarProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

export function TopBar({ onMenuToggle, isMenuOpen }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSearchKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Optional: wire to a /search route if/when you add one
      if (searchQuery.trim().length > 0) {
        // navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        // For now, no-op to avoid 404:
        console.debug("Search submitted:", searchQuery.trim());
      }
    }
  };

  const goSettings = () => navigate("/settings");
  const goProfile = () => navigate("/settings"); // no /profile page in repo; route to settings
  const openSupport = () =>
    window.open("mailto:support@upraizen.com?subject=Upraizen%20Support", "_blank");

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = (firstName?.[0] || "").toUpperCase();
    const last = (lastName?.[0] || "").toUpperCase();
    return (first + last) || "U";
    };

  // Replace with real notification count when you wire it up
  const notificationCount = 0;

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-6 flex items-center justify-between">
      {/* Left - Hamburger + Search */}
      <div className="flex items-center gap-3 md:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="w-48 sm:w-64 md:w-80">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKey}
              className="pl-10"
              aria-label="Search"
            />
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs p-0 flex items-center justify-center">
              {notificationCount}
            </Badge>
          )}
        </Button>

        {/* Help */}
        <Button variant="ghost" size="icon" aria-label="Help" onClick={openSupport}>
          <HelpCircle className="h-5 w-5" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full" aria-label="User menu">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || ""} alt="User avatar" />
                <AvatarFallback>
                  {getInitials((profile as any)?.first_name, (profile as any)?.last_name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {(profile as any)?.first_name && (profile as any)?.last_name
                    ? `${(profile as any).first_name} ${(profile as any).last_name}`
                    : "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {profile?.email ?? ""}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={goProfile}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={goSettings}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openSupport}>
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Support</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
