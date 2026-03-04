export default function Footer() {
  return (
    // We give it an ID so our header button can find it
    <footer id="footer-section" className="bg-slate-100 border-t">
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-xl font-semibold">Contact Us</h2>
        <p className="text-slate-600 mt-2">
          Have questions? Reach out to us at contact@devconnect.com
        </p>
        <div className="mt-4 text-sm text-slate-500">
          © 2025 DevConnect. All rights reserved.
        </div>
      </div>
    </footer>
  );
}