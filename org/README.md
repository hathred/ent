# ArchDaemon — Protect My Legacy

**Domain:** thearchdaemon.org
**Hosting Path:** `/org`
**Brand:** ArchDaemon
**Phase:** 3 · Build #21

## Purpose

Ministry hub. 501(c)(3) mission. The capstone.

## Architecture

- **UI:** goldhat.css + goldhat.js v2.0.0 (Cowboy Noir, Creme/Southwestern)
- **Backend:** PHP 8.4 + MariaDB via shared/php/
- **API:** Yes — /api/ endpoints return JSON
- **Admin:** Yes — /admin/ with Basic Auth

## File Structure

```
org/
├── index.html              Main page
├── .htaccess               Security headers + HTTPS
├── goldhat.css             Cowboy Noir v2.0.0 (symlink or copy)
├── goldhat.js              GoldHatUI v2.0.0 (symlink or copy)
├── assets/
│   ├── images/
│   └── favicon.svg
├── config.sample.php       DB config template
├── config.php              (NOT in VCS)
├── db_schema.sql           Table definitions
├── api/
│   └── index.php           API endpoint registry
├── admin/
│   ├── .htaccess           Basic Auth
│   └── index.php           Admin panel
├── docs/
│   └── testing.html        BDD scenarios
└── README.md               This file
```

## Build Status

- [ ] Cowboy Noir UI applied
- [ ] Skip link + focus ring verified
- [ ] data-testid on all interactive elements
- [ ] Schema.org JSON-LD in <head>
- [ ] BDD scenarios in docs/testing.html
- [ ] config.php created from config.sample.php
- [ ] Database tables created from db_schema.sql
- [ ] API endpoints returning JSON
- [ ] Admin panel functional
- [ ] Tested at 320px viewport
- [ ] No external CDN requests

---

*GoldHat™ 98925168 · ArchDaemon™ 98940257 · NAICS 541511*
