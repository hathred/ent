/* ═══════════════════════════════════════════════════════════════
   goldhat.js — GoldHat Enterprise UI Standard
   Version:   2.0.0
   Released:  2026-02-28
   License:   Proprietary — GoldHat™ 98925168 · ArchDaemon™ 98940257
   ─────────────────────────────────────────────────────────────
   CHANGELOG
   2.0.0  2026-02-28  Future-proofed release.
          BREAKING: Public API expanded from 4 to 14+ methods.
          GoldHatUI.version now "2.0.0".

          NEW CORE:
          - Event bus (on/off/emit) for cross-module pub/sub
          - Preferences manager (localStorage wrapper, fallback)
          - API client (fetch wrapper with CSRF, retry, timeout)
          - Plugin system (register site-specific modules)
          - Announce (live region screen reader announcements)

          NEW MODULES (24 total, up from 8):
          + Modal/dialog with focus trap and ESC dismiss
          + Table sorting (click headers, tri-state, aria-sort)
          + Tabs (aria-tablist, arrow key nav, panel switching)
          + Responsive drawer (mobile sidebar hamburger)
          + Lazy loading (IntersectionObserver, data-src)
          + Scroll spy (tracks hash nav against viewport)
          + Form validation engine (data-validate, per-field)
          + Back-to-top button (scroll threshold, smooth)
          + Print helpers (prepare/restore cycle)
          + Debounce/throttle utilities
          + Confirm dialogs (data-confirm on buttons/links)
          + Accordion enhancement (single-open groups)
          + Responsive tables (horizontal scroll wrapper)
          + Loading states (skeleton pulse on fetch)
          + Error boundary (global unhandled error toast)
          + Time ago (relative timestamps from datetime attrs)

          PRESERVED from 1.0.0 (backward-compatible):
          ✓ Toast, Copy, Search/Filter, IntakeForm, Contrast,
            ActiveNav, KeyboardNav, CountryMindset

   1.0.0  2026-02-28  Initial unified release.
   ─────────────────────────────────────────────────────────────
   ARCHITECTURE
   ┌─ GoldHatUI (namespace)
   │  ├─ Core
   │  │  ├─ .version            "2.0.0"
   │  │  ├─ .init()             auto-runs on DOMContentLoaded
   │  │  ├─ .escapeHtml(s)      XSS-safe encoding
   │  │  ├─ .debounce(fn,ms)    trailing-edge debounce
   │  │  ├─ .throttle(fn,ms)    leading-edge throttle
   │  │  └─ .sha256(text)       async SHA-256 hex digest
   │  │
   │  ├─ Events
   │  │  ├─ .on(event, fn)      subscribe
   │  │  ├─ .off(event, fn)     unsubscribe
   │  │  └─ .emit(event, data)  publish
   │  │
   │  ├─ Preferences
   │  │  ├─ .pref.get(key, def) read with fallback
   │  │  ├─ .pref.set(key, val) write
   │  │  └─ .pref.remove(key)   delete
   │  │
   │  ├─ Notifications
   │  │  ├─ .toast(msg, ms)     visual toast
   │  │  └─ .announce(msg)      screen-reader live region
   │  │
   │  ├─ API
   │  │  ├─ .api.get(url, opts) GET JSON
   │  │  ├─ .api.post(url,body) POST JSON/FormData
   │  │  └─ .api.submit(form)   submit <form> via fetch
   │  │
   │  ├─ UI
   │  │  ├─ .modal.open(el)     open dialog
   │  │  ├─ .modal.close()      close current dialog
   │  │  └─ .loading(el, bool)  toggle skeleton state
   │  │
   │  └─ Extensibility
   │     └─ .plugin(name, fn)   register site-specific module
   │
   │  24 internal modules (self-wiring, no-op if DOM absent):
   │  01 _initToast            toast notifications
   │  02 _initAnnounce         screen reader live region
   │  03 _initCopy             copy-to-clipboard buttons
   │  04 _initSearch           global search/filter
   │  05 _initIntakeForm       intake form + CSRF + honeypot
   │  06 _initForms            generic validation engine
   │  07 _initContrast         high-contrast toggle
   │  08 _initActiveNav        sidebar current-page marking
   │  09 _initKeyboardNav      kbd shortcut activation
   │  10 _initCountryMindset   country-mindset pill filter
   │  11 _initModal            modal/dialog system
   │  12 _initTabs             accessible tablist
   │  13 _initTableSort        sortable table headers
   │  14 _initDrawer           mobile sidebar hamburger
   │  15 _initLazy             IntersectionObserver lazy load
   │  16 _initScrollSpy        hash tracking on scroll
   │  17 _initBackToTop        scroll-to-top button
   │  18 _initConfirm          confirmation dialogs
   │  19 _initAccordionGroups  single-open accordion groups
   │  20 _initResponsiveTables horizontal scroll wrappers
   │  21 _initLoading          skeleton loading states
   │  22 _initTimeAgo          relative timestamp rendering
   │  23 _initPrint            print prepare/restore
   │  24 _initErrorBoundary    global error handler
   ─────────────────────────────────────────────────────────────
   GOALS
   - Offline-friendly: zero external dependencies
   - Accessibility-first: keyboard, aria-*, focus management
   - Automation-friendly: stable data-testid selectors
   - Progressive enhancement: every module no-ops if DOM absent
   - Future-proof: plugin system for site-specific extensions
   - v3.0 ready: event bus enables decoupled JS framework migration
   ─────────────────────────────────────────────────────────────
   USAGE
   <script src="/shared/v2.0.0/goldhat.js"></script>

   Site-specific extensions:
   <script>
     GoldHatUI.plugin("arena", function(UI) {
       // pc-vs-iot specific code using UI.api, UI.toast, etc.
     });
   </script>
   ═══════════════════════════════════════════════════════════════ */

var GoldHatUI = (function () {
  "use strict";

  /* ═══════════════════════════════════════
     CORE UTILITIES
     ═══════════════════════════════════════ */

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.from((root || document).querySelectorAll(sel)); };

  var VERSION = "2.0.0";

  function escapeHtml(s) {
    var map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return String(s).replace(/[&<>"']/g, function (ch) { return map[ch]; });
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, ms || 250);
    };
  }

  function throttle(fn, ms) {
    var last = 0;
    return function () {
      var now = Date.now();
      if (now - last >= (ms || 100)) {
        last = now;
        fn.apply(this, arguments);
      }
    };
  }

  function sha256(text) {
    if (!crypto || !crypto.subtle) return Promise.resolve("");
    var enc = new TextEncoder().encode(text);
    return crypto.subtle.digest("SHA-256", enc).then(function (buf) {
      return Array.from(new Uint8Array(buf))
        .map(function (b) { return b.toString(16).padStart(2, "0"); })
        .join("");
    });
  }

  /** Generate a unique ID (for aria-* linking) */
  var _uid = 0;
  function uid(prefix) { return (prefix || "gh") + "-" + (++_uid); }

  /** Check if reduced motion is preferred */
  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }


  /* ═══════════════════════════════════════
     EVENT BUS — pub/sub for cross-module
     communication and plugin integration
     ═══════════════════════════════════════ */

  var _bus = {};

  function on(event, fn) {
    if (!_bus[event]) _bus[event] = [];
    _bus[event].push(fn);
  }

  function off(event, fn) {
    if (!_bus[event]) return;
    _bus[event] = _bus[event].filter(function (f) { return f !== fn; });
  }

  function emit(event, data) {
    if (!_bus[event]) return;
    _bus[event].forEach(function (fn) {
      try { fn(data); } catch (e) { console.error("[GoldHatUI] Event handler error:", event, e); }
    });
  }


  /* ═══════════════════════════════════════
     PREFERENCES MANAGER — localStorage
     with silent fallback to in-memory
     ═══════════════════════════════════════ */

  var _memStore = {};
  var _storageOk = (function () {
    try { localStorage.setItem("__gh_test", "1"); localStorage.removeItem("__gh_test"); return true; }
    catch (_) { return false; }
  })();

  var pref = {
    get: function (key, def) {
      try {
        var v = _storageOk ? localStorage.getItem("gh-" + key) : _memStore["gh-" + key];
        if (v === null || v === undefined) return def;
        try { return JSON.parse(v); } catch (_) { return v; }
      } catch (_) { return def; }
    },
    set: function (key, val) {
      var s = typeof val === "string" ? val : JSON.stringify(val);
      try {
        if (_storageOk) localStorage.setItem("gh-" + key, s);
        else _memStore["gh-" + key] = s;
      } catch (_) { _memStore["gh-" + key] = s; }
      emit("pref:change", { key: key, value: val });
    },
    remove: function (key) {
      try {
        if (_storageOk) localStorage.removeItem("gh-" + key);
        delete _memStore["gh-" + key];
      } catch (_) { }
    }
  };


  /* ═══════════════════════════════════════
     API CLIENT — standardized fetch wrapper
     CSRF-aware, retry, timeout, JSON default
     ═══════════════════════════════════════ */

  var api = {
    /** GET JSON from url */
    get: function (url, opts) {
      return _apiFetch(url, Object.assign({ method: "GET" }, opts || {}));
    },

    /** POST JSON or FormData */
    post: function (url, body, opts) {
      var o = Object.assign({ method: "POST" }, opts || {});
      if (body instanceof FormData) {
        o.body = body;
      } else {
        o.headers = Object.assign({ "Content-Type": "application/json" }, o.headers || {});
        o.body = JSON.stringify(body);
      }
      return _apiFetch(url, o);
    },

    /** Submit a <form> element via fetch (replaces default submit) */
    submit: function (formEl) {
      var action = formEl.getAttribute("action") || "api/intake.php";
      var method = (formEl.getAttribute("method") || "POST").toUpperCase();
      var fd = new FormData(formEl);
      return _apiFetch(action, { method: method, body: fd });
    }
  };

  function _apiFetch(url, opts) {
    var timeout = (opts && opts.timeout) || 15000;
    var retries = (opts && opts.retries) || 0;

    var controller = new AbortController();
    opts.signal = controller.signal;
    var timer = setTimeout(function () { controller.abort(); }, timeout);

    emit("api:request", { url: url, method: opts.method });

    return fetch(url, opts)
      .then(function (res) {
        clearTimeout(timer);
        var ct = res.headers.get("content-type") || "";
        var parsePromise = ct.indexOf("json") !== -1 ? res.json() : res.text();
        return parsePromise.then(function (data) {
          var result = { ok: res.ok, status: res.status, data: data };
          emit("api:response", result);
          return result;
        });
      })
      .catch(function (err) {
        clearTimeout(timer);
        if (retries > 0) {
          opts.retries = retries - 1;
          return _apiFetch(url, opts);
        }
        var result = { ok: false, status: 0, data: null, error: err };
        emit("api:error", result);
        throw err;
      });
  }


  /* ═══════════════════════════════════════
     01. TOAST
     <div id="toast" class="toast" aria-live="polite"></div>
     ═══════════════════════════════════════ */

  var _toastEl = null;
  var _toastTimer = null;
  var _toastQueue = [];

  function _initToast() {
    _toastEl = $("#toast");
    /* Auto-create if missing */
    if (!_toastEl) {
      _toastEl = document.createElement("div");
      _toastEl.id = "toast";
      _toastEl.className = "toast";
      _toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(_toastEl);
    }
  }

  function toast(msg, duration) {
    if (!_toastEl) _initToast();
    _toastEl.textContent = msg;
    _toastEl.classList.add("show");
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(function () {
      _toastEl.classList.remove("show");
    }, duration || 2200);
    emit("toast", { message: msg });
  }


  /* ═══════════════════════════════════════
     02. ANNOUNCE — screen reader live region
     Injects into aria-live="assertive" region.
     ═══════════════════════════════════════ */

  var _announceEl = null;

  function _initAnnounce() {
    _announceEl = $("#gh-announce");
    if (!_announceEl) {
      _announceEl = document.createElement("div");
      _announceEl.id = "gh-announce";
      _announceEl.className = "sr-only";
      _announceEl.setAttribute("aria-live", "assertive");
      _announceEl.setAttribute("aria-atomic", "true");
      document.body.appendChild(_announceEl);
    }
  }

  function announce(msg) {
    if (!_announceEl) _initAnnounce();
    _announceEl.textContent = "";
    /* Force reflow so screen readers detect the change */
    void _announceEl.offsetHeight;
    _announceEl.textContent = msg;
  }


  /* ═══════════════════════════════════════
     03. COPY TO CLIPBOARD
     <button class="copy" data-copy-target="#somePreId">Copy</button>
     ═══════════════════════════════════════ */

  function _initCopy() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".copy[data-copy-target]");
      if (!btn) return;
      var target = $(btn.getAttribute("data-copy-target"));
      if (!target) { toast("Nothing to copy"); return; }
      var text = target.innerText || target.textContent || "";

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () { toast("Copied"); btn.textContent = "Copied!"; _resetCopyBtn(btn); },
          function () { _fallbackCopy(text); }
        );
      } else {
        _fallbackCopy(text);
      }
    });
  }

  function _fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:absolute;left:-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); toast("Copied"); }
    catch (_) { toast("Copy failed"); }
    ta.remove();
  }

  function _resetCopyBtn(btn) {
    setTimeout(function () { btn.textContent = "Copy"; }, 2000);
  }


  /* ═══════════════════════════════════════
     04. SEARCH / FILTER
     <input id="globalSearch"/> + [data-filter-text]
     ═══════════════════════════════════════ */

  function _initSearch() {
    var input = $("#globalSearch");
    var btn = $("#searchBtn");
    var filterables = $$("[data-filter-text]");
    if (!input || filterables.length === 0) return;

    var applyFilter = debounce(function () {
      var q = (input.value || "").trim().toLowerCase();
      var shown = 0;
      filterables.forEach(function (el) {
        var hay = (el.getAttribute("data-filter-text") || "").toLowerCase();
        var ok = q === "" || hay.indexOf(q) !== -1;
        el.style.display = ok ? "" : "none";
        if (ok) shown++;
      });
      if (q) toast('Filter: "' + q + '" (' + shown + " results)");
      emit("search:filter", { query: q, shown: shown, total: filterables.length });
    }, 300);

    if (btn) btn.addEventListener("click", applyFilter);
    input.addEventListener("input", applyFilter);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { input.value = ""; applyFilter(); }
    });
  }


  /* ═══════════════════════════════════════
     05. INTAKE FORM (production pattern)
     <form id="intakeForm">
     Posts to: api/intake.php
     ═══════════════════════════════════════ */

  function _initIntakeForm() {
    var form = $("#intakeForm");
    if (!form) return;

    var tokenInput = $("#token");
    var success = $("#formSuccess");
    var error = $("#formError");

    function refreshToken() {
      if (!tokenInput) return Promise.resolve();
      var name = ($("#name") ? $("#name").value : "");
      var contact = ($("#contact") ? $("#contact").value : "");
      var today = new Date().toISOString().slice(0, 10);
      var salt = form.getAttribute("data-csrf-salt") || "CHANGE_ME";
      return sha256(salt + "|" + today + "|" + name + "|" + contact).then(function (hash) {
        tokenInput.value = hash;
      });
    }

    if ($("#name")) $("#name").addEventListener("input", refreshToken);
    if ($("#contact")) $("#contact").addEventListener("input", refreshToken);
    refreshToken();

    /* Pre-fill URL ?service= param */
    var svcParam = new URL(window.location.href).searchParams.get("service");
    if (svcParam) {
      var sel = $("#service");
      if (sel) {
        var map = {
          network_setup: "wifi", printer_integration: "printer",
          malware_repair: "virus", data_transfer_backup: "backup",
          smallbiz_data: "smallbiz-files", os_tuneup_upgrade: "os-upgrade",
          software_setup: "software", remote_support: "remote",
          system_setup: "new-setup", reset_optimize: "tune-up",
          data_recovery: "recovery"
        };
        sel.value = map[svcParam] || svcParam;
      }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (success) success.style.display = "none";
      if (error) error.style.display = "none";

      var submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.setAttribute("aria-busy", "true"); }

      api.submit(form)
        .then(function (result) {
          if (result.ok && result.data && result.data.ok) {
            if (success) success.style.display = "block";
            form.reset();
            var city = $("#city"); if (city && !city.value) city.value = "Bluefield";
            var state = $("#state"); if (state && !state.value) state.value = "VA";
            var zip = $("#zip"); if (zip && !zip.value) zip.value = "24605";
            refreshToken();
            toast("Request submitted");
            announce("Your request has been submitted successfully.");
            emit("form:success", { form: "intake" });
          } else {
            var msg = (result.data && result.data.message) || "Please try again.";
            _showFormError(error, msg);
          }
        })
        .catch(function () {
          _showFormError(error, "Couldn't reach the server. Please try again.");
        })
        .finally(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.removeAttribute("aria-busy"); }
        });
    });
  }

  function _showFormError(el, msg) {
    if (!el) return;
    el.style.display = "block";
    el.innerHTML = "<strong>Couldn't send request.</strong> " + escapeHtml(msg);
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    toast("Form needs work");
    announce("Form error: " + msg);
  }


  /* ═══════════════════════════════════════
     06. GENERIC FORM VALIDATION
     <form data-validate> with per-field rules:
     <input required data-validate-min="3"
            data-validate-pattern="^[a-zA-Z]+"
            data-validate-msg="Letters only">
     ═══════════════════════════════════════ */

  function _initForms() {
    $$("form[data-validate]").forEach(function (form) {
      if (form.id === "intakeForm") return; /* Handled by _initIntakeForm */

      form.setAttribute("novalidate", "");

      form.addEventListener("submit", function (e) {
        var valid = true;
        $$("input, select, textarea", form).forEach(function (field) {
          if (!_validateField(field)) valid = false;
        });
        if (!valid) {
          e.preventDefault();
          var firstErr = $(".field-error", form);
          if (firstErr) firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
          toast("Please fix the errors above");
        }
      });

      /* Live validation on blur */
      form.addEventListener("focusout", function (e) {
        if (e.target.matches("input, select, textarea")) {
          _validateField(e.target);
        }
      });

      /* Clear error on input */
      form.addEventListener("input", function (e) {
        if (e.target.matches("input, select, textarea")) {
          _clearFieldError(e.target);
        }
      });
    });
  }

  function _validateField(field) {
    _clearFieldError(field);
    var val = (field.value || "").trim();

    /* Required */
    if (field.hasAttribute("required") && !val) {
      return _setFieldError(field, field.getAttribute("data-validate-msg") || "This field is required.");
    }

    if (!val) return true; /* Empty + not required = ok */

    /* Min length */
    var min = field.getAttribute("data-validate-min");
    if (min && val.length < parseInt(min, 10)) {
      return _setFieldError(field, "Must be at least " + min + " characters.");
    }

    /* Max length */
    var max = field.getAttribute("data-validate-max");
    if (max && val.length > parseInt(max, 10)) {
      return _setFieldError(field, "Must be " + max + " characters or fewer.");
    }

    /* Pattern */
    var pattern = field.getAttribute("data-validate-pattern");
    if (pattern) {
      try {
        if (!new RegExp(pattern).test(val)) {
          return _setFieldError(field, field.getAttribute("data-validate-msg") || "Invalid format.");
        }
      } catch (_) { }
    }

    /* Email */
    if (field.type === "email" && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      return _setFieldError(field, "Please enter a valid email address.");
    }

    return true;
  }

  function _setFieldError(field, msg) {
    field.classList.add("field-error");
    field.setAttribute("aria-invalid", "true");
    var errId = field.id ? field.id + "-error" : uid("err");
    var existing = document.getElementById(errId);
    if (existing) existing.remove();
    var errEl = document.createElement("div");
    errEl.id = errId;
    errEl.className = "helper error";
    errEl.setAttribute("role", "alert");
    errEl.textContent = msg;
    field.setAttribute("aria-describedby", errId);
    field.parentNode.appendChild(errEl);
    return false;
  }

  function _clearFieldError(field) {
    field.classList.remove("field-error");
    field.removeAttribute("aria-invalid");
    var errId = field.getAttribute("aria-describedby");
    if (errId) {
      var el = document.getElementById(errId);
      if (el && el.classList.contains("error")) { el.remove(); field.removeAttribute("aria-describedby"); }
    }
  }


  /* ═══════════════════════════════════════
     07. HIGH CONTRAST TOGGLE
     <button id="contrastToggle" aria-pressed="false">
     ═══════════════════════════════════════ */

  function _initContrast() {
    var btn = $("#contrastToggle");
    if (!btn) return;

    /* Restore preference */
    if (pref.get("contrast") === true) {
      document.documentElement.classList.add("contrast");
      btn.setAttribute("aria-pressed", "true");
    }

    btn.addEventListener("click", function () {
      document.documentElement.classList.toggle("contrast");
      var on = document.documentElement.classList.contains("contrast");
      btn.setAttribute("aria-pressed", String(on));
      pref.set("contrast", on);
      toast(on ? "High-contrast ON" : "High-contrast OFF");
      announce(on ? "High contrast mode enabled" : "High contrast mode disabled");
      emit("contrast:toggle", { on: on });
    });
  }


  /* ═══════════════════════════════════════
     08. ACTIVE NAV — sidebar current-page
     ═══════════════════════════════════════ */

  function _initActiveNav() {
    var path = (location.pathname || "").split("/").pop() || "index.html";
    var hash = location.hash;

    function mark() {
      var h = location.hash;
      $$(".nav a").forEach(function (a) {
        var href = a.getAttribute("href");
        if (!href) return;
        if (href.charAt(0) === "#") {
          a.setAttribute("aria-current", h === href ? "page" : "false");
        } else {
          a.setAttribute("aria-current", href.endsWith(path) ? "page" : "false");
        }
      });
    }

    mark();
    window.addEventListener("hashchange", mark);
  }


  /* ═══════════════════════════════════════
     09. KEYBOARD NAV — reads <kbd> labels
     ═══════════════════════════════════════ */

  function _initKeyboardNav() {
    var keyMap = {};
    $$(".nav a").forEach(function (a) {
      var kbd = a.querySelector("kbd");
      if (!kbd) return;
      keyMap[kbd.textContent.trim().toLowerCase()] = a;
    });

    if (Object.keys(keyMap).length === 0) return;

    document.addEventListener("keydown", function (e) {
      var tag = (e.target.tagName || "").toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      var a = keyMap[e.key.toLowerCase()];
      if (!a) return;
      e.preventDefault();
      var href = a.getAttribute("href");
      if (href && href.charAt(0) === "#") {
        location.hash = href;
        var el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
      } else if (href) {
        location.href = href;
      }
    });
  }


  /* ═══════════════════════════════════════
     10. COUNTRY MINDSET FILTER
     [data-country-mindset="1"] container
     ═══════════════════════════════════════ */

  function _initCountryMindset() {
    var root = $('[data-country-mindset="1"]');
    if (!root) return;
    var pills = $$("[data-pill]", root);
    var cards = $$("[data-offer-card]", root);
    var countEl = $("[data-offer-count]", root);

    function applyFilter(category) {
      var shown = 0;
      cards.forEach(function (card) {
        var cat = card.getAttribute("data-category") || "";
        var ok = category === "All" || cat === category;
        card.style.display = ok ? "" : "none";
        if (ok) shown++;
      });
      if (countEl) countEl.textContent = String(shown);
      emit("filter:country", { category: category, shown: shown });
    }

    pills.forEach(function (p) {
      p.addEventListener("click", function () {
        pills.forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        p.setAttribute("aria-pressed", "true");
        applyFilter(p.getAttribute("data-pill") || "All");
      });
    });
    applyFilter("All");
  }


  /* ═══════════════════════════════════════
     11. MODAL / DIALOG SYSTEM
     Trigger: <button data-modal-open="modal-id">
     Target:  <div class="modal" id="modal-id" role="dialog"
                   aria-labelledby="..." aria-modal="true">
               <div class="modal-overlay"></div>
               <div class="modal-content">
                 <button class="modal-close" aria-label="Close">×</button>
                 ...
               </div>
             </div>
     ═══════════════════════════════════════ */

  var _activeModal = null;
  var _previousFocus = null;

  function _initModal() {
    /* Delegate open triggers */
    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-modal-open]");
      if (trigger) {
        e.preventDefault();
        var id = trigger.getAttribute("data-modal-open");
        var el = document.getElementById(id);
        if (el) modalOpen(el);
        return;
      }

      /* Close on overlay or close button */
      if (_activeModal) {
        if (e.target.closest(".modal-close") || e.target.classList.contains("modal-overlay")) {
          modalClose();
        }
      }
    });

    /* Close on Escape */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && _activeModal) {
        modalClose();
      }
    });
  }

  function modalOpen(el) {
    if (_activeModal) modalClose();
    _previousFocus = document.activeElement;
    _activeModal = el;
    el.classList.add("open");
    el.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    /* Focus first focusable element inside */
    var focusable = el.querySelector(
      'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) focusable.focus();
    else el.focus();

    /* Trap focus */
    el.addEventListener("keydown", _trapFocus);
    announce("Dialog opened");
    emit("modal:open", { id: el.id });
  }

  function modalClose() {
    if (!_activeModal) return;
    _activeModal.classList.remove("open");
    _activeModal.setAttribute("aria-hidden", "true");
    _activeModal.removeEventListener("keydown", _trapFocus);
    document.body.style.overflow = "";
    var m = _activeModal;
    _activeModal = null;
    if (_previousFocus) { _previousFocus.focus(); _previousFocus = null; }
    announce("Dialog closed");
    emit("modal:close", { id: m.id });
  }

  function _trapFocus(e) {
    if (e.key !== "Tab") return;
    var focusables = $$('button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])', _activeModal);
    if (focusables.length === 0) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }


  /* ═══════════════════════════════════════
     12. TABS — accessible tablist
     <div data-tabs>
       <div role="tablist" aria-label="...">
         <button role="tab" aria-controls="panel-id">Tab 1</button>
       </div>
       <div role="tabpanel" id="panel-id">Content</div>
     </div>
     ═══════════════════════════════════════ */

  function _initTabs() {
    $$("[data-tabs]").forEach(function (root) {
      var tabs = $$('[role="tab"]', root);
      var panels = $$('[role="tabpanel"]', root);
      if (tabs.length === 0) return;

      /* Ensure IDs and aria linking */
      tabs.forEach(function (tab, i) {
        if (!tab.id) tab.id = uid("tab");
        var panelId = tab.getAttribute("aria-controls");
        var panel = panelId ? document.getElementById(panelId) : panels[i];
        if (panel) {
          panel.setAttribute("aria-labelledby", tab.id);
          tab.setAttribute("aria-controls", panel.id || (panel.id = uid("panel")));
        }
      });

      function activate(tab) {
        tabs.forEach(function (t) {
          t.setAttribute("aria-selected", "false");
          t.setAttribute("tabindex", "-1");
          var p = document.getElementById(t.getAttribute("aria-controls"));
          if (p) p.hidden = true;
        });
        tab.setAttribute("aria-selected", "true");
        tab.setAttribute("tabindex", "0");
        tab.focus();
        var panel = document.getElementById(tab.getAttribute("aria-controls"));
        if (panel) panel.hidden = false;
        emit("tabs:activate", { tab: tab.id, panel: tab.getAttribute("aria-controls") });
      }

      /* Click */
      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () { activate(tab); });
      });

      /* Arrow keys */
      var tablist = $('[role="tablist"]', root);
      if (tablist) {
        tablist.addEventListener("keydown", function (e) {
          var idx = tabs.indexOf(document.activeElement);
          if (idx === -1) return;
          if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            e.preventDefault();
            activate(tabs[(idx + 1) % tabs.length]);
          } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            e.preventDefault();
            activate(tabs[(idx - 1 + tabs.length) % tabs.length]);
          } else if (e.key === "Home") {
            e.preventDefault(); activate(tabs[0]);
          } else if (e.key === "End") {
            e.preventDefault(); activate(tabs[tabs.length - 1]);
          }
        });
      }

      /* Initialize: activate first tab */
      var active = $('[role="tab"][aria-selected="true"]', root) || tabs[0];
      activate(active);
    });
  }


  /* ═══════════════════════════════════════
     13. TABLE SORT
     <table data-sortable>
       <thead><tr>
         <th data-sort="string">Name</th>
         <th data-sort="number">Score</th>
         <th data-sort="date">Date</th>
       </tr></thead>
     </table>
     ═══════════════════════════════════════ */

  function _initTableSort() {
    $$("table[data-sortable]").forEach(function (table) {
      var headers = $$("th[data-sort]", table);
      var tbody = $("tbody", table);
      if (!tbody || headers.length === 0) return;

      headers.forEach(function (th, colIdx) {
        th.style.cursor = "pointer";
        th.setAttribute("aria-sort", "none");
        th.setAttribute("role", "columnheader");
        th.setAttribute("tabindex", "0");
        th.title = "Click to sort";

        function sortCol() {
          var dir = th.getAttribute("aria-sort");
          /* Cycle: none → ascending → descending → ascending */
          dir = dir === "ascending" ? "descending" : "ascending";

          /* Reset others */
          headers.forEach(function (h) { h.setAttribute("aria-sort", "none"); });
          th.setAttribute("aria-sort", dir);

          var rows = $$("tr", tbody);
          var type = th.getAttribute("data-sort");
          var mult = dir === "ascending" ? 1 : -1;

          rows.sort(function (a, b) {
            var aVal = (a.cells[colIdx] || {}).textContent || "";
            var bVal = (b.cells[colIdx] || {}).textContent || "";
            if (type === "number") {
              return mult * (parseFloat(aVal) - parseFloat(bVal) || 0);
            } else if (type === "date") {
              return mult * (new Date(aVal) - new Date(bVal) || 0);
            }
            return mult * aVal.localeCompare(bVal, undefined, { sensitivity: "base" });
          });

          rows.forEach(function (row) { tbody.appendChild(row); });
          toast("Sorted by " + (th.textContent || "column"));
          emit("table:sort", { column: colIdx, direction: dir });
        }

        th.addEventListener("click", sortCol);
        th.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); sortCol(); }
        });
      });
    });
  }


  /* ═══════════════════════════════════════
     14. RESPONSIVE DRAWER — mobile sidebar
     <button id="drawerToggle" aria-controls="sidebar"
             aria-expanded="false" aria-label="Open menu">☰</button>
     Sidebar already exists as <aside class="sidebar" id="sidebar">
     ═══════════════════════════════════════ */

  function _initDrawer() {
    var btn = $("#drawerToggle");
    var sidebar = $(".sidebar");
    if (!btn || !sidebar) return;

    sidebar.id = sidebar.id || "sidebar";
    btn.setAttribute("aria-controls", sidebar.id);

    btn.addEventListener("click", function () {
      var open = sidebar.classList.toggle("drawer-open");
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (open) {
        document.body.classList.add("drawer-active");
        /* Focus first nav link */
        var first = $(".nav a", sidebar);
        if (first) first.focus();
      } else {
        document.body.classList.remove("drawer-active");
        btn.focus();
      }
    });

    /* Close drawer on nav link click (mobile) */
    sidebar.addEventListener("click", function (e) {
      if (e.target.closest(".nav a") && sidebar.classList.contains("drawer-open")) {
        sidebar.classList.remove("drawer-open");
        btn.setAttribute("aria-expanded", "false");
        document.body.classList.remove("drawer-active");
      }
    });

    /* Close on Escape */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && sidebar.classList.contains("drawer-open")) {
        sidebar.classList.remove("drawer-open");
        btn.setAttribute("aria-expanded", "false");
        document.body.classList.remove("drawer-active");
        btn.focus();
      }
    });
  }


  /* ═══════════════════════════════════════
     15. LAZY LOADING — IntersectionObserver
     <img data-src="real.jpg" alt="..." class="lazy">
     <div data-lazy-load="module-id">heavy content</div>
     ═══════════════════════════════════════ */

  function _initLazy() {
    var lazyImages = $$("img[data-src]");
    var lazyDivs = $$("[data-lazy-load]");
    if (lazyImages.length === 0 && lazyDivs.length === 0) return;

    if (!("IntersectionObserver" in window)) {
      /* Fallback: load everything immediately */
      lazyImages.forEach(function (img) { img.src = img.getAttribute("data-src"); img.removeAttribute("data-src"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.tagName === "IMG" && el.getAttribute("data-src")) {
          el.src = el.getAttribute("data-src");
          el.removeAttribute("data-src");
          el.classList.remove("lazy");
        }
        observer.unobserve(el);
        emit("lazy:load", { element: el.id || el.tagName });
      });
    }, { rootMargin: "200px 0px" });

    lazyImages.forEach(function (img) { observer.observe(img); });
    lazyDivs.forEach(function (div) { observer.observe(div); });
  }


  /* ═══════════════════════════════════════
     16. SCROLL SPY — hash tracking
     Watches sections with IDs referenced by .nav a[href^="#"]
     ═══════════════════════════════════════ */

  function _initScrollSpy() {
    var links = $$('.nav a[href^="#"]');
    if (links.length === 0) return;
    if (!("IntersectionObserver" in window)) return;

    var sectionIds = links.map(function (a) { return a.getAttribute("href").slice(1); }).filter(Boolean);
    var sections = sectionIds.map(function (id) { return document.getElementById(id); }).filter(Boolean);
    if (sections.length === 0) return;

    var current = null;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.target.id !== current) {
          current = entry.target.id;
          links.forEach(function (a) {
            a.setAttribute("aria-current", a.getAttribute("href") === "#" + current ? "page" : "false");
          });
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });

    sections.forEach(function (sec) { observer.observe(sec); });
  }


  /* ═══════════════════════════════════════
     17. BACK TO TOP
     <button id="backToTop" class="back-to-top" aria-label="Back to top">↑</button>
     Or auto-creates if data-back-to-top on <body>
     ═══════════════════════════════════════ */

  function _initBackToTop() {
    var btn = $("#backToTop");
    if (!btn && document.body.hasAttribute("data-back-to-top")) {
      btn = document.createElement("button");
      btn.id = "backToTop";
      btn.className = "back-to-top";
      btn.setAttribute("aria-label", "Back to top");
      btn.innerHTML = "↑";
      btn.hidden = true;
      document.body.appendChild(btn);
    }
    if (!btn) return;

    var handleScroll = throttle(function () {
      btn.hidden = window.scrollY < 400;
    }, 150);

    window.addEventListener("scroll", handleScroll, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    });
  }


  /* ═══════════════════════════════════════
     18. CONFIRM DIALOGS
     <button data-confirm="Are you sure?" data-confirm-action="deleteItem()">Delete</button>
     Or <a href="/danger" data-confirm="Leave this page?">
     ═══════════════════════════════════════ */

  function _initConfirm() {
    document.addEventListener("click", function (e) {
      var el = e.target.closest("[data-confirm]");
      if (!el) return;
      var msg = el.getAttribute("data-confirm");
      if (!window.confirm(msg)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    });
  }


  /* ═══════════════════════════════════════
     19. ACCORDION GROUPS — single-open mode
     <div data-accordion-group>
       <details>...</details>
       <details>...</details>
     </div>
     ═══════════════════════════════════════ */

  function _initAccordionGroups() {
    $$("[data-accordion-group]").forEach(function (group) {
      group.addEventListener("toggle", function (e) {
        if (!e.target.open) return;
        $$("details", group).forEach(function (d) {
          if (d !== e.target && d.open) d.open = false;
        });
      }, true);
    });
  }


  /* ═══════════════════════════════════════
     20. RESPONSIVE TABLES — horizontal scroll
     Wraps tables wider than viewport in a scroll container
     Targets: <table data-responsive>
     ═══════════════════════════════════════ */

  function _initResponsiveTables() {
    $$("table[data-responsive]").forEach(function (table) {
      if (table.parentNode.classList.contains("table-scroll")) return;
      var wrapper = document.createElement("div");
      wrapper.className = "table-scroll";
      wrapper.setAttribute("tabindex", "0");
      wrapper.setAttribute("role", "region");
      wrapper.setAttribute("aria-label", "Scrollable table");
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
  }


  /* ═══════════════════════════════════════
     21. LOADING STATES — skeleton toggle
     GoldHatUI.loading(element, true/false)
     ═══════════════════════════════════════ */

  function _initLoading() { /* API only — no auto-init needed */ }

  function loading(el, state) {
    if (!el) return;
    if (typeof el === "string") el = $(el);
    if (!el) return;
    if (state) {
      el.classList.add("loading");
      el.setAttribute("aria-busy", "true");
    } else {
      el.classList.remove("loading");
      el.removeAttribute("aria-busy");
    }
  }


  /* ═══════════════════════════════════════
     22. TIME AGO — relative timestamps
     <time data-timeago datetime="2026-02-28T12:00:00Z">Feb 28, 2026</time>
     ═══════════════════════════════════════ */

  function _initTimeAgo() {
    var els = $$("time[data-timeago]");
    if (els.length === 0) return;

    function format(date) {
      var now = Date.now();
      var diff = now - date.getTime();
      var sec = Math.floor(diff / 1000);
      if (sec < 60) return "just now";
      var min = Math.floor(sec / 60);
      if (min < 60) return min + "m ago";
      var hr = Math.floor(min / 60);
      if (hr < 24) return hr + "h ago";
      var days = Math.floor(hr / 24);
      if (days < 30) return days + "d ago";
      var months = Math.floor(days / 30);
      if (months < 12) return months + "mo ago";
      return Math.floor(months / 12) + "y ago";
    }

    function update() {
      els.forEach(function (el) {
        var dt = el.getAttribute("datetime");
        if (!dt) return;
        var d = new Date(dt);
        if (isNaN(d.getTime())) return;
        el.textContent = format(d);
        el.title = d.toLocaleString();
      });
    }

    update();
    setInterval(update, 60000); /* Update every minute */
  }


  /* ═══════════════════════════════════════
     23. PRINT HELPERS
     Fires events before/after print for
     sites that need to collapse sidebars,
     expand accordions, etc.
     ═══════════════════════════════════════ */

  function _initPrint() {
    function beforePrint() {
      /* Expand all details for print */
      $$("details").forEach(function (d) {
        d.setAttribute("data-was-open", d.open ? "true" : "false");
        d.open = true;
      });
      emit("print:before");
    }

    function afterPrint() {
      $$("details[data-was-open]").forEach(function (d) {
        d.open = d.getAttribute("data-was-open") === "true";
        d.removeAttribute("data-was-open");
      });
      emit("print:after");
    }

    if (window.matchMedia) {
      var mql = window.matchMedia("print");
      mql.addEventListener("change", function (e) {
        if (e.matches) beforePrint(); else afterPrint();
      });
    }
    window.addEventListener("beforeprint", beforePrint);
    window.addEventListener("afterprint", afterPrint);
  }


  /* ═══════════════════════════════════════
     24. ERROR BOUNDARY — global handler
     Catches unhandled errors and shows toast.
     Doesn't swallow — still logs to console.
     ═══════════════════════════════════════ */

  function _initErrorBoundary() {
    window.addEventListener("error", function (e) {
      console.error("[GoldHatUI] Uncaught:", e.message, e.filename, e.lineno);
      emit("error:global", { message: e.message, source: e.filename, line: e.lineno });
    });

    window.addEventListener("unhandledrejection", function (e) {
      console.error("[GoldHatUI] Unhandled promise rejection:", e.reason);
      emit("error:promise", { reason: String(e.reason) });
    });
  }


  /* ═══════════════════════════════════════
     PLUGIN SYSTEM — site-specific extensions
     GoldHatUI.plugin("arena", function(UI) { ... });
     ═══════════════════════════════════════ */

  var _plugins = {};
  var _initialized = false;

  function plugin(name, fn) {
    _plugins[name] = fn;
    /* If already initialized, run immediately */
    if (_initialized) {
      try { fn(publicAPI); }
      catch (e) { console.error("[GoldHatUI] Plugin error:", name, e); }
    }
  }


  /* ═══════════════════════════════════════
     INIT — wire everything up
     ═══════════════════════════════════════ */

  function init() {
    /* Core services */
    _initToast();
    _initAnnounce();
    _initErrorBoundary();

    /* Navigation & layout */
    _initActiveNav();
    _initKeyboardNav();
    _initDrawer();
    _initScrollSpy();
    _initBackToTop();

    /* Interactive components */
    _initCopy();
    _initSearch();
    _initModal();
    _initTabs();
    _initTableSort();
    _initAccordionGroups();
    _initResponsiveTables();
    _initConfirm();

    /* Forms */
    _initForms();
    _initIntakeForm();

    /* Performance & display */
    _initLazy();
    _initTimeAgo();
    _initLoading();
    _initContrast();
    _initCountryMindset();
    _initPrint();

    /* Run registered plugins */
    _initialized = true;
    Object.keys(_plugins).forEach(function (name) {
      try { _plugins[name](publicAPI); }
      catch (e) { console.error("[GoldHatUI] Plugin error:", name, e); }
    });

    emit("init:complete", { version: VERSION, modules: 24, plugins: Object.keys(_plugins).length });
  }


  /* Auto-init on DOM ready */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }


  /* ═══════════════════════════════════════
     PUBLIC API
     ═══════════════════════════════════════ */

  var publicAPI = {
    /* Core */
    version:    VERSION,
    init:       init,
    escapeHtml: escapeHtml,
    debounce:   debounce,
    throttle:   throttle,
    sha256:     sha256,

    /* Events */
    on:   on,
    off:  off,
    emit: emit,

    /* Preferences */
    pref: pref,

    /* Notifications */
    toast:    toast,
    announce: announce,

    /* API Client */
    api: api,

    /* UI */
    modal: { open: modalOpen, close: modalClose },
    loading: loading,

    /* Extensibility */
    plugin: plugin
  };

  return publicAPI;
})();
