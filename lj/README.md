# Leeroy Jenkins — Experiments

**Domain:** leeroyjenkins.thearchdaemon.org
**Hosting Path:** `/lj`
**Brand:** ArchDaemon
**Phase:** 2 · Build #17

## Purpose

Experimental demos. At least I have chicken.

## Architecture

- **UI:** goldhat.css + goldhat.js v2.0.0 (Cowboy Noir, Creme/Southwestern)
- **Backend:** Static HTML (no database)
- **API:** None
- **Admin:** None

## File Structure

```
lj/
├── index.html              Main page
├── .htaccess               Security headers + HTTPS
├── goldhat.css             Cowboy Noir v2.0.0 (symlink or copy)
├── goldhat.js              GoldHatUI v2.0.0 (symlink or copy)
├── assets/
│   ├── images/
│   └── favicon.svg








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




- [ ] Tested at 320px viewport
- [ ] No external CDN requests

---

*GoldHat™ 98925168 · ArchDaemon™ 98940257 · NAICS 541511*
