# Beshoy Tags — Website

A static storefront (HTML/CSS/JS, no build step) with product browsing,
cart, and a password-gated admin page for managing products, prices, and
images. Built to be hosted for free on GitHub Pages.

## File structure

```
index.html          Storefront home page (hero + product grid)
product.html         Product detail page (?id=1 etc.)
admin.html            Admin panel (add/edit/delete products, upload images)
css/style.css          Site-wide styles
css/admin.css           Admin-only styles
js/products.js           ⭐ DEFAULT PRODUCT DATA + PRICE_OVERRIDES — edit here
js/storage.js              Merges saved admin edits with the defaults
js/app.js                    Storefront rendering + cart logic
js/admin.js                    Admin panel logic (auth, CRUD, image upload)
assets/images/placeholder/       Placeholder product images (SVG)
```

## Changing prices — 3 ways

1. **Fastest, one-off:** open `js/products.js`, find `PRICE_OVERRIDES` near
   the top, and add a line like `1: 299,` (product id → new price). This
   always wins over the base price, and you don't have to touch anything
   else.
2. **Editing the source of truth:** open `js/products.js`, find the product
   inside `DEFAULT_PRODUCTS`, and change its `price` / `oldPrice` fields
   directly.
3. **Through the Admin page:** go to `/admin.html`, log in, click "Edit" on
   a product, change the price fields, save. See the note below about
   making admin changes permanent.

## Adding, editing, and deleting products

Go to `/admin.html` and log in with the password set in `js/admin.js`
(`ADMIN_PASSWORD`, default is `beshoy2026` — change this before you share
the site). From there you can:

- **Add product** — fill in name, description, price/old price, stock
  status, and upload one or more images straight from your laptop (drag
  or click the upload box).
- **Edit** — click Edit on any row to change any of its fields or images.
- **Delete** — removes the product (with a confirmation prompt).

### Important: how admin changes become "live"

GitHub Pages only serves static files — there's no database or server
behind it. So the admin page saves your changes to **that browser's local
storage only**. To make changes visible to every visitor of the real
website:

1. In the admin page, click **"Export products.json"**. This downloads a
   JSON file with your current full product list (including any images
   you uploaded, embedded as base64 data).
2. Open that file, copy its contents.
3. Open `js/products.js`, replace the contents of the `DEFAULT_PRODUCTS`
   array with what you copied.
4. Commit and push to GitHub (`git add . && git commit -m "update products"
   && git push`). GitHub Pages rebuilds automatically within a minute or
   two.

Alternatively, click **"Import JSON"** in the admin page to load a
previously exported `products.json` back into the browser — handy for
keeping your local admin view in sync with what's actually deployed.

### About uploaded images

Images you upload in the admin page are converted to embedded base64 data
and stored in your browser (and included in the exported JSON). This means
there's no separate image file to host — but it also means very large
photos will make `products.json` (and therefore `js/products.js`) large.
Resize photos to a reasonable size (under ~500KB each) before uploading
for best results.

### Security note on the admin password

The password check in `admin.html` / `js/admin.js` is **client-side only**
— convenient for keeping casual visitors out, but anyone who views the
page source can read the password and bypass it. Don't rely on it to
protect sensitive data, and don't reuse a password you care about. Real
authentication would require a backend server, which isn't possible on
GitHub Pages alone.

## Placeholder data

The products currently in `js/products.js` are **placeholder/demo data**
(NFC business card, pet tag, luggage tag, desk name plate, wristband,
sticker pack) — not extracted from any real source. The reference site
you originally pointed me to renders its product data client-side via
JavaScript, so it couldn't be scraped by an automated fetch; you'll want
to add your real products (and real photos) through the admin page or
directly in `js/products.js`.

## Local preview

No build tools needed. From this folder, run any static server, e.g.:

```
python3 -m http.server 8000
```

then open `http://localhost:8000` in your browser.
