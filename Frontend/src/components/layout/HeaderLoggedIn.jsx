import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import LogoIcon from "@/assets/logo-icon.png";
import { User, Folder, Layers, Bookmark, FileText, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function HeaderLoggedIn() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="h-16 w-full sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex h-full items-center justify-between px-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 -ml-2.5">
          <img src={LogoIcon} alt="DevConnect Logo" className="h-8 w-8" />
          <span className="
            text-2xl font-bold
            bg-gradient-to-r from-sky-400 to-blue-600
            bg-clip-text text-transparent
          ">
            DevConnect
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Button asChild variant="ghost">
            <Link to="/dashboard">Dashboard</Link>
          </Button>

          <Button
            asChild
            className="bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.03]"
          >
            <Link to="/create-project">Post a Project</Link>
          </Button>

          {/* Avatar dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center h-9 w-9 rounded-full overflow-hidden border-2 border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 transition-all">
                {user?.avatar || user?.imageUrl ? (
                  <img
                    src={user.avatar || user.imageUrl}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-r from-sky-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                    {user?.fullName?.[0] || user?.username?.[0] || "U"}
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate(`/profile/${user?.username || ""}`)}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/my-projects")}>
                <Folder className="mr-2 h-4 w-4" />
                My Projects
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/workspace")}>
                <Layers className="mr-2 h-4 w-4" />
                Workspace
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/saved-projects")}>
                <Bookmark className="mr-2 h-4 w-4" />
                Saved Projects
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/applications")}>
                <FileText className="mr-2 h-4 w-4" />
                My Applications
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </nav>
  );
}
