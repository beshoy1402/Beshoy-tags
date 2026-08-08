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
}

function renderAdminTable() {
  const tbody = document.getElementById("adminTableBody");
  const products = Store.getRawProducts();

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:40px;">No products yet. Click "+ Add product" to create one.</td></tr>`;
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
  } else {
    document.getElementById("modalTitle").textContent = "Add product";
    document.getElementById("fId").value = "";
    document.getElementById("fAvailable").value = "true";
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

/* ---------------- Init ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  if (Store.isAdminAuthed()) {
    showAdminApp();
  }
});
