import Link from "next/link";
import Image from "next/image";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/products", label: "Products" },
  { href: "/wholesale", label: "Wholesale" },
];

const policies = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/shipping-returns", label: "Shipping & Returns" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-white bg-[url('/bg-decorations.svg')] bg-[length:100%_100%] bg-center bg-no-repeat">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Image
              src="/brand-logo-photo.png"
              alt="Bare Nutri"
              width={180}
              height={160}
              className="mb-4 object-contain"
            />
            <p className="text-sm leading-relaxed text-zinc-700">
              Pure, honest food from farm to family.
              <br />
              Arogyame Mahabhagyam.
            </p>
          </div>

          {/* Quick Links + Policies: one row on mobile; sm+ unwraps into parent grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-0 sm:contents">
            <div className="min-w-0">
              <h3 className="mb-4 text-lg font-semibold text-[#4a1a1a]">
                Quick Links
              </h3>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-700 transition-colors hover:text-zinc-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0">
              <h3 className="mb-4 text-lg font-semibold text-[#4a1a1a]">
                Policies
              </h3>
              <ul className="space-y-2">
                {policies.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-700 transition-colors hover:text-zinc-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-[#4a1a1a]">
              Contact
            </h3>
            <ul className="space-y-2 text-sm text-zinc-700">
              <li>
                <a
                  href="mailto:info@barenutri.com"
                  className="transition-colors hover:text-zinc-900"
                >
                  info@barenutri.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+91XXXXXXXXXX"
                  className="transition-colors hover:text-zinc-900"
                >
                  +91 XXXXX XXXXX
                </a>
              </li>
              <li>India</li>
            </ul>
          </div>
        </div>

        {/* Divider + Copyright */}
        <div className="mt-12 border-t border-zinc-400/40 pt-6 text-center">
          <p className="text-sm text-zinc-600">
            &copy; {new Date().getFullYear()} Barenutri. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
