/* =========================================================================
   BESHOY TAGS — STORAGE LAYER
   =========================================================================
   Handles merging the built-in DEFAULT_PRODUCTS (from products.js) with
   any admin edits saved in the browser's localStorage, and applying
   PRICE_OVERRIDES on top of everything.

   IMPORTANT: localStorage is per-browser. Changes made on the Admin page
   only affect the browser/device you made them on, until you use
   "Export products.json" and commit that file to your GitHub repo —
   that's what makes changes visible to every visitor of the live site.
   ========================================================================= */

const STORAGE_KEY = "beshoyTagsProducts";
const CART_KEY = "beshoyTagsCart";
const ADMIN_AUTH_KEY = "beshoyTagsAdminAuth";

const Store = {
  // Returns the working product list: localStorage version if it exists,
  // otherwise falls back to DEFAULT_PRODUCTS from products.js
  getRawProducts() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Could not read saved products, using defaults.", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
  },

  // Returns products with PRICE_OVERRIDES applied — use this everywhere
  // you need to DISPLAY products.
  getProducts() {
    const products = this.getRawProducts();
    return products.map((p) => {
      const override = PRICE_OVERRIDES[p.id];
      return override !== undefined ? { ...p, price: override } : p;
    });
  },

  getProduct(id) {
    return this.getProducts().find((p) => p.id === Number(id));
  },

  saveProducts(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  },

  addProduct(product) {
    const products = this.getRawProducts();
    const nextId =
      products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    const newProduct = { ...product, id: nextId };
    products.push(newProduct);
    this.saveProducts(products);
    return newProduct;
  },

  updateProduct(id, updates) {
    const products = this.getRawProducts();
    const idx = products.findIndex((p) => p.id === Number(id));
    if (idx === -1) return null;
    products[idx] = { ...products[idx], ...updates, id: Number(id) };
    this.saveProducts(products);
    return products[idx];
  },

  deleteProduct(id) {
    const products = this.getRawProducts().filter((p) => p.id !== Number(id));
    this.saveProducts(products);
  },

  resetToDefaults() {
    localStorage.removeItem(STORAGE_KEY);
  },

  // Downloads the current product list as a JSON file. Commit this file's
  // contents into js/products.js (replacing DEFAULT_PRODUCTS) and push to
  // GitHub to make your changes live for everyone.
  exportProducts() {
    const products = this.getRawProducts();
    const blob = new Blob([JSON.stringify(products, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  importProducts(jsonText) {
    const parsed = JSON.parse(jsonText);
    if (!Array.isArray(parsed)) throw new Error("Invalid product JSON — expected an array.");
    this.saveProducts(parsed);
  },

  // ---- Cart ----
  getCart() {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  },

  saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  },

  // ---- Admin auth (client-side only — see security note in admin.js) ----
  isAdminAuthed() {
    return sessionStorage.getItem(ADMIN_AUTH_KEY) === "true";
  },

  setAdminAuthed(val) {
    sessionStorage.setItem(ADMIN_AUTH_KEY, val ? "true" : "false");
  }
};
