/* ==========================================================================
   Read Nursery School — script.js
   Mobile navigation, smooth scrolling, active links, reveals and form checks
   ========================================================================== */

(() => {
  "use strict";

  document.documentElement.classList.add("js");

  const header = document.querySelector("[data-header]");
  const navToggle = document.querySelector(".nav-toggle");
  const primaryNav = document.querySelector(".primary-nav");
  const navToggleLabel = document.querySelector(".nav-toggle-label");
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const mobileQuery = window.matchMedia("(max-width: 940px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ------------------------------------------------------------------------
     Header shadow
     ------------------------------------------------------------------------ */
  const updateHeader = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* ------------------------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------------------------ */
  const setMenuState = (open, { restoreFocus = false } = {}) => {
    if (!navToggle || !primaryNav) return;

    navToggle.setAttribute("aria-expanded", String(open));
    primaryNav.classList.toggle("is-open", open);

    if (navToggleLabel) {
      navToggleLabel.textContent = open ? "Close" : "Menu";
    }

    if (!open && restoreFocus) {
      navToggle.focus();
    }
  };

  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      setMenuState(!isOpen);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        setMenuState(false, { restoreFocus: true });
      }
    });

    document.addEventListener("click", (event) => {
      if (
        mobileQuery.matches &&
        navToggle.getAttribute("aria-expanded") === "true" &&
        header &&
        !header.contains(event.target)
      ) {
        setMenuState(false);
      }
    });

    const closeMenuOnResize = () => {
      if (!mobileQuery.matches) setMenuState(false);
    };

    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", closeMenuOnResize);
    } else {
      mobileQuery.addListener(closeMenuOnResize);
    }
  }

  /* ------------------------------------------------------------------------
     Active section in the navigation
     ------------------------------------------------------------------------ */
  const setCurrentLink = (id) => {
    navLinks.forEach((link) => {
      const matches = link.getAttribute("href") === `#${id}`;
      if (matches) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const sectionLinks = navLinks
    .map((link) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#") || href.length < 2) return null;
      const section = document.getElementById(href.slice(1));
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sectionLinks.length) {
    const visibleSections = new Map();

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibleSections.set(entry.target.id, entry.isIntersecting);
        });

        const current = sectionLinks.find(({ section }) => visibleSections.get(section.id));
        if (current) setCurrentLink(current.section.id);
      },
      { rootMargin: "-18% 0px -70% 0px", threshold: 0 }
    );

    sectionLinks.forEach(({ section }) => sectionObserver.observe(section));

    if (window.location.hash.length > 1) {
      setCurrentLink(window.location.hash.slice(1));
    }
  }

  /* ------------------------------------------------------------------------
     Smooth scrolling + focus management
     ------------------------------------------------------------------------ */
  const makeFocusTarget = (target) => {
    if (target.matches("h1, h2, h3")) return target;
    return target.querySelector("h1, h2, h3") || target;
  };

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      let target;
      try {
        target = document.getElementById(href.slice(1));
      } catch (error) {
        return;
      }

      if (!target) return;

      event.preventDefault();
      setMenuState(false);

      const focusTarget = makeFocusTarget(target);
      if (!focusTarget.hasAttribute("tabindex")) {
        focusTarget.setAttribute("tabindex", "-1");
      }

      const behavior = reducedMotion.matches || href === "#main-content" ? "auto" : "smooth";
      target.scrollIntoView({ behavior, block: "start" });
      focusTarget.focus({ preventScroll: true });

      if (href === "#main-content") {
        history.replaceState(null, "", href);
      } else {
        history.pushState(null, "", href);
        const id = target.id;
        if (id) setCurrentLink(id);
      }
    });
  });

  /* ------------------------------------------------------------------------
     Gentle scroll reveals
     ------------------------------------------------------------------------ */
  const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));

  if (!reducedMotion.matches && "IntersectionObserver" in window && "animate" in Element.prototype) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const item = entry.target;
          const siblings = Array.from(item.parentElement.children).filter((child) =>
            child.hasAttribute("data-reveal")
          );
          const index = Math.max(siblings.indexOf(item), 0);
          const delay = Math.min(index, 3) * 65;

          item.animate(
            [
              { opacity: 0.35, transform: "translateY(18px)" },
              { opacity: 1, transform: "translateY(0)" }
            ],
            {
              duration: 560,
              delay,
              easing: "cubic-bezier(0.2, 0.7, 0.2, 1)"
            }
          );

          observer.unobserve(item);
        });
      },
      { rootMargin: "0px 0px -35px 0px", threshold: 0.06 }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  /* ------------------------------------------------------------------------
     Contact form
     ------------------------------------------------------------------------ */
  const form = document.getElementById("contact-form");

  if (form) {
    const fields = [
      {
        input: document.getElementById("contact-name"),
        error: document.getElementById("name-error"),
        validate(value) {
          if (value.trim().length < 2) return "Please enter your name.";
          return "";
        },
        label: "name"
      },
      {
        input: document.getElementById("contact-email"),
        error: document.getElementById("email-error"),
        validate(value) {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
          if (!value.trim()) return "Please enter your email address.";
          if (!emailPattern.test(value.trim())) return "Please enter a valid email address.";
          return "";
        },
        label: "email address"
      },
      {
        input: document.getElementById("contact-phone"),
        error: document.getElementById("phone-error"),
        validate(value) {
          const digits = value.replace(/\D/g, "");
          if (!digits) return "Please enter your phone number.";
          if (digits.length < 7 || digits.length > 15) {
            return "Please enter a phone number with 7–15 digits.";
          }
          return "";
        },
        label: "phone number"
      },
      {
        input: document.getElementById("contact-message"),
        error: document.getElementById("message-error"),
        validate(value) {
          if (value.trim().length < 10) {
            return "Please tell us a little more (at least 10 characters).";
          }
          return "";
        },
        label: "message"
      }
    ];

    const status = document.getElementById("form-status");
    const submitButton = form.querySelector('button[type="submit"]');

    const setFieldError = (field, message) => {
      field.input.setAttribute("aria-invalid", "true");
      field.error.textContent = message;
    };

    const clearFieldError = (field) => {
      field.input.removeAttribute("aria-invalid");
      field.error.textContent = "";
    };

    const validateField = (field) => {
      const message = field.validate(field.input.value);
      if (message) {
        setFieldError(field, message);
        return false;
      }
      clearFieldError(field);
      return true;
    };

    const clearStatus = () => {
      if (!status) return;
      status.textContent = "";
      status.classList.remove("is-success", "is-error");
    };

    fields.forEach((field) => {
      if (!field.input || !field.error) return;

      field.input.addEventListener("blur", () => {
        if (field.input.value.trim() !== "" || field.input.getAttribute("aria-invalid") === "true") {
          validateField(field);
        }
      });

      field.input.addEventListener("input", () => {
        if (field.input.getAttribute("aria-invalid") === "true") {
          validateField(field);
        }
        clearStatus();
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clearStatus();

      let firstInvalidField = null;

      fields.forEach((field) => {
        if (!field.input || !field.error) return;
        const isValid = validateField(field);
        if (!isValid && !firstInvalidField) firstInvalidField = field;
      });

      if (firstInvalidField) {
        if (status) {
          status.textContent = "Please check the highlighted fields and try again.";
          status.classList.add("is-error");
        }
        firstInvalidField.input.focus();
        return;
      }

      const nameField = fields[0].input;
      const firstName = nameField.value.trim().split(/\s+/)[0];

      form.reset();
      fields.forEach(clearFieldError);

      if (status) {
        status.textContent = `Thanks, ${firstName}! We've got your note and will be in touch within one working day.`;
        status.classList.add("is-success");
      }

      if (submitButton) submitButton.focus({ preventScroll: true });
    });
  }

  /* ------------------------------------------------------------------------
     Small niceties
     ------------------------------------------------------------------------ */
  const year = document.querySelector("[data-current-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
