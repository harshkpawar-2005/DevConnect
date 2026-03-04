import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  return (
    // 1. We remove the "dark" class.
    // 2. We set the default background to 'bg-background' (which is white in light mode)
    //    and default text to 'text-foreground' (which is dark in light mode).
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}


// export default function Layout() {
//   return (
//     <div className="flex min-h-screen flex-col text-foreground">
//       <Header />
//       <main className="flex-grow">
//         <Outlet />
//       </main>
//       <Footer />
//     </div>
//   );
// }
