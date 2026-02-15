
import { Product } from './types';

// Helper to get a date X days from now
export const getFutureDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// --- Curated Base Products (High Quality) ---
const BASE_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Vintage Denim Jacket',
    description: 'A classic rugged denim jacket suitable for all seasons. Features durable stitching and a timeless look.',
    price: 89.99,
    category: 'Clothing',
    origin: 'USA',
    size: 'M',
    color: 'Blue',
    tags: ['jacket', 'denim', 'fashion', 'outerwear', 'blue', 'vintage'],
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80',
    rating: 4.5,
    stockStatus: 'In Stock'
  },
  {
    id: 'p2',
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Immerse yourself in music with industry-leading noise cancellation and 30-hour battery life.',
    price: 249.99,
    category: 'Electronics',
    origin: 'Japan',
    size: 'One Size',
    color: 'Black',
    tags: ['headphones', 'audio', 'wireless', 'tech', 'music', 'gadget'],
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    stockStatus: 'Sold Out',
    restockDate: getFutureDate(14)
  },
  {
    id: 'p3',
    name: 'Organic Cotton T-Shirt',
    description: 'Soft, breathable, and eco-friendly. Made from 100% organic cotton.',
    price: 24.50,
    category: 'Clothing',
    origin: 'Portugal',
    size: 'L',
    color: 'White',
    tags: ['t-shirt', 'cotton', 'eco', 'clothing', 'basic', 'summer'],
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
    rating: 4.2,
    stockStatus: 'In Stock'
  },
  {
    id: 'p4',
    name: 'Ceramic Pour-Over Coffee Set',
    description: 'Brew the perfect cup of coffee with this minimalist ceramic pour-over set. Includes dripper and mug.',
    price: 45.00,
    category: 'Home',
    origin: 'Japan',
    size: 'One Size',
    color: 'White',
    tags: ['coffee', 'kitchen', 'ceramic', 'drink', 'morning'],
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    stockStatus: 'In Stock'
  },
  {
    id: 'p5',
    name: 'Leather Weekend Bag',
    description: 'Premium full-grain leather travel bag. Spacious enough for a weekend getaway.',
    price: 199.00,
    category: 'Accessories',
    origin: 'Italy',
    size: 'One Size',
    color: 'Brown',
    tags: ['bag', 'travel', 'leather', 'luxury', 'luggage'],
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    stockStatus: 'In Stock'
  },
  {
    id: 'p6',
    name: 'Smart Fitness Watch',
    description: 'Track your steps, heart rate, and sleep. Water-resistant and stylish.',
    price: 129.99,
    category: 'Electronics',
    origin: 'China',
    size: 'One Size',
    color: 'Black',
    tags: ['watch', 'fitness', 'tech', 'health', 'sport'],
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    rating: 4.3,
    stockStatus: 'In Stock'
  },
  {
    id: 'p7',
    name: 'Minimalist Desk Lamp',
    description: 'Adjustable LED desk lamp with touch control and warm/cool light settings.',
    price: 55.00,
    category: 'Home',
    origin: 'Sweden',
    size: 'One Size',
    color: 'White',
    tags: ['lamp', 'light', 'desk', 'office', 'furniture'],
    imageUrl: 'https://images.unsplash.com/photo-1507473888900-52a118d62383?auto=format&fit=crop&w=600&q=80',
    rating: 4.4,
    stockStatus: 'In Stock'
  },
  {
    id: 'p8',
    name: 'Running Sneakers AirFlow',
    description: 'Lightweight running shoes designed for speed and comfort. Breathable mesh upper.',
    price: 110.00,
    category: 'Footwear',
    origin: 'Vietnam',
    size: 'L',
    color: 'Red',
    tags: ['sneakers', 'shoes', 'running', 'sport', 'gym'],
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
    stockStatus: 'Sold Out',
    restockDate: getFutureDate(7)
  },
  {
    id: 'p9',
    name: 'Artisan Sourdough Starter Kit',
    description: 'Everything you need to bake delicious sourdough bread at home. Jar, whisk, and instructions included.',
    price: 35.00,
    category: 'Home',
    origin: 'USA',
    size: 'One Size',
    color: 'Beige',
    tags: ['bread', 'baking', 'kitchen', 'food', 'hobby'],
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    rating: 4.1,
    stockStatus: 'In Stock'
  },
  {
    id: 'p10',
    name: 'Cashmere Scarf',
    description: 'Ultra-soft cashmere scarf to keep you warm in style during winter.',
    price: 75.00,
    category: 'Clothing',
    origin: 'Scotland',
    size: 'One Size',
    color: 'Grey',
    tags: ['scarf', 'winter', 'wool', 'clothing', 'warm'],
    imageUrl: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    stockStatus: 'In Stock'
  },
  {
    id: 'p11',
    name: 'Mechanical Keyboard',
    description: 'Tactile mechanical switches with RGB backlighting. Perfect for typing and gaming.',
    price: 140.00,
    category: 'Electronics',
    origin: 'Taiwan',
    size: 'One Size',
    color: 'Black',
    tags: ['keyboard', 'computer', 'tech', 'gaming', 'office'],
    imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    stockStatus: 'In Stock'
  },
  {
    id: 'p12',
    name: 'Bamboo Cutting Board',
    description: 'Durable and sustainable bamboo cutting board with juice groove.',
    price: 25.00,
    category: 'Home',
    origin: 'China',
    size: 'M',
    color: 'Brown',
    tags: ['kitchen', 'cooking', 'wood', 'home', 'tools'],
    imageUrl: 'https://images.unsplash.com/photo-1592155931584-901ac15763e3?auto=format&fit=crop&w=600&q=80',
    rating: 4.5,
    stockStatus: 'In Stock'
  },
  {
    id: 'p13',
    name: 'Classic Wayfarer Sunglasses',
    description: 'Timeless style with UV400 protection. Perfect for sunny days.',
    price: 120.00,
    category: 'Accessories',
    origin: 'Italy',
    size: 'One Size',
    color: 'Black',
    tags: ['sunglasses', 'summer', 'fashion', 'accessories', 'eyewear'],
    imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
    stockStatus: 'In Stock'
  },
  {
    id: 'p14',
    name: 'Potted Succulent',
    description: 'Low maintenance indoor plant in a decorative ceramic pot. Adds life to any room.',
    price: 18.00,
    category: 'Home',
    origin: 'USA',
    size: 'One Size',
    color: 'Green',
    tags: ['plant', 'home', 'decor', 'nature', 'succulent'],
    imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    stockStatus: 'Sold Out',
    restockDate: getFutureDate(3)
  },
  {
    id: 'p15',
    name: 'Insulated Water Bottle',
    description: 'Keeps drinks cold for 24 hours or hot for 12. Stainless steel construction.',
    price: 30.00,
    category: 'Accessories',
    origin: 'China',
    size: 'One Size',
    color: 'Silver',
    tags: ['water', 'bottle', 'gym', 'travel', 'hydration'],
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    stockStatus: 'In Stock'
  },
  {
    id: 'p16',
    name: 'Vintage Film Camera',
    description: 'Refurbished 35mm film camera. Perfect for capturing authentic moments.',
    price: 299.00,
    category: 'Electronics',
    origin: 'Japan',
    size: 'One Size',
    color: 'Black',
    tags: ['camera', 'photo', 'vintage', 'film', 'art'],
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    stockStatus: 'In Stock'
  },
  {
    id: 'p17',
    name: 'Cozy Knit Hoodie',
    description: 'Oversized knit hoodie for maximum comfort. Great for lounging.',
    price: 65.00,
    category: 'Clothing',
    origin: 'Turkey',
    size: 'XL',
    color: 'Beige',
    tags: ['hoodie', 'sweatshirt', 'winter', 'comfort', 'clothing'],
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    rating: 4.4,
    stockStatus: 'In Stock'
  },
  {
    id: 'p18',
    name: 'Mid-Century Accent Chair',
    description: 'Stylish accent chair with wooden legs and fabric upholstery.',
    price: 180.00,
    category: 'Home',
    origin: 'Vietnam',
    size: 'One Size',
    color: 'Orange',
    tags: ['chair', 'furniture', 'home', 'decor', 'living room'],
    imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
    stockStatus: 'In Stock'
  },
    {
    id: 'p19',
    name: 'Pro Yoga Mat',
    description: 'Non-slip surface with extra cushioning for joint support.',
    price: 45.00,
    category: 'Accessories',
    origin: 'Germany',
    size: 'One Size',
    color: 'Purple',
    tags: ['yoga', 'fitness', 'gym', 'exercise', 'mat'],
    imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    stockStatus: 'In Stock'
  },
  {
    id: 'p20',
    name: 'Bluetooth Portable Speaker',
    description: 'Waterproof portable speaker with deep bass and 12-hour playtime.',
    price: 79.99,
    category: 'Electronics',
    origin: 'China',
    size: 'One Size',
    color: 'Blue',
    tags: ['speaker', 'audio', 'music', 'bluetooth', 'tech'],
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80',
    rating: 4.5,
    stockStatus: 'In Stock'
  },
  // --- NEW FOOD ITEMS ---
  {
    id: 'p21',
    name: 'Artisan Dark Chocolate Bar',
    description: '70% cacao dark chocolate with sea salt and caramel nibs. Handcrafted in small batches.',
    price: 8.50,
    category: 'Food',
    origin: 'Belgium',
    size: 'One Size',
    color: 'Brown',
    tags: ['chocolate', 'sweets', 'snack', 'food', 'dessert'],
    imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    stockStatus: 'In Stock'
  },
  {
    id: 'p22',
    name: 'Organic Raw Honey',
    description: 'Pure, unfiltered raw honey sourced from local wildflowers. Perfect for tea or toast.',
    price: 15.00,
    category: 'Food',
    origin: 'USA',
    size: 'One Size',
    color: 'Gold',
    tags: ['honey', 'organic', 'food', 'sweet', 'kitchen'],
    imageUrl: 'https://images.unsplash.com/photo-1555035270-43a75894b4e3?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    stockStatus: 'In Stock'
  },
    {
    id: 'p23',
    name: 'Truffle Infused Olive Oil',
    description: 'Premium extra virgin olive oil infused with black truffles. Elevates pasta and salads.',
    price: 28.00,
    category: 'Food',
    origin: 'Italy',
    size: 'One Size',
    color: 'Yellow',
    tags: ['oil', 'cooking', 'gourmet', 'food', 'italian'],
    imageUrl: 'https://images.unsplash.com/photo-1555663737-0a424a13d7be?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    stockStatus: 'In Stock'
  },
   {
    id: 'p24',
    name: 'Spicy Chili Crisp Sauce',
    description: 'Add heat and crunch to any meal. Made with roasted chilis, garlic, and soybeans.',
    price: 12.00,
    category: 'Food',
    origin: 'China',
    size: 'One Size',
    color: 'Red',
    tags: ['sauce', 'spicy', 'condiment', 'food', 'asian'],
    imageUrl: 'https://images.unsplash.com/photo-1517601278518-e325143a537c?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    stockStatus: 'Sold Out',
    restockDate: getFutureDate(5)
  }
];

// --- Generation Logic ---

const ADJECTIVES = ['Premium', 'Ultra', 'Smart', 'Eco', 'Modern', 'Vintage', 'Sleek', 'Durable', 'Compact', 'Pro', 'Classic', 'Urban', 'Cozy', 'Bold', 'Light', 'Air', 'Royal', 'Grand', 'Elite', 'Zen', 'Tech', 'Nordic', 'Tasty', 'Spicy', 'Sweet'];
const ORIGINS_LIST = ['USA', 'China', 'Japan', 'Germany', 'Italy', 'France', 'UK', 'Vietnam', 'Portugal', 'Sweden', 'Korea', 'India', 'Brazil', 'Belgium', 'Mexico'];

// Mapped Source Data: This ensures the image matches the color and item description.
// Structure: Category -> List of { ImageURL, ValidNouns, ValidColors }
const PRODUCT_SOURCES: Record<string, { url: string, nouns: string[], colors: string[] }[]> = {
  'Clothing': [
    { url: 'https://images.unsplash.com/photo-1551488852-0801464db517?auto=format&fit=crop&w=600&q=80', nouns: ['Coat', 'Jacket'], colors: ['Pink'] },
    { url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80', nouns: ['Jacket', 'Blazer'], colors: ['Blue'] },
    { url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=600&q=80', nouns: ['T-Shirt', 'Top'], colors: ['Black'] },
    { url: 'https://images.unsplash.com/photo-1620799140408-ed5341cd2431?auto=format&fit=crop&w=600&q=80', nouns: ['T-Shirt', 'Blouse'], colors: ['White'] },
    { url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=80', nouns: ['Shirt', 'Sweater'], colors: ['Red'] },
    { url: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=600&q=80', nouns: ['Jeans', 'Pants'], colors: ['Blue'] },
    { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80', nouns: ['T-Shirt'], colors: ['Black'] },
    { url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80', nouns: ['Hoodie'], colors: ['Beige', 'Grey'] },
    { url: 'https://images.unsplash.com/photo-1503341455253-b2e72333dbdb?auto=format&fit=crop&w=600&q=80', nouns: ['T-Shirt'], colors: ['Green', 'Black'] },
    { url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80', nouns: ['Shorts'], colors: ['Pink'] },
    { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80', nouns: ['Shirt', 'Button-up'], colors: ['White', 'Blue'] },
    { url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80', nouns: ['Sweater', 'Knit'], colors: ['Yellow'] },
  ],
  'Electronics': [
    { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', nouns: ['Headphones'], colors: ['Black'] },
    { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80', nouns: ['Headphones'], colors: ['White'] },
    { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80', nouns: ['Watch'], colors: ['White', 'Silver'] },
    { url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80', nouns: ['Watch', 'Tracker'], colors: ['Black'] },
    { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&w=600&q=80', nouns: ['Laptop'], colors: ['Silver', 'Grey'] },
    { url: 'https://images.unsplash.com/photo-1588872650257-7bc36513c622?auto=format&fit=crop&w=600&q=80', nouns: ['Mouse', 'Peripheral'], colors: ['White'] },
    { url: 'https://images.unsplash.com/photo-1618410320928-25228d811631?auto=format&fit=crop&w=600&q=80', nouns: ['Speaker'], colors: ['Blue'] },
    { url: 'https://images.unsplash.com/photo-1585565804112-f201f68c48b4?auto=format&fit=crop&w=600&q=80', nouns: ['Speaker'], colors: ['Black'] },
    { url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600&q=80', nouns: ['Keyboard'], colors: ['Black', 'RGB'] },
    // Expanded Controller options
    { url: 'https://images.unsplash.com/photo-1593118247619-e2d6f056869e?auto=format&fit=crop&w=600&q=80', nouns: ['Controller'], colors: ['Black'] },
    { url: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d88?auto=format&fit=crop&w=600&q=80', nouns: ['Controller'], colors: ['White'] },
    { url: 'https://images.unsplash.com/photo-1592840496058-a763a628d026?auto=format&fit=crop&w=600&q=80', nouns: ['Controller'], colors: ['Blue', 'Red'] },
    { url: 'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?auto=format&fit=crop&w=600&q=80', nouns: ['Gaming Mouse'], colors: ['Black'] },
    { url: 'https://images.unsplash.com/photo-1612287230217-969465901861?auto=format&fit=crop&w=600&q=80', nouns: ['Controller'], colors: ['White'] },
  ],
  'Home': [
    { url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80', nouns: ['Lamp', 'Decor'], colors: ['Gold', 'Yellow'] },
    { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80', nouns: ['Chair'], colors: ['Green'] },
    { url: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=600&q=80', nouns: ['Chair'], colors: ['Grey'] },
    { url: 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?auto=format&fit=crop&w=600&q=80', nouns: ['Candle'], colors: ['Brown', 'Orange'] },
    { url: 'https://images.unsplash.com/photo-1512372487999-9912e74d90ad?auto=format&fit=crop&w=600&q=80', nouns: ['Mug'], colors: ['White'] },
    { url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80', nouns: ['Vase'], colors: ['White', 'Beige'] },
    { url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80', nouns: ['Planter'], colors: ['White', 'Gold'] },
    { url: 'https://images.unsplash.com/photo-1589834390005-5d4fb9bf3d32?auto=format&fit=crop&w=600&q=80', nouns: ['Clock'], colors: ['Black'] },
    { url: 'https://images.unsplash.com/photo-1522758971460-1d21eed7dc1d?auto=format&fit=crop&w=600&q=80', nouns: ['Table'], colors: ['Brown'] },
    { url: 'https://images.unsplash.com/photo-1540932296774-3ed6926b9391?auto=format&fit=crop&w=600&q=80', nouns: ['Towel'], colors: ['Grey'] },
    { url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80', nouns: ['Pillow'], colors: ['Blue', 'White'] },
  ],
  'Accessories': [
    { url: 'https://images.unsplash.com/photo-1627123424574-181ce5171af3?auto=format&fit=crop&w=600&q=80', nouns: ['Bag', 'Purse'], colors: ['Brown'] },
    { url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80', nouns: ['Bag', 'Tote'], colors: ['Brown', 'Leather'] },
    { url: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=600&q=80', nouns: ['Backpack'], colors: ['Grey'] },
    { url: 'https://images.unsplash.com/photo-1551488852-0801464db517?auto=format&fit=crop&w=600&q=80', nouns: ['Hat'], colors: ['Beige'] },
    { url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80', nouns: ['Sunglasses'], colors: ['Black'] },
    { url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80', nouns: ['Sunglasses'], colors: ['Black', 'Tortoise'] },
    { url: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=600&q=80', nouns: ['Wallet'], colors: ['Brown'] },
    { url: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&w=600&q=80', nouns: ['Ring'], colors: ['Silver', 'Gold'] },
    { url: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&w=600&q=80', nouns: ['Perfume'], colors: ['Gold'] },
  ],
  'Footwear': [
    { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80', nouns: ['Sneakers'], colors: ['Red'] },
    { url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&q=80', nouns: ['Sneakers'], colors: ['Green'] },
    { url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80', nouns: ['Sneakers'], colors: ['Black'] },
    { url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80', nouns: ['Sneakers'], colors: ['White', 'Purple'] },
    { url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80', nouns: ['Boots'], colors: ['Brown'] },
    { url: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=600&q=80', nouns: ['Shoes', 'Loafers'], colors: ['Brown'] },
    { url: 'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&w=600&q=80', nouns: ['Shoes', 'Trainers'], colors: ['White'] },
    { url: 'https://images.unsplash.com/photo-1560769629-975e13f0c470?auto=format&fit=crop&w=600&q=80', nouns: ['Shoes', 'Dress'], colors: ['Brown'] },
  ],
  'Food': [
    { url: 'https://images.unsplash.com/photo-1499636138143-bd649043ea52?auto=format&fit=crop&w=600&q=80', nouns: ['Cookies', 'Biscuits'], colors: ['Brown', 'Beige'] },
    { url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80', nouns: ['Cake', 'Pastry'], colors: ['Pink', 'White'] },
    { url: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=600&q=80', nouns: ['Tea', 'Herbs'], colors: ['Green', 'Brown'] },
    { url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80', nouns: ['Juice', 'Drink'], colors: ['Orange', 'Yellow'] },
    { url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80', nouns: ['Coffee', 'Beans'], colors: ['Brown', 'Black'] },
    { url: 'https://images.unsplash.com/photo-1566478919030-26d81dd812de?auto=format&fit=crop&w=600&q=80', nouns: ['Snacks', 'Chips'], colors: ['Yellow', 'Red'] },
    { url: 'https://images.unsplash.com/photo-1599307767316-77889e477611?auto=format&fit=crop&w=600&q=80', nouns: ['Jam', 'Preserves'], colors: ['Red', 'Purple'] },
    { url: 'https://images.unsplash.com/photo-1551462147-37885acc36f1?auto=format&fit=crop&w=600&q=80', nouns: ['Pasta', 'Noodles'], colors: ['Yellow'] },
  ]
};

const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomPrice = (min: number, max: number) => parseFloat((Math.random() * (max - min) + min).toFixed(2));
const randomRating = () => parseFloat((Math.random() * (5.0 - 3.5) + 3.5).toFixed(1));

const generateProducts = (startId: number, count: number): Product[] => {
  const generated: Product[] = [];
  const categories = Object.keys(PRODUCT_SOURCES);

  for (let i = 0; i < count; i++) {
    // 1. Select a random category
    const category = pickRandom(categories);
    const sourceOptions = PRODUCT_SOURCES[category];
    
    // 2. Select a specific source config (Image + Valid attributes)
    // This ensures the Image matches the text.
    const source = pickRandom(sourceOptions);

    // 3. Pick attributes from the VALID list for this image
    const noun = pickRandom(source.nouns);
    const color = pickRandom(source.colors);
    const adjective = pickRandom(ADJECTIVES);
    
    const name = `${adjective} ${color} ${noun}`;
    
    // Logic to vary price based on category
    let minP = 15, maxP = 100;
    if (category === 'Electronics') { minP = 50; maxP = 400; }
    if (category === 'Footwear') { minP = 60; maxP = 200; }
    if (category === 'Accessories') { minP = 20; maxP = 150; }
    if (category === 'Food') { minP = 5; maxP = 40; }

    const size = (category === 'Clothing' || category === 'Footwear') 
      ? pickRandom(['XS', 'S', 'M', 'L', 'XL'] as const) 
      : 'One Size';

    // Simulate 20% stock outage
    const isSoldOut = Math.random() < 0.2;

    generated.push({
      id: `gen_${startId + i}`,
      name: name,
      description: `A ${adjective.toLowerCase()} ${noun.toLowerCase()} designed for modern living. Features high-quality materials from ${pickRandom(ORIGINS_LIST)}.`,
      price: randomPrice(minP, maxP),
      category: category,
      origin: pickRandom(ORIGINS_LIST),
      size: size,
      color: color,
      tags: [noun.toLowerCase(), category.toLowerCase(), color.toLowerCase(), adjective.toLowerCase(), 'shop', 'trend'],
      imageUrl: source.url, // Use the specific URL for this color/noun combo
      rating: randomRating(),
      stockStatus: isSoldOut ? 'Sold Out' : 'In Stock',
      restockDate: isSoldOut ? getFutureDate(Math.floor(Math.random() * 20) + 2) : undefined
    });
  }
  return generated;
};

// Combine base items with 80 new generated items
export const MOCK_PRODUCTS: Product[] = [...BASE_PRODUCTS, ...generateProducts(21, 80)];

export const ORIGINS = Array.from(new Set(MOCK_PRODUCTS.map(p => p.origin))).sort();
export const COLORS = Array.from(new Set(MOCK_PRODUCTS.map(p => p.color))).sort();
export const MAX_PRICE_LIMIT = Math.ceil(Math.max(...MOCK_PRODUCTS.map(p => p.price)));
