# شاي غزالة — Shay Ghazalah Pre‑Order App · Setup Guide

A Laravel 11 + Filament 3 + Livewire 3 cafe pre‑order application for **Riyadh, KSA**, with
an Arabic/RTL storefront, a secure admin dashboard, and **Moyasar** payments
(Mada, Apple Pay, STC Pay, Visa, MasterCard).

> This folder contains all the **application‑specific** source files. Because the
> machine has no PHP/Composer yet, you first generate a clean Laravel skeleton,
> overlay these files onto it, then install dependencies. Steps below are exact.

---

## 1. Install prerequisites (Windows)

You need **PHP 8.2+**, **Composer**, and **Node 18+** (Node 24 is already installed here).

Easiest path on Windows is [**Laragon**](https://laragon.org/download/) (bundles PHP + Composer + MySQL),
or install them individually:

- PHP 8.2+: https://windows.php.net/download (enable extensions: `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`, `gd`, `curl`, `zip`, `bcmath`, `intl`).
- Composer: https://getcomposer.org/Composer-Setup.exe
- A database: MySQL/MariaDB (via Laragon/XAMPP) — or use SQLite for quick testing.

Verify in a new terminal:

```powershell
php --version        # >= 8.2
composer --version
node --version        # >= 18
```

---

## 2. Generate the Laravel skeleton and overlay this code

These files are app‑specific (models, migrations, Livewire, Filament, views, config).
The full framework skeleton (`artisan`, `public/`, `config/*`, `storage/`, default
migrations, etc.) comes from a fresh Laravel project. Create one, then overlay our files
on top.

```powershell
# From C:\Users\PC\Desktop
composer create-project laravel/laravel:^11.0 shay-ghazalah

# Overlay our generated files onto the fresh skeleton (our files win on conflict).
robocopy "C:\Users\PC\Desktop\Tea" "C:\Users\PC\Desktop\shay-ghazalah" /E

cd C:\Users\PC\Desktop\shay-ghazalah
```

`robocopy /E` copies all files and folders, overwriting the skeleton’s
`composer.json`, `bootstrap/`, `routes/web.php`, `app/Models/User.php`,
`app/Providers/AppServiceProvider.php`, etc. with ours, while keeping every other
skeleton file (artisan, public, config, default migrations…).

---

## 3. Install dependencies

```powershell
composer update           # installs laravel + filament + livewire (from our composer.json)
php artisan filament:assets
npm install
```

---

## 4. Configure environment

```powershell
copy .env.example .env
php artisan key:generate
```

Edit `.env` and set your database credentials. For a quick test with **SQLite** instead of MySQL:

```dotenv
DB_CONNECTION=sqlite
# remove/blank the DB_HOST/PORT/DATABASE/USERNAME/PASSWORD lines
```
…then create the file: `New-Item database\database.sqlite -ItemType File`.

Set the Moyasar keys now (or later from the Admin → Settings page):

```dotenv
MOYASAR_PUBLISHABLE_KEY=pk_test_xxx
MOYASAR_SECRET_KEY=sk_test_xxx
MOYASAR_WEBHOOK_SECRET=choose-a-long-random-string
```

---

## 5. Migrate, seed, and link storage

```powershell
php artisan migrate --seed
php artisan storage:link
```

The seeder creates:
- An **admin** user → `admin@shayghazalah.com` / `password`  ⚠️ **change the password after first login**.
- Default compliance settings + policy texts (placeholders — edit them in the dashboard).
- A sample Arabic menu (شاي، مشروبات، شباتي، وجبات خفيفة) with variations.

---

## 6. Run

```powershell
# terminal 1
php artisan serve
# terminal 2 (asset watcher) — or run `npm run build` once for production
npm run dev
```

- **Storefront (Arabic/RTL):** http://localhost:8000
- **Admin dashboard (Filament):** http://localhost:8000/admin

---

## 7. Moyasar payment configuration

1. Create an account at https://dashboard.moyasar.com and get your **Publishable** and **Secret** keys.
2. Enter them in **Admin → الإعدادات → إعدادات المتجر** (these override `.env` at runtime),
   or keep them in `.env`.
3. **Webhook:** in the Moyasar dashboard add a webhook pointing to:
   `https://YOUR_DOMAIN/webhooks/moyasar`
   and set its **secret token** to the exact value of `MOYASAR_WEBHOOK_SECRET`
   (or the value saved on the Settings page). The app verifies this token on every webhook.
4. Payment flow:
   `Checkout → create pending order → /payment/{order} (Moyasar hosted form) → callback verifies via API → success/failed`.
   The webhook independently confirms payment server‑to‑server (idempotent), so orders are
   marked **paid** even if the customer closes the browser before the redirect.

> Amounts are sent to Moyasar in **halalas** (1 SAR = 100). Mada/Visa/MasterCard use the
> `creditcard` method; Apple Pay and STC Pay are enabled in `config/moyasar.php`.

---

## 8. KSA compliance (Ministry of Commerce)

Set these in **Admin → الإعدادات → إعدادات المتجر** — they render in the storefront footer on every page:

- **رقم السجل التجاري** (`cr_number`)
- **الرقم الضريبي** (`vat_number`)
- **رابط التوثيق – معروف / المركز السعودي للأعمال** (`sbc_link`)
- **رقم التواصل** (`contact_phone`) and **رابط موقع الاستلام** (`pickup_map_url`)

Policies (الشروط والأحكام، سياسة الخصوصية، سياسة الاسترجاع) are editable in
**Admin → الإعدادات → السياسات والشروط** and shown at `/policy/terms`, `/policy/privacy`, `/policy/refund`.

The storefront shows **"الأسعار تشمل ضريبة القيمة المضافة 15%"** and every order stores the
net subtotal, the extracted 15% VAT, and the VAT‑inclusive total.

---

## 9. Project structure (the files in this folder)

```
app/
  Filament/
    Pages/ManageSettings.php, ManagePolicies.php        # dynamic settings + policies
    Resources/CategoryResource, ProductResource, OrderResource  # menu & order managers
  Http/Controllers/PaymentController.php                # Moyasar show/callback/webhook
  Livewire/Storefront/Menu.php, CartBar.php, Checkout.php
  Models/                                               # Setting, Category, Product, ProductVariation, Order, OrderItem, User
  Providers/Filament/AdminPanelProvider.php             # /admin panel (brand colors + Tajawal + RTL)
  Services/CartService.php, OrderService.php, MoyasarService.php
config/moyasar.php
database/migrations/2026_01_01_*                        # settings, categories, products, variations, orders, order_items
database/seeders/DatabaseSeeder.php
resources/views/                                        # RTL layout, partials (header/footer), livewire + payment + policy views
routes/web.php
```

---

## 10. Security notes

- All prices are recomputed **server‑side** from the database at checkout (`OrderService`) — the
  client cannot tamper with amounts.
- Payment status is **never** trusted from the browser redirect alone; the server re‑fetches the
  payment from the Moyasar API and the webhook is authenticated by a shared secret (`hash_equals`).
- The webhook route is excluded from CSRF (it’s server‑to‑server) in `bootstrap/app.php`.
- Saudi mobile numbers are validated (`05XXXXXXXX` / `+9665XXXXXXXX`).
- Only users with `is_admin = true` can access `/admin` (`User::canAccessPanel`).
- Policy HTML is admin‑authored and rendered raw; keep admin accounts secured.
