export type ProductCategory =
  | "powders"
  | "flours"
  | "raw-products"
  | "traditional-essentials";

export type ProductType = "turmeric" | "kumkum" | "karam" | "millets" | "honey" | "flour" | "chillies";

export type ProductSize = "500g" | "1kg";

export type Product = {
  slug: string;
  name: string;
  description: string;
  image: string;
  category: ProductCategory;
  type: ProductType;
  sizes: ProductSize[];
  /** Selling price per size (what the customer pays). */
  priceBySize: Record<ProductSize, number>;
  /**
   * Optional higher “was” / MRP per size when an admin sets a discount.
   * Shown struck through when greater than `priceBySize` for that size.
   */
  compareAtPriceBySize?: Partial<Record<ProductSize, number>>;
  inStock: boolean;
};

export const CATEGORY_OPTIONS: Array<{ value: ProductCategory; label: string }> = [
  { value: "powders", label: "Powders" },
  { value: "flours", label: "Flours" },
  { value: "raw-products", label: "Raw Products" },
  { value: "traditional-essentials", label: "Traditional Essentials" },
];

export const TYPE_OPTIONS: Array<{ value: ProductType; label: string }> = [
  { value: "turmeric", label: "Turmeric" },
  { value: "kumkum", label: "Kumkum" },
  { value: "karam", label: "Karam" },
  { value: "millets", label: "Millets" },
  { value: "honey", label: "Honey" },
  { value: "flour", label: "Flour" },
  { value: "chillies", label: "Red Chillies" },
];

export const PRODUCTS: Product[] = [
  {
    slug: "turmeric-powder",
    name: "Turmeric Powder",
    description: "Stone-ground turmeric powder with rich aroma and natural color.",
    image: "/spices.jpg",
    category: "powders",
    type: "turmeric",
    sizes: ["500g", "1kg"],
    priceBySize: { "500g": 150, "1kg": 280 },
    inStock: true,
  },
  {
    slug: "kumkum-powder",
    name: "Kumkum Powder",
    description: "Traditional kumkum powder crafted with vibrant and lasting tone.",
    image: "/spices.jpg",
    category: "powders",
    type: "kumkum",
    sizes: ["500g", "1kg"],
    priceBySize: { "500g": 150, "1kg": 280 },
    inStock: true,
  },
  {
    slug: "karam-powder",
    name: "Karam Powder",
    description: "Authentic homemade style karam powder for everyday cooking.",
    image: "/spices.jpg",
    category: "powders",
    type: "karam",
    sizes: ["500g", "1kg"],
    priceBySize: { "500g": 130, "1kg": 240 },
    inStock: true,
  },
  {
    slug: "bajra-flour",
    name: "Bajra Flour",
    description: "Freshly milled bajra flour for soft rotis and healthy meals.",
    image: "/flours.jpg",
    category: "flours",
    type: "flour",
    sizes: ["500g", "1kg"],
    priceBySize: { "500g": 80, "1kg": 145 },
    compareAtPriceBySize: { "500g": 100, "1kg": 175 },
    inStock: true,
  },
  {
    slug: "jowar-flour",
    name: "Jowar Flour",
    description: "Pure jowar flour made from carefully selected grains.",
    image: "/flours.jpg",
    category: "flours",
    type: "flour",
    sizes: ["500g", "1kg"],
    priceBySize: { "500g": 85, "1kg": 150 },
    inStock: true,
  },
  {
    slug: "multigrain-millet-flour",
    name: "Multigrain Millet Flour",
    description: "Balanced blend of millets and grains for daily nutrition.",
    image: "/flours.jpg",
    category: "flours",
    type: "millets",
    sizes: ["500g", "1kg"],
    priceBySize: { "500g": 110, "1kg": 200 },
    inStock: false,
  },
  {
    slug: "raw-turmeric",
    name: "Raw Turmeric",
    description: "Farm-sourced raw turmeric fingers with natural freshness.",
    image: "/staples.jpg",
    category: "raw-products",
    type: "turmeric",
    sizes: ["500g", "1kg"],
    priceBySize: { "500g": 120, "1kg": 220 },
    inStock: true,
  },
  {
    slug: "dried-red-chillies",
    name: "Dried Red Chillies",
    description: "Sun-dried red chillies selected for flavor and heat balance.",
    image: "/staples.jpg",
    category: "raw-products",
    type: "chillies",
    sizes: ["500g", "1kg"],
    priceBySize: { "500g": 140, "1kg": 260 },
    inStock: true,
  },
  {
    slug: "mixed-millets",
    name: "Mixed Millets",
    description: "Whole mixed millets for porridges, upma, and daily cooking.",
    image: "/staples.jpg",
    category: "raw-products",
    type: "millets",
    sizes: ["500g", "1kg"],
    priceBySize: { "500g": 110, "1kg": 200 },
    inStock: false,
  },
  {
    slug: "raw-forest-honey",
    name: "Raw Forest Honey",
    description: "Unprocessed forest honey with natural aroma and texture.",
    image: "/staples.jpg",
    category: "traditional-essentials",
    type: "honey",
    sizes: ["500g", "1kg"],
    priceBySize: { "500g": 220, "1kg": 420 },
    inStock: true,
  },
];

export function getStartingPrice(product: Product): number {
  return Math.min(...product.sizes.map((size) => product.priceBySize[size]));
}

/** List/MRP for a size when admin set a discount (compare-at > sale). */
export function getCompareAtPrice(product: Product, size: ProductSize): number | undefined {
  const compare = product.compareAtPriceBySize?.[size];
  const sale = product.priceBySize[size];
  if (compare != null && compare > sale) return compare;
  return undefined;
}

export function discountPercentOff(compareAt: number, salePrice: number): number {
  if (compareAt <= 0 || salePrice >= compareAt) return 0;
  return Math.round(((compareAt - salePrice) / compareAt) * 100);
}
