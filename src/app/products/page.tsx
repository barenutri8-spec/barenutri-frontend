"use client";

import { Suspense, useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  CATEGORY_OPTIONS,
  PRODUCTS,
  TYPE_OPTIONS,
  discountPercentOff,
  getCompareAtPrice,
  type Product,
  type ProductCategory,
  type ProductSize,
  type ProductType,
  getStartingPrice,
} from "@/data/products";

type SortOption = "name-asc" | "price-low" | "price-high";
type AvailabilityFilter = "all" | "in-stock" | "out-of-stock";
type CartItemState = {
  quantity: number;
  size: ProductSize;
};

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "name-asc", label: "Sort by Name" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

function CategoriesToolbarIcon() {
  const gradientId = `toolbar-cat-${useId().replace(/:/g, "")}`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      className="h-4 w-4 shrink-0"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--brand-maroon))" />
          <stop offset="100%" stopColor="hsl(var(--brand-red))" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradientId})`}
        fillRule="evenodd"
        d="M2 4.75A.75.75 0 012.75 4h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-4.5zm9 0A.75.75 0 0111.75 4h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-4.5zm-9 9A.75.75 0 012.75 13h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-4.5zm9 0a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-4.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function FilterToolbarIcon() {
  const gradientId = `toolbar-flt-${useId().replace(/:/g, "")}`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      className="h-4 w-4 shrink-0"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--brand-maroon))" />
          <stop offset="100%" stopColor="hsl(var(--brand-red))" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradientId})`}
        d="M10 3.75a2 2 0 10-4 0 2 2 0 004 0zM17.25 4.5a.75.75 0 000-1.5h-5.5a.75.75 0 000 1.5h5.5zM5 3.75a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM4.25 17a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5zM17.25 17a.75.75 0 000-1.5h-5.5a.75.75 0 000 1.5h5.5zM9 10a.75.75 0 01-.75.75h-5.5a.75.75 0 010-1.5h5.5A.75.75 0 019 10zM17.25 10.75a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5zM14 10a2 2 0 10-4 0 2 2 0 004 0zM10 16.25a2 2 0 10-4 0 2 2 0 004 0z"
      />
    </svg>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageContent />
    </Suspense>
  );
}

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProductCategory | "all">("all");
  const [type, setType] = useState<ProductType | "all">("all");
  const [availability, setAvailability] = useState<AvailabilityFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [cartState, setCartState] = useLocalStorage<Record<string, CartItemState>>(
    "barenutri-cart",
    {},
  );
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const categoriesPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(event.target as Node)
      ) {
        setFilterOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setFilterOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [filterOpen]);

  useEffect(() => {
    if (!categoriesOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        categoriesPanelRef.current &&
        !categoriesPanelRef.current.contains(event.target as Node)
      ) {
        setCategoriesOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setCategoriesOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [categoriesOpen]);

  useEffect(() => {
    const categoryFromQuery = searchParams.get("category");
    if (isCategory(categoryFromQuery)) {
      setCategory(categoryFromQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!showCartPopup) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowCartPopup(false);
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [showCartPopup]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = PRODUCTS.filter((product) => {
      const matchesSearch =
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);
      const matchesCategory = category === "all" || product.category === category;
      const matchesType = type === "all" || product.type === type;
      const matchesAvailability =
        availability === "all" ||
        (availability === "in-stock" ? product.inStock : !product.inStock);

      return matchesSearch && matchesCategory && matchesType && matchesAvailability;
    });

    return [...result].sort((a, b) => sortProducts(a, b, sortBy));
  }, [search, category, type, availability, sortBy]);

  return (
    <>
      <Header />
      <main className="bg-[#f9f7f4]">
        <section className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
          {/* <div className="mb-8">
            <h1 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">
              Product Catalog
            </h1>
            <p className="mt-2 text-sm text-zinc-600 sm:text-base">
              Explore powders, flours, raw products, and traditional essentials.
            </p>
          </div> */}

          <div className="mb-8 flex w-full flex-nowrap items-center gap-2 sm:justify-end sm:gap-3">
            <div className="relative min-w-0 flex-1 sm:max-w-[240px] md:max-w-[280px]">
              <span
                className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400 sm:left-3"
                aria-hidden
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <input
                type="search"
                placeholder="Search products..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-8 pr-2 text-xs text-zinc-900 outline-none transition focus:border-zinc-500 sm:py-2.5 sm:pl-9 sm:pr-3 sm:text-sm"
                aria-label="Search products"
              />
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="relative" ref={categoriesPanelRef}>
              <button
                type="button"
                onClick={() => {
                  setCategoriesOpen((open) => !open);
                  setFilterOpen(false);
                }}
                aria-expanded={categoriesOpen}
                aria-controls="product-categories-panel"
                aria-label="Categories"
                title="Categories"
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-zinc-300 bg-white text-sm font-medium text-zinc-900 outline-none transition hover:border-zinc-400 focus-visible:border-zinc-500 focus-visible:ring-2 focus-visible:ring-zinc-400/40 md:size-auto md:gap-2 md:px-4 md:py-2.5"
              >
                <CategoriesToolbarIcon />
                <span className="hidden md:inline">Categories</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`hidden h-4 w-4 text-zinc-500 transition md:block ${categoriesOpen ? "rotate-180" : ""}`}
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {categoriesOpen && (
                <div
                  id="product-categories-panel"
                  role="menu"
                  aria-label="Product categories"
                  className="absolute right-0 z-20 mt-2 w-[min(100vw-2rem,16rem)] rounded-lg border border-zinc-200 bg-white py-1 shadow-lg"
                >
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={category === "all"}
                    onClick={() => {
                      setCategory("all");
                      setCategoriesOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm ${
                      category === "all"
                        ? "bg-[#fff5f3] font-medium text-[#8b1a1a]"
                        : "text-zinc-800 hover:bg-zinc-50"
                    }`}
                  >
                    <span
                      className="flex w-5 shrink-0 justify-center text-[#8b1a1a]"
                      aria-hidden
                    >
                      {category === "all" ? "✓" : ""}
                    </span>
                    <span>All Products</span>
                  </button>
                  {CATEGORY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="menuitemradio"
                      aria-checked={category === option.value}
                      onClick={() => {
                        setCategory(option.value);
                        setCategoriesOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm ${
                        category === option.value
                          ? "bg-[#fff5f3] font-medium text-[#8b1a1a]"
                          : "text-zinc-800 hover:bg-zinc-50"
                      }`}
                    >
                      <span
                        className="flex w-5 shrink-0 justify-center text-[#8b1a1a]"
                        aria-hidden
                      >
                        {category === option.value ? "✓" : ""}
                      </span>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative" ref={filterPanelRef}>
              <button
                type="button"
                onClick={() => {
                  setFilterOpen((open) => !open);
                  setCategoriesOpen(false);
                }}
                aria-expanded={filterOpen}
                aria-controls="product-filters-panel"
                aria-label="Filter"
                title="Filter"
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-zinc-300 bg-white text-sm font-medium text-zinc-900 outline-none transition hover:border-zinc-400 focus-visible:border-zinc-500 focus-visible:ring-2 focus-visible:ring-zinc-400/40 md:size-auto md:gap-2 md:px-4 md:py-2.5"
              >
                <FilterToolbarIcon />
                <span className="hidden md:inline">Filter</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`hidden h-4 w-4 text-zinc-500 transition md:block ${filterOpen ? "rotate-180" : ""}`}
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {filterOpen && (
                <div
                  id="product-filters-panel"
                  role="region"
                  aria-label="Product filters"
                  className="absolute right-0 z-20 mt-2 w-[min(100vw-2rem,18rem)] rounded-lg border border-zinc-200 bg-white p-4 shadow-lg sm:w-72"
                >
                  <div className="space-y-3">
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-zinc-600">
                        Sort
                      </span>
                      <select
                        value={sortBy}
                        onChange={(event) =>
                          setSortBy(event.target.value as SortOption)
                        }
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none"
                      >
                        {SORT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-zinc-600">
                        Type
                      </span>
                      <select
                        value={type}
                        onChange={(event) =>
                          setType(event.target.value as ProductType | "all")
                        }
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none"
                      >
                        <option value="all">All Types</option>
                        {TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-zinc-600">
                        Availability
                      </span>
                      <select
                        value={availability}
                        onChange={(event) =>
                          setAvailability(event.target.value as AvailabilityFilter)
                        }
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none"
                      >
                        <option value="all">All Availability</option>
                        <option value="in-stock">In Stock</option>
                        <option value="out-of-stock">Out of Stock</option>
                      </select>
                    </label>
                  </div>
                </div>
              )}
            </div>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-14 text-center text-zinc-600">
              No products found for the selected filters.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-3 lg:grid-cols-5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  cartItem={cartState[product.slug]}
                  onAddToCart={() => {
                    setCartState((previous) => ({
                      ...previous,
                      [product.slug]: {
                        quantity: 1,
                        size: previous[product.slug]?.size ?? product.sizes[0],
                      },
                    }));
                    setShowCartPopup(true);
                  }}
                  onIncrement={() => {
                    setCartState((previous) => {
                      const current = previous[product.slug];
                      if (!current) {
                        return {
                          ...previous,
                          [product.slug]: { quantity: 1, size: product.sizes[0] },
                        };
                      }

                      return {
                        ...previous,
                        [product.slug]: {
                          ...current,
                          quantity: current.quantity + 1,
                        },
                      };
                    });
                  }}
                  onDecrement={() => {
                    setCartState((previous) => {
                      const current = previous[product.slug];
                      if (!current) {
                        return previous;
                      }

                      if (current.quantity <= 1) {
                        const { [product.slug]: _removed, ...rest } = previous;
                        return rest;
                      }

                      return {
                        ...previous,
                        [product.slug]: {
                          ...current,
                          quantity: current.quantity - 1,
                        },
                      };
                    });
                  }}
                  onSizeChange={(size) => {
                    setCartState((previous) => {
                      const current = previous[product.slug];
                      return {
                        ...previous,
                        [product.slug]: {
                          quantity: current?.quantity ?? 0,
                          size,
                        },
                      };
                    });
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
      {showCartPopup && (
        <div className="fixed right-4 bottom-4 z-50 w-[90%] max-w-xs rounded-lg border border-zinc-200 bg-white p-3 shadow-lg">
          <p className="text-sm font-medium text-zinc-900">Item added to cart</p>
          <Link
            href="/cart"
            className="gradient-btn mt-2 block w-full rounded-md px-3 py-2 text-center text-sm font-medium text-white"
          >
            View Cart
          </Link>
        </div>
      )}
    </>
  );
}

function ProductCard({
  product,
  cartItem,
  onAddToCart,
  onIncrement,
  onDecrement,
  onSizeChange,
}: {
  product: Product;
  cartItem?: CartItemState;
  onAddToCart: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onSizeChange: (size: ProductSize) => void;
}) {
  const selectedSize = cartItem?.size ?? product.sizes[0];
  const selectedPrice = product.priceBySize[selectedSize];
  const quantity = cartItem?.quantity ?? 1;
  const totalPrice = selectedPrice * quantity;
  const compareAt = getCompareAtPrice(product, selectedSize);
  const compareTotal = compareAt != null ? compareAt * quantity : undefined;
  const pctOff =
    compareAt != null ? discountPercentOff(compareAt, selectedPrice) : 0;

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="relative block">
        <div className="relative h-[7.25rem] w-full bg-zinc-50 sm:h-40">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 20vw"
          />
        </div>
      </Link>

      <div className="p-2 sm:p-3">
        <Link href={`/products/${product.slug}`}>
          <h2 className="line-clamp-1 text-xs font-medium text-zinc-900 sm:text-sm">
            {product.name}
          </h2>
        </Link>
        <div className="mt-1.5 flex w-full min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 sm:mt-2 sm:gap-x-4">
          <span className="min-w-0 shrink text-[10px] text-zinc-500 sm:text-xs">
            {product.sizes.join(", ")}
          </span>
          <select
            dir="ltr"
            value={selectedSize}
            onChange={(event) => onSizeChange(event.target.value as ProductSize)}
            aria-label={`${product.name} pack size`}
            className="product-card-size-select h-6 w-[4.5rem] shrink-0 cursor-pointer rounded border border-zinc-300 bg-white py-0 pl-1.5 pr-6 text-left text-[10px] leading-none text-zinc-800 outline-none transition focus-visible:border-zinc-500 focus-visible:ring-2 focus-visible:ring-zinc-400/40 sm:h-7 sm:w-20 sm:pl-2 sm:pr-7 sm:text-[11px]"
          >
            {product.sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        {pctOff > 0 ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 sm:mt-2 sm:gap-x-2">
            <span className="inline-flex rounded-md bg-[#fff5f3] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#8b1a1a] ring-1 ring-[#8b1a1a]/25 sm:px-2 sm:text-[10px]">
              {pctOff}% off
            </span>
            {compareAt != null && compareAt > selectedPrice ? (
              <span className="text-[10px] font-medium text-green-700 sm:text-[11px]">
                Save ₹{(compareAt - selectedPrice) * quantity}
              </span>
            ) : null}
          </div>
        ) : null}
        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0 sm:mt-2">
          {compareTotal != null ? (
            <>
              <span className="text-[10px] text-zinc-400 line-through sm:text-xs">
                ₹{compareTotal}
              </span>
              <span className="text-sm font-semibold text-zinc-900 sm:text-base">
                ₹{totalPrice}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-zinc-900 sm:text-base">
              ₹{totalPrice}
            </span>
          )}
        </div>
        <p className="text-[10px] text-zinc-500 sm:text-xs">
          {product.inStock ? (
            <span className="text-green-700">In Stock</span>
          ) : (
            <span className="text-amber-700">Out of Stock</span>
          )}
        </p>

        {!product.inStock ? (
          <button
            type="button"
            disabled
            className="mt-2 w-full cursor-not-allowed rounded-md border border-zinc-300 px-2 py-1.5 text-xs font-medium text-zinc-400 sm:mt-3 sm:px-3 sm:py-2 sm:text-sm"
          >
            Out of Stock
          </button>
        ) : cartItem && cartItem.quantity > 0 ? (
          <div className="mt-2 flex items-center justify-between rounded-md border border-[#8b1a1a]/20 bg-[#fff5f3] p-0.5 sm:mt-3 sm:p-1">
            <button
              type="button"
              onClick={onDecrement}
              className="flex h-7 w-7 items-center justify-center rounded-md text-base font-semibold text-[#8b1a1a] hover:bg-[#8b1a1a]/10 sm:h-8 sm:w-8 sm:text-lg"
              aria-label={`Decrease ${product.name} quantity`}
            >
              -
            </button>
            <span className="min-w-7 text-center text-xs font-semibold text-[#8b1a1a] sm:min-w-8 sm:text-sm">
              {cartItem.quantity}
            </span>
            <button
              type="button"
              onClick={onIncrement}
              className="flex h-7 w-7 items-center justify-center rounded-md text-base font-semibold text-[#8b1a1a] hover:bg-[#8b1a1a]/10 sm:h-8 sm:w-8 sm:text-lg"
              aria-label={`Increase ${product.name} quantity`}
            >
              +
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onAddToCart}
            className="gradient-btn mt-2 w-full rounded-md px-2 py-1.5 text-xs font-medium text-white sm:mt-3 sm:px-3 sm:py-2 sm:text-sm"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}

function sortProducts(a: Product, b: Product, sortBy: SortOption): number {
  if (sortBy === "name-asc") {
    return a.name.localeCompare(b.name);
  }

  const aPrice = getStartingPrice(a);
  const bPrice = getStartingPrice(b);

  if (sortBy === "price-low") {
    return aPrice - bPrice;
  }

  return bPrice - aPrice;
}

function isCategory(value: string | null): value is ProductCategory {
  return CATEGORY_OPTIONS.some((option) => option.value === value);
}
