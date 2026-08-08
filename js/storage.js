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
const SETTINGS_KEY = "beshoyTagsSettings";
const CATEGORIES_KEY = "beshoyTagsCategories";
const ORDERS_KEY = "beshoyTagsOrders";

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
    this._downloadJSON(this.getRawProducts(), "products.json");
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
  },

  // ---- Site settings (phone, email, address, etc.) ----
  getSettings() {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {}
    return { ...DEFAULT_SETTINGS };
  },

  saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  exportSettings() {
    this._downloadJSON(this.getSettings(), "settings.json");
  },

  // ---- Categories ----
  getCategories() {
    try {
      const saved = localStorage.getItem(CATEGORIES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [...DEFAULT_CATEGORIES];
  },

  saveCategories(categories) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  },

  addCategory(name) {
    const categories = this.getCategories();
    if (!categories.includes(name)) {
      categories.push(name);
      this.saveCategories(categories);
    }
    return categories;
  },

  deleteCategory(name) {
    const categories = this.getCategories().filter((c) => c !== name);
    this.saveCategories(categories);
    return categories;
  },

  // ---- Orders ----
  // NOTE: because this site has no backend/database, orders placed by a
  // real customer on their own device are NOT automatically visible here
  // — they only show up in the Admin > Orders tab if placed in this same
  // browser (useful for testing). For real customer orders, checkout
  // sends the order details to you via WhatsApp (configured in
  // Admin > Customization) so you never miss one, AND logs a local copy
  // if you happen to be testing in this browser.
  getOrders() {
    try {
      const saved = localStorage.getItem(ORDERS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  },

  saveOrders(orders) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  },

  addOrder(order) {
    const orders = this.getOrders();
    const newOrder = {
      id: orders.length > 0 ? Math.max(...orders.map((o) => o.id)) + 1 : 1,
      status: "New",
      createdAt: new Date().toISOString(),
      ...order
    };
    orders.unshift(newOrder);
    this.saveOrders(orders);
    return newOrder;
  },

  updateOrderStatus(id, status) {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === Number(id));
    if (order) {
      order.status = status;
      this.saveOrders(orders);
    }
    return order;
  },

  deleteOrder(id) {
    const orders = this.getOrders().filter((o) => o.id !== Number(id));
    this.saveOrders(orders);
  },

  exportOrders() {
    this._downloadJSON(this.getOrders(), "orders.json");
  },

  // ---- Shared helper ----
  _downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
};
