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
the site). The admin page has four tabs:

### Products tab
- **Add product** — fill in name, category, description, price/old price,
  stock status, and upload one or more images straight from your laptop
  (drag or click the upload box).
- **Edit** — click Edit on any row to change any of its fields or images.
- **Delete** — removes the product (with a confirmation prompt).

### Categories tab
Add or delete categories (starts with NFC Coasters, Smart Stands, Smart
Cards, Smart Keychains — edit the starting list in `js/settings.js` under
`DEFAULT_CATEGORIES`). Categories show up as filter chips on the homepage.
Assign a product to a category from its edit form in the Products tab.

### Customization tab
Edit site-wide info: homepage tagline, phone number, WhatsApp number
(used for receiving orders — see below), email, address, and optional
Instagram/Facebook links. Click "Save changes", then "Export
settings.json" and paste its contents into `js/settings.js`
(`DEFAULT_SETTINGS`) to make it permanent on the live site.

### Orders tab
See the important note below — because this is a static site, this tab
mainly reflects orders placed in *your own* browser, not automatically
across every customer's device.

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

### How orders actually reach you

GitHub Pages can't run a database or receive form submissions on its own,
so there's no way for a stranger's checkout on their phone to
automatically appear in your Admin > Orders tab — that tab only sees
orders placed in the same browser. To make sure you never miss a real
order, checkout instead:

1. Collects the customer's name, phone, address, and notes.
2. Opens WhatsApp (using the number set in Admin > Customization) with
   the full order pre-filled as a message, so the customer just hits
   send.
3. Also logs a copy of the order locally, in case you're testing.

If you'd rather receive orders by email, or want them to land in a shared
spreadsheet everyone on your team can see, that needs a small third-party
service (like Formspree, Google Sheets via Apps Script, or a lightweight
backend) — let me know and I can wire one in.

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
