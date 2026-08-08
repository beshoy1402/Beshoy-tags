/* =========================================================================
   BESHOY TAGS — STOREFRONT LOGIC
   ========================================================================= */

function formatPrice(amount, currency) {
  return `${Number(amount).toLocaleString()} ${currency || "EGP"}`;
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ---------------- Cart ---------------- */
const Cart = {
  items: Store.getCart(), // [{id, qty, variants: {type: option}}]

  save() {
    Store.saveCart(this.items);
    this.renderCount();
    this.renderDrawer();
  },

  add(productId, qty, variants) {
    const existing = this.items.find(
      (i) => i.id === productId && JSON.stringify(i.variants) === JSON.stringify(variants)
    );
    if (existing) {
      existing.qty += qty;
    } else {
      this.items.push({ id: productId, qty, variants: variants || {} });
    }
    this.save();
    showToast("Added to cart");
  },

  updateQty(index, qty) {
    if (qty < 1) return this.remove(index);
    this.items[index].qty = qty;
    this.save();
  },

  remove(index) {
    this.items.splice(index, 1);
    this.save();
  },

  totals() {
    let subtotal = 0;
    let discount = 0;
    this.items.forEach((item) => {
      const p = Store.getProduct(item.id);
      if (!p) return;
      subtotal += p.oldPrice * item.qty;
      discount += (p.oldPrice - p.price) * item.qty;
    });
    return { subtotal, discount, total: subtotal - discount };
  },

  renderCount() {
    const count = this.items.reduce((sum, i) => sum + i.qty, 0);
    const el = document.getElementById("cartCount");
    if (el) el.textContent = count;
  },

  renderDrawer() {
    const container = document.getElementById("cartItems");
    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = `<div class="cart-empty">Your cart is empty.</div>`;
    } else {
      container.innerHTML = this.items
        .map((item, idx) => {
          const p = Store.getProduct(item.id);
          if (!p) return "";
          const variantText = Object.values(item.variants || {}).join(" / ");
          return `
            <div class="cart-item">
              <img src="${p.image}" alt="${p.name}">
              <div class="cart-item-info">
                <h4>${p.name}</h4>
                ${variantText ? `<div class="cart-item-meta">${variantText}</div>` : ""}
                <div class="cart-item-bottom">
                  <div class="cart-qty">
                    <button onclick="Cart.updateQty(${idx}, ${item.qty - 1})">−</button>
                    <span>${item.qty}</span>
                    <button onclick="Cart.updateQty(${idx}, ${item.qty + 1})">+</button>
                  </div>
                  <span class="cart-item-price">${formatPrice(p.price * item.qty, p.currency)}</span>
                </div>
                <button class="cart-remove" onclick="Cart.remove(${idx})">Remove</button>
              </div>
            </div>`;
        })
        .join("");
    }

    const t = this.totals();
    document.getElementById("sumSubtotal").textContent = formatPrice(t.subtotal, "EGP");
    document.getElementById("sumDiscount").textContent = "-" + formatPrice(t.discount, "EGP");
    document.getElementById("sumTotal").textContent = formatPrice(t.total, "EGP");
  }
};

function initCartUI() {
  const overlay = document.getElementById("cartOverlay");
  const drawer = document.getElementById("cartDrawer");
  const open = () => { overlay.classList.add("open"); drawer.classList.add("open"); };
  const close = () => { overlay.classList.remove("open"); drawer.classList.remove("open"); };

  document.getElementById("cartToggle")?.addEventListener("click", open);
  document.getElementById("cartClose")?.addEventListener("click", close);
  overlay?.addEventListener("click", close);

  document.getElementById("checkoutBtn")?.addEventListener("click", () => {
    if (Cart.items.length === 0) return showToast("Your cart is empty");
    const t = Cart.totals();
    alert(
      `Order summary\n\nItems: ${Cart.items.reduce((s, i) => s + i.qty, 0)}\nSubtotal: ${formatPrice(t.subtotal, "EGP")}\nDiscount: -${formatPrice(t.discount, "EGP")}\nTotal: ${formatPrice(t.total, "EGP")}\n\n(Connect this button to a real checkout / WhatsApp order / payment link when ready.)`
    );
  });

  Cart.renderCount();
  Cart.renderDrawer();
}

/* ---------------- Product grid (index.html) ---------------- */
function renderProductGrid() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;
  const products = Store.getProducts();

  if (products.length === 0) {
    grid.innerHTML = `<p style="color:var(--muted);">No products yet. Add some from the <a href="admin.html" style="text-decoration:underline;">admin page</a>.</p>`;
    return;
  }

  grid.innerHTML = products
    .map((p) => {
      const discountPct = p.oldPrice > p.price
        ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)
        : 0;
      return `
        <div class="product-card">
          <a href="product.html?id=${p.id}">
            <div class="thumb">
              ${discountPct > 0 ? `<span class="badge-discount">-${discountPct}%</span>` : ""}
              <img src="${p.image}" alt="${p.name}" loading="lazy">
            </div>
          </a>
          <div class="body">
            <a href="product.html?id=${p.id}"><h3>${p.name}</h3></a>
            <div class="price-row">
              <span class="price-current">${formatPrice(p.price, p.currency)}</span>
              ${p.oldPrice > p.price ? `<span class="price-old">${formatPrice(p.oldPrice, p.currency)}</span>` : ""}
            </div>
            <button class="btn btn-dark add-btn" onclick="Cart.add(${p.id}, 1, {})">Add to cart</button>
          </div>
        </div>`;
    })
    .join("");
}

/* ---------------- Product detail (product.html) ---------------- */
function renderProductDetail() {
  const container = document.getElementById("productDetail");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  const p = Store.getProduct(id);

  if (!p) {
    container.innerHTML = `<p>Product not found. <a href="index.html">Back to shop</a></p>`;
    return;
  }

  document.title = `${p.name} — Beshoy Tags`;
  document.getElementById("crumbName").textContent = p.name;

  const discountPct = p.oldPrice > p.price
    ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)
    : 0;

  const images = (p.images && p.images.length ? p.images : [p.image]);

  container.innerHTML = `
    <div>
      <div class="gallery-main"><img id="galleryMain" src="${images[0]}" alt="${p.name}"></div>
      ${images.length > 1 ? `
        <div class="gallery-thumbs">
          ${images.map((img, i) => `
            <button class="thumb-btn ${i === 0 ? "active" : ""}" onclick="setGalleryImage('${img}', this)">
              <img src="${img}" alt="thumb ${i+1}">
            </button>`).join("")}
        </div>` : ""}
    </div>
    <div>
      <h1 class="pd-title">${p.name}</h1>
      <div class="pd-price-row">
        <span class="pd-price-current">${formatPrice(p.price, p.currency)}</span>
        ${p.oldPrice > p.price ? `<span class="pd-price-old">${formatPrice(p.oldPrice, p.currency)}</span>` : ""}
        ${discountPct > 0 ? `<span class="pd-discount">Save ${discountPct}%</span>` : ""}
      </div>
      <p class="pd-desc">${p.description || ""}</p>

      <div id="variantGroups"></div>

      <div class="qty-row">
        <div class="qty-control">
          <button onclick="stepQty(-1)">−</button>
          <input type="text" id="qtyInput" value="1" readonly>
          <button onclick="stepQty(1)">+</button>
        </div>
        <button class="btn btn-primary" style="flex:1;" ${p.available === false ? "disabled" : ""} onclick="addCurrentToCart(${p.id})">
          ${p.available === false ? "Out of stock" : "Add to cart"}
        </button>
      </div>

      ${p.specifications && p.specifications.length ? `
        <table class="spec-table">
          ${p.specifications.map((s) => `<tr><td>${s.label}</td><td>${s.value}</td></tr>`).join("")}
        </table>` : ""}
    </div>
  `;

  // Render variant chip groups
  const variantContainer = document.getElementById("variantGroups");
  window._selectedVariants = {};
  (p.variants || []).forEach((group) => {
    window._selectedVariants[group.type] = group.options[0];
    const div = document.createElement("div");
    div.className = "variant-group";
    div.innerHTML = `
      <label class="group-label">${group.type}</label>
      <div class="variant-options">
        ${group.options.map((opt, i) => `
          <button type="button" class="variant-chip ${i === 0 ? "active" : ""}" onclick="selectVariant('${group.type}', '${opt}', this)">${opt}</button>
        `).join("")}
      </div>`;
    variantContainer.appendChild(div);
  });
}

function setGalleryImage(src, btn) {
  document.getElementById("galleryMain").src = src;
  document.querySelectorAll(".thumb-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
}

function selectVariant(type, option, btn) {
  window._selectedVariants[type] = option;
  btn.parentElement.querySelectorAll(".variant-chip").forEach((c) => c.classList.remove("active"));
  btn.classList.add("active");
}

function stepQty(delta) {
  const input = document.getElementById("qtyInput");
  const val = Math.max(1, Number(input.value) + delta);
  input.value = val;
}

function addCurrentToCart(productId) {
  const qty = Number(document.getElementById("qtyInput").value);
  Cart.add(productId, qty, window._selectedVariants || {});
}

/* ---------------- Init ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  initCartUI();
  renderProductGrid();
  renderProductDetail();
});
