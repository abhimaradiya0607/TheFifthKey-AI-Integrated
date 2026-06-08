/**
 * =============================================================
 *  THE FIFTH KEY — Main JavaScript
 *  File: public/js/luxury.js
 *
 *  Modules:
 *    1. Navbar — scroll shadow, hamburger
 *    2. Avatar dropdown
 *    3. Auth modal — open with mode, switching panels
 *    4. Form validation — login & signup
 *    5. Password strength indicator
 *    6. Toggle password visibility
 *    7. Toast notification system
 *    8. Flash message reader
 *  =============================================================
 */

(function () {
    'use strict';
  
    /* ============================================================
       1. NAVBAR — Scroll shadow & Hamburger
       ============================================================ */
  
    const navbar      = document.getElementById('tfkNavbar');
    const hamburger   = document.getElementById('tfkHamburger');
    const mobileMenu  = document.getElementById('tfkMobileMenu');
  
    /** Add shadow class when user scrolls past 10px */
    function handleNavbarScroll() {
      if (!navbar) return;
      if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  
    window.addEventListener('scroll', handleNavbarScroll, { passive: true });
    handleNavbarScroll(); // Run on load in case page is already scrolled
  
    /** Hamburger toggle — opens/closes mobile drawer */
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', function () {
        const isOpen = mobileMenu.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
      });
  
      // Close mobile menu when any modal is opened
      document.addEventListener('show.bs.modal', function () {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    }
  
  
    /* ============================================================
       2. AVATAR DROPDOWN
       ============================================================ */
  
    const userTrigger  = document.getElementById('tfkUserTrigger');
    const userDropdown = document.getElementById('tfkUserDropdown');
  
    if (userTrigger && userDropdown) {
      /** Toggle dropdown open/close */
      userTrigger.addEventListener('click', function (e) {
        e.stopPropagation();
        const isOpen = userDropdown.classList.toggle('open');
        userTrigger.setAttribute('aria-expanded', String(isOpen));
      });
  
      /** Close on outside click */
      document.addEventListener('click', function (e) {
        if (!userTrigger.contains(e.target) && !userDropdown.contains(e.target)) {
          userDropdown.classList.remove('open');
          userTrigger.setAttribute('aria-expanded', 'false');
        }
      });
  
      /** Close on Escape key */
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          userDropdown.classList.remove('open');
          userTrigger.setAttribute('aria-expanded', 'false');
          userTrigger.focus();
        }
      });
    }
  
  
    /* ============================================================
       3. AUTH MODAL — Open with mode + Panel switching
       ============================================================ */
  
    const authModal      = document.getElementById('tfkAuthModal');
    const loginFormWrap  = document.getElementById('loginFormWrap');
    const signupFormWrap = document.getElementById('signupFormWrap');
  
    /**
     * Show the login or signup panel with a smooth fade animation.
     * @param {'login'|'signup'} mode
     */
    function showAuthPanel(mode) {
      const showEl  = mode === 'login' ? loginFormWrap  : signupFormWrap;
      const hideEl  = mode === 'login' ? signupFormWrap : loginFormWrap;
  
      if (!showEl || !hideEl) return;
  
      // Animate out the current panel
      hideEl.classList.add('switching');
  
      setTimeout(function () {
        hideEl.style.display = 'none';
        hideEl.classList.remove('switching');
  
        // Show new panel
        showEl.style.display = 'block';
        showEl.classList.add('switching');
  
        // Trigger reflow then animate in
        void showEl.offsetWidth;
        showEl.classList.remove('switching');
      }, 220);
    }
  
    /**
     * Listen for Bootstrap modal show event to set the correct panel
     * based on the data-auth-mode attribute on the trigger button.
     */
    if (authModal) {
      authModal.addEventListener('show.bs.modal', function (e) {
        const triggerBtn = e.relatedTarget;
        const mode = triggerBtn && triggerBtn.getAttribute('data-auth-mode');
  
        if (mode === 'signup') {
          showAuthPanel('signup');
        } else {
          showAuthPanel('login');
        }
  
        // Reset forms on open
        const lf = document.getElementById('tfkLoginForm');
        const sf = document.getElementById('tfkSignupForm');
        if (lf) lf.reset();
        if (sf) sf.reset();
        clearAllValidation();
      });
    }
  
    /** "Create an account" link inside login form — switch to signup */
    document.addEventListener('click', function (e) {
      if (e.target && e.target.id === 'switchToSignup') {
        showAuthPanel('signup');
      }
    });
  
    /** "Sign in" link inside signup form — switch to login */
    document.addEventListener('click', function (e) {
      if (e.target && e.target.id === 'switchToLogin') {
        showAuthPanel('login');
      }
    });
  
    /**
     * Trigger auth modal from any element with data-auth-trigger="login|signup"
     * Usage: <a data-auth-trigger="signup">Sign up</a>
     */
    document.querySelectorAll('[data-auth-trigger]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        const mode = el.getAttribute('data-auth-trigger') || 'login';
        const bsModal = window.bootstrap && bootstrap.Modal.getOrCreateInstance(authModal);
        if (bsModal) {
          authModal.setAttribute('data-pending-mode', mode);
          bsModal.show();
        }
      });
    });
  
  
    /* ============================================================
       4. TOGGLE PASSWORD VISIBILITY
       ============================================================ */
  
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('.tfk-toggle-pw');
      if (!btn) return;
  
      const targetId = btn.getAttribute('data-target');
      const input    = document.getElementById(targetId);
      if (!input) return;
  
      const icon = btn.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        icon && icon.classList.replace('bi-eye', 'bi-eye-slash');
        btn.setAttribute('aria-label', 'Hide password');
      } else {
        input.type = 'password';
        icon && icon.classList.replace('bi-eye-slash', 'bi-eye');
        btn.setAttribute('aria-label', 'Show password');
      }
    });
  
  
    /* ============================================================
       5. PASSWORD STRENGTH INDICATOR
       ============================================================ */
  
    const signupPassword = document.getElementById('signupPassword');
    const pwStrengthWrap = document.getElementById('pwStrengthWrap');
    const pwStrengthFill = document.getElementById('pwStrengthFill');
    const pwStrengthLbl  = document.getElementById('pwStrengthLabel');
  
    /**
     * Score password 0–4 based on length, lowercase, uppercase,
     * numbers, and special characters.
     * @param {string} pw
     * @returns {{ score: number, level: string, label: string }}
     */
    function scorePassword(pw) {
      let score = 0;
      if (!pw) return { score: 0, level: '', label: '' };
      if (pw.length >= 8)  score++;
      if (pw.length >= 12) score++;
      if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
      if (/\d/.test(pw)) score++;
      if (/[^A-Za-z0-9]/.test(pw)) score++;
  
      const levels = ['', 'weak', 'fair', 'good', 'strong'];
      const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
      const idx = Math.min(score, 4);
  
      return { score: idx, level: levels[idx], label: labels[idx] };
    }
  
    if (signupPassword && pwStrengthWrap && pwStrengthFill && pwStrengthLbl) {
      signupPassword.addEventListener('input', function () {
        const pw = this.value;
  
        if (!pw) {
          pwStrengthWrap.classList.remove('visible');
          return;
        }
  
        pwStrengthWrap.classList.add('visible');
        const result = scorePassword(pw);
  
        // Remove all level classes, apply new one
        pwStrengthFill.className = 'pw-strength-fill ' + result.level;
        pwStrengthLbl.className  = 'pw-strength-label ' + result.level;
        pwStrengthLbl.textContent = result.label ? result.label + ' password' : '';
      });
    }
  
  
    /* ============================================================
       6. FORM VALIDATION
       ============================================================ */
  
    /**
     * Show a validation message on an input field.
     * @param {HTMLElement} input   - The input element
     * @param {string}      msgId   - ID of the message <div>
     * @param {boolean}     valid   - true = success, false = error
     * @param {string}      message - Text to display
     */
    function setFieldState(input, msgId, valid, message) {
      const msgEl = document.getElementById(msgId);
  
      input.classList.remove('is-valid', 'is-invalid');
      input.classList.add(valid ? 'is-valid' : 'is-invalid');
  
      if (msgEl) {
        msgEl.textContent = message;
        msgEl.className   = 'tfk-field-msg ' + (valid ? 'success' : 'error');
      }
    }
  
    /** Clear all validation states */
    function clearAllValidation() {
      document.querySelectorAll('.tfk-input').forEach(function (inp) {
        inp.classList.remove('is-valid', 'is-invalid');
      });
      document.querySelectorAll('.tfk-field-msg').forEach(function (el) {
        el.textContent = '';
      });
      if (pwStrengthWrap) pwStrengthWrap.classList.remove('visible');
    }
  
    /* ── Login Form Validation ──────────────────── */
  
    const loginForm = document.getElementById('tfkLoginForm');
  
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        let valid = true;
  
        const username = document.getElementById('loginUsername');
        const password = document.getElementById('loginPassword');
  
        // Validate username
        if (!username.value.trim()) {
          setFieldState(username, 'loginUsernameMsg', false, 'Please enter your username.');
          valid = false;
        } else {
          setFieldState(username, 'loginUsernameMsg', true, '');
        }
  
        // Validate password
        if (!password.value) {
          setFieldState(password, 'loginPasswordMsg', false, 'Please enter your password.');
          valid = false;
        } else if (password.value.length < 6) {
          setFieldState(password, 'loginPasswordMsg', false, 'Password must be at least 6 characters.');
          valid = false;
        } else {
          setFieldState(password, 'loginPasswordMsg', true, '');
        }
  
        if (!valid) {
          e.preventDefault();
          e.stopPropagation();
        }
      });
  
      // Real-time feedback on blur
      document.getElementById('loginUsername') && document.getElementById('loginUsername')
        .addEventListener('blur', function () {
          if (this.value.trim()) {
            setFieldState(this, 'loginUsernameMsg', true, '');
          }
        });
    }
  
    /* ── Signup Form Validation ─────────────────── */
  
    const signupForm = document.getElementById('tfkSignupForm');
  
    if (signupForm) {
      const suUsername = document.getElementById('signupUsername');
      const suEmail    = document.getElementById('signupEmail');
      const suPassword = document.getElementById('signupPassword');
      const suConfirm  = document.getElementById('signupConfirmPassword');
  
      // Real-time username validation
      if (suUsername) {
        suUsername.addEventListener('input', function () {
          const val = this.value.trim();
          if (val.length === 0) return;
          if (val.length < 3) {
            setFieldState(this, 'signupUsernameMsg', false, 'Username must be at least 3 characters.');
          } else if (val.length > 30) {
            setFieldState(this, 'signupUsernameMsg', false, 'Username cannot exceed 30 characters.');
          } else if (!/^[a-zA-Z0-9_]+$/.test(val)) {
            setFieldState(this, 'signupUsernameMsg', false, 'Only letters, numbers, and underscores allowed.');
          } else {
            setFieldState(this, 'signupUsernameMsg', true, 'Looks good!');
          }
        });
      }
  
      // Real-time email validation
      if (suEmail) {
        suEmail.addEventListener('input', function () {
          const val = this.value.trim();
          if (val.length === 0) return;
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val)) {
            setFieldState(this, 'signupEmailMsg', false, 'Please enter a valid email address.');
          } else {
            setFieldState(this, 'signupEmailMsg', true, 'Valid email address.');
          }
        });
      }
  
      // Real-time confirm password matching
      if (suConfirm && suPassword) {
        suConfirm.addEventListener('input', function () {
          const val = this.value;
          if (val.length === 0) return;
          if (val !== suPassword.value) {
            setFieldState(this, 'signupConfirmMsg', false, 'Passwords do not match.');
          } else {
            setFieldState(this, 'signupConfirmMsg', true, 'Passwords match!');
          }
        });
      }
  
      // Submit validation
      signupForm.addEventListener('submit', function (e) {
        let valid = true;
  
        // Username
        if (!suUsername || !suUsername.value.trim() || suUsername.value.trim().length < 3) {
          setFieldState(suUsername, 'signupUsernameMsg', false, 'Username must be at least 3 characters.');
          valid = false;
        }
  
        // Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!suEmail || !emailRegex.test(suEmail.value.trim())) {
          setFieldState(suEmail, 'signupEmailMsg', false, 'Please enter a valid email address.');
          valid = false;
        }
  
        // Password
        const pwResult = scorePassword(suPassword ? suPassword.value : '');
        if (!suPassword || suPassword.value.length < 8) {
          setFieldState(suPassword, 'signupPasswordMsg', false, 'Password must be at least 8 characters.');
          valid = false;
        } else if (pwResult.score < 2) {
          setFieldState(suPassword, 'signupPasswordMsg', false, 'Password is too weak. Add numbers or symbols.');
          valid = false;
        }
  
        // Confirm password
        if (!suConfirm || suConfirm.value !== (suPassword ? suPassword.value : '')) {
          setFieldState(suConfirm, 'signupConfirmMsg', false, 'Passwords do not match.');
          valid = false;
        }
  
        if (!valid) {
          e.preventDefault();
          e.stopPropagation();
        }
      });
    }
  
  
    /* ============================================================
       7. TOAST NOTIFICATION SYSTEM
       ============================================================ */
  
    const toastContainer = document.getElementById('tfkToastContainer');
  
    /**
     * Show a toast notification.
     * @param {Object} opts
     * @param {'success'|'error'|'info'} opts.type    - Toast type
     * @param {string}                  opts.title    - Bold heading
     * @param {string}                  opts.message  - Body text
     * @param {number}                  [opts.duration=3500] - Auto-hide ms
     */
    window.TFKToast = {
      show: function (opts) {
        if (!toastContainer) return;
  
        const type     = opts.type     || 'info';
        const title    = opts.title    || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Notice');
        const message  = opts.message  || '';
        const duration = opts.duration || (type === 'error' ? 4000 : 3000);
  
        // Icon map
        const icons = {
          success: 'bi-check-lg',
          error:   'bi-exclamation-lg',
          info:    'bi-info-lg'
        };
  
        const toast = document.createElement('div');
        toast.className = 'tfk-toast ' + type;
        toast.style.setProperty('--toast-duration', duration + 'ms');
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
  
        toast.innerHTML = `
          <div class="toast-icon" aria-hidden="true">
            <i class="bi ${icons[type] || 'bi-info-lg'}"></i>
          </div>
          <div class="toast-body">
            <div class="toast-title">${escapeHtml(title)}</div>
            ${message ? `<div class="toast-msg">${escapeHtml(message)}</div>` : ''}
          </div>
          <button type="button" class="toast-close" aria-label="Dismiss notification">
            <i class="bi bi-x-lg" aria-hidden="true"></i>
          </button>
        `;
  
        // Close button
        toast.querySelector('.toast-close').addEventListener('click', function () {
          hideToast(toast);
        });
  
        toastContainer.appendChild(toast);
  
        // Auto-remove after duration
        const timer = setTimeout(function () {
          hideToast(toast);
        }, duration);
  
        // Pause timer on hover (accessible UX)
        toast.addEventListener('mouseenter', function () { clearTimeout(timer); });
        toast.addEventListener('mouseleave', function () {
          setTimeout(function () { hideToast(toast); }, 1500);
        });
      }
    };
  
    function hideToast(toast) {
      toast.classList.add('hiding');
      toast.addEventListener('animationend', function () {
        toast.remove();
      }, { once: true });
    }
  
    /** Safely escape HTML to prevent XSS in toast messages */
    function escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }
  
  
    /* ============================================================
       8. FLASH MESSAGE READER
       Reads hidden divs injected by the EJS navbar partial
       and converts them into toast notifications.
       ============================================================ */
  
    function readFlashMessages() {
      const successEl = document.getElementById('flash-success');
      const errorEl   = document.getElementById('flash-error');
      const infoEl    = document.getElementById('flash-info');
  
      if (successEl) {
        const msg = successEl.getAttribute('data-message');
        if (msg) {
          TFKToast.show({ type: 'success', title: 'Success', message: msg });
        }
        successEl.remove();
      }
  
      if (errorEl) {
        const msg = errorEl.getAttribute('data-message');
        if (msg) {
          TFKToast.show({ type: 'error', title: 'Error', message: msg });
        }
        errorEl.remove();
      }
  
      if (infoEl) {
        const msg = infoEl.getAttribute('data-message');
        if (msg) {
          TFKToast.show({ type: 'info', title: 'Notice', message: msg });
        }
        infoEl.remove();
      }
    }
  
    // Run flash reader after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', readFlashMessages);
    } else {
      readFlashMessages();
    }
  
  })(); // End IIFE