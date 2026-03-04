import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LogoIcon from "@/assets/logo-icon.png";

export default function HeaderLoggedOut() {

  const handleScrollToFooter = () => {
    const footer = document.getElementById('footer-section');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="h-16 w-full sticky top-0 z-50 bg-slate-100 border-b">
      <div className="container mx-auto flex h-full items-center justify-between px-4">

        <Link to="/" className="flex items-center gap-2 -ml-2.5">
          <img
            src={LogoIcon}
            alt="DevConnect Logo"
            className="h-8 w-8"
          />
          <span className="
            text-2xl font-bold
            bg-gradient-to-r from-sky-400 to-blue-600
            bg-clip-text text-transparent
          ">
            DevConnect
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleScrollToFooter}>
            Contact Us
          </Button>

          <Button
            asChild
            className="bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.03]"
          >
            <Link to="/login">Login</Link>
          </Button>
        </div>

      </div>
    </nav>
  );
}