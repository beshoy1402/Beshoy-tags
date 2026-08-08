/* =========================================================================
   BESHOY TAGS — PRODUCT DATA
   =========================================================================
   This is the ONLY file you should need to touch to change prices,
   product info, or images (unless you're using the Admin page, which
   edits this data via the browser and lets you export an updated
   version of this file).

   -------------------------------------------------------------------------
   HOW PRICES WORK
   -------------------------------------------------------------------------
   Every product has a base "price" and "oldPrice" below. If you want to
   change a price WITHOUT hunting through the array, add an entry to
   PRICE_OVERRIDES using the product's id. The override always wins.

   Example:
     const PRICE_OVERRIDES = {
       1: 299,   // Product id 1 now costs 299 EGP regardless of price below
       3: 549
     };
   ========================================================================= */

// CHANGE PRODUCT PRICES HERE (quick overrides, keyed by product id)
const PRICE_OVERRIDES = {
  // 1: 299,
  // 2: 399,
};

// CHANGE / ADD PRODUCTS HERE
const DEFAULT_PRODUCTS = [
  {
    id: 1,
    category: "Smart Cards",
    name: "Beshoy Tags — NFC Business Card",
    description:
      "Tap-to-share smart business card. Instantly opens your contact details, website, or social links on any NFC-enabled phone — no app required.",
    image: "assets/images/placeholder/product-1.svg",
    images: ["assets/images/placeholder/product-1.svg"],
    oldPrice: 450,
    price: 320,
    currency: "EGP",
    discount: 29,
    variants: [
      { type: "Color", options: ["Matte Black", "Brushed Gold", "White"] }
    ],
    specifications: [
      { label: "Material", value: "PVC composite, NFC chip NTAG213" },
      { label: "Compatibility", value: "iPhone 7+ / Android NFC-enabled" },
      { label: "Write cycles", value: "Unlimited re-programming" },
      { label: "Size", value: "85.6mm x 54mm (credit card size)" }
    ],
    available: true
  },
  {
    id: 2,
    category: "Smart Keychains",
    name: "Beshoy Tags — Smart Pet ID Tag",
    description:
      "Durable NFC + QR pet tag linking to an online profile with your pet's info and your contact details, so anyone who finds them can reach you fast.",
    image: "assets/images/placeholder/product-2.svg",
    images: ["assets/images/placeholder/product-2.svg"],
    oldPrice: 250,
    price: 180,
    currency: "EGP",
    discount: 28,
    variants: [
      { type: "Shape", options: ["Bone", "Round", "Heart"] },
      { type: "Color", options: ["Silver", "Gold", "Black"] }
    ],
    specifications: [
      { label: "Material", value: "Stainless steel, waterproof" },
      { label: "Technology", value: "NFC + printed QR code" },
      { label: "Profile", value: "Editable online pet profile page" }
    ],
    available: true
  },
  {
    id: 3,
    category: "Smart Keychains",
    name: "Beshoy Tags — Luggage & Bag Tag",
    description:
      "Smart luggage tag with a scannable profile page showing your contact info — help your bag find its way back to you if it's lost in transit.",
    image: "assets/images/placeholder/product-3.svg",
    images: ["assets/images/placeholder/product-3.svg"],
    oldPrice: 300,
    price: 220,
    currency: "EGP",
    discount: 27,
    variants: [
      { type: "Color", options: ["Black", "Navy", "Tan"] }
    ],
    specifications: [
      { label: "Material", value: "PU leather + steel loop" },
      { label: "Technology", value: "NFC + QR code" },
      { label: "Weather resistance", value: "Yes" }
    ],
    available: true
  },
  {
    id: 4,
    category: "Smart Stands",
    name: "Beshoy Tags — Desk Name Plate (Smart)",
    description:
      "An engraved-look desk name plate with an embedded NFC tap point that shares your full contact card and calendar link with visitors.",
    image: "assets/images/placeholder/product-4.svg",
    images: ["assets/images/placeholder/product-4.svg"],
    oldPrice: 600,
    price: 480,
    currency: "EGP",
    discount: 20,
    variants: [
      { type: "Finish", options: ["Brushed Gold", "Matte Black", "Walnut"] }
    ],
    specifications: [
      { label: "Material", value: "Aluminum / wood composite" },
      { label: "Technology", value: "NFC NTAG215" },
      { label: "Size", value: "20cm x 6cm" }
    ],
    available: true
  },
  {
    id: 5,
    category: "Smart Keychains",
    name: "Beshoy Tags — Wristband (Event / Gym)",
    description:
      "Wearable NFC wristband for events, gyms, or access control. Link it to a membership profile, playlist, or digital ID.",
    image: "assets/images/placeholder/product-5.svg",
    images: ["assets/images/placeholder/product-5.svg"],
    oldPrice: 180,
    price: 140,
    currency: "EGP",
    discount: 22,
    variants: [
      { type: "Size", options: ["Small", "Medium", "Large"] },
      { type: "Color", options: ["Black", "Blue", "Red"] }
    ],
    specifications: [
      { label: "Material", value: "Silicone, waterproof" },
      { label: "Technology", value: "NFC NTAG213" }
    ],
    available: true
  },
  {
    id: 6,
    category: "NFC Coasters",
    name: "Beshoy Tags — Smart Drink Coaster",
    description:
      "A café or bar-ready NFC coaster that opens your menu, Wi-Fi login, or review page the moment a guest sets their glass down.",
    image: "assets/images/placeholder/product-6.svg",
    images: ["assets/images/placeholder/product-6.svg"],
    oldPrice: 160,
    price: 120,
    currency: "EGP",
    discount: 25,
    variants: [
      { type: "Material", options: ["Cork", "Slate", "Bamboo"] }
    ],
    specifications: [
      { label: "Diameter", value: "95mm" },
      { label: "Technology", value: "NFC NTAG213" },
      { label: "Water resistance", value: "Splash-proof, wipeable" }
    ],
    available: true
  },
  {
    id: 7,
    category: "Smart Stands",
    name: "Beshoy Tags — Smart Phone Stand",
    description:
      "A desk phone stand with a built-in NFC tap point — perfect for reception desks, cafés, or shops to share menus, Wi-Fi, or contact info.",
    image: "assets/images/placeholder/product-1.svg",
    images: ["assets/images/placeholder/product-1.svg"],
    oldPrice: 350,
    price: 280,
    currency: "EGP",
    discount: 20,
    variants: [
      { type: "Color", options: ["Black", "White", "Walnut"] }
    ],
    specifications: [
      { label: "Material", value: "Aluminum base, wood top" },
      { label: "Technology", value: "NFC NTAG215" },
      { label: "Compatible with", value: "All phone sizes" }
    ],
    available: true
  }
];
