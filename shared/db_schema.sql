-- ═══════════════════════════════════════════════════
-- GoldHat Enterprise — Unified Schema v2.0
-- MariaDB · InnoDB · utf8mb4_unicode_ci
-- All tables in ONE database on IONOS shared hosting
--
-- USAGE:
--   mysql -u dbu2832634 -p dbu2832634 < db_schema.sql
--
-- SOURCE: GHC Master UI Policy v2.0, Appendix B
-- ═══════════════════════════════════════════════════

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ── EXISTING (production on goldhatconsulting.com) ──
-- intake_requests: already live. No changes. If fresh install, uncomment:

-- CREATE TABLE IF NOT EXISTS intake_requests (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     contact VARCHAR(255) NOT NULL,
--     preferred_contact VARCHAR(50),
--     service VARCHAR(100),
--     service_details TEXT,
--     address VARCHAR(255),
--     city VARCHAR(100) DEFAULT 'Bluefield',
--     state VARCHAR(50) DEFAULT 'VA',
--     zip VARCHAR(20) DEFAULT '24605',
--     availability VARCHAR(255),
--     source_domain VARCHAR(100),
--     status ENUM('new','contacted','scheduled','completed','cancelled') DEFAULT 'new',
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     INDEX idx_status (status),
--     INDEX idx_created (created_at)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── ADMIN (shared across all sites) ──

CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin','editor') DEFAULT 'editor',
    last_login TIMESTAMP NULL,
    status ENUM('active','inactive','locked') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id INT,
    details JSON,
    ip_hash CHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created (created_at),
    INDEX idx_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── CONTENT (for sites that need CMS-managed pages) ──

CREATE TABLE IF NOT EXISTS content_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    domain VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    sort_order INT DEFAULT 0,
    UNIQUE KEY idx_domain_slug (domain, slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS content_pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section_id INT NOT NULL,
    slug VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    meta_description VARCHAR(500),
    body_html LONGTEXT,
    template VARCHAR(50) DEFAULT 'page',
    status ENUM('draft','published','archived') DEFAULT 'draft',
    sort_order INT DEFAULT 0,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES content_sections(id),
    UNIQUE KEY idx_section_slug (section_id, slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS content_revisions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    page_id INT NOT NULL,
    body_html LONGTEXT,
    editor VARCHAR(50),
    note VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (page_id) REFERENCES content_pages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── ARENA (pc-vs-iot.goldhatconsulting.com) ──

CREATE TABLE IF NOT EXISTS arena_contenders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codename VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    specs JSON,
    strengths JSON,
    risks JSON,
    domain_pattern VARCHAR(255),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS arena_rounds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    round_number INT NOT NULL,
    title VARCHAR(255),
    status ENUM('pending','active','completed') DEFAULT 'pending',
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS arena_scores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    round_id INT NOT NULL,
    contender_id INT NOT NULL,
    axis VARCHAR(50) NOT NULL,
    score DECIMAL(10,4) NOT NULL,
    notes TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (round_id) REFERENCES arena_rounds(id),
    FOREIGN KEY (contender_id) REFERENCES arena_contenders(id),
    INDEX idx_round_contender (round_id, contender_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── CATGOD (catgod.*, mtgdatadensity.thearchdaemon.org) ──

CREATE TABLE IF NOT EXISTS catgod_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    card_name VARCHAR(255) NOT NULL,
    card_type VARCHAR(100),
    mana_cost VARCHAR(50),
    cmc DECIMAL(4,1),
    roles JSON,
    tags JSON,
    quantity TINYINT DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS catgod_analysis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    analysis_type VARCHAR(50) NOT NULL,
    label VARCHAR(255),
    data_json JSON NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (analysis_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── MEDIA (shared) ──

CREATE TABLE IF NOT EXISTS media_library (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    file_size INT,
    alt_text VARCHAR(255),
    domain VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_domain (domain)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── PAGE VIEWS (basic analytics, shared) ──

CREATE TABLE IF NOT EXISTS page_views (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    domain VARCHAR(100) NOT NULL,
    page_url VARCHAR(500) NOT NULL,
    referrer VARCHAR(500),
    ip_hash CHAR(64),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_domain_created (domain, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


SET FOREIGN_KEY_CHECKS = 1;

-- ═══════════════════════════════════════════════════
-- END OF SCHEMA
-- 13 tables · 6 domains · 1 database
--
-- Table → Domain mapping:
--   intake_requests   → root, residential, b2b (via source_domain)
--   admin_users       → all sites with admin panels
--   admin_audit_log   → all sites with admin panels
--   content_sections  → any site needing CMS pages (via domain column)
--   content_pages     → any site needing CMS pages
--   content_revisions → any site needing CMS pages
--   arena_contenders  → pc-vs-iot
--   arena_rounds      → pc-vs-iot
--   arena_scores      → pc-vs-iot
--   catgod_cards      → catgod, catgod-density, catgodclaws, catgodstats
--   catgod_analysis   → catgod, catgod-density, catgodstats, mtgdatadensity
--   media_library     → all sites (via domain column)
--   page_views        → all sites (via domain column)
-- ═══════════════════════════════════════════════════
