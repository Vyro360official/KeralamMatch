import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const districts = ["Trivandrum", "Ernakulam", "Kozhikode", "Kottayam", "Thrissur", "Kollam", "Kannur"];
  const communities = ["Nair", "Ezhava", "Christian", "Muslim", "Latin Catholic", "Syrian Christian"];

  return (
    <footer className="w-full border-t border-border-subtle bg-bg-tertiary text-text-secondary py-16">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand Info */}
          <div className="flex flex-col space-y-4">
            <span className="text-lg font-bold text-brand-primary tracking-tight">KeralamMatch</span>
            <p className="text-sm leading-relaxed max-w-xs text-text-tertiary">
              Help people find their life partner safely, privately, and beautifully. Inspired by Apple design and privacy values.
            </p>
          </div>

          {/* District Directories (SEO) */}
          <div className="flex flex-col space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">Matches by District</span>
            <ul className="space-y-2 text-sm">
              {districts.map((d) => (
                <li key={d}>
                  <Link href={`/find/brides-in-${d.toLowerCase()}`} className="hover:text-text-primary transition-colors">
                    Brides in {d}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Directories (SEO) */}
          <div className="flex flex-col space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">Matches by Community</span>
            <ul className="space-y-2 text-sm">
              {communities.map((c) => (
                <li key={c}>
                  <Link href={`/find/${c.toLowerCase().replace(" ", "-")}-matrimony`} className="hover:text-text-primary transition-colors">
                    {c} Matrimony
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal / Guidelines */}
          <div className="flex flex-col space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">Legal & Guidelines</span>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/trust" className="hover:text-text-primary transition-colors">Safety Center</Link></li>
              <li><Link href="/faq" className="hover:text-text-primary transition-colors">Help FAQ</Link></li>
            </ul>
          </div>

        </div>

        {/* Footer bottom */}
        <div className="mt-16 pt-8 border-t border-border-subtle flex flex-col md:flex-row items-center justify-between text-xs text-text-tertiary">
          <span>© {currentYear} KeralamMatch. All rights reserved.</span>
          <span className="mt-4 md:mt-0">Designed and Engineered privately for Malayali communities.</span>
        </div>
      </div>
    </footer>
  );
}
