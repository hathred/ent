#!/usr/bin/env python3
"""
goldhat-enterprise repo scaffolding generator
Reads the UI Policy v2.0 site registry and generates
every file for every subdomain.
"""

import os
import textwrap

BASE = "/home/claude/goldhat-enterprise"

# ═══════════════════════════════════════
# SITE REGISTRY (from UI Policy v2.0 §3)
# ═══════════════════════════════════════

SITES = [
    # Phase 1: GoldHat Professional
    {"dir": "root",         "domain": "goldhatconsulting.com",              "path": "/",                "brand": "GoldHat", "label": "Home",               "phase": 1, "order": 0, "needs_db": True,  "needs_api": True,  "title": "GoldHat Consulting", "desc": "Local tech services in Bluefield, VA. House calls, remote support, small business IT."},
    {"dir": "b2b",          "domain": "b2b.goldhatconsulting.com",          "path": "/b2b",             "brand": "GoldHat", "label": "B2B Services",       "phase": 1, "order": 6, "needs_db": True,  "needs_api": True,  "title": "B2B Technology Services", "desc": "Enterprise technology services for businesses in the Tazewell County area."},
    {"dir": "bluefieldshop","domain": "bluefieldshop.goldhatconsulting.com","path": "/bluefieldshop",   "brand": "GoldHat", "label": "Bluefield Shop",     "phase": 1, "order": 7, "needs_db": False, "needs_api": False, "title": "Bluefield Tech Shop", "desc": "Curated technology products and recommendations for the Bluefield area."},
    {"dir": "compliance",   "domain": "compliance.goldhatconsulting.com",   "path": "/legal/compliance","brand": "GoldHat", "label": "Compliance",         "phase": 1, "order": 4, "needs_db": False, "needs_api": False, "title": "Compliance Documentation", "desc": "Regulatory compliance documentation and disclosures."},
    {"dir": "dev",          "domain": "dev.goldhatconsulting.com",          "path": "/dev",             "brand": "GoldHat", "label": "Dev Sandbox",        "phase": 0, "order": 0, "needs_db": True,  "needs_api": True,  "title": "Development Sandbox", "desc": "Development sandbox. NOT public-facing."},
    {"dir": "experience",   "domain": "experience.goldhatconsulting.com",   "path": "/experience",      "brand": "GoldHat", "label": "QE Case Study",      "phase": 1, "order": 8, "needs_db": False, "needs_api": False, "title": "QE Methodology Case Study", "desc": "Who's On First: a shift-left QE methodology demonstration."},
    {"dir": "guis",         "domain": "guis.goldhatconsulting.com",         "path": "/guis",            "brand": "GoldHat", "label": "UI Policy",          "phase": 1, "order": 1, "needs_db": False, "needs_api": False, "title": "Master UI Policy", "desc": "GoldHat Enterprise UI Standard — the policy that governs all sites."},
    {"dir": "legal",        "domain": "legal.goldhatconsulting.com",        "path": "/legal",           "brand": "GoldHat", "label": "Legal",              "phase": 1, "order": 3, "needs_db": False, "needs_api": False, "title": "Legal Hub", "desc": "Privacy policy, terms of service, trademark notices."},
    {"dir": "pc-vs-iot",    "domain": "pc-vs-iot.goldhatconsulting.com",    "path": "/pc-vs-iot",       "brand": "GoldHat", "label": "AI Thunderdome",     "phase": 1, "order": 9, "needs_db": True,  "needs_api": True,  "title": "AI Thunderdome", "desc": "PC vs IoT: QA Guy's AI benchmarking arena. WELCOME TO THE THUNDERDOME."},
    {"dir": "qa",           "domain": "qa.goldhatconsulting.com",           "path": "/qa",              "brand": "GoldHat", "label": "QA Methodology",     "phase": 1, "order": 2, "needs_db": False, "needs_api": False, "title": "QA Methodology", "desc": "Quality assurance methodology, testing philosophy, BDD showcase."},
    {"dir": "residential",  "domain": "residential.goldhatconsulting.com",  "path": "/residential",     "brand": "GoldHat", "label": "Residential",        "phase": 1, "order": 5, "needs_db": True,  "needs_api": True,  "title": "Residential Tech Services", "desc": "Home technology services in Tazewell County. House calls and remote support."},
    {"dir": "staging",      "domain": "staging.goldhatconsulting.com",      "path": "/staging",         "brand": "GoldHat", "label": "Staging",            "phase": 0, "order": 0, "needs_db": True,  "needs_api": True,  "title": "Staging Environment", "desc": "Pre-production staging. NOT public-facing."},
    # Phase 2: ArchDaemon Portfolio
    {"dir": "metadeck",     "domain": "professional.thearchdaemon.org",     "path": "/metadeck",        "brand": "ArchDaemon", "label": "IP Portfolio",    "phase": 2, "order": 10, "needs_db": True,  "needs_api": True,  "title": "Professional Portfolio", "desc": "Tensor analysis, data density, cybersecurity, methodology — the IP portfolio anchor."},
    {"dir": "catgod",       "domain": "catgod.thearchdaemon.org",           "path": "/catgod",          "brand": "ArchDaemon", "label": "CatGod Deck",     "phase": 2, "order": 11, "needs_db": True,  "needs_api": True,  "title": "CatGod — Guenhwyvar Deck Analysis", "desc": "Primary MTG Guenhwyvar deck analysis."},
    {"dir": "catgod-density","domain": "catgod-density.thearchdaemon.org",  "path": "/catgod-density",  "brand": "ArchDaemon", "label": "CatGod Density",  "phase": 2, "order": 12, "needs_db": True,  "needs_api": True,  "title": "CatGod — Data Density", "desc": "MTG data density metrics and Frobenius analysis."},
    {"dir": "catgodclaws",  "domain": "catgodclaws.thearchdaemon.org",      "path": "/catgodclaws",     "brand": "ArchDaemon", "label": "CatGod Claws",    "phase": 2, "order": 13, "needs_db": True,  "needs_api": True,  "title": "CatGod — Deck Interactions", "desc": "MTG deck interaction tools and synergy mapping."},
    {"dir": "catgodstats",  "domain": "catgodstats.thearchdaemon.org",      "path": "/catgodstats",     "brand": "ArchDaemon", "label": "CatGod Stats",    "phase": 2, "order": 14, "needs_db": True,  "needs_api": True,  "title": "CatGod — Statistics", "desc": "MTG statistical analysis dashboard."},
    {"dir": "mtgdatadensity","domain": "mtgdatadensity.thearchdaemon.org",  "path": "/mtgdatadensity",  "brand": "ArchDaemon", "label": "MTG Tensor",      "phase": 2, "order": 15, "needs_db": True,  "needs_api": True,  "title": "MTG Data Density — Tensor Decomposition", "desc": "Tensor decomposition and Frobenius norm analysis for MTG."},
    {"dir": "study",        "domain": "study.thearchdaemon.org",            "path": "/study",           "brand": "ArchDaemon", "label": "Study",           "phase": 2, "order": 16, "needs_db": True,  "needs_api": True,  "title": "Study Resources", "desc": "Learning progress tracking and study resources."},
    {"dir": "lj",           "domain": "leeroyjenkins.thearchdaemon.org",    "path": "/lj",              "brand": "ArchDaemon", "label": "Leeroy Jenkins",  "phase": 2, "order": 17, "needs_db": False, "needs_api": False, "title": "Leeroy Jenkins — Experiments", "desc": "Experimental demos. At least I have chicken."},
    {"dir": "sylvester",    "domain": "sylvester.thearchdaemon.org",        "path": "/sylvester",       "brand": "ArchDaemon", "label": "Sylvester",       "phase": 2, "order": 18, "needs_db": False, "needs_api": False, "title": "David Leo Sylvester", "desc": "Personal brand, biography, timeline, values."},
    {"dir": "sites",        "domain": "therealpreacher.com",                "path": "/sites",           "brand": "TheRealPreacher", "label": "Ministry",   "phase": 2, "order": 19, "needs_db": False, "needs_api": False, "title": "The Real Preacher", "desc": "Ministry marketing. Referee for the Arena. Personal testimony."},
    # Phase 3: Final Two
    {"dir": "doctorates",   "domain": "doctorates.thearchdaemon.org",       "path": "/doctorates",      "brand": "ArchDaemon", "label": "Doctorates",      "phase": 3, "order": 20, "needs_db": True,  "needs_api": True,  "title": "Doctorate Tracking", "desc": "Progress tracking toward doctorate completion."},
    {"dir": "org",          "domain": "thearchdaemon.org",                  "path": "/org",             "brand": "ArchDaemon", "label": "Protect My Legacy","phase": 3, "order": 21, "needs_db": True,  "needs_api": True,  "title": "ArchDaemon — Protect My Legacy", "desc": "Ministry hub. 501(c)(3) mission. The capstone."},
]


def w(path, content):
    """Write file, creating parent dirs."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(content)


def brand_name(site):
    if site["brand"] == "GoldHat":
        return "GoldHat Consulting"
    elif site["brand"] == "ArchDaemon":
        return "ArchDaemon"
    else:
        return "The Real Preacher"


def root_url(site):
    if site["brand"] == "GoldHat":
        return "https://goldhatconsulting.com"
    elif site["brand"] == "ArchDaemon":
        return "https://thearchdaemon.org"
    else:
        return "https://therealpreacher.com"


# ═══════════════════════════════════════
# SHARED PHP INCLUDES
# ═══════════════════════════════════════

def gen_shared_php():
    # db.php — PDO singleton
    w(f"{BASE}/shared/php/db.php", textwrap.dedent("""\
    <?php
    declare(strict_types=1);
    /**
     * GoldHat Enterprise — PDO Database Singleton
     * shared/php/db.php
     *
     * Usage:
     *   require_once __DIR__ . '/../../shared/php/db.php';
     *   $pdo = GoldHat\\DB::get($config['db']);
     *
     * Every site that touches the database includes this file.
     * Config comes from each site's config.php (never committed).
     */

    namespace GoldHat;

    class DB
    {
        private static ?\\PDO $instance = null;

        /**
         * Get or create the PDO singleton.
         *
         * @param array{host:string,name:string,user:string,pass:string,charset?:string} $cfg
         * @return \\PDO
         */
        public static function get(array $cfg): \\PDO
        {
            if (self::$instance === null) {
                $charset = $cfg['charset'] ?? 'utf8mb4';
                $dsn = "mysql:host={$cfg['host']};dbname={$cfg['name']};charset={$charset}";
                self::$instance = new \\PDO($dsn, $cfg['user'], $cfg['pass'], [
                    \\PDO::ATTR_ERRMODE            => \\PDO::ERRMODE_EXCEPTION,
                    \\PDO::ATTR_DEFAULT_FETCH_MODE  => \\PDO::FETCH_ASSOC,
                    \\PDO::ATTR_EMULATE_PREPARES    => false,
                ]);
            }
            return self::$instance;
        }

        /** Reset the singleton (for testing). */
        public static function reset(): void
        {
            self::$instance = null;
        }
    }
    """))

    # csrf.php — CSRF token helper
    w(f"{BASE}/shared/php/csrf.php", textwrap.dedent("""\
    <?php
    declare(strict_types=1);
    /**
     * GoldHat Enterprise — CSRF Token Verification
     * shared/php/csrf.php
     *
     * Usage:
     *   require_once __DIR__ . '/../../shared/php/csrf.php';
     *   GoldHat\\CSRF::verify($salt, $_POST['token'], $_POST['name'], $_POST['contact']);
     *
     * Mirrors the client-side SHA-256 HMAC in goldhat.js _initIntakeForm.
     */

    namespace GoldHat;

    class CSRF
    {
        /**
         * Verify a CSRF token from the intake form.
         *
         * @param string $salt   The per-site salt from config.php
         * @param string $token  The token submitted by the form
         * @param string $name   The name field value
         * @param string $contact The contact field value
         * @return bool
         */
        public static function verify(string $salt, string $token, string $name, string $contact): bool
        {
            $today = date('Y-m-d');
            $expected = hash('sha256', "{$salt}|{$today}|{$name}|{$contact}");
            return hash_equals($expected, $token);
        }
    }
    """))

    # response.php — JSON response helper
    w(f"{BASE}/shared/php/response.php", textwrap.dedent("""\
    <?php
    declare(strict_types=1);
    /**
     * GoldHat Enterprise — JSON Response Helper
     * shared/php/response.php
     *
     * Usage:
     *   require_once __DIR__ . '/../../shared/php/response.php';
     *   GoldHat\\Response::json(['ok' => true, 'id' => $id]);
     *   GoldHat\\Response::error('Validation failed', 422);
     */

    namespace GoldHat;

    class Response
    {
        public static function json(array $data, int $status = 200): never
        {
            http_response_code($status);
            header('Content-Type: application/json; charset=utf-8');
            header('X-Content-Type-Options: nosniff');
            echo json_encode($data, JSON_UNESCAPED_UNICODE);
            exit;
        }

        public static function error(string $message, int $status = 400): never
        {
            self::json(['ok' => false, 'message' => $message], $status);
        }

        public static function ok(array $data = []): never
        {
            self::json(array_merge(['ok' => true], $data));
        }
    }
    """))

    # audit.php — Audit log helper
    w(f"{BASE}/shared/php/audit.php", textwrap.dedent("""\
    <?php
    declare(strict_types=1);
    /**
     * GoldHat Enterprise — Audit Log Helper
     * shared/php/audit.php
     *
     * Usage:
     *   require_once __DIR__ . '/../../shared/php/audit.php';
     *   GoldHat\\Audit::log($pdo, 'intake.create', 'intake_requests', $id, ['name' => $name]);
     */

    namespace GoldHat;

    class Audit
    {
        public static function log(
            \\PDO $pdo,
            string $action,
            ?string $targetType = null,
            ?int $targetId = null,
            ?array $details = null,
            ?int $userId = null
        ): void {
            $ipHash = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown');
            $stmt = $pdo->prepare(
                'INSERT INTO admin_audit_log (user_id, action, target_type, target_id, details, ip_hash)
                 VALUES (:uid, :action, :ttype, :tid, :details, :ip)'
            );
            $stmt->execute([
                ':uid'     => $userId,
                ':action'  => $action,
                ':ttype'   => $targetType,
                ':tid'     => $targetId,
                ':details' => $details ? json_encode($details) : null,
                ':ip'      => $ipHash,
            ]);
        }
    }
    """))

    # pageview.php — Basic analytics helper
    w(f"{BASE}/shared/php/pageview.php", textwrap.dedent("""\
    <?php
    declare(strict_types=1);
    /**
     * GoldHat Enterprise — Page View Tracker
     * shared/php/pageview.php
     *
     * Usage (at top of any PHP page):
     *   require_once __DIR__ . '/../../shared/php/pageview.php';
     *   GoldHat\\PageView::record($pdo, 'goldhatconsulting.com');
     *
     * Records: domain, URL, referrer, hashed IP, user agent.
     * No cookies. No tracking scripts. Server-side only.
     */

    namespace GoldHat;

    class PageView
    {
        public static function record(\\PDO $pdo, string $domain): void
        {
            try {
                $stmt = $pdo->prepare(
                    'INSERT INTO page_views (domain, page_url, referrer, ip_hash, user_agent)
                     VALUES (:domain, :url, :ref, :ip, :ua)'
                );
                $stmt->execute([
                    ':domain' => $domain,
                    ':url'    => $_SERVER['REQUEST_URI'] ?? '/',
                    ':ref'    => $_SERVER['HTTP_REFERER'] ?? null,
                    ':ip'     => hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown'),
                    ':ua'     => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255),
                ]);
            } catch (\\PDOException $e) {
                // Silently fail — analytics should never break the page
                error_log('[GoldHat] PageView error: ' . $e->getMessage());
            }
        }
    }
    """))


# ═══════════════════════════════════════
# PER-SITE FILE GENERATORS
# ═══════════════════════════════════════

def gen_htaccess(site):
    """Generate .htaccess with security headers and HTTPS redirect."""
    content = textwrap.dedent(f"""\
    # ═══════════════════════════════════════
    # {site['domain']} — .htaccess
    # GoldHat Enterprise UI Standard v2.0
    # ═══════════════════════════════════════

    # Force HTTPS
    RewriteEngine On
    RewriteCond %{{HTTPS}} off
    RewriteRule ^(.*)$ https://%{{HTTP_HOST}}%{{REQUEST_URI}} [L,R=301]

    # Security Headers
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"

    # Block config.php from web access
    <Files "config.php">
        Require all denied
    </Files>
    <Files "config.sample.php">
        Require all denied
    </Files>

    # Block .sql files from web access
    <FilesMatch "\\.sql$">
        Require all denied
    </FilesMatch>

    # Block .md files from web access
    <FilesMatch "\\.md$">
        Require all denied
    </FilesMatch>

    # Default charset
    AddDefaultCharset utf-8

    # Error documents
    ErrorDocument 404 /index.html
    ErrorDocument 403 /index.html
    """)
    w(f"{BASE}/{site['dir']}/.htaccess", content)


def gen_admin_htaccess(site):
    """Generate admin/.htaccess with Basic Auth."""
    content = textwrap.dedent(f"""\
    # ═══════════════════════════════════════
    # {site['domain']} — admin/.htaccess
    # Basic Auth protection for admin panel
    # ═══════════════════════════════════════

    # TODO: Generate .htpasswd and set path
    # AuthType Basic
    # AuthName "{brand_name(site)} Admin"
    # AuthUserFile /path/to/.htpasswd
    # Require valid-user

    # For now: deny all until admin is ready
    Require all denied
    """)
    w(f"{BASE}/{site['dir']}/admin/.htaccess", content)


def gen_config_sample(site):
    """Generate config.sample.php (template — real config never committed)."""
    content = textwrap.dedent(f"""\
    <?php
    declare(strict_types=1);
    /**
     * {site['domain']} — Configuration Template
     *
     * INSTRUCTIONS:
     * 1. Copy this file to config.php
     * 2. Fill in your IONOS database credentials
     * 3. Generate a unique CSRF salt (any long random string)
     * 4. NEVER commit config.php to version control
     *
     * @see shared/php/db.php for PDO singleton usage
     */

    return [
        'db' => [
            'host'    => 'db5019716891.hosting-data.io',  // IONOS DB host
            'name'    => 'dbu2832634',                     // Database name
            'user'    => 'dbu2832634',                     // Database user
            'pass'    => 'CHANGE_ME_IMMEDIATELY',          // Database password
            'charset' => 'utf8mb4',
        ],
        'csrf_salt' => 'GENERATE_A_LONG_RANDOM_STRING_HERE',
        'domain'    => '{site["domain"]}',
        'brand'     => '{site["brand"]}',
        'admin' => [
            'enabled'  => false,  // Set true when admin panel is ready
            'password' => 'CHANGE_ME_IMMEDIATELY',
        ],
    ];
    """)
    w(f"{BASE}/{site['dir']}/config.sample.php", content)


def gen_index_html(site):
    """Generate the index.html skeleton page."""
    bn = brand_name(site)
    root = root_url(site)

    # Determine if this is a placeholder site
    placeholders = ["b2b", "bluefieldshop", "compliance", "legal", "qa", "residential"]
    is_placeholder = site["dir"] in placeholders

    if is_placeholder:
        main_content = textwrap.dedent(f"""\
        <section class="grid">
          <article class="card" data-testid="card-coming-soon">
            <h1>{site['title']}</h1>
            <p class="kicker">Under Construction</p>
            <p>This section is being built. Visit <a href="{root}">{bn}</a> for current services.</p>
            <p class="small">Phase {site['phase']} · Build #{site['order']} in the rebuild sequence.</p>
            <div class="callout gold">
              <p><strong>What's coming:</strong> {site['desc']}</p>
            </div>
          </article>
        </section>""")
    else:
        main_content = textwrap.dedent(f"""\
        <section class="hero" aria-label="Hero">
          <div class="hero-grid">
            <div>
              <h1>{site['title']}</h1>
              <p>{site['desc']}</p>
              <!-- TODO: Phase {site['phase']} build — add hero actions, CTAs -->
              <div class="hero-actions">
                <a href="{root}" class="btn primary" data-testid="cta-home">← {bn}</a>
              </div>
            </div>
            <div class="hero-card">
              <!-- TODO: Add hero image/artwork -->
              <div class="caption">Phase {site['phase']} · Build #{site['order']}</div>
            </div>
          </div>
        </section>

        <section class="grid">
          <article class="card" data-testid="card-main">
            <!-- TODO: Phase {site['phase']} — Build out primary content for {site['domain']} -->
            <!-- Directive: {site['desc']} -->
            <h2>Content Coming</h2>
            <p>This site is being rebuilt with the Cowboy Noir design system.</p>
          </article>
        </section>""")

    content = textwrap.dedent(f"""\
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <title>{site['title']} | {bn}</title>
      <meta name="description" content="{site['desc']}"/>
      <link rel="icon" href="assets/favicon.svg" type="image/svg+xml"/>
      <link rel="stylesheet" href="goldhat.css"/>
      <!-- goldhat-ui v2.0.0 -->

      <script type="application/ld+json">
      {{
        "@context": "https://schema.org",
        "@type": "{'"LocalBusiness"' if site['brand'] == 'GoldHat' else '"WebPage"'}",
        "name": "{bn}",
        "url": "https://{site['domain']}",
        "description": "{site['desc']}"
      }}
      </script>
    </head>
    <body{"" if site["dir"] not in ["root","org","metadeck"] else ' data-back-to-top'}>
      <a class="skip-link" href="#main">Skip to content</a>

      <button id="drawerToggle" aria-controls="sidebar" aria-expanded="false" aria-label="Open menu">☰</button>

      <div class="shell">
        <aside class="sidebar" id="sidebar" aria-label="Site navigation">
          <div class="brand" data-testid="brand">
            <svg aria-hidden="true" viewBox="0 0 128 128">
              <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#f2c14e"/><stop offset="1" stop-color="#d88a23"/></linearGradient></defs>
              <rect width="128" height="128" rx="22" fill="#0f0c16"/>
              <path d="M22 84c18-28 66-52 84-40-6 18-22 56-44 56-14 0-26-6-40-16z" fill="url(#g)"/>
            </svg>
            <div class="brand-title">
              <strong>{bn}</strong>
              <span>{site['label']}</span>
            </div>
          </div>

          <nav class="nav" role="navigation">
            <a href="index.html" aria-current="page" data-testid="nav-home"><span>Home</span><kbd>H</kbd></a>
            <!-- TODO: Add site-specific nav links per UI Policy §8 -->
          </nav>

          <div class="sidebar-footer">
            <div class="pill" aria-label="Status">
              <span class="dot" aria-hidden="true"></span>
              <span>Phase {site['phase']} · v2.0</span>
            </div>
            <p style="margin:10px 0 0 0">
              <button id="contrastToggle" class="btn" style="padding:6px 10px" aria-pressed="false" data-testid="contrast-toggle">High Contrast</button>
            </p>
            <p style="margin:8px 0 0 0">
              <a href="{root}">{bn}</a> · <a href="https://guis.goldhatconsulting.com">UI Policy</a>
            </p>
            <p class="small" style="margin:6px 0 0 0">© 2026 David Leo Sylvester</p>
          </div>
        </aside>

        <main class="main" id="main">
          <div class="container">
            <header class="topbar" data-testid="topbar">
              <div class="status">
                <span class="pill">
                  <span class="dot" aria-hidden="true"></span>
                  <strong>{site['label']}</strong>
                </span>
              </div>
            </header>

    {main_content}

            <footer class="footer" data-testid="footer">
              <p>© 2026 David Leo Sylvester · <a href="https://goldhatconsulting.com">GoldHat™</a> 98925168 · <a href="https://thearchdaemon.org">ArchDaemon™</a> 98940257 · NAICS 541511</p>
            </footer>
          </div>
        </main>
      </div>

      <div id="toast" class="toast" aria-live="polite"></div>
      <script src="goldhat.js"></script>
    </body>
    </html>
    """)
    w(f"{BASE}/{site['dir']}/index.html", content)


def gen_api_endpoint(site):
    """Generate api/intake.php (or api/index.php stub)."""
    if site["dir"] in ["root", "residential", "b2b"]:
        # Full intake endpoint
        content = textwrap.dedent(f"""\
        <?php
        declare(strict_types=1);
        /**
         * {site['domain']} — Intake API Endpoint
         * POST api/intake.php
         *
         * Accepts intake form submissions and stores them in intake_requests.
         * CSRF-verified. Honeypot-filtered. Audit-logged.
         *
         * @see shared/php/db.php, shared/php/csrf.php, shared/php/response.php
         */

        require_once __DIR__ . '/../../shared/php/db.php';
        require_once __DIR__ . '/../../shared/php/csrf.php';
        require_once __DIR__ . '/../../shared/php/response.php';
        require_once __DIR__ . '/../../shared/php/audit.php';

        use GoldHat\\DB;
        use GoldHat\\CSRF;
        use GoldHat\\Response;
        use GoldHat\\Audit;

        // Only accept POST
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {{
            Response::error('Method not allowed', 405);
        }}

        $config = require __DIR__ . '/../config.php';
        $pdo = DB::get($config['db']);

        // Honeypot check (hidden field should be empty)
        if (!empty($_POST['website'] ?? '')) {{
            Response::error('Bot detected', 422);
        }}

        // CSRF verification
        $token   = $_POST['token'] ?? '';
        $name    = trim($_POST['name'] ?? '');
        $contact = trim($_POST['contact'] ?? '');

        if (!CSRF::verify($config['csrf_salt'], $token, $name, $contact)) {{
            Response::error('Invalid token. Please reload and try again.', 403);
        }}

        // Validate required fields
        if ($name === '' || $contact === '') {{
            Response::error('Name and contact information are required.');
        }}

        // Insert into database
        $stmt = $pdo->prepare(
            'INSERT INTO intake_requests (name, contact, preferred_contact, service, service_details, address, city, state, zip, availability, source_domain)
             VALUES (:name, :contact, :pref, :svc, :details, :addr, :city, :state, :zip, :avail, :domain)'
        );

        $stmt->execute([
            ':name'    => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
            ':contact' => htmlspecialchars($contact, ENT_QUOTES, 'UTF-8'),
            ':pref'    => htmlspecialchars($_POST['preferred_contact'] ?? '', ENT_QUOTES, 'UTF-8'),
            ':svc'     => htmlspecialchars($_POST['service'] ?? '', ENT_QUOTES, 'UTF-8'),
            ':details' => htmlspecialchars($_POST['service_details'] ?? '', ENT_QUOTES, 'UTF-8'),
            ':addr'    => htmlspecialchars($_POST['address'] ?? '', ENT_QUOTES, 'UTF-8'),
            ':city'    => htmlspecialchars($_POST['city'] ?? 'Bluefield', ENT_QUOTES, 'UTF-8'),
            ':state'   => htmlspecialchars($_POST['state'] ?? 'VA', ENT_QUOTES, 'UTF-8'),
            ':zip'     => htmlspecialchars($_POST['zip'] ?? '24605', ENT_QUOTES, 'UTF-8'),
            ':avail'   => htmlspecialchars($_POST['availability'] ?? '', ENT_QUOTES, 'UTF-8'),
            ':domain'  => '{site["domain"]}',
        ]);

        $id = (int) $pdo->lastInsertId();
        Audit::log($pdo, 'intake.create', 'intake_requests', $id, ['name' => $name, 'domain' => '{site["domain"]}']);

        Response::ok(['id' => $id]);
        """)
        w(f"{BASE}/{site['dir']}/api/intake.php", content)

    if site["needs_api"]:
        # Generic API stub
        content = textwrap.dedent(f"""\
        <?php
        declare(strict_types=1);
        /**
         * {site['domain']} — API Index
         * GET api/index.php
         *
         * Returns available endpoints for this subdomain.
         * All API endpoints return JSON.
         *
         * TODO: Phase {site['phase']} — Implement domain-specific endpoints:
         *   - GET  /api/[resource].php        → list/read
         *   - POST /api/[resource].php        → create
         *   - PUT  /api/[resource].php?id=N   → update
         *   - DELETE /api/[resource].php?id=N → delete
         *
         * @see UI Policy §21 (v3.0 Forward Compatibility)
         *      Every DB-backed site exposes /api/ endpoints returning JSON.
         *      These become the API consumed by the v3.0 headless front-end.
         */

        require_once __DIR__ . '/../../shared/php/response.php';

        use GoldHat\\Response;

        Response::ok([
            'domain'   => '{site["domain"]}',
            'version'  => '2.0.0',
            'endpoints' => [
                // TODO: Register endpoints as they are built
            ],
        ]);
        """)
        w(f"{BASE}/{site['dir']}/api/index.php", content)


def gen_admin(site):
    """Generate admin/index.php stub."""
    if not site["needs_db"]:
        return
    content = textwrap.dedent(f"""\
    <?php
    declare(strict_types=1);
    /**
     * {site['domain']} — Admin Panel
     * admin/index.php
     *
     * Protected by .htaccess Basic Auth (see admin/.htaccess).
     * Loads data via PDO from config.php.
     *
     * TODO: Phase {site['phase']} — Build admin interface:
     *   - Dashboard with recent activity from admin_audit_log
     *   - CRUD for domain-specific tables
     *   - Export to CSV
     *   - Pagination + search
     *
     * @see UI Policy §14 (Admin Pages)
     * @see shared/php/db.php, shared/php/audit.php
     */

    require_once __DIR__ . '/../../shared/php/db.php';
    require_once __DIR__ . '/../../shared/php/audit.php';

    use GoldHat\\DB;
    use GoldHat\\Audit;

    // Load config
    $config = require __DIR__ . '/../config.php';

    // Check admin is enabled
    if (!($config['admin']['enabled'] ?? false)) {{
        http_response_code(503);
        echo '<h1>Admin panel not yet enabled</h1>';
        echo '<p>Set admin.enabled = true in config.php when ready.</p>';
        exit;
    }}

    $pdo = DB::get($config['db']);

    // TODO: Build admin UI using Cowboy Noir components
    // For now: basic data dump
    ?>
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <title>Admin | {site['title']}</title>
      <link rel="stylesheet" href="../goldhat.css"/>
    </head>
    <body>
      <div class="shell" style="grid-template-columns:1fr">
        <main class="main" id="main">
          <div class="container">
            <h1>Admin: {site['title']}</h1>
            <p class="kicker">Protected panel for {site['domain']}</p>
            <div class="callout warn">
              <p><strong>TODO:</strong> Build admin interface per UI Policy §14.</p>
            </div>
            <!-- TODO: Admin content here -->
          </div>
        </main>
      </div>
      <script src="../goldhat.js"></script>
    </body>
    </html>
    """)
    w(f"{BASE}/{site['dir']}/admin/index.php", content)


def gen_readme(site):
    """Generate README.md for each site."""
    content = textwrap.dedent(f"""\
    # {site['title']}

    **Domain:** {site['domain']}
    **Hosting Path:** `{site['path']}`
    **Brand:** {brand_name(site)}
    **Phase:** {site['phase']} · Build #{site['order']}

    ## Purpose

    {site['desc']}

    ## Architecture

    - **UI:** goldhat.css + goldhat.js v2.0.0 (Cowboy Noir, Creme/Southwestern)
    - **Backend:** {'PHP 8.4 + MariaDB via shared/php/' if site['needs_db'] else 'Static HTML (no database)'}
    - **API:** {'Yes — /api/ endpoints return JSON' if site['needs_api'] else 'None'}
    - **Admin:** {'Yes — /admin/ with Basic Auth' if site['needs_db'] else 'None'}

    ## File Structure

    ```
    {site['dir']}/
    ├── index.html              Main page
    ├── .htaccess               Security headers + HTTPS
    ├── goldhat.css             Cowboy Noir v2.0.0 (symlink or copy)
    ├── goldhat.js              GoldHatUI v2.0.0 (symlink or copy)
    ├── assets/
    │   ├── images/
    │   └── favicon.svg
    {"├── config.sample.php       DB config template" if site["needs_db"] else ""}
    {"├── config.php              (NOT in VCS)" if site["needs_db"] else ""}
    {"├── db_schema.sql           Table definitions" if site["needs_db"] else ""}
    {"├── api/" if site["needs_api"] else ""}
    {"│   └── index.php           API endpoint registry" if site["needs_api"] else ""}
    {"├── admin/" if site["needs_db"] else ""}
    {"│   ├── .htaccess           Basic Auth" if site["needs_db"] else ""}
    {"│   └── index.php           Admin panel" if site["needs_db"] else ""}
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
    {"- [ ] config.php created from config.sample.php" if site["needs_db"] else ""}
    {"- [ ] Database tables created from db_schema.sql" if site["needs_db"] else ""}
    {"- [ ] API endpoints returning JSON" if site["needs_api"] else ""}
    {"- [ ] Admin panel functional" if site["needs_db"] else ""}
    - [ ] Tested at 320px viewport
    - [ ] No external CDN requests

    ---

    *GoldHat™ 98925168 · ArchDaemon™ 98940257 · NAICS 541511*
    """)
    w(f"{BASE}/{site['dir']}/README.md", content)


def gen_docs_testing(site):
    """Generate docs/testing.html BDD scenario placeholder."""
    content = textwrap.dedent(f"""\
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <title>BDD Test Scenarios | {site['title']}</title>
      <link rel="stylesheet" href="../goldhat.css"/>
    </head>
    <body>
      <a class="skip-link" href="#main">Skip to content</a>
      <div class="shell" style="grid-template-columns:1fr">
        <main class="main" id="main">
          <div class="container">
            <h1>BDD Test Scenarios</h1>
            <p class="kicker">{site['domain']}</p>

            <article class="card prose">
              <h2>Scenario: Page loads with accessible navigation</h2>
              <pre><code>Feature: {site['title']} Accessibility
      Scenario: Page loads with accessible navigation
        Given I navigate to "{site['domain']}"
        Then the page title should contain "{site['title']}"
        And a skip link with text "Skip to content" should exist
        And the sidebar should have aria-label "Site navigation"
        And the current nav link should have aria-current "page"
        And all interactive elements should have a visible focus ring

      Scenario: High contrast toggle works
        Given I navigate to "{site['domain']}"
        When I click the "High Contrast" button
        Then the html element should have class "contrast"
        And the button aria-pressed should be "true"</code></pre>
            </article>

            <article class="card prose">
              <h2>TODO: Domain-Specific Scenarios</h2>
              <div class="callout gold">
                <p><strong>Phase {site['phase']}:</strong> Add Gherkin scenarios specific to {site['domain']} functionality.</p>
                <p>Per UI Policy §22 (Arya/ARIA): every interactive element needs a scenario proving its name, role, and keyboard behavior.</p>
              </div>
            </article>

          </div>
        </main>
      </div>
    </body>
    </html>
    """)
    w(f"{BASE}/{site['dir']}/docs/testing.html", content)


def gen_gitignore():
    """Generate .gitignore for the entire repo."""
    content = textwrap.dedent("""\
    # GoldHat Enterprise — .gitignore
    # NEVER commit secrets or generated files

    # Database credentials (per-site)
    config.php

    # OS files
    .DS_Store
    Thumbs.db
    *.swp
    *~

    # Editor/IDE
    .vscode/
    .idea/
    *.sublime-*

    # PHP
    vendor/
    composer.lock

    # Logs
    *.log
    error_log

    # Backups
    *.bak
    *.backup
    *.old

    # htpasswd (credentials)
    .htpasswd
    """)
    w(f"{BASE}/.gitignore", content)


# ═══════════════════════════════════════
# MAIN — Generate everything
# ═══════════════════════════════════════

if __name__ == "__main__":
    print("Generating GoldHat Enterprise repo...")

    # Shared PHP
    gen_shared_php()
    print("  ✓ shared/php/ (5 files)")

    # .gitignore
    gen_gitignore()
    print("  ✓ .gitignore")

    # Per-site files
    for site in SITES:
        gen_htaccess(site)
        gen_admin_htaccess(site)
        gen_index_html(site)
        gen_readme(site)
        gen_docs_testing(site)

        if site["needs_db"]:
            gen_config_sample(site)
            gen_admin(site)

        if site["needs_api"] or site["dir"] in ["root", "residential", "b2b"]:
            gen_api_endpoint(site)

        print(f"  ✓ {site['dir']}/  ({site['domain']})")

    print(f"\\nDone. {len(SITES)} sites scaffolded.")
