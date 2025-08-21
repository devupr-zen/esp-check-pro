// src/components/shell/TopBar.tsx
import { Bell, User, Settings, MessageSquare, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useNavigate } from "react-router-dom";

interface TopBarProps {
  pageTitle: string; // Pass title of current page
}

export function TopBar({ pageTitle }: TopBarProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const goSettings = () => navigate("/settings");
  const goProfile = () => navigate("/settings/profile");
  const openSupport = () =>
    window.open("mailto:support@upraizen.com?subject=Upraizen%20Support", "_blank");

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = (firstName?.[0] || "").toUpperCase();
    const last = (lastName?.[0] || "").toUpperCase();
    return (first + last) || "U";
  };

  const notificationCount = 0; // wire real count later

  return (
    <header className="h-14 bg-background/80 backdrop-blur-md px-4 md:px-6 flex items-center justify-between">
      {/* Left: Page Title */}
      <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>

      {/* Right: Notifications + User Menu */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs p-0 flex items-center justify-center">
              {notificationCount}
            </Badge>
          )}
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
