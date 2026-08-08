/* =========================================================================
   BESHOY TAGS — ADMIN LOGIC
   =========================================================================
   SECURITY NOTE: This is a purely client-side admin page, which is what's
   possible on a static host like GitHub Pages (no server/database). The
   password check below only hides the page from casual visitors — anyone
   who reads the page source can see the password and bypass it. Do not
   rely on this for real access control or store sensitive data here.
   For real authentication you'd need a backend (e.g. a small Node/Firebase
   app) instead of GitHub Pages.
   ========================================================================= */

// CHANGE THE ADMIN PASSWORD HERE
const ADMIN_PASSWORD = "beshoy2026";

let currentImages = [];

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

function tryLogin() {
  const input = document.getElementById("adminPassword").value;
  if (input === ADMIN_PASSWORD) {
    Store.setAdminAuthed(true);
    showAdminApp();
  } else {
    showToast("Incorrect password");
  }
}

function logout() {
  Store.setAdminAuthed(false);
  location.reload();
}

function showAdminApp() {
  document.getElementById("lockScreen").style.display = "none";
  document.getElementById("adminApp").style.display = "block";
  renderAdminTable();
  renderOrdersTable();
  renderCategoriesTab();
  populateCategorySelect();
  loadSettingsForm();
}

function switchTab(tab) {
  document.querySelectorAll(".admin-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tab);
  });
  document.querySelectorAll(".admin-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `tab-${tab}`);
  });
  if (tab === "orders") renderOrdersTable();
  if (tab === "categories") renderCategoriesTab();
  if (tab === "customization") loadSettingsForm();
}

function renderAdminTable() {
  const tbody = document.getElementById("adminTableBody");
  const products = Store.getRawProducts();

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:40px;">No products yet. Click "+ Add product" to create one.</td></tr>`;
    return;
  }

  tbody.innerHTML = products
    .map((p) => {
      const overridden = PRICE_OVERRIDES[p.id] !== undefined;
      const displayPrice = overridden ? PRICE_OVERRIDES[p.id] : p.price;
      return `
        <tr>
          <td><img class="admin-thumb" src="${p.image || (p.images && p.images[0]) || ''}" alt="${p.name}"></td>
          <td class="prod-name">${p.name}${overridden ? ' <span class="hint">(price override active)</span>' : ""}</td>
          <td>${p.category || "—"}</td>
          <td class="price-cell">
            ${formatEGP(displayPrice)}
            ${p.oldPrice > p.price ? `<span class="old">${formatEGP(p.oldPrice)}</span>` : ""}
          </td>
          <td><span class="availability-pill ${p.available === false ? "out" : "in"}">${p.available === false ? "Out of stock" : "In stock"}</span></td>
          <td>
            <div class="row-actions">
              <button class="edit-link" onclick="openProductModal(${p.id})">Edit</button>
              <button class="delete-link" onclick="handleDelete(${p.id})">Delete</button>
            </div>
          </td>
        </tr>`;
    })
    .join("");
}

function populateCategorySelect() {
  const select = document.getElementById("fCategory");
  if (!select) return;
  const categories = Store.getCategories();
  select.innerHTML = categories.map((c) => `<option value="${c}">${c}</option>`).join("");
}

function formatEGP(n) {
  return `${Number(n).toLocaleString()} EGP`;
}

/* ---------------- Modal / form ---------------- */
function openProductModal(id) {
  const modal = document.getElementById("productModal");
  const form = document.getElementById("productForm");
  form.reset();
  currentImages = [];

  if (id) {
    const p = Store.getRawProducts().find((x) => x.id === id);
    document.getElementById("modalTitle").textContent = "Edit product";
    document.getElementById("fId").value = p.id;
    document.getElementById("fName").value = p.name || "";
    document.getElementById("fDescription").value = p.description || "";
    document.getElementById("fPrice").value = p.price ?? "";
    document.getElementById("fOldPrice").value = p.oldPrice ?? "";
    document.getElementById("fAvailable").value = String(p.available !== false);
    currentImages = p.images && p.images.length ? [...p.images] : (p.image ? [p.image] : []);
    populateCategorySelect();
    if (p.category) document.getElementById("fCategory").value = p.category;
  } else {
    document.getElementById("modalTitle").textContent = "Add product";
    document.getElementById("fId").value = "";
    document.getElementById("fAvailable").value = "true";
    populateCategorySelect();
  }

  renderImagePreviews();
  modal.classList.add("open");
}

function closeProductModal() {
  document.getElementById("productModal").classList.remove("open");
}

function handleImageUpload(event) {
  const files = Array.from(event.target.files || []);
  let remaining = files.length;
  if (remaining === 0) return;

  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      currentImages.push(e.target.result); // base64 data URL
      renderImagePreviews();
    };
    reader.readAsDataURL(file);
  });

  event.target.value = ""; // allow re-selecting the same file
}

function renderImagePreviews() {
  const grid = document.getElementById("imagePreviewGrid");
  grid.innerHTML = currentImages
    .map(
      (img, i) => `
      <div class="image-preview-item">
        <img src="${img}" alt="preview ${i+1}">
        <button type="button" class="remove-img" onclick="removeImage(${i})">×</button>
      </div>`
    )
    .join("");
}

function removeImage(index) {
  currentImages.splice(index, 1);
  renderImagePreviews();
}

function saveProductForm() {
  const id = document.getElementById("fId").value;
  const name = document.getElementById("fName").value.trim();
  const price = Number(document.getElementById("fPrice").value);
  const oldPrice = Number(document.getElementById("fOldPrice").value) || price;

  if (!name) return showToast("Product name is required");
  if (isNaN(price)) return showToast("Enter a valid price");
  if (currentImages.length === 0) {
    currentImages = ["assets/images/placeholder/product-1.svg"];
  }

  const discount = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  const productData = {
    name,
    category: document.getElementById("fCategory").value,
    description: document.getElementById("fDescription").value.trim(),
    image: currentImages[0],
    images: currentImages,
    price,
    oldPrice,
    currency: "EGP",
    discount,
    available: document.getElementById("fAvailable").value === "true",
    variants: [],
    specifications: []
  };

  if (id) {
    // preserve existing variants/specs when editing
    const existing = Store.getRawProducts().find((p) => p.id === Number(id));
    if (existing) {
      productData.variants = existing.variants || [];
      productData.specifications = existing.specifications || [];
    }
    Store.updateProduct(id, productData);
    showToast("Product updated");
  } else {
    Store.addProduct(productData);
    showToast("Product added");
  }

  closeProductModal();
  renderAdminTable();
}

function handleDelete(id) {
  if (!confirm("Delete this product? This cannot be undone (in this browser).")) return;
  Store.deleteProduct(id);
  renderAdminTable();
  showToast("Product deleted");
}

function handleResetDefaults() {
  if (!confirm("Reset all products back to the original defaults from products.js? Your local edits will be lost.")) return;
  Store.resetToDefaults();
  renderAdminTable();
  showToast("Reset to defaults");
}

function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      Store.importProducts(e.target.result);
      renderAdminTable();
      showToast("Products imported");
    } catch (err) {
      showToast("Invalid JSON file");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

/* ---------------- Orders tab ---------------- */
function renderOrdersTable() {
  const tbody = document.getElementById("ordersTableBody");
  if (!tbody) return;
  const orders = Store.getOrders();

  const countEl = document.getElementById("ordersCount");
  if (countEl) countEl.textContent = orders.length > 0 ? orders.length : "";

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:40px;">No orders yet. Orders placed at checkout in this browser will appear here.</td></tr>`;
    return;
  }

  tbody.innerHTML = orders
    .map((o) => {
      const date = new Date(o.createdAt).toLocaleString();
      const itemsText = o.items
        ? o.items.map((i) => `${i.qty}x ${i.name}`).join(", ")
        : o.summary || "—";
      return `
        <tr>
          <td><span class="order-id">#${o.id}</span><span class="order-date">${date}</span></td>
          <td>${o.customerName || "—"}<br><span class="hint">${o.customerPhone || ""}</span></td>
          <td class="order-items">${itemsText}</td>
          <td>${formatEGP(o.total || 0)}</td>
          <td>
            <select class="status-select" onchange="Store.updateOrderStatus(${o.id}, this.value); renderOrdersTable();">
              ${["New", "Processing", "Completed", "Cancelled"].map(
                (s) => `<option value="${s}" ${o.status === s ? "selected" : ""}>${s}</option>`
              ).join("")}
            </select>
          </td>
          <td><button class="delete-link" onclick="handleDeleteOrder(${o.id})">Delete</button></td>
        </tr>`;
    })
    .join("");
}

function handleDeleteOrder(id) {
  if (!confirm("Delete this order record?")) return;
  Store.deleteOrder(id);
  renderOrdersTable();
}

function openManualOrderModal() {
  document.getElementById("orderModal").classList.add("open");
}
function closeManualOrderModal() {
  document.getElementById("orderModal").classList.remove("open");
}
function saveManualOrder() {
  const name = document.getElementById("oName").value.trim();
  if (!name) return showToast("Customer name is required");
  Store.addOrder({
    customerName: name,
    customerPhone: document.getElementById("oPhone").value.trim(),
    summary: document.getElementById("oSummary").value.trim(),
    total: Number(document.getElementById("oTotal").value) || 0
  });
  closeManualOrderModal();
  document.getElementById("oName").value = "";
  document.getElementById("oPhone").value = "";
  document.getElementById("oSummary").value = "";
  document.getElementById("oTotal").value = "";
  renderOrdersTable();
  showToast("Order logged");
}

/* ---------------- Categories tab ---------------- */
function renderCategoriesTab() {
  const list = document.getElementById("categoryList");
  if (!list) return;
  const categories = Store.getCategories();
  const products = Store.getRawProducts();

  list.innerHTML = categories
    .map((c) => {
      const count = products.filter((p) => p.category === c).length;
      return `
        <div class="category-item">
          <div><span class="cat-name">${c}</span><span class="cat-count">${count} product${count === 1 ? "" : "s"}</span></div>
          <button onclick="handleDeleteCategory('${c.replace(/'/g, "\\'")}')">Delete</button>
        </div>`;
    })
    .join("");
}

function handleAddCategory() {
  const input = document.getElementById("newCategoryInput");
  const name = input.value.trim();
  if (!name) return showToast("Enter a category name");
  Store.addCategory(name);
  input.value = "";
  renderCategoriesTab();
  populateCategorySelect();
  showToast("Category added");
}

function handleDeleteCategory(name) {
  if (!confirm(`Delete category "${name}"? Products already assigned to it will keep the label until you edit them.`)) return;
  Store.deleteCategory(name);
  renderCategoriesTab();
  populateCategorySelect();
}

/* ---------------- Customization tab ---------------- */
function loadSettingsForm() {
  const s = Store.getSettings();
  document.getElementById("sTagline").value = s.tagline || "";
  document.getElementById("sPhone").value = s.phone || "";
  document.getElementById("sWhatsapp").value = s.whatsapp || "";
  document.getElementById("sEmail").value = s.email || "";
  document.getElementById("sAddress").value = s.address || "";
  document.getElementById("sInstagram").value = s.instagram || "";
  document.getElementById("sFacebook").value = s.facebook || "";
}

function saveSettingsForm() {
  const settings = {
    tagline: document.getElementById("sTagline").value.trim(),
    phone: document.getElementById("sPhone").value.trim(),
    whatsapp: document.getElementById("sWhatsapp").value.trim().replace(/\D/g, ""),
    email: document.getElementById("sEmail").value.trim(),
    address: document.getElementById("sAddress").value.trim(),
    instagram: document.getElementById("sInstagram").value.trim(),
    facebook: document.getElementById("sFacebook").value.trim(),
    currency: "EGP"
  };
  Store.saveSettings(settings);
  showToast("Site info saved");
}

/* ---------------- Init ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  if (Store.isAdminAuthed()) {
    showAdminApp();
  }
});
