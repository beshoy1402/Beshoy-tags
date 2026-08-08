/* =========================================================================
   BESHOY TAGS — SITE SETTINGS & CATEGORIES
   =========================================================================
   Default categories and default site-wide info (phone, email, etc).
   These are the fallback values — once someone saves changes in the
   Admin > Customization tab or Admin > Categories tab, those saved
   values (in localStorage) take over. Use "Export settings.json" in
   admin to get a copy you can paste back in here to make it permanent.
   ========================================================================= */

// CHANGE STARTING CATEGORIES HERE
const DEFAULT_CATEGORIES = [
  "NFC Coasters",
  "Smart Stands",
  "Smart Cards",
  "Smart Keychains"
];

// CHANGE SITE CONTACT / INFO HERE
const DEFAULT_SETTINGS = {
  tagline: "Smart NFC tags & cards — tap to share, instantly.",
  phone: "+20 100 000 0000",
  whatsapp: "201000000000", // digits only, with country code, no + or spaces — used for WhatsApp order links
  email: "hello@beshoytags.com",
  address: "Cairo, Egypt",
  instagram: "",
  facebook: "",
  currency: "EGP"
};
