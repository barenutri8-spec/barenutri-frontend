"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuthSession } from "@/hooks/useAuthSession";
import { ROUTES } from "@/constants";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/products", label: "Products" },
  { href: "/wholesale", label: "Wholesale" },
  { href: "/contact", label: "Contact" },
];

/** Matches .gradient-text / .gradient-btn in globals.css */
const navLinkUnderlineBase =
  "relative inline-block pb-1 after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:block after:h-0.5 after:w-full after:origin-left after:rounded-full after:bg-[linear-gradient(135deg,hsl(var(--brand-maroon)),hsl(var(--brand-red)))] after:transition-transform after:duration-300 after:ease-out after:content-['']";

function isActiveNavHref(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navLinkUnderlineClass(active: boolean): string {
  return `${navLinkUnderlineBase} ${active ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"}`;
}

/** Brand gradient tint on hover — same stops as .gradient-btn (globals.css) */
const headerActionGradientHover =
  "transition-[background,background-image] duration-300 ease-out hover:bg-[linear-gradient(135deg,hsl(var(--brand-maroon)_/_0.14),hsl(var(--brand-red)_/_0.14))]";

const headerIconCircleClass = `group relative flex h-9 w-9 items-center justify-center rounded-full border border-[#3b3838] text-[#3b3838] ${headerActionGradientHover}`;

function HeaderTooltip({ label }: { label: string }) {
  return (
    <span
      className="pointer-events-none absolute left-1/2 top-full z-[60] mt-1 flex -translate-x-1/2 flex-col items-center whitespace-nowrap opacity-0 transition-opacity duration-100 group-hover:opacity-100 group-focus-visible:opacity-100"
      aria-hidden
    >
      {/* Upward point toward the trigger */}
      <span className="h-0 w-0 border-x-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-[#1a1717]" />
      <span className="-mt-px rounded-md bg-[#1a1717] px-2.5 py-1 text-xs font-medium text-white shadow-md ring-1 ring-black/10">
        {label}
      </span>
    </span>
  );
}

function GetInTouchIcon({ className = "h-4 w-4 shrink-0" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user: authUser, logout: sessionLogout } = useAuthSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [cartState] = useLocalStorage<Record<string, { quantity: number }>>(
    "barenutri-cart",
    {},
  );
  const cartCount = Object.values(cartState).reduce(
    (total, item) => total + item.quantity,
    0,
  );

  function handleLogout() {
    sessionLogout();
    setUserDropdown(false);
    setMenuOpen(false);
    router.push(ROUTES.HOME);
    router.refresh();
  }

  const accountInitial =
    authUser?.name?.trim()?.charAt(0)?.toUpperCase() ||
    authUser?.email?.trim()?.charAt(0)?.toUpperCase() ||
    "?";

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
          {navLinks.map((link) => {
            const active = isActiveNavHref(link.href, pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`text-[14px] font-medium tracking-wide text-[#3b3838] transition-colors hover:text-[#1a1717] xl:text-[16px] 2xl:text-[18px] ${navLinkUnderlineClass(active)}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/track-order"
            className={headerIconCircleClass}
            aria-label="Track Order"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 20.25h6M3.75 6.75h16.5M5.25 6.75v10.5a1.5 1.5 0 001.5 1.5h10.5a1.5 1.5 0 001.5-1.5V6.75M9.75 10.5l2.25-1.5 2.25 1.5v2.25L12 14.25l-2.25-1.5V10.5z"
              />
            </svg>
            <HeaderTooltip label="Track Order" />
          </Link>

          <Link
            href="/cart"
            className={headerIconCircleClass}
            aria-label="Cart"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386a1.5 1.5 0 011.465 1.177l.508 2.283m0 0h13.841a1.5 1.5 0 011.466 1.823l-1.197 5.389a1.5 1.5 0 01-1.466 1.177H8.168a1.5 1.5 0 01-1.465-1.177L5.61 6.46zM9 20.25a.75.75 0 100-1.5.75.75 0 000 1.5zm9 0a.75.75 0 100-1.5.75.75 0 000 1.5z"
              />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 rounded-full bg-[#8b1a1a] px-1 text-center text-[10px] font-semibold leading-4 text-white">
                {cartCount}
              </span>
            )}
            <HeaderTooltip label="Cart" />
          </Link>

          {/* Account menu */}
          <div
            className="relative"
            onMouseEnter={() => setUserDropdown(true)}
            onMouseLeave={() => setUserDropdown(false)}
          >
            <button
              type="button"
              aria-label={authUser ? "Signed-in account menu" : "Account menu"}
              aria-expanded={userDropdown}
              className={`flex h-9 w-9 items-center justify-center rounded-full border border-[#3b3838] text-[#3b3838] ${headerActionGradientHover} ${authUser ? "border-[#8b1a1a] bg-[linear-gradient(135deg,hsl(var(--brand-maroon)_/_0.08),hsl(var(--brand-red)_/_0.08))] text-[#8b1a1a]" : ""}`}
            >
              {authUser ? (
                <span className="text-sm font-semibold">{accountInitial}</span>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              )}
            </button>
            {userDropdown && (
              <div className="absolute right-0 top-full mt-1 w-[min(100vw-2rem,16rem)] rounded-lg border border-zinc-200 bg-white py-2 shadow-lg md:left-1/2 md:right-auto md:w-56 md:-translate-x-1/2">
                {authUser ? (
                  <>
                    <div className="border-b border-zinc-100 px-4 pb-3 pt-1">
                      <p className="truncate text-sm font-semibold text-[#1a1717]">
                        {authUser.name}
                      </p>
                      <p className="truncate text-xs text-zinc-500">
                        {authUser.email}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="w-full px-4 py-2 text-left text-sm text-[#8b1a1a] transition-colors hover:bg-[#f5f0eb]"
                      onClick={handleLogout}
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-4 py-2 text-center text-sm text-[#3b3838] transition-colors hover:bg-[#f5f0eb]"
                      onClick={() => setUserDropdown(false)}
                    >
                      Login
                    </Link>
                    <div className="mx-3 border-t border-zinc-200" />
                    <Link
                      href="/register"
                      className="block px-4 py-2 text-center text-sm text-[#3b3838] transition-colors hover:bg-[#f5f0eb]"
                      onClick={() => setUserDropdown(false)}
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          <Link
            href="/contact"
            className={headerIconCircleClass}
            aria-label="Get in Touch"
          >
            <GetInTouchIcon className="h-5 w-5 shrink-0" />
            <HeaderTooltip label="Get in Touch" />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="group relative flex flex-col items-center gap-1.5 md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
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
          <HeaderTooltip
            label={menuOpen ? "Close menu" : "Open menu"}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="flex flex-col gap-4 bg-white/80 px-6 pb-4 backdrop-blur-sm md:hidden">
          {navLinks.map((link) => {
            const active = isActiveNavHref(link.href, pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`text-[14px] font-medium tracking-wide text-[#3b3838] transition-colors hover:text-[#1a1717] xl:text-[16px] 2xl:text-[18px] ${navLinkUnderlineClass(active)}`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/track-order"
            onClick={() => setMenuOpen(false)}
            aria-current={
              isActiveNavHref("/track-order", pathname) ? "page" : undefined
            }
            className={`text-[14px] font-medium text-[#3b3838] transition-colors hover:text-[#1a1717] xl:text-[16px] 2xl:text-[18px] ${navLinkUnderlineClass(isActiveNavHref("/track-order", pathname))}`}
          >
            Track Order
          </Link>
          <Link
            href="/cart"
            onClick={() => setMenuOpen(false)}
            aria-current={
              isActiveNavHref("/cart", pathname) ? "page" : undefined
            }
            className={`text-[14px] font-medium text-[#3b3838] transition-colors hover:text-[#1a1717] xl:text-[16px] 2xl:text-[18px] ${navLinkUnderlineClass(isActiveNavHref("/cart", pathname))}`}
          >
            Cart {cartCount > 0 ? `(${cartCount})` : ""}
          </Link>
          {authUser ? (
            <>
              <div className="rounded-lg border border-zinc-200 bg-[#faf8f6] px-3 py-2">
                <p className="text-xs font-semibold text-[#1a1717]">
                  {authUser.name}
                </p>
                <p className="truncate text-xs text-zinc-500">{authUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                }}
                className="text-left text-[14px] font-medium text-[#8b1a1a] transition-colors hover:text-[#6b1414] xl:text-[16px] 2xl:text-[18px]"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                aria-current={
                  isActiveNavHref("/login", pathname) ? "page" : undefined
                }
                className={`text-[14px] font-medium text-[#3b3838] transition-colors hover:text-[#1a1717] xl:text-[16px] 2xl:text-[18px] ${navLinkUnderlineClass(isActiveNavHref("/login", pathname))}`}
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                aria-current={
                  isActiveNavHref("/register", pathname) ? "page" : undefined
                }
                className={`text-[14px] font-medium text-[#3b3838] transition-colors hover:text-[#1a1717] xl:text-[16px] 2xl:text-[18px] ${navLinkUnderlineClass(isActiveNavHref("/register", pathname))}`}
              >
                Sign up
              </Link>
            </>
          )}
          <Link
            href="/contact"
            onClick={() => setMenuOpen(false)}
            className={headerIconCircleClass}
            aria-label="Get in Touch"
          >
            <GetInTouchIcon className="h-5 w-5 shrink-0" />
            <HeaderTooltip label="Get in Touch" />
          </Link>
        </nav>
      )}
    </header>
  );
}
