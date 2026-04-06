/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Campus Marketplace — Database Seed Script
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Populates the database with realistic sample users, listings (with real
 *  product images), and buyer demands.
 *
 *  Run: node src/tests/seed-data.js
 * ═══════════════════════════════════════════════════════════════════════════════
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Listing = require('../models/Listing');
const BuyerDemand = require('../models/BuyerDemand');

// ─── Sample Users ───────────────────────────────────────────────────────────────
const USERS = [
  {
    email: 'rahul.sharma@iiitm.ac.in',
    passwordHash: 'password123',
    realName: 'Rahul Sharma',
    hostelBlock: 'BH-1',
    showRealIdentity: true,
  },
  {
    email: 'priya.patel@iiitm.ac.in',
    passwordHash: 'password123',
    realName: 'Priya Patel',
    hostelBlock: 'GH-1',
    showRealIdentity: false,
  },
  {
    email: 'arjun.verma@iiitm.ac.in',
    passwordHash: 'password123',
    realName: 'Arjun Verma',
    hostelBlock: 'BH-3',
    showRealIdentity: true,
  },
  {
    email: 'sneha.gupta@iiitm.ac.in',
    passwordHash: 'password123',
    realName: 'Sneha Gupta',
    hostelBlock: 'GH-2',
    showRealIdentity: false,
  },
  {
    email: 'vikram.singh@iiitm.ac.in',
    passwordHash: 'password123',
    realName: 'Vikram Singh',
    hostelBlock: 'BH-2',
    showRealIdentity: true,
  },
  {
    email: 'ananya.reddy@iiitm.ac.in',
    passwordHash: 'password123',
    realName: 'Ananya Reddy',
    hostelBlock: 'GH-1',
    showRealIdentity: true,
  },
  {
    email: 'karan.mehta@iiitm.ac.in',
    passwordHash: 'password123',
    realName: 'Karan Mehta',
    hostelBlock: 'BH-4',
    showRealIdentity: false,
  },
  {
    email: 'deepika.nair@iiitm.ac.in',
    passwordHash: 'password123',
    realName: 'Deepika Nair',
    hostelBlock: 'New BH',
    showRealIdentity: true,
  },
];

// ─── Sample Listings with Real Images ───────────────────────────────────────────
// Images sourced from Unsplash (free to use), Picsum, and public CDNs
const LISTINGS = [
  // ── BOOKS ────────────────────────────────────────────────────────────────────
  {
    title: 'Introduction to Algorithms (CLRS) - 3rd Edition',
    description: 'The classic CLRS textbook used in DSA courses. Minor highlights on chapters 1-5, rest is clean. Hardcover edition in great shape. Essential for competitive programming and placements.',
    category: 'books',
    price: 450,
    condition: 'good',
    images: [
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop',
    ],
    priceReferenceLink: 'https://www.amazon.in/Introduction-Algorithms-Thomas-H-Cormen/dp/8120340078',
    viewCount: 48,
    interestCount: 4,
  },
  {
    title: 'Operating System Concepts by Galvin - 9th Edition',
    description: 'Galvin OS textbook, only used for one semester. Some pencil notes in margins, easily erasable. All pages intact. Perfect for MTech OS course.',
    category: 'books',
    price: 300,
    condition: 'good',
    images: [
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=600&fit=crop',
    ],
    priceReferenceLink: 'https://www.amazon.in/Operating-System-Concepts-Abraham-Silberschatz/dp/8126554274',
    viewCount: 32,
    interestCount: 2,
  },
  {
    title: 'Computer Networks by Kurose & Ross - 7th Edition',
    description: 'Top-down approach networking textbook. Like new condition — bought but barely touched. Great for CN course and GATE preparation.',
    category: 'books',
    price: 380,
    condition: 'like-new',
    images: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&h=600&fit=crop',
    ],
    viewCount: 22,
    interestCount: 1,
  },
  {
    title: 'Engineering Mathematics by B.S. Grewal',
    description: 'Higher Engineering Mathematics. Used for all math courses (M1 to M4). Some wear on cover but all pages clean. Has solved examples bookmarked.',
    category: 'books',
    price: 200,
    condition: 'fair',
    images: [
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=600&fit=crop',
    ],
    priceReferenceLink: 'https://www.amazon.in/Higher-Engineering-Mathematics-B-Grewal/dp/8174091955',
    viewCount: 55,
    interestCount: 3,
  },
  {
    title: 'Head First Design Patterns - 2nd Edition',
    description: 'The fun OOP design patterns book. Very engaging illustrations. Perfect condition, only read once. Great for SE course and interview prep.',
    category: 'books',
    price: 350,
    condition: 'like-new',
    images: [
      'https://images.unsplash.com/photo-1589998059171-988d887df646?w=600&h=600&fit=crop',
    ],
    viewCount: 18,
    interestCount: 2,
  },

  // ── ELECTRONICS ────────────────────────────────────────────────────────────
  {
    title: 'HP Pavilion Laptop - i5 11th Gen, 8GB RAM, 512GB SSD',
    description: '2 years old HP Pavilion. i5-1135G7, 8GB DDR4, 512GB NVMe SSD, 15.6" FHD IPS display. Battery health ~78%. No dead pixels. Comes with original charger.',
    category: 'electronics',
    price: 28000,
    condition: 'good',
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&h=600&fit=crop',
    ],
    priceReferenceLink: 'https://www.amazon.in/HP-Pavilion-15-6-Intel-Core/dp/B09SVBVLPN',
    viewCount: 120,
    interestCount: 8,
  },
  {
    title: 'boAt Rockerz 450 Bluetooth Headphones',
    description: 'Wireless headphones with 40mm drivers. Excellent bass, 15hr battery life. Used for 6 months. Minor wear on headband padding. Comes with AUX cable and USB charging cable.',
    category: 'electronics',
    price: 800,
    condition: 'good',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop',
    ],
    priceReferenceLink: 'https://www.amazon.in/boAt-Rockerz-450-Wireless-Bluetooth/dp/B07Z5WQJ3P',
    viewCount: 88,
    interestCount: 5,
  },
  {
    title: 'Logitech G102 Gaming Mouse',
    description: 'Budget gaming mouse with 8000 DPI sensor and RGB lighting. 6 programmable buttons. Used for 4 months, works perfectly. Great for FPS gaming and daily use.',
    category: 'electronics',
    price: 600,
    condition: 'like-new',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&h=600&fit=crop',
    ],
    priceReferenceLink: 'https://www.amazon.in/Logitech-G102-Customizable-Lighting-Programmable/dp/B08LT9BMPP',
    viewCount: 65,
    interestCount: 3,
  },
  {
    title: 'Redmi Pad SE 11" - 128GB, WiFi Only',
    description: 'Xiaomi tablet bought 3 months ago. 11-inch FHD+ display, Snapdragon 680, 6GB RAM, 128GB storage. With cover and tempered glass applied. No scratches.',
    category: 'electronics',
    price: 10500,
    condition: 'like-new',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=600&h=600&fit=crop',
    ],
    viewCount: 94,
    interestCount: 6,
  },
  {
    title: 'JBL Flip 5 Portable Bluetooth Speaker',
    description: 'Waterproof Bluetooth speaker (IPX7). 12 hours battery life. Powerful bass for hostel room parties. Used for one year, still in excellent condition. Color: Black.',
    category: 'electronics',
    price: 3500,
    condition: 'good',
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop',
    ],
    priceReferenceLink: 'https://www.amazon.in/JBL-Portable-Waterproof-Bluetooth-Speaker/dp/B07QKJ6NMD',
    viewCount: 45,
    interestCount: 3,
  },
  {
    title: 'Casio FX-991EX Scientific Calculator',
    description: 'Advanced scientific calculator with spreadsheet function, 552 functions. Perfect for engineering math exams. Bought last semester, barely used. With original box.',
    category: 'electronics',
    price: 900,
    condition: 'like-new',
    images: [
      'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=600&h=600&fit=crop',
    ],
    priceReferenceLink: 'https://www.amazon.in/Casio-FX-991EX-Scientific-Calculator/dp/B079DKZHSY',
    viewCount: 33,
    interestCount: 2,
  },
  {
    title: 'Cosmic Byte CB-GK-16 Mechanical Keyboard',
    description: 'Full-size mechanical keyboard with Outemu Blue switches (clicky). RGB backlit. Braided cable. Used for 8 months — all keys work perfectly. Good for coding and gaming.',
    category: 'electronics',
    price: 1200,
    condition: 'good',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&h=600&fit=crop',
    ],
    viewCount: 42,
    interestCount: 2,
  },

  // ── CLOTHING ──────────────────────────────────────────────────────────────
  {
    title: 'IIITM Official Hoodie - Navy Blue (Size L)',
    description: 'Official ABV-IIITM Gwalior hoodie from college fest. Size L, barely worn (3-4 times). Warm fleece lining, IIITM logo on front and back. Perfect for Gwalior winters.',
    category: 'clothing',
    price: 600,
    condition: 'like-new',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=600&fit=crop',
    ],
    viewCount: 76,
    interestCount: 4,
  },
  {
    title: 'Levi\'s 511 Slim Fit Jeans (Size 32)',
    description: 'Dark wash Levi\'s 511 slim fit denim. Waist 32, Length 32. Worn about 10 times, still in great condition. No fading or tears. Genuine Levi\'s, bought from Levi\'s store.',
    category: 'clothing',
    price: 1200,
    condition: 'good',
    images: [
      'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=600&h=600&fit=crop',
    ],
    priceReferenceLink: 'https://www.amazon.in/Levis-Mens-Jeans/dp/B07WCR6QJ2',
    viewCount: 28,
    interestCount: 1,
  },
  {
    title: 'Nike Dri-FIT Running Shoes - Size UK 9',
    description: 'Nike Revolution 6 running shoes. Used for 3 months for morning jogs on campus track. Soles still have excellent grip. Light and comfortable. Color: Black/White.',
    category: 'clothing',
    price: 1500,
    condition: 'good',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop',
    ],
    viewCount: 52,
    interestCount: 3,
  },
  {
    title: 'Formal Shirt Bundle - 3 Shirts (Size M)',
    description: 'Bundle of 3 formal shirts (white, light blue, lavender). Size M. Worn for campus placements. Ironed and clean. Peter England and Van Heusen brands.',
    category: 'clothing',
    price: 800,
    condition: 'good',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=600&fit=crop',
    ],
    viewCount: 35,
    interestCount: 2,
  },

  // ── FURNITURE ────────────────────────────────────────────────────────────
  {
    title: 'Ergonomic Study Chair - Mesh Back',
    description: 'Mesh-back office-style study chair. Adjustable height, armrests, and tilt. Bought from Amazon 1 year ago for ₹5500. Perfect for long coding sessions. Minor scuffs on base.',
    category: 'furniture',
    price: 2500,
    condition: 'good',
    images: [
      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600&h=600&fit=crop',
    ],
    priceReferenceLink: 'https://www.amazon.in/Office-Chairs/b?ie=UTF8&node=1380441031',
    viewCount: 63,
    interestCount: 5,
  },
  {
    title: 'Foldable Laptop Table / Bed Desk',
    description: 'Portable foldable laptop table. Adjustable angle, cup holder, and mouse pad area. Great for using laptop on bed or floor. Light weight and easy to store. Like new.',
    category: 'furniture',
    price: 400,
    condition: 'like-new',
    images: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&h=600&fit=crop',
    ],
    viewCount: 41,
    interestCount: 3,
  },
  {
    title: 'Wooden Bookshelf - 4 Tiers',
    description: '4-tier wooden bookshelf, perfect for hostel room. Holds 40+ books, plus space for accessories. Assembly required. Solid construction, bought from local furniture shop.',
    category: 'furniture',
    price: 1200,
    condition: 'good',
    images: [
      'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&h=600&fit=crop',
    ],
    viewCount: 38,
    interestCount: 2,
  },
  {
    title: 'LED Desk Lamp with USB Charging Port',
    description: 'Modern LED desk lamp. 3 brightness levels, cool/warm light modes. Built-in USB port for phone charging. Touch control. Used for 6 months. No defects.',
    category: 'furniture',
    price: 500,
    condition: 'good',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600&h=600&fit=crop',
    ],
    viewCount: 29,
    interestCount: 1,
  },

  // ── STATIONERY ────────────────────────────────────────────────────────────
  {
    title: 'Engineering Drawing Instruments Set',
    description: 'Complete ED set: drafter, compass, divider, protractor, French curves, set squares. Used for one semester. All pieces intact. Essential for 1st year ED course.',
    category: 'stationery',
    price: 250,
    condition: 'good',
    images: [
      'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&h=600&fit=crop',
    ],
    viewCount: 44,
    interestCount: 4,
  },
  {
    title: 'A4 Graph Paper Sheets - Pack of 200',
    description: 'Unused pack of 200 A4 graph paper sheets (1mm grid). Bought in bulk for lab reports. Only used about 40 sheets. Great deal for engg students.',
    category: 'stationery',
    price: 120,
    condition: 'like-new',
    images: [
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=600&fit=crop',
    ],
    viewCount: 15,
    interestCount: 1,
  },
  {
    title: 'Whiteboard (2x3 ft) with Markers & Duster',
    description: 'Magnetic whiteboard for study group sessions. 2x3 feet. Comes with 4 markers (blue, black, red, green) and a duster. Wall-mount type. Great for DSA problem solving.',
    category: 'stationery',
    price: 350,
    condition: 'good',
    images: [
      'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=600&h=600&fit=crop',
    ],
    viewCount: 26,
    interestCount: 2,
  },

  // ── SPORTS ────────────────────────────────────────────────────────────────
  {
    title: 'Yonex Badminton Racket - Nanoray 7000I',
    description: 'Yonex Nanoray racket, isometric head shape. Used for intramural tournaments. Strings are still tight, grip tape replaced recently. Comes with cover.',
    category: 'sports',
    price: 700,
    condition: 'good',
    images: [
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&h=600&fit=crop',
    ],
    priceReferenceLink: 'https://www.amazon.in/Yonex-Nanoray-7000I-Badminton-Racquet/dp/B00NVHXZGK',
    viewCount: 37,
    interestCount: 3,
  },
  {
    title: 'Nivia Football - Storm Size 5 (FIFA Quality)',
    description: 'Match-quality football. Used on campus ground for pickup games. Minor scuffs but holds air perfectly. Good for casual and competitive play.',
    category: 'sports',
    price: 400,
    condition: 'fair',
    images: [
      'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=600&h=600&fit=crop',
    ],
    viewCount: 21,
    interestCount: 1,
  },
  {
    title: 'Complete Gym Set - Dumbbells + Mat + Bands',
    description: 'Home gym starter kit: 2x5kg hex dumbbells, yoga mat (6mm), 3 resistance bands (light/medium/heavy). All in great shape. Selling because graduating.',
    category: 'sports',
    price: 1500,
    condition: 'good',
    images: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop',
    ],
    viewCount: 58,
    interestCount: 4,
  },
  {
    title: 'SS Cricket Bat - English Willow (Grade 2)',
    description: 'SS Ton cricket bat, English willow. Grade 2. Knocked in and ready to use. Used for 2 seasons. Some minor marks on face. Includes bat cover and grip.',
    category: 'sports',
    price: 2200,
    condition: 'fair',
    images: [
      'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&h=600&fit=crop',
    ],
    viewCount: 31,
    interestCount: 2,
  },

  // ── ACCESSORIES ────────────────────────────────────────────────────────────
  {
    title: 'Wildcraft Backpack - 45L (Trekking + Daily Use)',
    description: 'Large 45L Wildcraft backpack. Rain cover included. Multiple compartments, laptop sleeve, padded straps. Used for 2 treks and daily college use. Very durable.',
    category: 'accessories',
    price: 900,
    condition: 'good',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=600&h=600&fit=crop',
    ],
    priceReferenceLink: 'https://www.amazon.in/Wildcraft-Backpack/b?ie=UTF8&node=2917423031',
    viewCount: 49,
    interestCount: 3,
  },
  {
    title: 'Fastrack Analog Watch - Blue Dial',
    description: 'Fastrack casual watch with blue dial and leather strap. Battery recently replaced. Looks stylish, keeps accurate time. Selling because got a smartwatch.',
    category: 'accessories',
    price: 650,
    condition: 'good',
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop',
    ],
    viewCount: 24,
    interestCount: 1,
  },
  {
    title: 'Ray-Ban Style Sunglasses (UV400 Protection)',
    description: 'Aviator-style sunglasses with UV400 lenses. Metal frame, polarized lenses. No scratches. Comes with hard case and cleaning cloth. Perfect for the Gwalior sun!',
    category: 'accessories',
    price: 350,
    condition: 'like-new',
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop',
    ],
    viewCount: 33,
    interestCount: 2,
  },
  {
    title: 'Laptop Sleeve 15.6" - Neoprene, Water-Resistant',
    description: 'Slim neoprene laptop sleeve fits up to 15.6" screens. Water-resistant, soft inner lining. Front pocket for charger/mouse. Barely used. Color: Dark Grey.',
    category: 'accessories',
    price: 250,
    condition: 'like-new',
    images: [
      'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop',
    ],
    viewCount: 19,
    interestCount: 1,
  },

  // ── OTHER ─────────────────────────────────────────────────────────────────
  {
    title: 'Room Cooler / Desert Cooler - 20L',
    description: 'Personal room cooler, 20L tank. 3 speed settings, honeycomb cooling pads. Used for 2 Gwalior summers. Works great. Essential for hostel life from March-June!',
    category: 'other',
    price: 2000,
    condition: 'fair',
    images: [
      'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=600&fit=crop',
    ],
    viewCount: 72,
    interestCount: 5,
  },
  {
    title: 'Electric Kettle - 1.5L Stainless Steel',
    description: 'Milton electric kettle. 1.5L capacity, stainless steel body, auto cut-off. Perfect for making Maggi, tea, and coffee in hostel room. Used for 1 year, clean and functional.',
    category: 'other',
    price: 350,
    condition: 'good',
    images: [
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&h=600&fit=crop',
    ],
    viewCount: 56,
    interestCount: 4,
  },
  {
    title: 'Mattress Topper - Memory Foam (Single Bed)',
    description: '2-inch memory foam mattress topper for single hostel bed. Game changer for comfort. Used for 1 semester, washed and clean. With zipper cover.',
    category: 'other',
    price: 800,
    condition: 'good',
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=600&fit=crop',
    ],
    viewCount: 39,
    interestCount: 3,
  },
  {
    title: 'Extension Board - 6 Sockets + 2 USB + Surge Protection',
    description: 'Heavy-duty extension board with surge protector. 6 universal sockets + 2 USB charging ports. 3-meter cable. Used for 1 year, all sockets working perfectly.',
    category: 'other',
    price: 300,
    condition: 'good',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop',
    ],
    viewCount: 27,
    interestCount: 2,
  },
];

// ─── Sample Buyer Demands ───────────────────────────────────────────────────────
const DEMANDS = [
  {
    title: 'Looking for GATE CSE preparation books',
    description: 'Need standard GATE CS books — Made Easy or GateForum publications. Previous year solved papers also welcome. Budget is flexible for good condition.',
    category: 'books',
    budgetMin: 200,
    budgetMax: 800,
  },
  {
    title: 'Need a second-hand laptop for coding',
    description: 'Any laptop with at least i5/Ryzen 5, 8GB RAM, SSD. Should run VS Code and Docker smoothly. Screen size 14" or 15". Battery should last 3+ hours.',
    category: 'electronics',
    budgetMin: 15000,
    budgetMax: 30000,
  },
  {
    title: 'Looking for a table fan for hostel room',
    description: 'Need a table fan or mini pedestal fan for BH-3 room. Oscillating preferred. Decent airflow needed.',
    category: 'other',
    budgetMin: 300,
    budgetMax: 800,
  },
  {
    title: 'Need a study table / desk for hostel room',
    description: 'Foldable or compact study table that fits in hostel room. Should be sturdy enough for laptop + books. Not too heavy to move.',
    category: 'furniture',
    budgetMin: 500,
    budgetMax: 2000,
  },
  {
    title: 'Want to buy a cricket kit (bat + pads + gloves)',
    description: 'Looking for a complete cricket kit or individual pieces. English willow bat preferred but Kashmir willow also ok. For inter-hostel tournament.',
    category: 'sports',
    budgetMin: 1000,
    budgetMax: 5000,
  },
  {
    title: 'Need formal clothes for placement season',
    description: 'Looking for formal shirts (M/L), trousers (32-34 waist), and formal shoes (UK 8-9). Need for upcoming placement interviews. Good condition only please.',
    category: 'clothing',
    budgetMin: 500,
    budgetMax: 2000,
  },
  {
    title: 'Wireless earbuds / TWS under ₹1000',
    description: 'Looking for any decent TWS earbuds. Should have good battery life (4+ hours) and decent sound quality. Mic quality matters for online classes.',
    category: 'electronics',
    budgetMin: 300,
    budgetMax: 1000,
  },
  {
    title: 'Old monitor for dual-screen setup',
    description: 'Need any monitor (21"+) for a dual screen coding setup. 1080p preferred. HDMI or VGA input. Even an old monitor works as long as display is clear.',
    category: 'electronics',
    budgetMin: 2000,
    budgetMax: 6000,
  },
];

// ─── Seed Function ──────────────────────────────────────────────────────────────
async function seedDatabase() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  Campus Marketplace — Database Seeder            ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  const dbURI = process.env.MONGODB_URI;
  if (!dbURI) {
    console.error('❌ MONGODB_URI is not set in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(dbURI);
    console.log(`📦 Connected to MongoDB\n`);
  } catch (err) {
    console.error(`❌ Failed to connect: ${err.message}`);
    process.exit(1);
  }

  // ── Clear old data ──────────────────────────────────────────────────────────
  console.log('🧹 Clearing existing data…');
  await User.deleteMany({});
  await Listing.deleteMany({});
  await BuyerDemand.deleteMany({});
  console.log('   ✅ Cleared users, listings, and demands\n');

  // ── Create Users ────────────────────────────────────────────────────────────
  console.log('👥 Creating sample users…');
  const createdUsers = [];
  for (const userData of USERS) {
    const user = new User(userData);
    await user.save();
    createdUsers.push(user);
    console.log(`   ✅ ${user.realName} (${user.anonymousNickname}) — ${user.hostelBlock}`);
  }
  console.log(`   → ${createdUsers.length} users created\n`);

  // ── Create Listings ─────────────────────────────────────────────────────────
  console.log('📦 Creating sample listings…');
  let listingCount = 0;
  for (const listingData of LISTINGS) {
    // Assign a random seller from created users
    const seller = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    const listing = new Listing({
      ...listingData,
      seller: seller._id,
    });
    await listing.save();
    listingCount++;
    console.log(`   ✅ [${listingData.category}] ${listingData.title} — ₹${listingData.price} (${listingData.images.length} img)`);
  }
  console.log(`   → ${listingCount} listings created\n`);

  // ── Create Buyer Demands ────────────────────────────────────────────────────
  console.log('📋 Creating buyer demands…');
  let demandCount = 0;
  for (const demandData of DEMANDS) {
    const buyer = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    const demand = new BuyerDemand({
      ...demandData,
      buyer: buyer._id,
    });
    await demand.save();
    demandCount++;
    console.log(`   ✅ [${demandData.category}] ${demandData.title}`);
  }
  console.log(`   → ${demandCount} demands created\n`);

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log('╔══════════════════════════════════════════════════╗');
  console.log(`║  Seeding Complete!                                ║`);
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  👥 Users:   ${String(createdUsers.length).padEnd(35)}║`);
  console.log(`║  📦 Listings: ${String(listingCount).padEnd(34)}║`);
  console.log(`║  📋 Demands:  ${String(demandCount).padEnd(34)}║`);
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║  Login credentials for all users:                ║');
  console.log('║  Password: password123                           ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  console.log('📧 Sample login emails:');
  createdUsers.forEach((u) => {
    console.log(`   • ${u.email}`);
  });
  console.log('');

  await mongoose.disconnect();
  console.log('📦 Disconnected from MongoDB.\n');
  process.exit(0);
}

// ─── Run ────────────────────────────────────────────────────────────────────────
seedDatabase().catch((err) => {
  console.error('❌ Seed script error:', err);
  process.exit(1);
});
