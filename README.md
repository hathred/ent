# GoldHat Enterprise — PHP Repo v2.0

**24 sites. 2 brands. 1 design system. 1 database. 0 external dependencies.**

This is the complete codebase for all GoldHat Consulting and ArchDaemon web properties, built from the [GHC Master UI Policy v2.0](https://guis.goldhatconsulting.com).

## Stack

- **Frontend:** goldhat.css + goldhat.js v2.0.0 (Cowboy Noir, Creme/Southwestern)
- **Backend:** PHP 8.4 (strict_types, PDO, prepared statements)
- **Database:** MariaDB (InnoDB, utf8mb4, single shared database)
- **Hosting:** IONOS shared hosting with Apache/.htaccess
- **Dependencies:** Zero external. No CDN. No npm. No composer (yet).

## Repository Structure

```
goldhat-enterprise/
├── shared/                    ← Shared assets (deployed to /shared/ on hosting)
│   ├── v2.0.0/
│   │   ├── goldhat.css        Cowboy Noir design system
│   │   └── goldhat.js         GoldHatUI v2.0.0 (24 modules)
│   ├── php/
│   │   ├── db.php             PDO singleton (GoldHat\DB)
│   │   ├── csrf.php           CSRF verification (GoldHat\CSRF)
│   │   ├── response.php       JSON response helper (GoldHat\Response)
│   │   ├── audit.php          Audit log helper (GoldHat\Audit)
│   │   └── pageview.php       Page view tracker (GoldHat\PageView)
│   └── db_schema.sql          Unified MariaDB schema (13 tables)
│
├── root/                      ← goldhatconsulting.com (/)
├── b2b/                       ← b2b.goldhatconsulting.com (/b2b)
├── bluefieldshop/             ← bluefieldshop.goldhatconsulting.com (/bluefieldshop)
├── compliance/                ← compliance.goldhatconsulting.com (/legal/compliance)
├── dev/                       ← dev.goldhatconsulting.com (/dev)
├── experience/                ← experience.goldhatconsulting.com (/experience)
├── guis/                      ← guis.goldhatconsulting.com (/guis)
├── legal/                     ← legal.goldhatconsulting.com (/legal)
├── pc-vs-iot/                 ← pc-vs-iot.goldhatconsulting.com (/pc-vs-iot)
├── qa/                        ← qa.goldhatconsulting.com (/qa)
├── residential/               ← residential.goldhatconsulting.com (/residential)
├── staging/                   ← staging.goldhatconsulting.com (/staging)
├── org/                       ← thearchdaemon.org (/org)
├── catgod/                    ← catgod.thearchdaemon.org (/catgod)
├── catgod-density/            ← catgod-density.thearchdaemon.org (/catgod-density)
├── catgodclaws/               ← catgodclaws.thearchdaemon.org (/catgodclaws)
├── catgodstats/               ← catgodstats.thearchdaemon.org (/catgodstats)
├── doctorates/                ← doctorates.thearchdaemon.org (/doctorates)
├── lj/                        ← leeroyjenkins.thearchdaemon.org (/lj)
├── mtgdatadensity/            ← mtgdatadensity.thearchdaemon.org (/mtgdatadensity)
├── metadeck/                  ← professional.thearchdaemon.org (/metadeck)
├── study/                     ← study.thearchdaemon.org (/study)
├── sylvester/                 ← sylvester.thearchdaemon.org (/sylvester)
├── sites/                     ← therealpreacher.com (/sites)
│
├── .gitignore
├── db_schema.sql              ← Symlink to shared/db_schema.sql
├── scaffold.py                ← Generator script (re-run to regenerate skeletons)
└── README.md                  ← This file
```

## Build Phases (from UI Policy §18)

### Phase 1: GoldHat Professional (9 sites)
1. guis → 2. qa → 3. legal → 4. compliance → 5. residential → 6. b2b → 7. bluefieldshop → 8. experience → 9. pc-vs-iot

### Phase 2: ArchDaemon Portfolio (10 sites)
10. metadeck → 11. catgod → 12. catgod-density → 13. catgodclaws → 14. catgodstats → 15. mtgdatadensity → 16. study → 17. lj → 18. sylvester → 19. sites

### Phase 3: Capstones (2 sites)
20. doctorates → 21. org (LAST)

## Per-Site File Inventory

Every site directory contains:

| File | Purpose | Always |
|------|---------|--------|
| `index.html` | Main page (Cowboy Noir skeleton) | ✓ |
| `.htaccess` | HTTPS redirect + security headers | ✓ |
| `goldhat.css` | UI stylesheet (copy from shared/) | ✓ |
| `goldhat.js` | UI behavior (copy from shared/) | ✓ |
| `assets/` | Images, favicon | ✓ |
| `docs/testing.html` | BDD scenarios | ✓ |
| `README.md` | Site documentation | ✓ |
| `admin/.htaccess` | Basic Auth (deny all until ready) | ✓ |
| `config.sample.php` | DB config template | If DB |
| `api/index.php` | API endpoint registry | If API |
| `api/intake.php` | Intake form handler | root, residential, b2b |
| `admin/index.php` | Admin panel skeleton | If DB |

## Deployment

```bash

# 2. For each site, copy goldhat.css + goldhat.js from shared/
cp shared/v2.0.0/goldhat.css root/goldhat.css
cp shared/v2.0.0/goldhat.js  root/goldhat.js
# (repeat for each site, or upload shared/ to /shared/ and use relative paths)

# 3. For DB-backed sites, create config.php from config.sample.php
cp root/config.sample.php root/config.php
# Edit config.php with real credentials — NEVER commit this file

# 4. Upload to IONOS via SFTP
# Each site dir maps to its hosting path (see registry above)
```

## Shared PHP Classes

All PHP includes live in `shared/php/` and use the `GoldHat\` namespace:

| Class | File | Purpose |
|-------|------|---------|
| `GoldHat\DB` | db.php | PDO singleton with config array |
| `GoldHat\CSRF` | csrf.php | Token verification (mirrors goldhat.js) |
| `GoldHat\Response` | response.php | `::ok()`, `::error()`, `::json()` |
| `GoldHat\Audit` | audit.php | Write to admin_audit_log |
| `GoldHat\PageView` | pageview.php | Record to page_views (server-side) |

## Database Schema (13 tables)

| Table | Domain | Purpose |
|-------|--------|---------|
| `intake_requests` | root, residential, b2b | Client intake form submissions |
| `admin_users` | all w/ admin | Admin authentication |
| `admin_audit_log` | all w/ admin | Action audit trail |
| `content_sections` | any CMS site | Content organization |
| `content_pages` | any CMS site | Page content + status |
| `content_revisions` | any CMS site | Version history |
| `arena_contenders` | pc-vs-iot | AI Thunderdome contenders |
| `arena_rounds` | pc-vs-iot | Tournament rounds |
| `arena_scores` | pc-vs-iot | Per-axis scoring |
| `catgod_cards` | catgod family | MTG deck list |
| `catgod_analysis` | catgod family | Analysis results JSON |
| `media_library` | all sites | Uploaded media tracking |
| `page_views` | all sites | Basic analytics |

---

*GoldHat™ US Serial 98925168 · ArchDaemon™ US Serial 98940257 · NAICS 541511*
*© 2026 David Leo Sylvester. All rights reserved.*
