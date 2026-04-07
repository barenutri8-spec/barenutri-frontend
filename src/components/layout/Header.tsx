"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/products", label: "Products" },
  { href: "/wholesale", label: "Wholesale" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/20 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/brand-logo-photo.png"
            alt="Bare Nutri"
            width={150}
            height={140}
            className="object-contain"
          />
        </Link>

        {/* Desktop nav - centered */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[14px] font-medium tracking-wide text-[#3b3838] transition-colors hover:text-[#1a1717] xl:text-[16px] 2xl:text-[18px]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="hidden items-center gap-4 md:flex">
          {/* User icon with dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setUserDropdown(true)}
            onMouseLeave={() => setUserDropdown(false)}
          >
            <button className="flex h-9 w-9 items-center justify-center rounded-full border border-[#3b3838] text-[#3b3838] transition-colors hover:bg-[#3b3838]/10">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </button>
            {userDropdown && (
              <div className="absolute left-1/2 top-full mt-1 w-40 -translate-x-1/2 rounded-lg border border-zinc-200 bg-white py-2 shadow-lg">
                <Link
                  href="/login"
                  className="block px-4 py-2 text-center text-sm text-[#3b3838] transition-colors hover:bg-[#f5f0eb]"
                >
                  Login
                </Link>
                <div className="mx-3 border-t border-zinc-200" />
                <Link
                  href="/register"
                  className="block px-4 py-2 text-center text-sm text-[#3b3838] transition-colors hover:bg-[#f5f0eb]"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
          <Link
            href="/contact"
            className="rounded-full border border-[#3b3838] px-5 py-2 text-sm font-medium text-[#3b3838] transition-colors hover:bg-[#3b3838]/10"
          >
            Get in Touch
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex flex-col gap-1.5 md:hidden"
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-6 bg-[#3b3838] transition-transform ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-6 bg-[#3b3838] transition-opacity ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-6 bg-[#3b3838] transition-transform ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="flex flex-col gap-4 bg-white/80 px-6 pb-4 backdrop-blur-sm md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-[14px] font-medium tracking-wide text-[#3b3838] transition-colors hover:text-[#1a1717] xl:text-[16px] 2xl:text-[18px]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="text-[14px] font-medium text-[#3b3838] transition-colors hover:text-[#1a1717] xl:text-[16px] 2xl:text-[18px]"
          >
            Login
          </Link>
          <Link
            href="/register"
            onClick={() => setMenuOpen(false)}
            className="text-[14px] font-medium text-[#3b3838] transition-colors hover:text-[#1a1717] xl:text-[16px] 2xl:text-[18px]"
          >
            Sign up
          </Link>
          <Link
            href="/contact"
            onClick={() => setMenuOpen(false)}
            className="w-fit rounded-full border border-[#3b3838] px-5 py-2 text-[14px] font-medium text-[#3b3838] xl:text-[16px] 2xl:text-[18px]"
          >
            Get in Touch
          </Link>
        </nav>
      )}
    </header>
  );
}
