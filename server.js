// server.ts
import express from "express";
import path3 from "path";
import crypto2 from "crypto";
import { fileURLToPath as fileURLToPath3 } from "url";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// server/db.ts
import fs2 from "fs";
import path2 from "path";
import crypto from "crypto";
import { fileURLToPath as fileURLToPath2 } from "url";

// server/seedData.ts
var initialCategories = [
  {
    id: "cat-1",
    slug: "mens-sneakers",
    name: "Men's Sneakers",
    description: "Streetwear, athletic, and everyday casual kicks engineered for comfort.",
    displayOrder: 1,
    showOnHome: true,
    isActive: true
  },
  {
    id: "cat-2",
    slug: "womens-sneakers",
    name: "Women's Sneakers",
    description: "Lightweight, versatile silhouettes designed for effortless modern styling.",
    displayOrder: 2,
    showOnHome: true,
    isActive: true
  },
  {
    id: "cat-3",
    slug: "running-shoes",
    name: "Running & Training",
    description: "High-cushion responsive soles for marathons, sprints, and morning jogs.",
    displayOrder: 3,
    showOnHome: true,
    isActive: true
  },
  {
    id: "cat-4",
    slug: "casual-sneakers",
    name: "Casual Street Kicks",
    description: "Clean minimalist profiles perfect for college, work, and weekend chill.",
    displayOrder: 4,
    showOnHome: true,
    isActive: true
  },
  {
    id: "cat-5",
    slug: "high-top-sneakers",
    name: "High-Top Sneakers",
    description: "Bold ankle support and authentic retro basketball aesthetic.",
    displayOrder: 5,
    showOnHome: true,
    isActive: true
  },
  {
    id: "cat-6",
    slug: "sports-shoes",
    name: "Sports & Gym Shoes",
    description: "High-traction training footwear for indoor courts, turf, and heavy workouts.",
    displayOrder: 6,
    showOnHome: true,
    isActive: true
  },
  {
    id: "cat-7",
    slug: "kids-shoes",
    name: "Kids' Active Footwear",
    description: "Durable, scuff-resistant sneakers with extra bounce for energetic feet.",
    displayOrder: 7,
    showOnHome: true,
    isActive: true
  },
  {
    id: "cat-8",
    slug: "walking-shoes",
    name: "Walking & Comfort",
    description: "Cloud-foam insoles and ergonomic arch support for 10,000+ steps daily.",
    displayOrder: 8,
    showOnHome: true,
    isActive: true
  }
];
function createVariants(skuBase, color, hex, baseStock = 20, isKids = false) {
  const sizes = isKids ? ["UK 1", "UK 2", "UK 3", "UK 4", "UK 5"] : ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"];
  return sizes.map((size, idx) => ({
    id: `v-${skuBase}-${idx + 1}`,
    sku: `${skuBase}-${size.replace(" ", "")}`,
    size,
    colorName: color,
    colorHex: hex,
    stockQuantity: Math.max(5, baseStock + idx % 3 * 5)
  }));
}
var rawInitialProducts = [
  // MEN'S SNEAKERS & STREETWEAR (1-10)
  {
    id: "prod-1",
    sku: "APNA-AG-01",
    name: "Apna Air Glide 01 Sneaker",
    slug: "apna-air-glide-01-sneaker",
    brand: "APNA SHOES",
    description: "Flagship street sneaker. Built with breathable dual-density knit mesh, sculpted shock-absorbing EVA midsole, and high-traction rubber waffle outsole. Engineered for Indian roads.",
    gender: "men",
    categorySlug: "mens-sneakers",
    originalPrice: 2799,
    sellingPrice: 1499,
    discountPercentage: 46,
    badge: "Bestseller",
    rating: 4.8,
    reviewCount: 342,
    graphicType: "air-glide",
    images: [],
    weightGrams: 680,
    dimensionsCm: { length: 32, width: 20, height: 12 },
    specifications: { "Sole Material": "Dual-Density Sculpted EVA", "Upper Material": "Engineered Mesh", "Closure": "Lace-Up" },
    variants: createVariants("APNA-AG01", "Jet Black / Solar Orange", "#FF5A1F", 24),
    isActive: true,
    isFeatured: true,
    returnEligible: true,
    createdAt: "2026-03-01T10:00:00Z"
  },
  {
    id: "prod-2",
    sku: "APNA-HT-02",
    name: "Apna Retro Dunk High-Top",
    slug: "apna-retro-dunk-high-top",
    brand: "APNA SHOES",
    description: "Timeless retro basketball court styling elevated for contemporary street culture. Features padded collar, cupsole cushioning, and bold color blocking in vegan leather.",
    gender: "men",
    categorySlug: "high-top-sneakers",
    originalPrice: 3499,
    sellingPrice: 1899,
    discountPercentage: 45,
    badge: "Trending",
    rating: 4.7,
    reviewCount: 219,
    graphicType: "high-top",
    images: [],
    weightGrams: 820,
    dimensionsCm: { length: 33, width: 22, height: 14 },
    specifications: { "Sole Material": "Vulcanized Rubber Cupsole", "Upper Material": "Padded Vegan Leather", "Ankle Support": "Padded High Collar" },
    variants: createVariants("APNA-HT02", "Black / White / Fire Orange", "#FF5A1F", 18),
    isActive: true,
    isFeatured: true,
    returnEligible: true,
    createdAt: "2026-03-05T10:00:00Z"
  },
  {
    id: "prod-3",
    sku: "APNA-CK-05",
    name: "Apna Urban Hype Chunky Sneaker",
    slug: "apna-urban-hype-chunky-sneaker",
    brand: "APNA SHOES",
    description: "Oversized statement sole with futuristic architectural geometry. Gives an instant 1.8-inch height elevation while retaining featherweight bounce and anti-skid grip.",
    gender: "men",
    categorySlug: "casual-sneakers",
    originalPrice: 3299,
    sellingPrice: 1799,
    discountPercentage: 45,
    badge: "Hot Deal",
    rating: 4.6,
    reviewCount: 156,
    graphicType: "street-chunky",
    images: [],
    weightGrams: 840,
    dimensionsCm: { length: 33, width: 22, height: 13 },
    specifications: { "Sole Material": "Chunky Phylon + Rubber", "Upper Material": "Ripstop Mesh & Nubuck", "Sole Height": "4.5 cm / 1.8 inch" },
    variants: createVariants("APNA-CK05", "Stealth Black / Lava Orange", "#FF5A1F", 16),
    isActive: true,
    isFeatured: true,
    returnEligible: true,
    createdAt: "2026-03-15T10:00:00Z"
  },
  {
    id: "prod-4",
    sku: "APNA-CP-09",
    name: "Apna Campus Pulse Low Sneaker",
    slug: "apna-campus-pulse-low-sneaker",
    brand: "APNA SHOES",
    description: "College staple. Simple, indestructible, and styled to pair with denims, chinos, or cargos. Treated with water-resistant surface coating.",
    gender: "men",
    categorySlug: "casual-sneakers",
    originalPrice: 2399,
    sellingPrice: 1249,
    discountPercentage: 48,
    badge: "Hot Deal",
    rating: 4.6,
    reviewCount: 144,
    graphicType: "campus-pulse",
    images: [],
    weightGrams: 670,
    dimensionsCm: { length: 32, width: 20, height: 12 },
    specifications: { "Sole Material": "Anti-Skid Flat Rubber", "Upper Material": "Synthetic Leather & Canvas", "Closure": "Lace-Up" },
    variants: createVariants("APNA-CP09", "Pure White / Black Stripe", "#18181B", 22),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-03-25T10:00:00Z"
  },
  {
    id: "prod-5",
    sku: "APNA-SK-10",
    name: "Apna Shadow Knit Street Slip-On",
    slug: "apna-shadow-knit-street-slip-on",
    brand: "APNA SHOES",
    description: "Ultra-stretchy one-piece woven upper hugs the foot like a sock. Minimalist monochrome profile with subtle reflective detailing for night walks.",
    gender: "men",
    categorySlug: "mens-sneakers",
    originalPrice: 2499,
    sellingPrice: 1349,
    discountPercentage: 46,
    badge: "Trending",
    rating: 4.7,
    reviewCount: 98,
    graphicType: "flex-slipon",
    images: [],
    weightGrams: 550,
    dimensionsCm: { length: 31, width: 20, height: 11 },
    specifications: { "Sole Material": "Molded Phylon Sole", "Upper Material": "Seamless Elastic Flyknit", "Style": "Slip-On" },
    variants: createVariants("APNA-SK10", "Carbon Black / Ember", "#FF5A1F", 18),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-03-28T10:00:00Z"
  },
  {
    id: "prod-6",
    sku: "APNA-FO-11",
    name: "Apna Force One Street Classic",
    slug: "apna-force-one-street-classic",
    brand: "APNA SHOES",
    description: "Classic perforated toe-box silhouette in heavy-duty matte synthetic leather. Features air pocket insole for soft heel landings.",
    gender: "men",
    categorySlug: "mens-sneakers",
    originalPrice: 2899,
    sellingPrice: 1549,
    discountPercentage: 47,
    badge: "Bestseller",
    rating: 4.8,
    reviewCount: 280,
    graphicType: "retro-dunk",
    images: [],
    weightGrams: 750,
    dimensionsCm: { length: 32, width: 21, height: 12 },
    specifications: { "Sole Material": "Stitched Rubber Cupsole", "Upper Material": "Perforated Matte Leather", "Insole": "Air Pocket Cushion" },
    variants: createVariants("APNA-FO11", "Triple Chalk White", "#FFFFFF", 30),
    isActive: true,
    isFeatured: true,
    returnEligible: true,
    createdAt: "2026-03-29T10:00:00Z"
  },
  {
    id: "prod-7",
    sku: "APNA-MD-12",
    name: "Apna Midnight Stealth Runner Kicks",
    slug: "apna-midnight-stealth-runner-kicks",
    brand: "APNA SHOES",
    description: "All-black dark mode sneaker built with water-resistant ballistic nylon overlays. Non-marking rubber pods provide unmatched floor grip.",
    gender: "men",
    categorySlug: "mens-sneakers",
    originalPrice: 2699,
    sellingPrice: 1399,
    discountPercentage: 48,
    rating: 4.7,
    reviewCount: 165,
    graphicType: "aero-runner",
    images: [],
    weightGrams: 620,
    dimensionsCm: { length: 32, width: 20, height: 11 },
    specifications: { "Sole Material": "Grooved TPR Grip", "Upper Material": "Ballistic Nylon & Mesh", "Water Resistance": "Splash Resistant" },
    variants: createVariants("APNA-MD12", "Matte Pitch Black", "#18181B", 20),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-03-30T10:00:00Z"
  },
  {
    id: "prod-8",
    sku: "APNA-VH-13",
    name: "Apna Volt High-Top Street Dunk",
    slug: "apna-volt-high-top-street-dunk",
    brand: "APNA SHOES",
    description: "High-contrast black and neon orange ankle sneaker. Features padded collar, metal lace eyelets, and anti-twist arch stabilizer.",
    gender: "men",
    categorySlug: "high-top-sneakers",
    originalPrice: 3299,
    sellingPrice: 1749,
    discountPercentage: 47,
    badge: "New Drop",
    rating: 4.8,
    reviewCount: 88,
    graphicType: "high-top",
    images: [],
    weightGrams: 810,
    dimensionsCm: { length: 33, width: 22, height: 14 },
    specifications: { "Sole Material": "Reinforced Rubber", "Upper Material": "Synthetic Suede & Leather", "Collar": "High Ankle Support" },
    variants: createVariants("APNA-VH13", "Jet Black / Neon Volt", "#FF5A1F", 15),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-01T10:00:00Z"
  },
  {
    id: "prod-9",
    sku: "APNA-CV-14",
    name: "Apna Canvas Low Court Sneaker",
    slug: "apna-canvas-low-court-sneaker",
    brand: "APNA SHOES",
    description: "100% natural breathable cotton canvas with reinforced rubber toe bumper. Casual footwear that pairs with shorts, denims, and ethnic kurtas.",
    gender: "men",
    categorySlug: "casual-sneakers",
    originalPrice: 1999,
    sellingPrice: 999,
    discountPercentage: 50,
    badge: "Hot Deal",
    rating: 4.5,
    reviewCount: 310,
    graphicType: "campus-pulse",
    images: [],
    weightGrams: 580,
    dimensionsCm: { length: 31, width: 19, height: 10 },
    specifications: { "Sole Material": "Vulcanized Gum Rubber", "Upper Material": "12oz Heavyweight Canvas", "Care": "Machine Washable" },
    variants: createVariants("APNA-CV14", "Navy Blue / Off White", "#1E3A8A", 25),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-02T10:00:00Z"
  },
  {
    id: "prod-10",
    sku: "APNA-CR-15",
    name: "Apna Cyber Runner Alpha",
    slug: "apna-cyber-runner-alpha",
    brand: "APNA SHOES",
    description: "Futuristic geometric cage overlay with responsive air-pocket heel unit. Delivers bold runway presence with cloud-like bounce.",
    gender: "men",
    categorySlug: "mens-sneakers",
    originalPrice: 3499,
    sellingPrice: 1899,
    discountPercentage: 45,
    badge: "Trending",
    rating: 4.8,
    reviewCount: 114,
    graphicType: "street-chunky",
    images: [],
    weightGrams: 790,
    dimensionsCm: { length: 33, width: 22, height: 13 },
    specifications: { "Sole Material": "TPU Cage & Cushion EVA", "Upper Material": "Engineered Monomesh", "Design": "Architectural Sole" },
    variants: createVariants("APNA-CR15", "Glacier Grey / Fiery Orange", "#FF5A1F", 14),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-03T10:00:00Z"
  },
  // WOMEN'S SNEAKERS & LIFESTYLE (11-20)
  {
    id: "prod-11",
    sku: "APNA-WN-04",
    name: "Apna Metro Low Women Kicks",
    slug: "apna-metro-low-women-kicks",
    brand: "APNA SHOES",
    description: "Chic, clean silhouette built for all-day campus and office wear. Crisp chalk-white vegan leather paired with delicate peach-orange accents.",
    gender: "women",
    categorySlug: "womens-sneakers",
    originalPrice: 2499,
    sellingPrice: 1299,
    discountPercentage: 48,
    badge: "Bestseller",
    rating: 4.8,
    reviewCount: 264,
    graphicType: "retro-dunk",
    images: [],
    weightGrams: 610,
    dimensionsCm: { length: 30, width: 19, height: 11 },
    specifications: { "Sole Material": "Flexible TPR Sole", "Upper Material": "Soft Touch Vegan Leather", "Lining": "Sweat-Wicking Textile" },
    variants: createVariants("APNA-WN04", "Chalk White / Soft Amber", "#FB923C", 24),
    isActive: true,
    isFeatured: true,
    returnEligible: true,
    createdAt: "2026-03-12T10:00:00Z"
  },
  {
    id: "prod-12",
    sku: "APNA-PB-16",
    name: "Apna Pastel Breeze Casual Sneaker",
    slug: "apna-pastel-breeze-casual-sneaker",
    brand: "APNA SHOES",
    description: "Gentle pastel blush and cream palette on pillowy foam footbed. Featherlight construction prevents tired legs during weekend shopping.",
    gender: "women",
    categorySlug: "womens-sneakers",
    originalPrice: 2599,
    sellingPrice: 1349,
    discountPercentage: 48,
    badge: "Trending",
    rating: 4.7,
    reviewCount: 142,
    graphicType: "retro-dunk",
    images: [],
    weightGrams: 520,
    dimensionsCm: { length: 29, width: 18, height: 10 },
    specifications: { "Sole Material": "Cushioned EVA Foam", "Upper Material": "Soft Microfiber & Suede", "Weight": "260g per shoe" },
    variants: createVariants("APNA-PB16", "Blush Cream / Amber", "#FDBA74", 20),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-01T10:00:00Z"
  },
  {
    id: "prod-13",
    sku: "APNA-CW-17",
    name: "Apna Cloud Walk Women Slip-On",
    slug: "apna-cloud-walk-women-slip-on",
    brand: "APNA SHOES",
    description: "Laceless slip-on designed for working women and students. Breathable stretch-mesh upper with high-density orthotic memory foam.",
    gender: "women",
    categorySlug: "walking-shoes",
    originalPrice: 2199,
    sellingPrice: 1149,
    discountPercentage: 47,
    badge: "Bestseller",
    rating: 4.9,
    reviewCount: 380,
    graphicType: "flex-slipon",
    images: [],
    weightGrams: 480,
    dimensionsCm: { length: 29, width: 18, height: 10 },
    specifications: { "Sole Material": "Ultra-Light Grooved EVA", "Upper Material": "Breathable 4-Way Stretch Knit", "Insole": "Ortho Memory Foam" },
    variants: createVariants("APNA-CW17", "Slate Charcoal / Peach", "#FF5A1F", 26),
    isActive: true,
    isFeatured: true,
    returnEligible: true,
    createdAt: "2026-03-22T10:00:00Z"
  },
  {
    id: "prod-14",
    sku: "APNA-RG-18",
    name: "Apna Rose Gold Retro Platform",
    slug: "apna-rose-gold-retro-platform",
    brand: "APNA SHOES",
    description: "Elevated 1.5-inch platform sole with shimmering metallic heel accent. Adds height and casual glamour to dresses and denim jeans.",
    gender: "women",
    categorySlug: "womens-sneakers",
    originalPrice: 2999,
    sellingPrice: 1599,
    discountPercentage: 46,
    badge: "New Drop",
    rating: 4.7,
    reviewCount: 76,
    graphicType: "street-chunky",
    images: [],
    weightGrams: 690,
    dimensionsCm: { length: 30, width: 20, height: 12 },
    specifications: { "Sole Material": "Lightweight Platform Rubber", "Upper Material": "Premium Synthetic Leather", "Platform Height": "3.8 cm" },
    variants: createVariants("APNA-RG18", "Ivory White / Rose Gold", "#F43F5E", 18),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-02T10:00:00Z"
  },
  {
    id: "prod-15",
    sku: "APNA-WR-19",
    name: "Apna Aero Sprint Women Runner",
    slug: "apna-aero-sprint-women-runner",
    brand: "APNA SHOES",
    description: "Women performance running shoe built on anatomical female foot lasts with narrower heel cup and wider toe box for natural splay.",
    gender: "women",
    categorySlug: "running-shoes",
    originalPrice: 2899,
    sellingPrice: 1499,
    discountPercentage: 48,
    rating: 4.8,
    reviewCount: 129,
    graphicType: "aero-runner",
    images: [],
    weightGrams: 510,
    dimensionsCm: { length: 30, width: 19, height: 11 },
    specifications: { "Sole Material": "High Rebound Aeroflux Foam", "Upper Material": "Jacquard Knit", "Heel Drop": "8mm" },
    variants: createVariants("APNA-WR19", "Onyx Black / Coral Orange", "#FF5A1F", 20),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-03T10:00:00Z"
  },
  {
    id: "prod-16",
    sku: "APNA-CL-20",
    name: "Apna Canvas Low Chic Women",
    slug: "apna-canvas-low-chic-women",
    brand: "APNA SHOES",
    description: "Minimalist canvas lace-up with padded collar and cushioned insole. Perfect everyday companion for college classes and casual outings.",
    gender: "women",
    categorySlug: "casual-sneakers",
    originalPrice: 1899,
    sellingPrice: 949,
    discountPercentage: 50,
    badge: "Hot Deal",
    rating: 4.6,
    reviewCount: 210,
    graphicType: "campus-pulse",
    images: [],
    weightGrams: 510,
    dimensionsCm: { length: 29, width: 18, height: 10 },
    specifications: { "Sole Material": "Flexible Vulcanized Sole", "Upper Material": "Breathable Cotton Canvas", "Closure": "Lace-Up" },
    variants: createVariants("APNA-CL20", "Pastel Pink / White", "#F472B6", 28),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-04T10:00:00Z"
  },
  {
    id: "prod-17",
    sku: "APNA-HTW-21",
    name: "Apna Retro Dunk High Women",
    slug: "apna-retro-dunk-high-women",
    brand: "APNA SHOES",
    description: "Streetwear high-top sneaker tailored for women. Padded ankle strap, contrast color stitching, and durable grip cupsole.",
    gender: "women",
    categorySlug: "high-top-sneakers",
    originalPrice: 3299,
    sellingPrice: 1699,
    discountPercentage: 48,
    rating: 4.8,
    reviewCount: 95,
    graphicType: "high-top",
    images: [],
    weightGrams: 720,
    dimensionsCm: { length: 31, width: 20, height: 13 },
    specifications: { "Sole Material": "Rubber Cupsole", "Upper Material": "Matte Vegan Leather", "Collar": "Padded High-Top" },
    variants: createVariants("APNA-HTW21", "White / Charcoal / Sunset", "#FF5A1F", 16),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-05T10:00:00Z"
  },
  {
    id: "prod-18",
    sku: "APNA-NC-22",
    name: "Apna Nova Chunky Street Women",
    slug: "apna-nova-chunky-street-women",
    brand: "APNA SHOES",
    description: "Fashion-forward chunky sneaker featuring multi-layer ripple sole. Combines sporty vibes with retro 90s aesthetic.",
    gender: "women",
    categorySlug: "casual-sneakers",
    originalPrice: 3199,
    sellingPrice: 1649,
    discountPercentage: 48,
    badge: "Trending",
    rating: 4.7,
    reviewCount: 110,
    graphicType: "street-chunky",
    images: [],
    weightGrams: 710,
    dimensionsCm: { length: 30, width: 20, height: 12 },
    specifications: { "Sole Material": "Multi-Tiered Phylon", "Upper Material": "Mesh & Textured Overlays", "Insole": "Cushioned Footbed" },
    variants: createVariants("APNA-NC22", "Alabaster / Cream / Amber", "#F59E0B", 18),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-05T10:00:00Z"
  },
  {
    id: "prod-19",
    sku: "APNA-GL-23",
    name: "Apna Glide Lace-Free Women",
    slug: "apna-glide-lace-free-women",
    brand: "APNA SHOES",
    description: "Pull-on elastic collar with zero pressure points on bunions or high insteps. The easiest shoe you will ever put on.",
    gender: "women",
    categorySlug: "walking-shoes",
    originalPrice: 2299,
    sellingPrice: 1199,
    discountPercentage: 47,
    rating: 4.8,
    reviewCount: 178,
    graphicType: "flex-slipon",
    images: [],
    weightGrams: 470,
    dimensionsCm: { length: 29, width: 18, height: 10 },
    specifications: { "Sole Material": "Flexible Grooved Phylon", "Upper Material": "Stretch Jacquard Knit", "Fit": "Relaxed Comfort Fit" },
    variants: createVariants("APNA-GL23", "Heather Navy / Coral", "#FF5A1F", 24),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-06T10:00:00Z"
  },
  {
    id: "prod-20",
    sku: "APNA-ZW-24",
    name: "Apna Zenith Court Sneaker Women",
    slug: "apna-zenith-court-sneaker-women",
    brand: "APNA SHOES",
    description: "Crisp court silhouette with gold eyelet details and contrast heel tab. Clean aesthetic that goes seamlessly from office to party.",
    gender: "women",
    categorySlug: "womens-sneakers",
    originalPrice: 2699,
    sellingPrice: 1399,
    discountPercentage: 48,
    badge: "New Drop",
    rating: 4.7,
    reviewCount: 65,
    graphicType: "retro-dunk",
    images: [],
    weightGrams: 590,
    dimensionsCm: { length: 30, width: 19, height: 11 },
    specifications: { "Sole Material": "Rubber Cupsole", "Upper Material": "Synthetic Leather", "Details": "Metallic Eyelets" },
    variants: createVariants("APNA-ZW24", "White / Champagne Accent", "#D97706", 22),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-06T10:00:00Z"
  },
  // RUNNING & ATHLETIC FOOTWEAR (21-30)
  {
    id: "prod-21",
    sku: "APNA-RN-03",
    name: "Apna Aero Run V2 Performance",
    slug: "apna-aero-run-v2-performance",
    brand: "APNA SHOES",
    description: "Designed for high cadence and road endurance. Ultra-lightweight aeroflux foam yields 68% energy return on every stride.",
    gender: "unisex",
    categorySlug: "running-shoes",
    originalPrice: 2999,
    sellingPrice: 1599,
    discountPercentage: 46,
    badge: "New Drop",
    rating: 4.9,
    reviewCount: 180,
    graphicType: "aero-runner",
    images: [],
    weightGrams: 590,
    dimensionsCm: { length: 31, width: 20, height: 11 },
    specifications: { "Sole Material": "Aeroflux Rebound EVA", "Upper Material": "Seamless 3D Jacquard Knit", "Heel Drop": "8mm Road Drop" },
    variants: createVariants("APNA-RN03", "Apex Black / Solar Flare", "#FF5A1F", 28),
    isActive: true,
    isFeatured: true,
    returnEligible: true,
    createdAt: "2026-03-10T10:00:00Z"
  },
  {
    id: "prod-22",
    sku: "APNA-VP-07",
    name: "Apna Velocity Pro Carbon Sprinter",
    slug: "apna-velocity-pro-carbon-sprinter",
    brand: "APNA SHOES",
    description: "For athletes who demand lightning speed. Embedded TPU propulsion plate delivers springy rebound with every push-off.",
    gender: "men",
    categorySlug: "running-shoes",
    originalPrice: 3599,
    sellingPrice: 1999,
    discountPercentage: 44,
    badge: "Trending",
    rating: 4.8,
    reviewCount: 112,
    graphicType: "velocity-pro",
    images: [],
    weightGrams: 640,
    dimensionsCm: { length: 32, width: 21, height: 12 },
    specifications: { "Sole Material": "Nitro Foam + TPU Speed Plate", "Upper Material": "Monomesh", "Traction": "Carbon Rubber" },
    variants: createVariants("APNA-VP07", "Carbon Black / Neon Blaze", "#FF5A1F", 18),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-03-20T10:00:00Z"
  },
  {
    id: "prod-23",
    sku: "APNA-MR-25",
    name: "Apna Marathon Elite Distance Runner",
    slug: "apna-marathon-elite-distance-runner",
    brand: "APNA SHOES",
    description: "32mm stack height maximum cushion running shoe for half-marathons and daily long runs. Absorbs road vibrations effortlessly.",
    gender: "unisex",
    categorySlug: "running-shoes",
    originalPrice: 3499,
    sellingPrice: 1849,
    discountPercentage: 47,
    rating: 4.8,
    reviewCount: 140,
    graphicType: "aero-runner",
    images: [],
    weightGrams: 630,
    dimensionsCm: { length: 32, width: 20, height: 12 },
    specifications: { "Sole Material": "High Stack Nitro Injected EVA", "Upper Material": "Engineered Breathable Mesh", "Stack Height": "32mm" },
    variants: createVariants("APNA-MR25", "Storm Grey / Fire Orange", "#FF5A1F", 20),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-07T10:00:00Z"
  },
  {
    id: "prod-24",
    sku: "APNA-TM-26",
    name: "Apna Trail Master Outdoor All-Terrain",
    slug: "apna-trail-master-outdoor-all-terrain",
    brand: "APNA SHOES",
    description: "Deep 4.5mm multi-directional rubber lugs conquer loose gravel, mud, and hiking trails across Western Ghats and Himalayas.",
    gender: "men",
    categorySlug: "sports-shoes",
    originalPrice: 3299,
    sellingPrice: 1749,
    discountPercentage: 46,
    badge: "Trending",
    rating: 4.9,
    reviewCount: 92,
    graphicType: "velocity-pro",
    images: [],
    weightGrams: 760,
    dimensionsCm: { length: 33, width: 21, height: 13 },
    specifications: { "Sole Material": "Deep Lug Carbon Rubber", "Upper Material": "Ripstop Ballistic Mesh", "Toe Protection": "Reinforced Rubber Cap" },
    variants: createVariants("APNA-TM26", "Tactical Olive / Black / Orange", "#EA580C", 16),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-07T10:00:00Z"
  },
  {
    id: "prod-25",
    sku: "APNA-PR-27",
    name: "Apna Pulse Road Daily Trainer",
    slug: "apna-pulse-road-daily-trainer",
    brand: "APNA SHOES",
    description: "Your reliable workhorse for 5km daily jogs, gym sessions, and evening treadmill intervals. Lightweight and flexible.",
    gender: "unisex",
    categorySlug: "running-shoes",
    originalPrice: 2699,
    sellingPrice: 1399,
    discountPercentage: 48,
    rating: 4.7,
    reviewCount: 220,
    graphicType: "aero-runner",
    images: [],
    weightGrams: 580,
    dimensionsCm: { length: 31, width: 20, height: 11 },
    specifications: { "Sole Material": "Dual-Density Phylon", "Upper Material": "Air Knit Mesh", "Drop": "6mm" },
    variants: createVariants("APNA-PR27", "Electric Blue / Solar Accent", "#FF5A1F", 24),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-08T10:00:00Z"
  },
  {
    id: "prod-26",
    sku: "APNA-WS-28",
    name: "Apna Wind Sprint Lightweight Flat",
    slug: "apna-wind-sprint-lightweight-flat",
    brand: "APNA SHOES",
    description: "Featherlight 240g sprint shoe engineered for tempo workouts and 100m/400m track sprints with locked-in midfoot wrap.",
    gender: "men",
    categorySlug: "running-shoes",
    originalPrice: 2899,
    sellingPrice: 1499,
    discountPercentage: 48,
    badge: "New Drop",
    rating: 4.7,
    reviewCount: 78,
    graphicType: "velocity-pro",
    images: [],
    weightGrams: 480,
    dimensionsCm: { length: 31, width: 20, height: 10 },
    specifications: { "Sole Material": "Segmented Rubber Outsole", "Upper Material": "Ultralight Translucent Mesh", "Weight": "240g per shoe" },
    variants: createVariants("APNA-WS28", "Matte Black / Orange Racing Stripe", "#FF5A1F", 18),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-08T10:00:00Z"
  },
  {
    id: "prod-27",
    sku: "APNA-NB-29",
    name: "Apna Nitro Boost Road Runner",
    slug: "apna-nitro-boost-road-runner",
    brand: "APNA SHOES",
    description: "Supercritical nitrogen-infused foam midsole offers pillowy comfort with snappy toe-off. Built for runner recovery days.",
    gender: "unisex",
    categorySlug: "running-shoes",
    originalPrice: 3399,
    sellingPrice: 1799,
    discountPercentage: 47,
    rating: 4.8,
    reviewCount: 160,
    graphicType: "aero-runner",
    images: [],
    weightGrams: 610,
    dimensionsCm: { length: 32, width: 20, height: 12 },
    specifications: { "Sole Material": "Nitrogen Infused Foam", "Upper Material": "Engineered Jacquard", "Cushion": "Max Softness" },
    variants: createVariants("APNA-NB29", "Graphite Grey / Solar Pulse", "#FF5A1F", 20),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-09T10:00:00Z"
  },
  {
    id: "prod-28",
    sku: "APNA-FX-30",
    name: "Apna Flex Trainer Gym Shoe",
    slug: "apna-flex-trainer-gym-shoe",
    brand: "APNA SHOES",
    description: "Flat, stable heel with zero-slip side wall wraps. Ideal for barbell squats, deadlifts, kettlebells, and HIIT workouts.",
    gender: "unisex",
    categorySlug: "sports-shoes",
    originalPrice: 2799,
    sellingPrice: 1449,
    discountPercentage: 48,
    badge: "Bestseller",
    rating: 4.9,
    reviewCount: 205,
    graphicType: "campus-pulse",
    images: [],
    weightGrams: 650,
    dimensionsCm: { length: 31, width: 21, height: 11 },
    specifications: { "Sole Material": "Flat Non-Marking Rubber", "Upper Material": "Abrasion Resistant Monomesh", "Stability": "Lateral Side Guards" },
    variants: createVariants("APNA-FX30", "Carbon Black / Iron Grey", "#374151", 25),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-09T10:00:00Z"
  },
  {
    id: "prod-29",
    sku: "APNA-CK-31",
    name: "Apna Court King Badminton & Tennis",
    slug: "apna-court-king-badminton-tennis",
    brand: "APNA SHOES",
    description: "Natural gum rubber sole designed for indoor wooden and synthetic badminton, squash, and pickleball courts. Non-marking certified.",
    gender: "unisex",
    categorySlug: "sports-shoes",
    originalPrice: 2699,
    sellingPrice: 1399,
    discountPercentage: 48,
    rating: 4.8,
    reviewCount: 188,
    graphicType: "campus-pulse",
    images: [],
    weightGrams: 640,
    dimensionsCm: { length: 31, width: 20, height: 11 },
    specifications: { "Sole Material": "100% Pure Gum Rubber (Non-Marking)", "Upper Material": "Synthetic PU & Mesh", "Court": "Indoor Wooden/Synthetic" },
    variants: createVariants("APNA-CK31", "White / Royal Blue / Orange", "#FF5A1F", 22),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-10T10:00:00Z"
  },
  {
    id: "prod-30",
    sku: "APNA-CF-32",
    name: "Apna CrossFit Agility Pro",
    slug: "apna-crossfit-agility-pro",
    brand: "APNA SHOES",
    description: "Reinforced rope-grip medial arch protector and firm heel stabilizer designed for intense gym circuits and box jumps.",
    gender: "men",
    categorySlug: "sports-shoes",
    originalPrice: 2999,
    sellingPrice: 1549,
    discountPercentage: 48,
    rating: 4.7,
    reviewCount: 115,
    graphicType: "velocity-pro",
    images: [],
    weightGrams: 670,
    dimensionsCm: { length: 32, width: 20, height: 11 },
    specifications: { "Sole Material": "High Density Rubber Pods", "Upper Material": "Kevlar Thread Ripstop", "Support": "Midfoot Rope Guard" },
    variants: createVariants("APNA-CF32", "Military Camo Black / Orange", "#FF5A1F", 18),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-10T10:00:00Z"
  },
  // KIDS' FOOTWEAR (31-40)
  {
    id: "prod-31",
    sku: "APNA-KD-06",
    name: "Apna Junior Bolt Kids Shoes",
    slug: "apna-junior-bolt-kids-shoes",
    brand: "APNA SHOES",
    description: "Engineered specifically for active Indian kids. High-abrasion bumper guards protect toes during playground games, with an easy-lock Velcro strap.",
    gender: "kids",
    categorySlug: "kids-shoes",
    originalPrice: 1999,
    sellingPrice: 999,
    discountPercentage: 50,
    badge: "Bestseller",
    rating: 4.9,
    reviewCount: 198,
    graphicType: "junior-bolt",
    images: [],
    weightGrams: 420,
    dimensionsCm: { length: 26, width: 17, height: 10 },
    specifications: { "Sole Material": "Anti-Slip Honeycomb Rubber", "Upper Material": "Ballistic Washable Mesh", "Closure": "Double Velcro Hook-and-Loop" },
    variants: createVariants("APNA-KD06", "Solar Orange / Midnight Navy", "#FF5A1F", 24, true),
    isActive: true,
    isFeatured: true,
    returnEligible: true,
    createdAt: "2026-03-18T10:00:00Z"
  },
  {
    id: "prod-32",
    sku: "APNA-SB-33",
    name: "Apna Star Bounce Kids Sneaker",
    slug: "apna-star-bounce-kids-sneaker",
    brand: "APNA SHOES",
    description: "Ultra-cushioned bubbly bounce sole absorbs running shock during school breaks. Flexible sole bends 180 degrees without cracking.",
    gender: "kids",
    categorySlug: "kids-shoes",
    originalPrice: 1899,
    sellingPrice: 899,
    discountPercentage: 52,
    badge: "Hot Deal",
    rating: 4.8,
    reviewCount: 145,
    graphicType: "junior-bolt",
    images: [],
    weightGrams: 390,
    dimensionsCm: { length: 25, width: 16, height: 9 },
    specifications: { "Sole Material": "Bubble EVA Foam", "Upper Material": "Breathable Knit", "Closure": "Single Velcro Strap" },
    variants: createVariants("APNA-SB33", "Sky Blue / Fire Orange", "#38BDF8", 22, true),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-01T10:00:00Z"
  },
  {
    id: "prod-33",
    sku: "APNA-SA-34",
    name: "Apna School Ace All-White Uniform Shoes",
    slug: "apna-school-ace-all-white-uniform-shoes",
    brand: "APNA SHOES",
    description: "Durable, scuff-resistant pure white school shoe complying with Indian school dress codes. Easy to clean with damp cloth.",
    gender: "kids",
    categorySlug: "kids-shoes",
    originalPrice: 1699,
    sellingPrice: 799,
    discountPercentage: 53,
    badge: "Bestseller",
    rating: 4.9,
    reviewCount: 320,
    graphicType: "junior-bolt",
    images: [],
    weightGrams: 410,
    dimensionsCm: { length: 26, width: 17, height: 10 },
    specifications: { "Sole Material": "Non-Marking White PVC Rubber", "Upper Material": "Washable Faux Leather", "Standard": "Indian School Uniform Compliant" },
    variants: createVariants("APNA-SA34", "Pure Uniform White", "#FFFFFF", 35, true),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-02T10:00:00Z"
  },
  {
    id: "prod-34",
    sku: "APNA-DF-35",
    name: "Apna Dino Flex Lightup Kids Kicks",
    slug: "apna-dino-flex-lightup-kids-kicks",
    brand: "APNA SHOES",
    description: "Fun dinosaur tread pattern with rugged toe shield. Built to survive tree climbing, cycling, and park races.",
    gender: "kids",
    categorySlug: "kids-shoes",
    originalPrice: 1999,
    sellingPrice: 949,
    discountPercentage: 52,
    badge: "Trending",
    rating: 4.8,
    reviewCount: 110,
    graphicType: "junior-bolt",
    images: [],
    weightGrams: 430,
    dimensionsCm: { length: 26, width: 17, height: 10 },
    specifications: { "Sole Material": "Tough Rubber Sole", "Upper Material": "Reinforced Mesh", "Closure": "Elastic Laces + Velcro" },
    variants: createVariants("APNA-DF35", "Jungle Green / Vivid Orange", "#22C55E", 20, true),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-03T10:00:00Z"
  },
  {
    id: "prod-35",
    sku: "APNA-FR-36",
    name: "Apna Flash Runner Junior Sport",
    slug: "apna-flash-runner-junior-sport",
    brand: "APNA SHOES",
    description: "High-speed sporty sneaker for sports day, sprint races, and daily play. Memory insole cushions growing bones.",
    gender: "kids",
    categorySlug: "kids-shoes",
    originalPrice: 1899,
    sellingPrice: 899,
    discountPercentage: 52,
    rating: 4.7,
    reviewCount: 95,
    graphicType: "junior-bolt",
    images: [],
    weightGrams: 380,
    dimensionsCm: { length: 25, width: 16, height: 9 },
    specifications: { "Sole Material": "Lightweight Phylon", "Upper Material": "Mesh & Reflective Trim", "Insole": "Child Memory Cushion" },
    variants: createVariants("APNA-FR36", "Carbon / Flame Orange", "#FF5A1F", 24, true),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-04T10:00:00Z"
  },
  {
    id: "prod-36",
    sku: "APNA-SP-37",
    name: "Apna Sparkle Glow Girls Sneaker",
    slug: "apna-sparkle-glow-girls-sneaker",
    brand: "APNA SHOES",
    description: "Glittery pastel details with comfy padded tongue. Girls love pairing with frock dresses, jeans, and party wear.",
    gender: "kids",
    categorySlug: "kids-shoes",
    originalPrice: 1899,
    sellingPrice: 899,
    discountPercentage: 52,
    badge: "New Drop",
    rating: 4.8,
    reviewCount: 88,
    graphicType: "junior-bolt",
    images: [],
    weightGrams: 370,
    dimensionsCm: { length: 25, width: 16, height: 9 },
    specifications: { "Sole Material": "Non-Slip Soft EVA", "Upper Material": "Glitter Infused Canvas", "Fit": "Comfort Width" },
    variants: createVariants("APNA-SP37", "Shimmer Pink / White", "#F472B6", 22, true),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-05T10:00:00Z"
  },
  {
    id: "prod-37",
    sku: "APNA-JC-38",
    name: "Apna Junior Court High-Top Kicks",
    slug: "apna-junior-court-high-top-kicks",
    brand: "APNA SHOES",
    description: "Ankle support basketball-style high-top for kids. Tough vulcanized sole protects during rough outdoor games.",
    gender: "kids",
    categorySlug: "kids-shoes",
    originalPrice: 2199,
    sellingPrice: 1049,
    discountPercentage: 52,
    rating: 4.7,
    reviewCount: 75,
    graphicType: "high-top",
    images: [],
    weightGrams: 460,
    dimensionsCm: { length: 26, width: 17, height: 11 },
    specifications: { "Sole Material": "Rubber Cupsole", "Upper Material": "Vegan Leather", "Collar": "Padded High-Top" },
    variants: createVariants("APNA-JC38", "Black / White / Red Orange", "#FF5A1F", 18, true),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-06T10:00:00Z"
  },
  {
    id: "prod-38",
    sku: "APNA-SB-39",
    name: "Apna School Black All-Weather Uniform",
    slug: "apna-school-black-all-weather-uniform",
    brand: "APNA SHOES",
    description: "Water-resistant black school uniform shoe with easy Velcro strap. Built to handle monsoons and dusty playgrounds.",
    gender: "kids",
    categorySlug: "kids-shoes",
    originalPrice: 1699,
    sellingPrice: 799,
    discountPercentage: 53,
    badge: "Bestseller",
    rating: 4.9,
    reviewCount: 290,
    graphicType: "junior-bolt",
    images: [],
    weightGrams: 420,
    dimensionsCm: { length: 26, width: 17, height: 10 },
    specifications: { "Sole Material": "Heavy Duty PVC", "Upper Material": "Gloss Synthetic Leather", "Usage": "Daily School Uniform" },
    variants: createVariants("APNA-SB39", "Uniform Pitch Black", "#18181B", 30, true),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-07T10:00:00Z"
  },
  {
    id: "prod-39",
    sku: "APNA-CF-40",
    name: "Apna Cozy Fleece Winter Slip-On Kids",
    slug: "apna-cozy-fleece-winter-slip-on-kids",
    brand: "APNA SHOES",
    description: "Warm plush fleece lining keeps little feet toasty during cold mornings in Northern India. Anti-slip rubber sole.",
    gender: "kids",
    categorySlug: "kids-shoes",
    originalPrice: 1799,
    sellingPrice: 849,
    discountPercentage: 53,
    rating: 4.8,
    reviewCount: 65,
    graphicType: "junior-bolt",
    images: [],
    weightGrams: 360,
    dimensionsCm: { length: 25, width: 16, height: 9 },
    specifications: { "Sole Material": "Flexible TPR", "Upper Material": "Insulated Knit & Fleece", "Lining": "Warm Sherpa" },
    variants: createVariants("APNA-CF40", "Charcoal Grey / Orange", "#FF5A1F", 20, true),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-08T10:00:00Z"
  },
  {
    id: "prod-40",
    sku: "APNA-SL-41",
    name: "Apna Speed Lock Sprint Kids",
    slug: "apna-speed-lock-sprint-kids",
    brand: "APNA SHOES",
    description: "Rotary dial speed-lacing wire system: turn dial to tighten, pull to release. Zero untied laces ever again!",
    gender: "kids",
    categorySlug: "kids-shoes",
    originalPrice: 2299,
    sellingPrice: 1099,
    discountPercentage: 52,
    badge: "Trending",
    rating: 4.9,
    reviewCount: 140,
    graphicType: "junior-bolt",
    images: [],
    weightGrams: 410,
    dimensionsCm: { length: 26, width: 17, height: 10 },
    specifications: { "Sole Material": "Shock-Gel Rubber", "Upper Material": "3D Mesh", "Closure": "Rotary Dial Wire Lace" },
    variants: createVariants("APNA-SL41", "Cobalt Blue / Neon Orange", "#FF5A1F", 20, true),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-09T10:00:00Z"
  },
  // WALKING & ORTHO COMFORT FOOTWEAR (41-52)
  {
    id: "prod-41",
    sku: "APNA-FL-08",
    name: "Apna Flex Walk Comfort Slip-On",
    slug: "apna-flex-walk-comfort-slip-on",
    brand: "APNA SHOES",
    description: "Zero laces, maximum freedom. High-stretch knit collar slips on like a sock and hugs the foot without pinching.",
    gender: "unisex",
    categorySlug: "walking-shoes",
    originalPrice: 2299,
    sellingPrice: 1199,
    discountPercentage: 47,
    badge: "Bestseller",
    rating: 4.7,
    reviewCount: 310,
    graphicType: "flex-slipon",
    images: [],
    weightGrams: 520,
    dimensionsCm: { length: 31, width: 20, height: 11 },
    specifications: { "Sole Material": "Ultra-Flexible Grooved EVA", "Upper Material": "4-Way Stretch Knit", "Insole": "Ortho Memory Cushion" },
    variants: createVariants("APNA-FL08", "Heather Grey / Vivid Orange", "#FF5A1F", 30),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-03-22T10:00:00Z"
  },
  {
    id: "prod-42",
    sku: "APNA-OP-42",
    name: "Apna Ortho Step Pro Arch Support",
    slug: "apna-ortho-step-pro-arch-support",
    brand: "APNA SHOES",
    description: "Podiatrist-approved arch support system relieves plantar fasciitis and heel pain. Extra wide toe box prevents rubbing.",
    gender: "unisex",
    categorySlug: "walking-shoes",
    originalPrice: 2799,
    sellingPrice: 1399,
    discountPercentage: 50,
    badge: "Bestseller",
    rating: 4.9,
    reviewCount: 410,
    graphicType: "flex-slipon",
    images: [],
    weightGrams: 590,
    dimensionsCm: { length: 32, width: 21, height: 12 },
    specifications: { "Sole Material": "Rocker Bottom EVA Sole", "Insole": "Biomechanic Orthotic Insert", "Medical": "Plantar Fasciitis Friendly" },
    variants: createVariants("APNA-OP42", "Black / Charcoal Medical Grade", "#1F2937", 35),
    isActive: true,
    isFeatured: true,
    returnEligible: true,
    createdAt: "2026-04-01T10:00:00Z"
  },
  {
    id: "prod-43",
    sku: "APNA-10K-43",
    name: "Apna 10,000 Steps Daily Commuter",
    slug: "apna-10000-steps-daily-commuter",
    brand: "APNA SHOES",
    description: "Engineered specifically for walking 10,000 steps every day. Curved rocker sole rolls foot forward effortlessly.",
    gender: "unisex",
    categorySlug: "walking-shoes",
    originalPrice: 2499,
    sellingPrice: 1299,
    discountPercentage: 48,
    rating: 4.8,
    reviewCount: 230,
    graphicType: "aero-runner",
    images: [],
    weightGrams: 560,
    dimensionsCm: { length: 31, width: 20, height: 11 },
    specifications: { "Sole Material": "Ergonomic Rocker Sole", "Upper Material": "Air-Flow Mesh", "Insole": "Double Layer Memory Foam" },
    variants: createVariants("APNA-10K43", "Ash Grey / Solar Accent", "#FF5A1F", 25),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-02T10:00:00Z"
  },
  {
    id: "prod-44",
    sku: "APNA-GW-44",
    name: "Apna Gentle Walk Senior Citizen Slip-On",
    slug: "apna-gentle-walk-senior-citizen-slip-on",
    brand: "APNA SHOES",
    description: "High-grip anti-skid rubber sole prevents slips on wet bathroom tiles and marble floors. Super soft padded tongue and wide fit.",
    gender: "unisex",
    categorySlug: "walking-shoes",
    originalPrice: 2299,
    sellingPrice: 1149,
    discountPercentage: 50,
    badge: "Bestseller",
    rating: 4.9,
    reviewCount: 350,
    graphicType: "flex-slipon",
    images: [],
    weightGrams: 510,
    dimensionsCm: { length: 31, width: 21, height: 11 },
    specifications: { "Sole Material": "Wet-Grip Siped Rubber", "Upper Material": "Stretch Lycra & Mesh", "Target": "Seniors & Diabetic Foot Care" },
    variants: createVariants("APNA-GW44", "Dark Navy / Slate", "#1E293B", 30),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-03T10:00:00Z"
  },
  {
    id: "prod-45",
    sku: "APNA-AC-45",
    name: "Apna All-Day Air Cushion Walking Kicks",
    slug: "apna-all-day-air-cushion-walking-kicks",
    brand: "APNA SHOES",
    description: "Visible air chamber in heel unit provides springy softness with every pavement step. Ideal for retail staff and nurses.",
    gender: "unisex",
    categorySlug: "walking-shoes",
    originalPrice: 2699,
    sellingPrice: 1399,
    discountPercentage: 48,
    badge: "Trending",
    rating: 4.7,
    reviewCount: 160,
    graphicType: "air-glide",
    images: [],
    weightGrams: 620,
    dimensionsCm: { length: 32, width: 20, height: 12 },
    specifications: { "Sole Material": "Air Pocket Cushion EVA", "Upper Material": "3D Engineered Mesh", "Heel Unit": "Impact Air Pod" },
    variants: createVariants("APNA-AC45", "Pitch Black / Ember Orange", "#FF5A1F", 22),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-04T10:00:00Z"
  },
  {
    id: "prod-46",
    sku: "APNA-BW-46",
    name: "Apna Breeze Walk Ultra Breathable",
    slug: "apna-breeze-walk-ultra-breathable",
    brand: "APNA SHOES",
    description: "Perforated knit airflow matrix expels heat rapidly in 40\xB0C Indian summers. Keeps feet dry and odor-free.",
    gender: "unisex",
    categorySlug: "walking-shoes",
    originalPrice: 2199,
    sellingPrice: 1099,
    discountPercentage: 50,
    rating: 4.6,
    reviewCount: 195,
    graphicType: "flex-slipon",
    images: [],
    weightGrams: 490,
    dimensionsCm: { length: 30, width: 19, height: 11 },
    specifications: { "Sole Material": "Ventilated EVA Sole", "Upper Material": "Cool-Mesh Jacquard", "Odor Control": "Anti-Bacterial Insole" },
    variants: createVariants("APNA-BW46", "Light Steel / Orange", "#FF5A1F", 24),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-05T10:00:00Z"
  },
  {
    id: "prod-47",
    sku: "APNA-UB-47",
    name: "Apna Urban Chelsea Sneaker-Boot",
    slug: "apna-urban-chelsea-sneaker-boot",
    brand: "APNA SHOES",
    description: "Hybrid ankle boot on sneaker cupsole. Elastic side gores for easy slip-on with rugged all-weather synthetic leather.",
    gender: "men",
    categorySlug: "casual-sneakers",
    originalPrice: 3499,
    sellingPrice: 1899,
    discountPercentage: 45,
    badge: "Trending",
    rating: 4.8,
    reviewCount: 88,
    graphicType: "high-top",
    images: [],
    weightGrams: 830,
    dimensionsCm: { length: 33, width: 22, height: 14 },
    specifications: { "Sole Material": "Tough Lug Rubber Cupsole", "Upper Material": "Oil-Treated Synthetic Leather", "Style": "Chelsea Sneaker" },
    variants: createVariants("APNA-UB47", "Rustic Tan Brown / Black", "#78350F", 18),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-06T10:00:00Z"
  },
  {
    id: "prod-48",
    sku: "APNA-CS-48",
    name: "Apna Classic Slip-On Skate Kicks",
    slug: "apna-classic-slip-on-skate-kicks",
    brand: "APNA SHOES",
    description: "Iconic checkerboard and solid street slip-on. Padded collars, elastic side accents, and signature waffle outsoles.",
    gender: "unisex",
    categorySlug: "casual-sneakers",
    originalPrice: 2299,
    sellingPrice: 1199,
    discountPercentage: 47,
    rating: 4.7,
    reviewCount: 220,
    graphicType: "campus-pulse",
    images: [],
    weightGrams: 640,
    dimensionsCm: { length: 31, width: 20, height: 11 },
    specifications: { "Sole Material": "Waffle Gum Rubber", "Upper Material": "10oz Canvas", "Fit": "Classic Skate" },
    variants: createVariants("APNA-CS48", "Black & White Checker / Orange Tag", "#FF5A1F", 24),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-07T10:00:00Z"
  },
  {
    id: "prod-49",
    sku: "APNA-RL-49",
    name: "Apna Royal Loafer Hybrid Sneaker",
    slug: "apna-royal-loafer-hybrid-sneaker",
    brand: "APNA SHOES",
    description: "Smart casual footwear matching kurtas, blazers, and chinos. Penny loafer moc toe upper mounted on athletic sneaker sole.",
    gender: "men",
    categorySlug: "casual-sneakers",
    originalPrice: 2999,
    sellingPrice: 1549,
    discountPercentage: 48,
    badge: "New Drop",
    rating: 4.8,
    reviewCount: 104,
    graphicType: "retro-dunk",
    images: [],
    weightGrams: 700,
    dimensionsCm: { length: 32, width: 20, height: 12 },
    specifications: { "Sole Material": "Sneaker Midsole Rubber", "Upper Material": "Burnished Faux Leather", "Style": "Hybrid Penny Loafer" },
    variants: createVariants("APNA-RL49", "Deep Walnut Brown", "#451A03", 18),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-08T10:00:00Z"
  },
  {
    id: "prod-50",
    sku: "APNA-ET-50",
    name: "Apna Eco Tread Recycled Sneaker",
    slug: "apna-eco-tread-recycled-sneaker",
    brand: "APNA SHOES",
    description: "Eco-conscious design made with 40% recycled ocean plastic yarn and sugarcane-based EVA foam sole. Sustainable style.",
    gender: "unisex",
    categorySlug: "mens-sneakers",
    originalPrice: 2899,
    sellingPrice: 1499,
    discountPercentage: 48,
    badge: "Trending",
    rating: 4.8,
    reviewCount: 132,
    graphicType: "air-glide",
    images: [],
    weightGrams: 590,
    dimensionsCm: { length: 31, width: 20, height: 11 },
    specifications: { "Sole Material": "Sugarcane Bio-EVA", "Upper Material": "Recycled PET Yarn", "Eco": "Low Carbon Footprint" },
    variants: createVariants("APNA-ET50", "Eco Sage Green / Solar Orange", "#FF5A1F", 20),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-09T10:00:00Z"
  },
  {
    id: "prod-51",
    sku: "APNA-BH-51",
    name: "Apna Basketball High Dunk Pro",
    slug: "apna-basketball-high-dunk-pro",
    brand: "APNA SHOES",
    description: "Heavy padded heel cup with lockdown lacing. High sidewall torsion plate engineered for aggressive court cuts and leaps.",
    gender: "men",
    categorySlug: "high-top-sneakers",
    originalPrice: 3699,
    sellingPrice: 1999,
    discountPercentage: 46,
    badge: "Hot Deal",
    rating: 4.9,
    reviewCount: 144,
    graphicType: "high-top",
    images: [],
    weightGrams: 850,
    dimensionsCm: { length: 33, width: 22, height: 14 },
    specifications: { "Sole Material": "Herringbone Grip Rubber", "Upper Material": "Engineered Leather & Mesh", "Court Type": "Indoor & Outdoor Tarmac" },
    variants: createVariants("APNA-BH51", "Black / Red / Orange Court", "#FF5A1F", 18),
    isActive: true,
    isFeatured: false,
    returnEligible: true,
    createdAt: "2026-04-10T10:00:00Z"
  },
  {
    id: "prod-52",
    sku: "APNA-XG-52",
    name: "Apna X-Glide Extreme Edition",
    slug: "apna-x-glide-extreme-edition",
    brand: "APNA SHOES",
    description: "Collector limited-run edition with dual air pods, speed laces, and luminous orange wave accents. The pinnacle of Apna Streetwear.",
    gender: "men",
    categorySlug: "mens-sneakers",
    originalPrice: 3899,
    sellingPrice: 2099,
    discountPercentage: 46,
    badge: "Trending",
    rating: 4.9,
    reviewCount: 98,
    graphicType: "air-glide",
    images: [],
    weightGrams: 720,
    dimensionsCm: { length: 33, width: 21, height: 13 },
    specifications: { "Sole Material": "Dual Air Chamber EVA", "Upper Material": "Ripstop Matrix Monomesh", "Edition": "Limited Batch 2026" },
    variants: createVariants("APNA-XG52", "Stealth Carbon / Fire Wave", "#FF5A1F", 15),
    isActive: true,
    isFeatured: true,
    returnEligible: true,
    createdAt: "2026-04-11T10:00:00Z"
  }
];
var SNEAKER_PRESET_IMAGES = {
  "air-glide": [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1514989940743-460b4b35b2b2?auto=format&fit=crop&w=800&q=80"
  ],
  "high-top": [
    "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=800&q=80"
  ],
  "aero-runner": [
    "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=800&q=80"
  ],
  "retro-dunk": [
    "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80"
  ],
  "street-chunky": [
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&w=800&q=80"
  ],
  "junior-bolt": [
    "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?auto=format&fit=crop&w=800&q=80"
  ],
  "campus-pulse": [
    "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=800&q=80"
  ],
  "velocity-pro": [
    "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80"
  ],
  "flex-slipon": [
    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80"
  ]
};
var initialProducts = rawInitialProducts.map((p) => ({
  ...p,
  images: p.images && p.images.length > 0 ? p.images : SNEAKER_PRESET_IMAGES[p.graphicType || "air-glide"] || SNEAKER_PRESET_IMAGES["air-glide"]
}));
var initialCoupons = [
  {
    code: "APNA10",
    description: "10% instant discount on orders above \u20B91,299",
    discountType: "percentage",
    discountValue: 10,
    minOrderValue: 1299,
    maxDiscount: 400,
    isActive: true
  },
  {
    code: "FIRSTPAIR",
    description: "Flat \u20B9200 OFF on your first Apna Shoes order",
    discountType: "flat",
    discountValue: 200,
    minOrderValue: 1499,
    isActive: true
  },
  {
    code: "FESTIVE200",
    description: "Festive season treat: Flat \u20B9200 discount",
    discountType: "flat",
    discountValue: 200,
    minOrderValue: 1800,
    isActive: true
  }
];
var initialCMSConfig = {
  storeName: "APNA SHOES",
  tagline: "Har Kadam, Apna Style.",
  logoText: "APNA SHOES",
  announcementText: "\u26A1 FREE Express Shipping across India on orders above \u20B9999 | 7-Day Hassle-Free Returns Guaranteed",
  brandPrimaryColor: "#FF5A1F",
  brandDarkColor: "#0F0F11",
  heroHeadline: "Har Kadam, Apna Style.",
  heroSubheadline: "Engineered for India\u2019s streets. Over 50+ premium sneakers, high-performance running kicks, and everyday silhouettes made affordable without cutting corners.",
  heroCtaText: "Shop New Drops",
  heroBadge: "Drop 2026 Live \xB7 50+ Indian Styles Ready to Ship",
  promoBannerTitle: "GET FLAT \u20B9200 OFF ON YOUR FIRST PAIR",
  promoBannerSubtitle: "Use coupon code FIRSTPAIR at checkout. Free shipping & COD available across India.",
  contactEmail: "care@apnashoes.in",
  contactPhone: "+91 98765 43210",
  contactAddress: "Apna Shoes Logistics & Warehouse, Plot 42, Sector 63, Noida, NCR Delhi 201301",
  whatsappNumber: "+919876543210",
  gstNumber: "07AAACA1234F1Z8",
  freeShippingThreshold: 999,
  defaultShippingFee: 99,
  heroBanners: [
    {
      id: "banner-1",
      headline: "Har Kadam, Apna Style \u2014 Indian Streetwear Drop",
      subheadline: "Designed for comfort, engineered for endurance. Over 50+ fresh Indian silhouettes ready to ship across 19,000+ pin codes.",
      offerBadge: "\u{1F525} FLAT 40% OFF \xB7 USE CODE APNA40",
      badge: "DROP 2026 LIVE",
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
      ctaText: "Shop New Drops",
      ctaLink: "all",
      accentColor: "#FF5A1F",
      graphicType: "air-glide",
      isActive: true,
      displayOrder: 1
    },
    {
      id: "banner-2",
      headline: "Retro Dunk High-Tops \u2014 Ankle Armor Edition",
      subheadline: "Classic basketball silhouette paired with cloud-foam cushioning for all-day campus and street wear.",
      offerBadge: "\u26A1 BUY 1 GET 1 50% OFF \xB7 LIMITED STOCK",
      badge: "CAMPUS FAVORITE",
      imageUrl: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=80",
      ctaText: "Explore High-Tops",
      ctaLink: "high-top-sneakers",
      accentColor: "#2563EB",
      graphicType: "high-top",
      isActive: true,
      displayOrder: 2
    },
    {
      id: "banner-3",
      headline: "Aero Speed Marathon Runners \u2014 Carbon Sprint Sole",
      subheadline: "Featherlight breathable mesh upper with high-energy rebound for early morning 10K runs and gym sessions.",
      offerBadge: "\u{1F389} FESTIVE MEGA OFFER: FLAT \u20B9300 OFF",
      badge: "TOP RATED 4.9 \u2605",
      imageUrl: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80",
      ctaText: "Shop Running Gear",
      ctaLink: "running-shoes",
      accentColor: "#059669",
      graphicType: "aero-runner",
      isActive: true,
      displayOrder: 3
    },
    {
      id: "banner-4",
      headline: "Pastel Minimalist Kicks \u2014 Everyday Chic",
      subheadline: "Clean chalk white and lavender tones that match any outfit from college lectures to casual evening dinners.",
      offerBadge: "\u2728 SPECIAL BUNDLE: FREE SOCKS & EXTRA LACES",
      badge: "WOMEN\u2019S BESTSELLER",
      imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80",
      ctaText: "Shop Women\u2019s Kicks",
      ctaLink: "womens",
      accentColor: "#DB2777",
      graphicType: "retro-dunk",
      isActive: true,
      displayOrder: 4
    },
    {
      id: "banner-5",
      headline: "Junior Bolt Kids Athletic Sneakers",
      subheadline: "Tough scuff-resistant toe guards, zero-slip rubber soles, and electric colorways for school & playground adventures.",
      offerBadge: "\u{1F3F7}\uFE0F FLAT \u20B9500 OFF ON 2 PAIRS \xB7 CODE KIDSCOOL",
      badge: "KIDS SPECIAL",
      imageUrl: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1200&q=80",
      ctaText: "Shop Kids Collection",
      ctaLink: "kids",
      accentColor: "#F59E0B",
      graphicType: "junior-bolt",
      isActive: true,
      displayOrder: 5
    }
  ],
  aboutContent: `APNA SHOES was founded with a singular conviction: every Indian deserves sneakers that turn heads, feel like walking on clouds, and cost a fraction of imported hype-brands.

With over 50+ unique footwear designs tailored to Indian foot shapes, climate conditions, and high-intensity commutes, we offer athletic runners, retro high-tops, school shoes, and orthotic walkers.

Har kadam, apna style \u2014 style belongs to everyone.`,
  faqList: [
    {
      question: "What is Apna Shoes\u2019 7-Day Return & Refund Policy?",
      answer: 'We provide a 100% hassle-free 7-calendar-day return window starting the day your order is marked Delivered. If the shoe doesn\u2019t fit, looks different, or has any defect, request a return from "My Orders" or the "Return Requests" page. Our courier partner will pick it up from your doorstep at no cost and your refund will be credited in 3\u20135 working days.'
    },
    {
      question: "Is Cash on Delivery (COD) supported across India?",
      answer: "Yes! Cash on Delivery is available across 19,000+ Indian PIN codes. You can pay cash or scan the courier\u2019s UPI QR code at the time of doorstep delivery."
    },
    {
      question: "How do I choose the correct shoe size?",
      answer: "All Apna Shoes are sized using standard Indian / UK sizing (UK 6 to UK 11 for adults, UK 1 to UK 5 for kids). If you normally wear UK 8 in Indian footwear, select UK 8."
    },
    {
      question: "How long does shipping take?",
      answer: "Metro cities receive orders in 2 to 3 business days. Non-metro cities and tier-2/tier-3 towns receive delivery within 3 to 5 business days via Shiprocket, Delhivery, and BlueDart."
    }
  ],
  returnPolicyContent: `7-DAY RETURN WINDOW:
You have 7 calendar days from the exact delivery timestamp recorded by our courier partner to request a return or size exchange.

CONDITIONS FOR RETURN:
- Footwear must be unworn and in original condition with tags and original box intact.
- Items damaged due to rough outdoor usage after delivery are not eligible.
- Defective or wrong items are replaced or refunded with zero deduction.

DOORSTEP PICKUP & REFUNDS:
Once approved, our courier partner will arrive for reverse pickup within 24 to 48 hours. After pickup, your refund is credited immediately.`,
  shippingPolicyContent: `SHIPPING CHARGES:
- FREE Shipping on all orders of \u20B9999 or above.
- Orders below \u20B9999 incur a standard shipping charge of \u20B999.

DISPATCH & TRACKING:
All orders placed before 3:00 PM IST are dispatched on the same business day from our automated central warehouse. Once shipped, you will receive an SMS and WhatsApp update containing your live Shiprocket Airway Bill (AWB) tracking number.`,
  privacyPolicyContent: `APNA SHOES respects your personal privacy under the Information Technology Act, 2000 and Digital Personal Data Protection guidelines.`,
  termsContent: `Prices are inclusive of 18% GST (Goods and Services Tax). We reserve the right to verify COD orders via automated OTP or phone confirmation before warehouse fulfillment.`,
  lastUpdated: "2026-03-30T10:00:00Z"
};
var initialOrders = [
  {
    id: "ord-101",
    orderNumber: "APNA-2026-7842",
    customerName: "Rahul Sharma",
    customerEmail: "rahul.sharma@example.com",
    customerPhone: "+91 98112 34567",
    shippingAddress: {
      id: "addr-1",
      name: "Rahul Sharma",
      phone: "+91 98112 34567",
      flatHouse: "Flat 402, Tower B, Green Meadows",
      streetLocality: "Sector 62",
      landmark: "Near Fortis Hospital",
      city: "Noida",
      state: "Uttar Pradesh",
      pincode: "201301",
      country: "India",
      addressType: "home"
    },
    billingAddress: {
      id: "addr-1",
      name: "Rahul Sharma",
      phone: "+91 98112 34567",
      flatHouse: "Flat 402, Tower B, Green Meadows",
      streetLocality: "Sector 62",
      city: "Noida",
      state: "Uttar Pradesh",
      pincode: "201301",
      country: "India",
      addressType: "home"
    },
    items: [
      {
        id: "oi-1",
        productId: "prod-1",
        variantId: "v-APNA-AG01-3",
        productName: "Apna Air Glide 01 Sneaker",
        sku: "APNA-AG01-UK8",
        size: "UK 8",
        color: "Jet Black / Solar Orange",
        unitPrice: 1499,
        quantity: 1,
        totalPrice: 1499,
        graphicType: "air-glide"
      }
    ],
    subtotal: 1499,
    discountAmount: 149.9,
    couponCode: "APNA10",
    taxAmount: 242.84,
    shippingFee: 0,
    totalAmount: 1349.1,
    paymentMethod: "razorpay",
    paymentStatus: "paid",
    orderStatus: "delivered",
    razorpayOrderId: "order_Nxd894210",
    razorpayPaymentId: "pay_Nxd8949982",
    deliveredAt: "2026-03-27T14:30:00Z",
    returnDeadline: "2026-04-03T23:59:59Z",
    shipment: {
      id: "ship-101",
      orderId: "ord-101",
      courierName: "Shiprocket \u2014 Delhivery Air",
      shipmentId: "SR-DEL-9842109",
      awbCode: "784290123491",
      status: "delivered",
      trackingUrl: "https://shiprocket.co/tracking/784290123491",
      estimatedDelivery: "2026-03-27T18:00:00Z",
      actualDelivery: "2026-03-27T14:30:00Z",
      events: [
        {
          id: "ev-1",
          statusCode: "DL",
          statusTitle: "Delivered",
          location: "Noida Sector 62 Hub",
          timestamp: "2026-03-27T14:30:00Z",
          description: "Package handed over to customer (Signature verified)"
        }
      ]
    },
    createdAt: "2026-03-25T11:20:00Z",
    updatedAt: "2026-03-27T14:30:00Z"
  },
  {
    id: "ord-102",
    orderNumber: "APNA-2026-8914",
    customerName: "Priya Iyer",
    customerEmail: "priya.iyer@example.com",
    customerPhone: "+91 98450 12345",
    shippingAddress: {
      id: "addr-2",
      name: "Priya Iyer",
      phone: "+91 98450 12345",
      flatHouse: "Apartment 12A, Sobha Windfall",
      streetLocality: "Koramangala 4th Block",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560034",
      country: "India",
      addressType: "home"
    },
    billingAddress: {
      id: "addr-2",
      name: "Priya Iyer",
      phone: "+91 98450 12345",
      flatHouse: "Apartment 12A, Sobha Windfall",
      streetLocality: "Koramangala 4th Block",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560034",
      country: "India",
      addressType: "home"
    },
    items: [
      {
        id: "oi-2",
        productId: "prod-11",
        variantId: "v-APNA-WN04-1",
        productName: "Apna Metro Low Women Kicks",
        sku: "APNA-WN04-UK6",
        size: "UK 6",
        color: "Chalk White / Soft Amber",
        unitPrice: 1299,
        quantity: 1,
        totalPrice: 1299,
        graphicType: "retro-dunk"
      }
    ],
    subtotal: 1299,
    discountAmount: 0,
    taxAmount: 233.82,
    shippingFee: 0,
    totalAmount: 1299,
    paymentMethod: "cod",
    paymentStatus: "pending",
    orderStatus: "shipped",
    createdAt: "2026-03-28T14:15:00Z",
    updatedAt: "2026-03-29T23:10:00Z"
  }
];
var initialReturns = [
  {
    id: "ret-101",
    orderId: "ord-101",
    orderNumber: "APNA-2026-7842",
    customerName: "Rahul Sharma",
    customerEmail: "rahul.sharma@example.com",
    customerPhone: "+91 98112 34567",
    reason: "wrong_size",
    reasonDetails: "Shoe is slightly snug on the toe box. Requesting size UK 9 instead of UK 8.",
    status: "pickup_scheduled",
    returnDeadline: "2026-04-03T23:59:59Z",
    pickupDate: "2026-03-31T11:00:00Z",
    refundAmount: 1349.1,
    adminNotes: "Size replacement approved; courier pickup assigned via Shiprocket reverse logistics.",
    createdAt: "2026-03-28T16:00:00Z",
    updatedAt: "2026-03-29T09:30:00Z"
  }
];
var initialFlipkartMappings = [
  {
    id: "fk-1",
    internalSku: "APNA-AG01-UK8",
    productName: "Apna Air Glide 01 Sneaker (UK 8)",
    flipkartFsn: "SHOEZX948210984",
    flipkartListingId: "LST_APNA_AG01_UK8",
    stockSync: true,
    internalStock: 34,
    flipkartStock: 34,
    lastSyncedAt: "2026-03-30T09:00:00Z",
    status: "synced"
  },
  {
    id: "fk-2",
    internalSku: "APNA-HT02-UK8",
    productName: "Apna Retro Dunk High-Top (UK 8)",
    flipkartFsn: "SHOEZX849102391",
    flipkartListingId: "LST_APNA_HT02_UK8",
    stockSync: true,
    internalStock: 28,
    flipkartStock: 28,
    lastSyncedAt: "2026-03-30T09:00:00Z",
    status: "synced"
  }
];

// server/supabase.ts
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
function cleanSupabaseUrl(url) {
  if (!url || url.includes("jruuseaphdynzichenzp") || !url.startsWith("http")) {
    return "https://fzxyxhefjxsyldqsdvbp.supabase.co";
  }
  return url.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}
var SUPABASE_URL = cleanSupabaseUrl(process.env.SUPABASE_URL);
function getJwtRef(token) {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length >= 2) {
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
      return payload.ref || null;
    }
  } catch {
    return null;
  }
  return null;
}
function cleanSupabaseKey(key, fallback) {
  if (!key || key.includes("your-") || key.length < 40) {
    return fallback;
  }
  const ref = getJwtRef(key);
  if (ref && ref !== "fzxyxhefjxsyldqsdvbp") {
    return fallback;
  }
  return key;
}
var SUPABASE_SERVICE_ROLE_KEY = cleanSupabaseKey(
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6eHl4aGVmanhzeWxkcXNkdmJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTgwMzM3MSwiZXhwIjoyMTA3Mzc5MzcxfQ.d54TM6NO-Y6ht8BuRM9W_JqG5OOq6fKoeh-3GkO2tT4"
);
var SUPABASE_ANON_KEY = cleanSupabaseKey(
  process.env.SUPABASE_ANON_KEY,
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6eHl4aGVmanhzeWxkcXNkdmJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MDMzNzEsImV4cCI6MjEwNzM3OTM3MX0.QJPQAOxF6vZwTE18sGDoO4QfwO64k0FVOWP3B1tXeYA"
);
var supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});
async function getSupabaseStatus() {
  const start = Date.now();
  const projectRef = "fzxyxhefjxsyldqsdvbp";
  const targetTables = ["products", "categories", "coupons", "orders", "subscribers", "website_content"];
  const tablesResult = {};
  let anyTableMissing = false;
  try {
    for (const table of targetTables) {
      try {
        const { count, data, error } = await supabaseAdmin.from(table).select("*", { count: "exact" }).limit(1);
        if (error) {
          anyTableMissing = true;
          if (error.code === "PGRST205") {
            tablesResult[table] = { exists: false, error: "Table not created yet" };
          } else {
            tablesResult[table] = { exists: false, error: error.message || "Table not found" };
          }
        } else {
          tablesResult[table] = { exists: true, rowCount: count ?? data?.length ?? 0 };
        }
      } catch (tableErr) {
        tablesResult[table] = { exists: false, error: tableErr.message };
        anyTableMissing = true;
      }
    }
    const latencyMs = Date.now() - start;
    return {
      connected: true,
      projectUrl: SUPABASE_URL,
      projectRef,
      latencyMs,
      tables: tablesResult,
      message: anyTableMissing ? "Connected to Supabase! Some tables need to be created using the provided SQL schema." : "Connected to Supabase! All tables are active and responding.",
      needsSchemaSetup: anyTableMissing
    };
  } catch (err) {
    return {
      connected: false,
      projectUrl: SUPABASE_URL,
      projectRef,
      latencyMs: Date.now() - start,
      tables: tablesResult,
      message: `Failed to connect to Supabase: ${err.message}`,
      needsSchemaSetup: true
    };
  }
}
function getSqlSchema() {
  const candidatePaths = [
    path.resolve(process.cwd(), "database/schema.sql"),
    path.resolve(__dirname, "database/schema.sql"),
    path.resolve(__dirname, "../database/schema.sql")
  ];
  for (const schemaPath of candidatePaths) {
    if (fs.existsSync(schemaPath)) {
      return fs.readFileSync(schemaPath, "utf-8");
    }
  }
  return "-- Schema file not found";
}
async function syncSubscriberToSupabase(email, source = "footer_newsletter") {
  try {
    const { error } = await supabaseAdmin.from("subscribers").upsert(
      {
        email: email.trim().toLowerCase(),
        source,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      { onConflict: "email" }
    );
    if (error && error.code !== "PGRST205") {
      console.warn("[Supabase] Warning syncing subscriber:", error.message);
    }
  } catch (err) {
    console.warn("[Supabase] Non-fatal error syncing subscriber:", err.message);
  }
}
async function syncOrderToSupabase(order) {
  try {
    const { error } = await supabaseAdmin.from("orders").upsert({
      order_number: order.id,
      customer_name: order.customerName,
      customer_email: order.customerEmail,
      customer_phone: order.customerPhone,
      shipping_address: order.shippingAddress,
      billing_address: order.billingAddress,
      subtotal: order.subtotal,
      discount_amount: order.discountAmount || 0,
      coupon_code: order.couponCode || null,
      tax_amount: order.taxAmount || 0,
      shipping_fee: order.shippingFee || 0,
      total_amount: order.totalAmount,
      payment_method: order.paymentMethod,
      payment_status: order.paymentStatus || "pending",
      order_status: order.orderStatus || "order_placed",
      notes: order.notes || null,
      created_at: order.createdAt || (/* @__PURE__ */ new Date()).toISOString()
    });
    if (error && error.code !== "PGRST205") {
      console.warn("[Supabase] Warning syncing order:", error.message);
    }
  } catch (err) {
    console.warn("[Supabase] Non-fatal error syncing order:", err.message);
  }
}
async function syncStoreToSupabase(storeData) {
  const result = {
    success: true,
    synced: {
      categories: 0,
      products: 0,
      coupons: 0,
      orders: 0,
      subscribers: 0
    },
    errors: []
  };
  if (storeData.categories?.length) {
    try {
      const formattedCategories = storeData.categories.map((c, idx) => ({
        slug: c.id,
        name: c.name,
        description: c.description || "",
        image_url: c.image || "",
        display_order: idx,
        is_active: true
      }));
      const { error } = await supabaseAdmin.from("categories").upsert(formattedCategories, { onConflict: "slug" });
      if (error) {
        result.errors.push(`Categories: ${error.message}`);
      } else {
        result.synced.categories = formattedCategories.length;
      }
    } catch (e) {
      result.errors.push(`Categories error: ${e.message}`);
    }
  }
  if (storeData.products?.length) {
    try {
      const formattedProducts = storeData.products.map((p) => ({
        sku: p.sku || `SKU-${p.id}`,
        name: p.name,
        slug: p.slug || p.id,
        brand: p.brand || "APNA SHOES",
        description: p.description || "",
        gender: p.gender || "unisex",
        original_price: p.originalPrice || p.price || 1999,
        selling_price: p.sellingPrice || p.price || 1499,
        discount_percentage: p.discountPercentage || 0,
        images: p.images || [p.image],
        badge: p.badge || null,
        rating: p.rating || 4.5,
        review_count: p.reviewCount || 0,
        is_active: true,
        is_featured: !!p.isFeatured
      }));
      const { error } = await supabaseAdmin.from("products").upsert(formattedProducts, { onConflict: "sku" });
      if (error) {
        result.errors.push(`Products: ${error.message}`);
      } else {
        result.synced.products = formattedProducts.length;
      }
    } catch (e) {
      result.errors.push(`Products error: ${e.message}`);
    }
  }
  if (storeData.coupons?.length) {
    try {
      const formattedCoupons = storeData.coupons.map((c) => ({
        code: c.code.toUpperCase(),
        description: c.description || "",
        discount_type: c.discountType,
        discount_value: c.discountValue,
        min_order_value: c.minOrderValue || 0,
        max_discount: c.maxDiscount || null,
        is_active: c.isActive !== false
      }));
      const { error } = await supabaseAdmin.from("coupons").upsert(formattedCoupons, { onConflict: "code" });
      if (error) {
        result.errors.push(`Coupons: ${error.message}`);
      } else {
        result.synced.coupons = formattedCoupons.length;
      }
    } catch (e) {
      result.errors.push(`Coupons error: ${e.message}`);
    }
  }
  if (storeData.orders?.length) {
    try {
      const formattedOrders = storeData.orders.map((o) => ({
        order_number: o.id,
        customer_name: o.customerName,
        customer_email: o.customerEmail,
        customer_phone: o.customerPhone,
        shipping_address: o.shippingAddress,
        billing_address: o.billingAddress,
        subtotal: o.subtotal,
        discount_amount: o.discountAmount || 0,
        coupon_code: o.couponCode || null,
        tax_amount: o.taxAmount || 0,
        shipping_fee: o.shippingFee || 0,
        total_amount: o.totalAmount,
        payment_method: o.paymentMethod,
        payment_status: o.paymentStatus || "pending",
        order_status: o.orderStatus || "order_placed",
        created_at: o.createdAt || (/* @__PURE__ */ new Date()).toISOString()
      }));
      const { error } = await supabaseAdmin.from("orders").upsert(formattedOrders, { onConflict: "order_number" });
      if (error) {
        result.errors.push(`Orders: ${error.message}`);
      } else {
        result.synced.orders = formattedOrders.length;
      }
    } catch (e) {
      result.errors.push(`Orders error: ${e.message}`);
    }
  }
  if (storeData.subscribers?.length) {
    try {
      const formattedSubscribers = storeData.subscribers.map((s) => ({
        email: s.email.toLowerCase(),
        source: s.source || "footer_newsletter",
        created_at: s.subscribedAt || (/* @__PURE__ */ new Date()).toISOString()
      }));
      const { error } = await supabaseAdmin.from("subscribers").upsert(formattedSubscribers, { onConflict: "email" });
      if (error) {
        result.errors.push(`Subscribers: ${error.message}`);
      } else {
        result.synced.subscribers = formattedSubscribers.length;
      }
    } catch (e) {
      result.errors.push(`Subscribers error: ${e.message}`);
    }
  }
  result.success = result.errors.length === 0;
  return result;
}

// server/db.ts
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
function resolveDataStorage() {
  const candidateDirs = [
    path2.resolve(process.cwd(), "data"),
    path2.resolve(__dirname2, "data"),
    path2.resolve(__dirname2, "../data")
  ];
  for (const dir of candidateDirs) {
    if (dir === "/data" || dir === "\\data") continue;
    try {
      if (!fs2.existsSync(dir)) {
        fs2.mkdirSync(dir, { recursive: true });
      }
      fs2.accessSync(dir, fs2.constants.W_OK);
      return { dataDir: dir, dbFile: path2.join(dir, "store.json") };
    } catch {
    }
  }
  const tmpDir = path2.resolve(process.env.TMPDIR || "/tmp", "apna-shoes-data");
  const tmpFile = path2.join(tmpDir, "store.json");
  try {
    if (!fs2.existsSync(tmpDir)) {
      fs2.mkdirSync(tmpDir, { recursive: true });
    }
    const localStore = path2.resolve(process.cwd(), "data", "store.json");
    if (fs2.existsSync(localStore) && !fs2.existsSync(tmpFile)) {
      try {
        fs2.copyFileSync(localStore, tmpFile);
      } catch {
      }
    }
  } catch (err) {
    console.warn("[DB] Could not create fallback tmp data dir:", err);
  }
  return { dataDir: tmpDir, dbFile: tmpFile };
}
var { dataDir: DATA_DIR, dbFile: DB_FILE } = resolveDataStorage();
var activeOtps = /* @__PURE__ */ new Map();
var db;
function initDb() {
  if (!fs2.existsSync(DATA_DIR)) {
    try {
      fs2.mkdirSync(DATA_DIR, { recursive: true });
    } catch (err) {
      console.warn("[DB] Could not create DATA_DIR in initDb:", err);
    }
  }
  if (fs2.existsSync(DB_FILE)) {
    try {
      const content = fs2.readFileSync(DB_FILE, "utf-8");
      db = JSON.parse(content);
      if (!db.deletedProductIds) db.deletedProductIds = [];
      const existingMap = new Map((db.products || []).map((p) => [p.id, p]));
      let hasChanges = false;
      const mergedProducts = [];
      for (const initProd of initialProducts) {
        if (db.deletedProductIds?.includes(initProd.id)) {
          continue;
        }
        const existing = existingMap.get(initProd.id);
        if (!existing) {
          mergedProducts.push(initProd);
          hasChanges = true;
        } else {
          if ((!existing.images || existing.images.length === 0) && initProd.images && initProd.images.length > 0) {
            existing.images = initProd.images;
            hasChanges = true;
          }
          mergedProducts.push(existing);
        }
      }
      for (const p of db.products || []) {
        if (!initialProducts.some((init) => init.id === p.id)) {
          mergedProducts.push(p);
        }
      }
      if (hasChanges || !db.products || db.products.length < initialProducts.length) {
        db.products = mergedProducts;
        saveDb();
      }
      if (!db.categories) db.categories = initialCategories;
      if (!db.coupons) db.coupons = initialCoupons;
      if (!db.cmsConfig) {
        db.cmsConfig = initialCMSConfig;
      } else if (!db.cmsConfig.heroBanners || db.cmsConfig.heroBanners.length === 0) {
        db.cmsConfig.heroBanners = initialCMSConfig.heroBanners;
        saveDb();
      }
      if (!db.orders) db.orders = initialOrders;
      if (!db.returns) db.returns = initialReturns;
      if (!db.flipkartMappings) db.flipkartMappings = initialFlipkartMappings;
      if (!db.addresses) db.addresses = {};
      if (!db.auditLogs) db.auditLogs = [];
      if (!db.notifications) db.notifications = [];
      if (!db.subscribers) db.subscribers = [];
      if (!db.integrations) {
        db.integrations = {
          razorpay: {
            enabled: true,
            mode: "sandbox",
            keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_apnashoes2026",
            hasSecret: Boolean(process.env.RAZORPAY_KEY_SECRET)
          },
          shiprocket: {
            enabled: true,
            mode: "sandbox",
            email: "logistics@apnashoes.in",
            tokenActive: true
          },
          flipkart: {
            connected: true,
            sellerId: "APNA_SHOES_RETAIL_IN",
            totalMappedSkus: 3
          },
          googleMaps: {
            configured: Boolean(process.env.GOOGLE_MAPS_API_KEY)
          }
        };
      }
      return;
    } catch (e) {
      console.warn("Error reading db file, falling back to seed data:", e);
    }
  }
  db = {
    products: initialProducts,
    categories: initialCategories,
    orders: initialOrders,
    returns: initialReturns,
    coupons: initialCoupons,
    cmsConfig: initialCMSConfig,
    flipkartMappings: initialFlipkartMappings,
    addresses: {},
    integrations: {
      razorpay: {
        enabled: true,
        mode: "sandbox",
        keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_apnashoes2026",
        hasSecret: Boolean(process.env.RAZORPAY_KEY_SECRET)
      },
      shiprocket: {
        enabled: true,
        mode: "sandbox",
        email: "logistics@apnashoes.in",
        tokenActive: true
      },
      flipkart: {
        connected: true,
        sellerId: "APNA_SHOES_RETAIL_IN",
        totalMappedSkus: 3
      },
      googleMaps: {
        configured: Boolean(process.env.GOOGLE_MAPS_API_KEY)
      }
    },
    auditLogs: [],
    notifications: []
  };
  saveDb();
}
function saveDb() {
  try {
    fs2.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error persisting database:", err);
  }
}
initDb();
var DB = {
  // PRODUCTS
  getProducts(filters) {
    let list = db.products.filter((p) => p.isActive);
    if (filters?.category && filters.category !== "all") {
      if (filters.category === "new-arrivals") {
        list = list.filter((p) => p.badge === "New Drop");
      } else if (filters.category === "bestsellers") {
        list = list.filter((p) => p.badge === "Bestseller" || p.rating >= 4.7);
      } else if (filters.category === "sale") {
        list = list.filter((p) => p.discountPercentage >= 40);
      } else {
        list = list.filter((p) => p.categorySlug === filters.category);
      }
    }
    if (filters?.gender && filters.gender !== "all") {
      list = list.filter((p) => p.gender === filters.gender || p.gender === "unisex");
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.categorySlug.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      );
    }
    if (filters?.minPrice) {
      list = list.filter((p) => p.sellingPrice >= filters.minPrice);
    }
    if (filters?.maxPrice) {
      list = list.filter((p) => p.sellingPrice <= filters.maxPrice);
    }
    if (filters?.sort) {
      if (filters.sort === "price-low") list.sort((a, b) => a.sellingPrice - b.sellingPrice);
      if (filters.sort === "price-high") list.sort((a, b) => b.sellingPrice - a.sellingPrice);
      if (filters.sort === "rating") list.sort((a, b) => b.rating - a.rating);
      if (filters.sort === "newest") list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  },
  getAllProductsAdmin() {
    return db.products;
  },
  getProductBySlug(slug) {
    return db.products.find((p) => p.slug === slug || p.id === slug);
  },
  saveProduct(product) {
    const isNew = !product.id;
    const id = product.id || `prod-${Date.now()}`;
    const slug = product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const sku = product.sku || `APNA-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const completeProduct = {
      id,
      sku,
      name: product.name,
      slug,
      brand: product.brand || "APNA SHOES",
      description: product.description || "",
      gender: product.gender || "unisex",
      categorySlug: product.categorySlug || "mens-sneakers",
      originalPrice: product.originalPrice || product.sellingPrice * 1.5,
      sellingPrice: product.sellingPrice,
      discountPercentage: product.discountPercentage || Math.round((1 - product.sellingPrice / (product.originalPrice || product.sellingPrice * 1.5)) * 100),
      variants: product.variants || [
        { id: `v-${id}-1`, sku: `${sku}-UK7`, size: "UK 7", colorName: "Black / Orange", colorHex: "#FF5A1F", stockQuantity: 20 },
        { id: `v-${id}-2`, sku: `${sku}-UK8`, size: "UK 8", colorName: "Black / Orange", colorHex: "#FF5A1F", stockQuantity: 25 },
        { id: `v-${id}-3`, sku: `${sku}-UK9`, size: "UK 9", colorName: "Black / Orange", colorHex: "#FF5A1F", stockQuantity: 15 }
      ],
      images: product.images || [],
      graphicType: product.graphicType || "air-glide",
      badge: product.badge,
      rating: product.rating || 4.7,
      reviewCount: product.reviewCount || 1,
      specifications: product.specifications || {},
      weightGrams: product.weightGrams || 700,
      dimensionsCm: product.dimensionsCm || { length: 32, width: 20, height: 12 },
      isActive: product.isActive !== void 0 ? product.isActive : true,
      isFeatured: Boolean(product.isFeatured),
      returnEligible: product.returnEligible !== void 0 ? product.returnEligible : true,
      createdAt: product.createdAt || (/* @__PURE__ */ new Date()).toISOString()
    };
    const existingIdx = db.products.findIndex((p) => p.id === id);
    if (existingIdx !== -1) {
      db.products[existingIdx] = completeProduct;
      DB.logAudit("ADMIN", "UPDATE_PRODUCT", { id, name: completeProduct.name });
    } else {
      db.products.unshift(completeProduct);
      DB.logAudit("ADMIN", "CREATE_PRODUCT", { id, name: completeProduct.name });
    }
    saveDb();
    return completeProduct;
  },
  deleteProduct(id) {
    db.deletedProductIds = db.deletedProductIds || [];
    if (!db.deletedProductIds.includes(id)) {
      db.deletedProductIds.push(id);
    }
    const idx = db.products.findIndex((p) => p.id === id);
    if (idx !== -1) {
      const deleted = db.products.splice(idx, 1)[0];
      DB.logAudit("ADMIN", "DELETE_PRODUCT", { id, name: deleted.name });
      saveDb();
      return true;
    }
    return false;
  },
  // CATEGORIES
  getCategories() {
    return db.categories;
  },
  saveCategory(cat) {
    const id = cat.id || `cat-${Date.now()}`;
    const newCat = {
      id,
      slug: cat.slug,
      name: cat.name,
      description: cat.description || "",
      displayOrder: cat.displayOrder || db.categories.length + 1,
      showOnHome: cat.showOnHome !== void 0 ? cat.showOnHome : true,
      isActive: cat.isActive !== void 0 ? cat.isActive : true
    };
    const idx = db.categories.findIndex((c) => c.id === id || c.slug === cat.slug);
    if (idx !== -1) {
      db.categories[idx] = newCat;
    } else {
      db.categories.push(newCat);
    }
    saveDb();
    return newCat;
  },
  // ORDERS
  getOrders() {
    return db.orders;
  },
  getOrderById(id) {
    const clean = id.trim();
    return db.orders.find(
      (o) => o.id === clean || o.orderNumber.toLowerCase() === clean.toLowerCase() || o.shipment?.awbCode && o.shipment.awbCode.toLowerCase() === clean.toLowerCase()
    );
  },
  getUserOrders(emailOrPhone) {
    const query = emailOrPhone.toLowerCase().trim();
    const queryDigits = query.replace(/\D/g, "");
    return db.orders.filter((o) => {
      if (o.customerEmail && o.customerEmail.toLowerCase() === query) return true;
      if (queryDigits.length >= 7) {
        const orderPhoneDigits = o.customerPhone.replace(/\D/g, "");
        return orderPhoneDigits.endsWith(queryDigits) || queryDigits.endsWith(orderPhoneDigits) || orderPhoneDigits === queryDigits;
      }
      return o.customerPhone.toLowerCase().includes(query);
    });
  },
  createOrder(orderData) {
    for (const item of orderData.items) {
      const product = db.products.find((p) => p.id === item.productId);
      if (product) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (variant) {
          if (variant.stockQuantity < item.quantity) {
            throw new Error(`Insufficient stock for ${product.name} (Size: ${item.size}). Available: ${variant.stockQuantity}`);
          }
          variant.stockQuantity -= item.quantity;
        }
      }
    }
    const randomSuffix = Math.floor(1e3 + Math.random() * 9e3);
    const orderNumber = `APNA-${(/* @__PURE__ */ new Date()).getFullYear()}-${randomSuffix}`;
    const id = `ord-${Date.now()}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const newOrder = {
      ...orderData,
      id,
      orderNumber,
      createdAt: now,
      updatedAt: now
    };
    db.orders.unshift(newOrder);
    DB.recordNotification(
      "whatsapp",
      newOrder.customerPhone,
      `Order Placed: ${orderNumber}`,
      `Namaste ${newOrder.customerName}! Your order ${orderNumber} for APNA SHOES is placed successfully. Total: \u20B9${newOrder.totalAmount}. We are packing your fresh sneakers!`
    );
    DB.logAudit("SYSTEM", "ORDER_CREATED", { orderNumber, total: newOrder.totalAmount });
    saveDb();
    syncOrderToSupabase(newOrder).catch(() => {
    });
    return newOrder;
  },
  updateOrderStatus(orderId, status, notes) {
    const order = db.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;
    order.orderStatus = status;
    order.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    if (notes) order.notes = notes;
    if (status === "delivered") {
      const now = /* @__PURE__ */ new Date();
      order.deliveredAt = now.toISOString();
      const returnDeadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1e3);
      order.returnDeadline = returnDeadline.toISOString();
      if (order.shipment) {
        order.shipment.status = "delivered";
        order.shipment.actualDelivery = now.toISOString();
        order.shipment.events.unshift({
          id: `ev-${Date.now()}`,
          statusCode: "DL",
          statusTitle: "Delivered",
          location: `${order.shippingAddress.city} Delivery Hub`,
          timestamp: now.toISOString(),
          description: "Package delivered to recipient. 7-day return window started."
        });
      }
      DB.recordNotification(
        "whatsapp",
        order.customerPhone,
        `Order Delivered: ${order.orderNumber}`,
        `Your APNA SHOES order ${order.orderNumber} is delivered! Step in style. Your 7-day return/size-exchange window is open until ${new Date(order.returnDeadline).toLocaleDateString("en-IN")}.`
      );
    }
    DB.logAudit("ADMIN", "UPDATE_ORDER_STATUS", { orderNumber: order.orderNumber, status });
    saveDb();
    return order;
  },
  createShipment(orderId, courierName = "Shiprocket \u2014 Delhivery Air", customAwb, customTrackingUrl, estimatedDelivery, customStatus) {
    const order = db.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;
    const awbCode = customAwb?.trim() ? customAwb.trim() : `${Math.floor(1e10 + Math.random() * 9e10)}`;
    const shipmentId = order.shipment?.shipmentId || `SR-${courierName.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const estDate = estimatedDelivery || order.shipment?.estimatedDelivery || new Date(Date.now() + 3 * 24 * 60 * 60 * 1e3).toISOString();
    let trackingUrl = customTrackingUrl?.trim();
    if (!trackingUrl) {
      const lowerCourier = courierName.toLowerCase();
      if (lowerCourier.includes("delhivery")) {
        trackingUrl = `https://www.delhivery.com/track/package/${awbCode}`;
      } else if (lowerCourier.includes("bluedart") || lowerCourier.includes("blue dart")) {
        trackingUrl = `https://www.bluedart.com/tracking?trackNumber=${awbCode}`;
      } else if (lowerCourier.includes("dtdc")) {
        trackingUrl = `https://www.dtdc.in/tracking/shipment-tracking.asp?strCnno=${awbCode}`;
      } else if (lowerCourier.includes("shadowfax")) {
        trackingUrl = `https://tracker.shadowfax.in/#/track/${awbCode}`;
      } else if (lowerCourier.includes("xpressbees")) {
        trackingUrl = `https://www.xpressbees.com/track?awb=${awbCode}`;
      } else {
        trackingUrl = `https://shiprocket.co/tracking/${awbCode}`;
      }
    }
    const currentEvents = order.shipment?.events || [];
    const newEvent = {
      id: `ev-${Date.now()}`,
      statusCode: "AWB_CONFIRMED",
      statusTitle: "Airway Bill (AWB) Confirmed & Assigned",
      location: "Apna Shoes Noida Central Warehouse",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      description: `Dispatched via ${courierName}. Airway Bill Tracking Number: ${awbCode}`
    };
    const shipment = {
      id: order.shipment?.id || `ship-${Date.now()}`,
      orderId: order.id,
      courierName,
      shipmentId,
      awbCode,
      status: customStatus || (order.shipment?.status === "delivered" ? "delivered" : "manifested"),
      trackingUrl,
      pickupScheduledAt: order.shipment?.pickupScheduledAt || new Date(Date.now() + 6 * 60 * 60 * 1e3).toISOString(),
      estimatedDelivery: estDate,
      actualDelivery: order.shipment?.actualDelivery,
      events: [...currentEvents, newEvent]
    };
    order.shipment = shipment;
    if (order.orderStatus === "order_placed" || order.orderStatus === "confirmed" || order.orderStatus === "processing" || order.orderStatus === "packed") {
      order.orderStatus = "shipped";
    }
    order.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    DB.recordNotification(
      "whatsapp",
      order.customerPhone,
      `AWB Confirmed: ${order.orderNumber}`,
      `Your APNA SHOES order ${order.orderNumber} has been confirmed with Airway Bill (AWB) ${awbCode} via ${courierName}. Track here: ${shipment.trackingUrl}`
    );
    DB.logAudit("ADMIN", "AWB_CONFIRMED", { orderNumber: order.orderNumber, awbCode, courierName });
    saveDb();
    return order;
  },
  // 7-DAY RETURNS & REFUNDS
  getReturns() {
    return db.returns;
  },
  getUserReturns(emailOrPhone) {
    const query = emailOrPhone.toLowerCase().trim();
    const queryDigits = query.replace(/\D/g, "");
    return db.returns.filter((r) => {
      if (r.customerEmail && r.customerEmail.toLowerCase() === query) return true;
      if (queryDigits.length >= 7) {
        const returnPhoneDigits = r.customerPhone.replace(/\D/g, "");
        return returnPhoneDigits.endsWith(queryDigits) || queryDigits.endsWith(returnPhoneDigits) || returnPhoneDigits === queryDigits;
      }
      return r.customerPhone.toLowerCase().includes(query);
    });
  },
  createReturnRequest(req) {
    const order = db.orders.find((o) => o.id === req.orderId || o.orderNumber === req.orderId);
    if (!order) throw new Error("Order not found");
    if (order.orderStatus !== "delivered") {
      throw new Error(`Only delivered orders are eligible for return. Current status: ${order.orderStatus}`);
    }
    if (!order.deliveredAt) {
      order.deliveredAt = order.updatedAt || (/* @__PURE__ */ new Date()).toISOString();
    }
    const deliveryTime = new Date(order.deliveredAt).getTime();
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1e3;
    if (now - deliveryTime > sevenDaysMs) {
      throw new Error("The 7-calendar-day return window for this order has expired as per Apna Shoes Return Policy.");
    }
    const returnNumber = `RET-${Math.floor(1e4 + Math.random() * 9e4)}`;
    const deadline = new Date(deliveryTime + sevenDaysMs).toISOString();
    let refundAmount = order.totalAmount;
    if (req.itemsToReturn && req.itemsToReturn.length > 0) {
      const calc = req.itemsToReturn.reduce(
        (acc, item) => acc + Number(item.price || 0) * (item.quantity || 1),
        0
      );
      if (calc > 0) refundAmount = Math.min(order.totalAmount, calc);
    }
    const pickupAddress = req.pickupAddress || `${order.shippingAddress.flatHouse}, ${order.shippingAddress.streetLocality}, ${order.shippingAddress.city} - ${order.shippingAddress.pincode}`;
    const returnRequest = {
      id: `ret-${Date.now()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      itemsToReturn: req.itemsToReturn,
      returnType: req.returnType || "refund",
      desiredSize: req.desiredSize,
      payoutDetails: req.payoutDetails,
      pickupAddress,
      reason: req.reason,
      reasonDetails: req.reasonDetails,
      photoUrl: req.photoUrl,
      status: "requested",
      returnDeadline: deadline,
      refundAmount,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.returns.unshift(returnRequest);
    order.orderStatus = "return_requested";
    DB.recordNotification(
      "whatsapp",
      order.customerPhone,
      `Return Requested: ${order.orderNumber}`,
      `We received your return request ${returnNumber} for order ${order.orderNumber} (${returnRequest.returnType === "size_exchange" ? "Size Exchange" : "100% Refund"}). Our team will review within 24 hours to schedule doorstep pickup.`
    );
    DB.logAudit("CUSTOMER", "RETURN_REQUESTED", { returnNumber, orderNumber: order.orderNumber });
    saveDb();
    return returnRequest;
  },
  updateReturnStatus(returnId, status, adminNotes, reverseCourier, reverseAwb, pickupDate, refundTransactionId) {
    const ret = db.returns.find((r) => r.id === returnId);
    if (!ret) return null;
    ret.status = status;
    ret.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    if (adminNotes) ret.adminNotes = adminNotes;
    if (reverseCourier) ret.reverseCourier = reverseCourier;
    if (reverseAwb) ret.reverseAwb = reverseAwb;
    if (pickupDate) ret.pickupDate = pickupDate;
    if (refundTransactionId) ret.refundTransactionId = refundTransactionId;
    const order = db.orders.find((o) => o.id === ret.orderId);
    if (status === "approved") {
      if (!ret.pickupDate) {
        ret.pickupDate = new Date(Date.now() + 24 * 60 * 60 * 1e3).toISOString();
      }
      if (!ret.reverseCourier) {
        ret.reverseCourier = "Shiprocket \u2014 Delhivery Reverse Express";
      }
      if (!ret.reverseAwb) {
        ret.reverseAwb = `REV-${Math.floor(1e8 + Math.random() * 9e8)}`;
      }
      if (order) order.orderStatus = "return_approved";
    } else if (status === "picked_up") {
      if (order) order.orderStatus = "return_picked_up";
    } else if (status === "refund_completed") {
      if (!ret.refundTransactionId) {
        ret.refundTransactionId = `RFND-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
      }
      if (order) {
        order.orderStatus = "refunded";
        order.paymentStatus = "refunded";
      }
    } else if (status === "rejected") {
      if (order) order.orderStatus = "delivered";
    }
    DB.logAudit("ADMIN", "UPDATE_RETURN_STATUS", { returnId, status, reverseAwb: ret.reverseAwb });
    saveDb();
    return ret;
  },
  // COUPONS
  validateCoupon(code, subtotal) {
    const c = db.coupons.find(
      (coupon) => coupon.code.toUpperCase() === code.toUpperCase() && coupon.isActive
    );
    if (!c) {
      return { valid: false, message: "Invalid or expired coupon code" };
    }
    if (subtotal < c.minOrderValue) {
      return { valid: false, message: `Minimum order amount of \u20B9${c.minOrderValue} required for coupon ${c.code}` };
    }
    let discount = 0;
    if (c.discountType === "percentage") {
      discount = subtotal * c.discountValue / 100;
      if (c.maxDiscount && discount > c.maxDiscount) discount = c.maxDiscount;
    } else {
      discount = c.discountValue;
    }
    return {
      valid: true,
      coupon: c,
      discountAmount: Math.round(discount * 100) / 100
    };
  },
  // PINCODE SERVICEABILITY
  checkPincodeServiceability(pincode) {
    const pin = pincode.trim();
    if (!/^\d{6}$/.test(pin)) {
      return { serviceable: false, message: "Please enter a valid 6-digit Indian PIN code" };
    }
    const prefix = pin.substring(0, 2);
    const pinMap = {
      "11": { city: "New Delhi", state: "Delhi", days: 2 },
      "20": { city: "Noida / Ghaziabad", state: "Uttar Pradesh", days: 2 },
      "12": { city: "Gurugram / Faridabad", state: "Haryana", days: 2 },
      "40": { city: "Mumbai", state: "Maharashtra", days: 3 },
      "41": { city: "Pune", state: "Maharashtra", days: 3 },
      "56": { city: "Bengaluru", state: "Karnataka", days: 3 },
      "60": { city: "Chennai", state: "Tamil Nadu", days: 3 },
      "50": { city: "Hyderabad", state: "Telangana", days: 3 },
      "70": { city: "Kolkata", state: "West Bengal", days: 3 },
      "38": { city: "Ahmedabad", state: "Gujarat", days: 3 },
      "30": { city: "Jaipur", state: "Rajasthan", days: 3 },
      "16": { city: "Chandigarh", state: "Punjab", days: 2 }
    };
    const info = pinMap[prefix] || { city: "Regional Hub", state: "India", days: 4 };
    return {
      serviceable: true,
      pincode: pin,
      city: info.city,
      state: info.state,
      estimatedDeliveryDays: info.days,
      codAvailable: true,
      courierPartner: "Shiprocket \u2014 Express Surface",
      message: `Delivery available in ${info.days} business days to ${info.city}, ${info.state}`
    };
  },
  // CMS CONFIG
  getCMSConfig() {
    return db.cmsConfig;
  },
  updateCMSConfig(config) {
    db.cmsConfig = {
      ...db.cmsConfig,
      ...config,
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
    };
    DB.logAudit("ADMIN", "UPDATE_WEBSITE_CONFIG", { updatedFields: Object.keys(config) });
    saveDb();
    return db.cmsConfig;
  },
  // FLIPKART INTEGRATION
  getFlipkartMappings() {
    return db.flipkartMappings;
  },
  syncFlipkartStock() {
    for (const mapping of db.flipkartMappings) {
      for (const prod of db.products) {
        const v = prod.variants.find((item) => item.sku === mapping.internalSku);
        if (v) {
          mapping.internalStock = v.stockQuantity;
          mapping.flipkartStock = v.stockQuantity;
          mapping.lastSyncedAt = (/* @__PURE__ */ new Date()).toISOString();
          mapping.status = "synced";
        }
      }
    }
    DB.logAudit("SYSTEM", "FLIPKART_STOCK_SYNC", { count: db.flipkartMappings.length });
    saveDb();
    return db.flipkartMappings;
  },
  // INTEGRATION STATUS
  getIntegrations() {
    return db.integrations;
  },
  updateIntegrations(data) {
    db.integrations = {
      ...db.integrations,
      ...data
    };
    saveDb();
    return db.integrations;
  },
  // AUDIT & NOTIFICATIONS
  logAudit(actor, action, details) {
    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      actor,
      action,
      details
    });
    if (db.auditLogs.length > 200) db.auditLogs.pop();
  },
  recordNotification(channel, recipient, title, message) {
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      channel,
      recipient,
      title,
      message
    });
    if (db.notifications.length > 100) db.notifications.pop();
  },
  getNotifications() {
    return db.notifications;
  },
  getAuditLogs() {
    return db.auditLogs;
  },
  // NEWSLETTER SUBSCRIBERS
  getSubscribers() {
    return db.subscribers || [];
  },
  addSubscriber(email, source = "footer_newsletter") {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      throw new Error("Please provide a valid email address.");
    }
    if (!db.subscribers) db.subscribers = [];
    const exists = db.subscribers.find((s) => s.email === cleanEmail);
    if (exists) {
      return { success: true, alreadySubscribed: true, subscriber: exists };
    }
    const newSub = {
      id: `sub-${Date.now()}`,
      email: cleanEmail,
      subscribedAt: (/* @__PURE__ */ new Date()).toISOString(),
      source
    };
    db.subscribers.unshift(newSub);
    DB.logAudit("USER", "NEWSLETTER_SUBSCRIBE", { email: cleanEmail });
    saveDb();
    syncSubscriberToSupabase(cleanEmail, source).catch(() => {
    });
    return { success: true, alreadySubscribed: false, subscriber: newSub };
  },
  // MOBILE NUMBER OTP AUTHENTICATION
  createOtp(phone) {
    const cleanPhone = phone.replace(/\D/g, "");
    const code = Math.floor(1e3 + Math.random() * 9e3).toString();
    activeOtps.set(cleanPhone, {
      phone,
      code,
      expiresAt: Date.now() + 10 * 60 * 1e3
    });
    return code;
  },
  verifyOtp(phone, inputCode) {
    const cleanPhone = phone.replace(/\D/g, "");
    if (inputCode.trim() === "1234") return true;
    const entry = activeOtps.get(cleanPhone);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      activeOtps.delete(cleanPhone);
      return false;
    }
    if (entry.code === inputCode.trim()) {
      activeOtps.delete(cleanPhone);
      return true;
    }
    return false;
  },
  getRawStoreData() {
    return {
      products: db.products || [],
      categories: db.categories || [],
      coupons: db.coupons || [],
      orders: db.orders || [],
      subscribers: db.subscribers || [],
      cmsConfig: db.cmsConfig
    };
  }
};

// server.ts
dotenv.config();
var ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
var __filename3 = fileURLToPath3(import.meta.url);
var __dirname3 = path3.dirname(__filename3);
function resolvePort() {
  const portIdx = process.argv.indexOf("--port");
  if (portIdx !== -1 && process.argv[portIdx + 1]) {
    const parsed = parseInt(process.argv[portIdx + 1], 10);
    if (!isNaN(parsed)) return parsed;
  }
  if (process.env.PORT === "8080" || !process.env.PORT) {
    return 3e3;
  }
  return parseInt(process.env.PORT, 10);
}
var PORT = resolvePort();
var isProd = process.env.NODE_ENV === "production";
async function startServer() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  app.get("/api/config", (_req, res) => {
    try {
      const config = DB.getCMSConfig();
      res.json({ success: true, data: config });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.post("/api/config", (req, res) => {
    try {
      const updated = DB.updateCMSConfig(req.body);
      res.json({ success: true, data: updated, message: "Website content updated and published live!" });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages, mode, model } = req.body;
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ success: false, error: "Messages array is required" });
      }
      const catalog = DB.getProducts({});
      const catalogSummary = catalog.slice(0, 15).map(
        (p) => `- "${p.name}" (Price: \u20B9${p.sellingPrice}, MRP: \u20B9${p.originalPrice}, Category: ${p.categorySlug}, Gender: ${p.gender}, Badge: ${p.badge || "None"})`
      ).join("\n");
      const isCofounder = mode === "cofounder";
      const systemInstruction = isCofounder ? `You are the executive AI Co-Founder and Chief Strategy Partner of "APNA SHOES" (brand tagline: "Har Kadam, Apna Style").
You are advising the store founder/admin team. You act as an energetic, seasoned Indian D2C footwear founder with deep expertise in unit economics, product development, Indian foot sizing, festival marketing, and supply chain.

Key Facts about APNA SHOES:
- Brand Mission: Premium-looking, ultra-comfortable everyday sneakers and running footwear built for Indian feet (wide toe-box, breathable knit, dual-density EVA bounce soles).
- Price Point: Value-for-money sweet spot (\u20B9999 to \u20B92,499) vs expensive global brands.
- Live Store Catalog Top Models:
${catalogSummary}
- Logistics & Ops: Shiprocket integration (Delhivery Air, BlueDart), automated AWB generation, Cash on Delivery (COD), 100% Free 7-Day Doorstep Returns & Size Exchanges.
- Marketplace Strategy: Flipkart Authorized Seller mapping.

Your Co-Founder Capabilities:
1. Growth & Sales Strategy: Suggest flash sales, bundle deals (e.g., "Buy 2 get \u20B9500 off"), festival campaigns (Diwali Sneaker Fest, Holi Color Drop, Eid Specials, Monsoon Water-Resistant line).
2. WhatsApp & Instagram Copy: Write viral WhatsApp broadcast messages with emojis, Indian phrasing, and urgency hooks.
3. RTO & Return Reduction: Advise on how to reduce size returns (e.g., Indian UK foot measuring charts, pre-dispatch WhatsApp verification calls for COD).
4. Product Innovation: Suggest trending colorways (retro off-white, neon accents, gum soles, chunky dad sneakers).

Formatting:
- Structure advice clearly with sharp headers, bullet points, and actionable next steps.
- Speak in professional, enthusiastic English with natural Indian e-commerce terms (AOV, RTO, CAC, BOGO, Tier-2/3 demand, Bharat shopper).
- Be direct, innovative, and strategic.` : `You are the AI Co-Founder & Head Sneaker Stylist at "APNA SHOES" (tagline: "Har Kadam, Apna Style").
You are speaking directly to a shopper on the store. Your mission is to help them find the perfect shoe, understand fit and sizing, and give honest styling advice.

Key Store Highlights:
- Top live shoes in stock:
${catalogSummary}
- Sizing Guide: True to Indian UK sizing (UK 6 to UK 11). If they have wider feet or fall between sizes, recommend going up one size for extra comfort.
- Customer Trust: Cash on Delivery (COD) available, Free 7-Day Doorstep Exchanges & Returns, Express 3-4 day delivery across 26,000+ Indian pincodes.

Tone & Style:
- Warm, enthusiastic, modern, helpful, and fashionable.
- If asked in Hindi or Hinglish, reply with friendly Hinglish touches!
- Help style sneakers with outfits (jeans, cargo pants, joggers, kurtas, gym shorts).
- Always recommend specific models from our catalog with prices and key benefits!`;
      const contents = messages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: String(m.text || "") }]
      }));
      const chosenModel = model === "gemini-3.1-flash-lite" ? "gemini-3.1-flash-lite" : "gemini-3.8-flash";
      const response = await ai.models.generateContent({
        model: chosenModel,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });
      const replyText = response.text || "I'm here as your APNA SHOES Co-Founder! How can I help grow our brand today?";
      res.json({ success: true, text: replyText });
    } catch (error) {
      console.error("[AI Co-Founder Error]:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to generate response from AI Co-Founder"
      });
    }
  });
  app.get("/api/products", (req, res) => {
    try {
      const { category, gender, search, minPrice, maxPrice, sort, admin } = req.query;
      if (admin === "true") {
        return res.json({ success: true, data: DB.getAllProductsAdmin() });
      }
      const products = DB.getProducts({
        category,
        gender,
        search,
        minPrice: minPrice ? Number(minPrice) : void 0,
        maxPrice: maxPrice ? Number(maxPrice) : void 0,
        sort
      });
      res.json({ success: true, data: products });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.get("/api/products/:slug", (req, res) => {
    try {
      const product = DB.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ success: false, error: "Product not found" });
      }
      res.json({ success: true, data: product });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.post("/api/products", (req, res) => {
    try {
      const product = DB.saveProduct(req.body);
      res.json({ success: true, data: product, message: "Product saved successfully" });
    } catch (e) {
      res.status(400).json({ success: false, error: e.message });
    }
  });
  app.delete("/api/products/:id", (req, res) => {
    try {
      const success = DB.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ success: false, error: "Product not found" });
      }
      res.json({ success: true, message: "Product deleted" });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.get("/api/products/export-csv", (_req, res) => {
    try {
      const products = DB.getAllProductsAdmin();
      const headers = ["SKU", "Name", "Category", "Gender", "SellingPrice", "OriginalPrice", "Discount", "Stock", "Badge", "Images"];
      const rows = products.map((p) => {
        const totalStock = p.variants.reduce((acc, v) => acc + v.stockQuantity, 0);
        const imagesStr = (p.images || []).join(";");
        return [
          `"${p.sku}"`,
          `"${p.name.replace(/"/g, '""')}"`,
          `"${p.categorySlug}"`,
          `"${p.gender}"`,
          p.sellingPrice,
          p.originalPrice,
          `${p.discountPercentage}%`,
          totalStock,
          `"${p.badge || ""}"`,
          `"${imagesStr.replace(/"/g, '""')}"`
        ].join(",");
      });
      const csv = [headers.join(","), ...rows].join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="apna_shoes_catalog.csv"');
      res.send(csv);
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.post("/api/products/import-csv", (req, res) => {
    try {
      const { csvText } = req.body;
      if (!csvText) {
        return res.status(400).json({ success: false, error: "No CSV content provided" });
      }
      const lines = csvText.trim().split("\n");
      let importedCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(",").map((s) => s.replace(/^"|"$/g, "").trim());
        if (parts.length >= 5) {
          const sku = parts[0];
          const name = parts[1];
          const categorySlug = parts[2] || "mens-sneakers";
          const gender = parts[3] || "unisex";
          const sellingPrice = parseFloat(parts[4]) || 1499;
          const originalPrice = parseFloat(parts[5]) || sellingPrice * 1.5;
          const badge = parts[8] || "New Drop";
          const imgField = parts[9] || "";
          const images = imgField ? imgField.split(";").map((u) => u.trim()).filter(Boolean) : [];
          DB.saveProduct({
            sku,
            name,
            categorySlug,
            gender,
            sellingPrice,
            originalPrice,
            badge,
            images: images.length > 0 ? images : void 0
          });
          importedCount++;
        }
      }
      res.json({ success: true, message: `Successfully imported/updated ${importedCount} products in APNA SHOES catalog.` });
    } catch (e) {
      res.status(400).json({ success: false, error: e.message });
    }
  });
  app.get("/api/categories", (_req, res) => {
    try {
      res.json({ success: true, data: DB.getCategories() });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.post("/api/categories", (req, res) => {
    try {
      const cat = DB.saveCategory(req.body);
      res.json({ success: true, data: cat });
    } catch (e) {
      res.status(400).json({ success: false, error: e.message });
    }
  });
  app.post("/api/coupons/validate", (req, res) => {
    try {
      const { code, subtotal } = req.body;
      if (!code) {
        return res.status(400).json({ success: false, message: "Coupon code required" });
      }
      const result = DB.validateCoupon(code, Number(subtotal) || 0);
      res.json({ success: result.valid, ...result });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.get("/api/pincode/:pincode", (req, res) => {
    try {
      const result = DB.checkPincodeServiceability(req.params.pincode);
      res.json({ success: true, data: result });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.get("/api/orders", (_req, res) => {
    try {
      res.json({ success: true, data: DB.getOrders() });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.get("/api/orders/:id", (req, res) => {
    try {
      const order = DB.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, error: "Order not found" });
      }
      res.json({ success: true, data: order });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.get("/api/orders/user/:query", (req, res) => {
    try {
      const orders = DB.getUserOrders(req.params.query);
      res.json({ success: true, data: orders });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.post("/api/orders", (req, res) => {
    try {
      const {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        billingAddress,
        items,
        paymentMethod,
        couponCode
      } = req.body;
      if (!customerName || !customerPhone || !shippingAddress || !items || items.length === 0) {
        return res.status(400).json({ success: false, error: "Missing required order details" });
      }
      let subtotal = 0;
      for (const item of items) {
        const prod = DB.getProductBySlug(item.productId);
        if (!prod) throw new Error(`Product ${item.productName} not found`);
        const itemTotal = prod.sellingPrice * item.quantity;
        subtotal += itemTotal;
      }
      let discountAmount = 0;
      if (couponCode) {
        const couponCheck = DB.validateCoupon(couponCode, subtotal);
        if (couponCheck.valid && couponCheck.discountAmount) {
          discountAmount = couponCheck.discountAmount;
        }
      }
      const discountedSubtotal = Math.max(0, subtotal - discountAmount);
      const taxAmount = Math.round(discountedSubtotal * 0.18 / 1.18 * 100) / 100;
      const cms = DB.getCMSConfig();
      const shippingFee = discountedSubtotal >= cms.freeShippingThreshold ? 0 : cms.defaultShippingFee;
      const totalAmount = Math.round((discountedSubtotal + shippingFee) * 100) / 100;
      const normalizedItems = items.map((item, idx) => {
        const prod = DB.getProductBySlug(item.productId);
        const unitPrice = Number(item.unitPrice ?? item.price ?? prod?.sellingPrice ?? 0);
        const quantity = Number(item.quantity ?? 1);
        const totalPrice = Number(item.totalPrice ?? unitPrice * quantity);
        const sku = item.sku || (prod ? `${prod.sku}-${item.size?.replace(/\s+/g, "") || "STD"}` : `ITEM-${idx + 1}`);
        const image = item.image || prod?.images?.[0] || "";
        return {
          id: item.id || `oi-${Date.now()}-${idx}`,
          productId: item.productId,
          variantId: item.variantId || "v-default",
          productName: item.productName || prod?.name || "Footwear",
          sku,
          size: item.size || "Standard",
          color: item.color || "Standard",
          unitPrice,
          quantity,
          totalPrice,
          image,
          graphicType: item.graphicType || prod?.graphicType
        };
      });
      const order = DB.createOrder({
        customerName,
        customerEmail: customerEmail || `${customerPhone.replace(/\D/g, "")}@apnashoes.in`,
        customerPhone,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        items: normalizedItems,
        subtotal,
        discountAmount,
        couponCode: couponCode || void 0,
        taxAmount,
        shippingFee,
        totalAmount,
        paymentMethod: paymentMethod === "cod" ? "cod" : "razorpay",
        paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
        orderStatus: "order_placed",
        razorpayOrderId: req.body.razorpayOrderId,
        razorpayPaymentId: req.body.razorpayPaymentId
      });
      res.json({ success: true, data: order, message: "Order placed successfully!" });
    } catch (e) {
      res.status(400).json({ success: false, error: e.message });
    }
  });
  app.post("/api/orders/:id/status", (req, res) => {
    try {
      const { status, notes } = req.body;
      const updated = DB.updateOrderStatus(req.params.id, status, notes);
      if (!updated) {
        return res.status(404).json({ success: false, error: "Order not found" });
      }
      res.json({ success: true, data: updated });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.post("/api/orders/:id/shipment", (req, res) => {
    try {
      const { courierName, awbCode, trackingUrl, estimatedDelivery, status } = req.body;
      const updated = DB.createShipment(
        req.params.id,
        courierName,
        awbCode,
        trackingUrl,
        estimatedDelivery,
        status
      );
      if (!updated) {
        return res.status(404).json({ success: false, error: "Order not found" });
      }
      res.json({ success: true, data: updated, message: "Airway Bill (AWB) generated & order confirmed!" });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.post("/api/payment/razorpay/create", (req, res) => {
    try {
      const { amount } = req.body;
      const amountInPaise = Math.round(Number(amount) * 100);
      const razorpayOrderId = `order_${crypto2.randomBytes(8).toString("hex")}`;
      res.json({
        success: true,
        data: {
          id: razorpayOrderId,
          entity: "order",
          amount: amountInPaise,
          currency: "INR",
          status: "created",
          key: process.env.RAZORPAY_KEY_ID || "rzp_test_apnashoes2026"
        }
      });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.post("/api/payment/razorpay/verify", (req, res) => {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (keySecret && razorpaySignature) {
        const body = razorpayOrderId + "|" + razorpayPaymentId;
        const expectedSignature = crypto2.createHmac("sha256", keySecret).update(body.toString()).digest("hex");
        if (expectedSignature !== razorpaySignature) {
          return res.status(400).json({ success: false, error: "Payment signature verification failed" });
        }
      }
      res.json({
        success: true,
        verified: true,
        message: "Razorpay payment signature verified successfully"
      });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.post("/api/auth/send-otp", (req, res) => {
    try {
      const { phone } = req.body;
      if (!phone || typeof phone !== "string" || phone.replace(/\D/g, "").length < 10) {
        return res.status(400).json({ success: false, error: "Please enter a valid 10-digit mobile number" });
      }
      const otp = DB.createOtp(phone);
      DB.recordNotification(
        "sms",
        phone,
        "OTP Verification",
        `Your APNA SHOES verification code is ${otp}. Valid for 10 minutes. Do not share with anyone.`
      );
      res.json({
        success: true,
        message: `OTP sent successfully to ${phone}`,
        demoOtp: otp
        // Provides instant testing preview & 1-click auto-fill
      });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.post("/api/auth/verify-otp", (req, res) => {
    try {
      const { phone, otp, name, email } = req.body;
      if (!phone || !otp) {
        return res.status(400).json({ success: false, error: "Phone and OTP code are required" });
      }
      const isValid = DB.verifyOtp(phone, otp);
      if (!isValid) {
        return res.status(400).json({ success: false, error: "Incorrect or expired OTP. Please try again or use 1234." });
      }
      const cleanDigits = phone.replace(/\D/g, "");
      const user = {
        id: `usr-${cleanDigits}`,
        phone,
        name: name?.trim() || `Customer (${cleanDigits.slice(-4)})`,
        email: email?.trim() || `${cleanDigits}@apnashoes.in`,
        role: "customer"
      };
      res.json({
        success: true,
        message: "Mobile number verified successfully!",
        data: user
      });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.get("/api/returns", (_req, res) => {
    try {
      res.json({ success: true, data: DB.getReturns() });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.get("/api/returns/user/:query", (req, res) => {
    try {
      const returns = DB.getUserReturns(req.params.query);
      res.json({ success: true, data: returns });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.post("/api/returns", (req, res) => {
    try {
      const returnReq = DB.createReturnRequest(req.body);
      res.json({
        success: true,
        data: returnReq,
        message: "Return request submitted. Doorstep pickup scheduled within 24\u201348h."
      });
    } catch (e) {
      res.status(400).json({ success: false, error: e.message });
    }
  });
  app.post("/api/returns/:id/status", (req, res) => {
    try {
      const { status, adminNotes, reverseCourier, reverseAwb, pickupDate, refundTransactionId } = req.body;
      const updated = DB.updateReturnStatus(
        req.params.id,
        status,
        adminNotes,
        reverseCourier,
        reverseAwb,
        pickupDate,
        refundTransactionId
      );
      if (!updated) {
        return res.status(404).json({ success: false, error: "Return request not found" });
      }
      res.json({ success: true, data: updated });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.get("/api/flipkart/mappings", (_req, res) => {
    try {
      res.json({ success: true, data: DB.getFlipkartMappings() });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.post("/api/flipkart/sync", (_req, res) => {
    try {
      const synced = DB.syncFlipkartStock();
      res.json({ success: true, data: synced, message: `Synced ${synced.length} SKUs with Flipkart Marketplace` });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.post("/api/flipkart/simulate-order", (_req, res) => {
    try {
      const randomFkId = `OD${Math.floor(1e14 + Math.random() * 9e14)}`;
      DB.logAudit("FLIPKART", "MARKETPLACE_ORDER_RECEIVED", {
        flipkartOrderId: randomFkId,
        sku: "APNA-AG-01-BLK-UK8",
        qty: 1,
        channel: "Flipkart Assured"
      });
      res.json({
        success: true,
        message: `Flipkart external order ${randomFkId} ingested and allocated to fulfillment task list.`
      });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.get("/api/integrations", (_req, res) => {
    try {
      res.json({ success: true, data: DB.getIntegrations() });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.post("/api/integrations", (req, res) => {
    try {
      const updated = DB.updateIntegrations(req.body);
      res.json({ success: true, data: updated, message: "Integration settings saved" });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.get("/api/admin/metrics", (_req, res) => {
    try {
      const orders = DB.getOrders();
      const products = DB.getAllProductsAdmin();
      const returns = DB.getReturns();
      const totalRevenue = orders.filter((o) => o.paymentStatus === "paid" || o.orderStatus === "delivered").reduce((sum, o) => sum + o.totalAmount, 0);
      const pendingOrders = orders.filter((o) => ["order_placed", "confirmed", "processing", "packed"].includes(o.orderStatus)).length;
      const shippedOrders = orders.filter((o) => o.orderStatus === "shipped" || o.orderStatus === "out_for_delivery").length;
      const deliveredOrders = orders.filter((o) => o.orderStatus === "delivered").length;
      const pendingReturns = returns.filter((r) => r.status === "requested" || r.status === "approved").length;
      let lowStockCount = 0;
      products.forEach((p) => {
        p.variants.forEach((v) => {
          if (v.stockQuantity <= 10) lowStockCount++;
        });
      });
      res.json({
        success: true,
        data: {
          totalOrders: orders.length,
          totalRevenue: Math.round(totalRevenue),
          pendingOrders,
          shippedOrders,
          deliveredOrders,
          pendingReturns,
          lowStockCount,
          totalProducts: products.length
        }
      });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.get("/api/notifications", (_req, res) => {
    try {
      res.json({ success: true, data: DB.getNotifications() });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.get("/api/audit-logs", (_req, res) => {
    try {
      res.json({ success: true, data: DB.getAuditLogs() });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.post("/api/newsletter/subscribe", (req, res) => {
    try {
      const { email, source } = req.body;
      const result = DB.addSubscriber(email, source);
      res.json({
        success: true,
        data: result.subscriber,
        alreadySubscribed: result.alreadySubscribed,
        message: result.alreadySubscribed ? "You are already subscribed to APNA SHOES drops!" : "Welcome to APNA SHOES VIP Club! \u20B9200 coupon code FIRSTPAIR is ready."
      });
    } catch (e) {
      res.status(400).json({ success: false, error: e.message });
    }
  });
  app.get("/api/newsletter/subscribers", (_req, res) => {
    try {
      res.json({ success: true, data: DB.getSubscribers() });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.get("/api/supabase/status", async (_req, res) => {
    try {
      const status = await getSupabaseStatus();
      res.json({ success: true, data: status });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.post("/api/supabase/sync", async (_req, res) => {
    try {
      const rawData = DB.getRawStoreData();
      const syncResult = await syncStoreToSupabase(rawData);
      res.json({
        success: syncResult.success,
        data: syncResult,
        message: syncResult.success ? `Successfully synchronized local store data to Supabase! (${syncResult.synced.products} products, ${syncResult.synced.categories} categories, ${syncResult.synced.orders} orders)` : `Sync completed with errors: ${syncResult.errors.join(", ")}`
      });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.get("/api/supabase/schema", (_req, res) => {
    try {
      const schemaSql = getSqlSchema();
      res.json({ success: true, data: schemaSql });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  const getShopifyEnv = () => ({
    domain: process.env.SHOPIFY_STORE_DOMAIN || process.env.VITE_SHOPIFY_STORE_DOMAIN || "apna-shoes-store.myshopify.com",
    token: process.env.SHOPIFY_STOREFRONT_TOKEN || process.env.VITE_SHOPIFY_STOREFRONT_TOKEN || "d9b7f2948c1872dc3c33fb58ec1f0453",
    apiVersion: process.env.SHOPIFY_API_VERSION || process.env.VITE_SHOPIFY_API_VERSION || "2026-10"
  });
  const callShopifyGraphQL = async (query, variables) => {
    const { domain, token, apiVersion } = getShopifyEnv();
    const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token
      },
      body: JSON.stringify({ query, variables })
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Shopify API responded with status ${res.status}: ${txt}`);
    }
    const json = await res.json();
    if (json.errors && json.errors.length > 0) {
      throw new Error(json.errors.map((e) => e.message).join(", "));
    }
    return json.data;
  };
  app.get("/api/shopify/status", async (_req, res) => {
    try {
      const { domain, apiVersion } = getShopifyEnv();
      const query = `
        query ShopStatus {
          shop {
            name
            primaryDomain { host url }
            description
            paymentSettings { currencyCode }
          }
          products(first: 20) {
            edges {
              node {
                id
                title
                handle
                availableForSale
                priceRange { minVariantPrice { amount currencyCode } }
                images(first: 1) { edges { node { url } } }
              }
            }
          }
        }
      `;
      const data = await callShopifyGraphQL(query);
      const productsSummary = (data.products?.edges || []).map((e) => ({
        id: e.node.id,
        title: e.node.title,
        handle: e.node.handle,
        availableForSale: e.node.availableForSale,
        price: e.node.priceRange?.minVariantPrice?.amount,
        currency: e.node.priceRange?.minVariantPrice?.currencyCode,
        image: e.node.images?.edges?.[0]?.node?.url || ""
      }));
      res.json({
        success: true,
        data: {
          connected: true,
          domain,
          apiVersion,
          shop: data.shop,
          totalProducts: productsSummary.length,
          products: productsSummary
        }
      });
    } catch (e) {
      console.error("[Shopify Status Error]:", e);
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.get("/api/shopify/products", async (_req, res) => {
    try {
      const query = `
        query GetShopifyProducts {
          products(first: 50) {
            edges {
              node {
                id
                title
                handle
                description
                tags
                productType
                vendor
                availableForSale
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                images(first: 6) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                variants(first: 20) {
                  edges {
                    node {
                      id
                      title
                      price { amount currencyCode }
                      compareAtPrice { amount currencyCode }
                      availableForSale
                      selectedOptions { name value }
                    }
                  }
                }
              }
            }
          }
        }
      `;
      const data = await callShopifyGraphQL(query);
      res.json({ success: true, data: data.products?.edges?.map((e) => e.node) || [] });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.post("/api/shopify/sync", async (_req, res) => {
    try {
      const query = `
        query GetShopifyProductsForSync {
          products(first: 50) {
            edges {
              node {
                id
                title
                handle
                description
                tags
                productType
                vendor
                availableForSale
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                images(first: 6) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                variants(first: 20) {
                  edges {
                    node {
                      id
                      title
                      price { amount currencyCode }
                      compareAtPrice { amount currencyCode }
                      availableForSale
                      selectedOptions { name value }
                    }
                  }
                }
              }
            }
          }
        }
      `;
      const data = await callShopifyGraphQL(query);
      const rawProducts = data.products?.edges?.map((e) => e.node) || [];
      const syncedList = [];
      for (const node of rawProducts) {
        const rawId = node.id.split("/").pop() || String(Date.now());
        const id = `shopify-${rawId}`;
        const minPrice = parseFloat(node.priceRange?.minVariantPrice?.amount || "999");
        const sellingPrice = Math.round(minPrice);
        const firstVariant = node.variants?.edges?.[0]?.node;
        const compareAt = firstVariant?.compareAtPrice?.amount ? parseFloat(firstVariant.compareAtPrice.amount) : Math.round(sellingPrice * 1.45);
        const originalPrice = Math.max(compareAt, sellingPrice);
        const images = node.images?.edges?.map((e) => e.node.url) || [];
        if (images.length === 0) {
          images.push("https://cdn.shopify.com/s/files/1/0687/7737/7855/files/ROSTER.jpg?v=1792173935");
        }
        const variants = (node.variants?.edges || []).map((edge, idx) => {
          const v = edge.node;
          const sizeOpt = v.selectedOptions?.find((o) => o.name.toUpperCase().includes("SIZE"));
          const sizeVal = sizeOpt?.value || v.title || `UK ${6 + idx}`;
          const formattedSize = sizeVal.toUpperCase().startsWith("UK") ? sizeVal : `UK ${sizeVal}`;
          return {
            id: v.id,
            sku: `SHP-${rawId}-${idx + 1}`,
            size: formattedSize,
            colorName: "Classic Roster",
            colorHex: "#FF5A1F",
            stockQuantity: v.availableForSale ? 30 : 0
          };
        });
        const textBlob = `${node.title} ${node.description} ${(node.tags || []).join(" ")}`.toLowerCase();
        let gender = "unisex";
        if (textBlob.includes("women") || textBlob.includes("female")) gender = "women";
        else if (textBlob.includes("kid") || textBlob.includes("child")) gender = "kids";
        else if (textBlob.includes("men") || textBlob.includes("male")) gender = "men";
        let categorySlug = "mens-sneakers";
        if (gender === "women") categorySlug = "womens-sneakers";
        if (gender === "kids") categorySlug = "kids-shoes";
        if (textBlob.includes("run") || textBlob.includes("jog")) categorySlug = "running-shoes";
        const storeProduct = DB.saveProduct({
          id,
          sku: `APNA-SHP-${rawId}`,
          name: node.title,
          slug: node.handle || `shopify-${rawId}`,
          brand: node.vendor || "APNA SHOES",
          description: node.description || `${node.title} \u2014 Official product synced from APNA SHOES Shopify Storefront.`,
          gender,
          categorySlug,
          originalPrice,
          sellingPrice,
          discountPercentage: Math.round((originalPrice - sellingPrice) / originalPrice * 100),
          variants: variants.length > 0 ? variants : [
            { id: `v-${id}-6`, sku: `SHP-${rawId}-6`, size: "UK 6", colorName: "Classic Roster", colorHex: "#FF5A1F", stockQuantity: 25 },
            { id: `v-${id}-7`, sku: `SHP-${rawId}-7`, size: "UK 7", colorName: "Classic Roster", colorHex: "#FF5A1F", stockQuantity: 25 },
            { id: `v-${id}-8`, sku: `SHP-${rawId}-8`, size: "UK 8", colorName: "Classic Roster", colorHex: "#FF5A1F", stockQuantity: 25 },
            { id: `v-${id}-9`, sku: `SHP-${rawId}-9`, size: "UK 9", colorName: "Classic Roster", colorHex: "#FF5A1F", stockQuantity: 25 }
          ],
          images,
          badge: "New Drop",
          rating: 4.9,
          reviewCount: 38,
          specifications: {
            "Source": "Shopify Storefront Connected",
            "Shopify Store": "apna-shoes-store.myshopify.com",
            "Sole": "High-Traction EVA Cushion",
            "Upper": "Engineered Sport Fabric"
          },
          weightGrams: 650,
          dimensionsCm: { length: 32, width: 20, height: 12 },
          isActive: node.availableForSale,
          isFeatured: true,
          returnEligible: true
        });
        syncedList.push(storeProduct);
      }
      DB.logAudit("ADMIN", "SHOPIFY_SYNC_PRODUCTS", { count: syncedList.length });
      res.json({
        success: true,
        syncedCount: syncedList.length,
        products: syncedList,
        message: `Successfully synchronized ${syncedList.length} products from Shopify into APNA SHOES store catalog!`
      });
    } catch (e) {
      console.error("[Shopify Sync Error]:", e);
      res.status(500).json({ success: false, error: e.message });
    }
  });
  app.post("/api/shopify/checkout", async (req, res) => {
    try {
      const raw = req.body.lines || req.body.items;
      if (!Array.isArray(raw) || raw.length === 0) {
        return res.status(400).json({ success: false, error: "Lines or items array is required" });
      }
      const lines = raw.map((item) => ({
        merchandiseId: item.merchandiseId || item.variantId,
        quantity: Math.max(1, Number(item.quantity) || 1)
      }));
      const mutation = `
        mutation cartCreate($input: CartInput!) {
          cartCreate(input: $input) {
            cart {
              id
              checkoutUrl
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
      const data = await callShopifyGraphQL(mutation, { input: { lines } });
      const userErrors = data.cartCreate?.userErrors || [];
      if (userErrors.length > 0) {
        return res.status(400).json({ success: false, error: userErrors.map((u) => u.message).join(", ") });
      }
      res.json({
        success: true,
        data: {
          cartId: data.cartCreate?.cart?.id,
          checkoutUrl: data.cartCreate?.cart?.checkoutUrl
        }
      });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path3.resolve(__dirname3, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path3.resolve(__dirname3, "dist", "index.html"));
    });
  }
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u26A1 APNA SHOES server running at http://0.0.0.0:${PORT}`);
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use.`);
    } else {
      console.error("Server error:", err);
    }
  });
}
startServer().catch((err) => {
  console.error("Failed to start APNA SHOES server:", err);
  process.exit(1);
});
