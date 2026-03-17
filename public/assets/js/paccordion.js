export class Accordion {
  constructor() {
    this.init();
  }

  init() {
    let autoId = 0;

    const prefersReducedMotion = () =>
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const closestItem = (node) => node?.closest?.(".paccordion__item") || null;

    const getParts = (itemEl) => {
      const button = itemEl.querySelector(":scope > .paccordion__heading > .paccordion__button");
      const panelId = button?.getAttribute("aria-controls") || "";
      const panel = panelId ? document.getElementById(panelId) : itemEl.querySelector(":scope > .paccordion__panel");
      return { button, panel };
    };

    const slugify = (text) => {
      const base = (text || "")
        .toString()
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-+/g, "-");
      return base || "sekcja";
    };

    const ensureUniqueId = (base) => {
      let candidate = base;
      let i = 2;
      while (document.getElementById(candidate)) {
        candidate = `${base}-${i}`;
        i += 1;
      }
      return candidate;
    };

    const ensureItemId = (itemEl) => {
      if (itemEl.id) return itemEl.id;
      const label = itemEl.querySelector(".paccordion__label");
      const base = slugify(label?.textContent || "");
      const unique = ensureUniqueId(base);
      itemEl.id = unique;
      return unique;
    };

    const isOpen = (itemEl) => {
      const { button, panel } = getParts(itemEl);
      if (!button || !panel) return false;
      return button.getAttribute("aria-expanded") === "true" && !panel.hasAttribute("hidden");
    };

    const setExpanded = (button, expanded) => {
      button.setAttribute("aria-expanded", expanded ? "true" : "false");
    };

    const stopRunningTransition = (panel) => {
      const handler = panel._revealTransitionEnd;
      if (handler) panel.removeEventListener("transitionend", handler);
      panel._revealTransitionEnd = null;
      panel.style.removeProperty("height");
      panel.style.removeProperty("overflow");
      panel.style.removeProperty("will-change");
      delete panel.dataset.animating;
    };

    const animateOpen = (panel) => {
      stopRunningTransition(panel);
      panel.dataset.animating = "1";
      panel.hidden = false;

      if (prefersReducedMotion()) {
        panel.style.removeProperty("height");
        panel.style.removeProperty("overflow");
        panel.style.removeProperty("will-change");
        delete panel.dataset.animating;
        return;
      }

      panel.style.willChange = "height";
      panel.style.overflow = "hidden";
    panel.style.height = "0px";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        panel.style.height = `${panel.scrollHeight}px`;
      });
    });

      panel._revealTransitionEnd = (ev) => {
        if (ev.target !== panel) return;
        stopRunningTransition(panel);
      };
      panel.addEventListener("transitionend", panel._revealTransitionEnd);
    };

    const animateClose = (panel) => {
      stopRunningTransition(panel);
      panel.dataset.animating = "1";

      if (prefersReducedMotion()) {
        panel.hidden = true;
        panel.style.removeProperty("height");
        panel.style.removeProperty("overflow");
        panel.style.removeProperty("will-change");
        delete panel.dataset.animating;
        return;
      }

      panel.style.willChange = "height";
      panel.style.overflow = "hidden";
    panel.style.height = `${panel.scrollHeight}px`;

    requestAnimationFrame(() => {
      panel.style.height = "0px";
    });

      panel._revealTransitionEnd = (ev) => {
        if (ev.target !== panel) return;
        panel.hidden = true;
        stopRunningTransition(panel);
      };
      panel.addEventListener("transitionend", panel._revealTransitionEnd);
    };

    const openItem = (itemEl) => {
      const { button, panel } = getParts(itemEl);
      if (!button || !panel) return;
      if (isOpen(itemEl)) return;
      setExpanded(button, true);
      itemEl.classList.add("paccordion__item--open");
      animateOpen(panel);
    };

    const closeItem = (itemEl) => {
      const { button, panel } = getParts(itemEl);
      if (!button || !panel) return;
      if (!isOpen(itemEl)) return;
      setExpanded(button, false);
      itemEl.classList.remove("paccordion__item--open");
      animateClose(panel);
    };

    const toggleItem = (itemEl) => {
      if (isOpen(itemEl)) closeItem(itemEl);
      else openItem(itemEl);
    };

    const openItemImmediate = (itemEl) => {
      const { button, panel } = getParts(itemEl);
      if (!button || !panel) return;
      setExpanded(button, true);
      itemEl.classList.add("paccordion__item--open");
      panel.hidden = false;
      panel.style.removeProperty("height");
      panel.style.removeProperty("overflow");
      delete panel.dataset.animating;
    };

    const openAncestorsImmediate = (itemEl) => {
      let current = itemEl?.parentElement || null;
      while (current) {
        const item = closestItem(current);
        if (!item) break;
        openItemImmediate(item);
        current = item.parentElement;
      }
    };

    const setupButton = (button) => {
      const item = closestItem(button);
      if (!item) return;
      const { panel } = getParts(item);
      if (!panel) return;

      if (!button.id) {
        autoId += 1;
        button.id = `button-${autoId}`;
      }

      if (!panel.id) {
        autoId += 1;
        panel.id = `panel-${autoId}`;
      }

      button.setAttribute("aria-controls", panel.id);
      panel.setAttribute("aria-labelledby", button.id);

      button.addEventListener("click", () => toggleItem(item));
    };

    const setupPanel = (panel) => {
      if (!panel.hasAttribute("hidden")) {
        panel.setAttribute("hidden", "");
      }
    };

    const setupItem = (item) => {
      const { button, panel } = getParts(item);
      if (!button || !panel) return;

      setupButton(button);
      setupPanel(panel);

      ensureItemId(item);

      if (item.hasAttribute("data-open")) {
        openItemImmediate(item);
      }
    };

    const setupAll = () => {
      const items = Array.from(document.querySelectorAll(".paccordion__item"));
      items.forEach(setupItem);
    };

    const openFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (!hash) return;
      const target = document.getElementById(hash);
      if (!target) return;
      const item = closestItem(target);
      if (item) {
        openItemImmediate(item);
        openAncestorsImmediate(item);
      }
    };

    const setupAnchors = () => {
      const items = Array.from(document.querySelectorAll(".paccordion__item"));
      items.forEach((item) => {
        if (item.id) return;
        const label = item.querySelector(".paccordion__label");
        const base = slugify(label?.textContent || "");
        const unique = ensureUniqueId(base);
        item.id = unique;
      });
    };

    const setupRegions = () => {
      const items = Array.from(document.querySelectorAll(".paccordion__item"));
      items.forEach((item) => {
        const { panel } = getParts(item);
        if (!panel) return;
        const level = item.className.match(/paccordion__item--l(\d)/)?.[1];
        if (level === "1") {
          panel.setAttribute("role", "region");
        } else {
          panel.removeAttribute("role");
        }
      });
    };

    const applyDefaultOpen = () => {
      const openItems = Array.from(document.querySelectorAll(".paccordion__item[data-open]"));
      openItems.forEach((item) => openAncestorsImmediate(item));
    };

    const handleKeydown = (event) => {
      const button = event.target.closest?.(".paccordion__button");
      if (!button) return;

      const item = closestItem(button);
      if (!item) return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleItem(item);
      }
    };

    const init = () => {
      setupAll();
      setupAnchors();
      setupRegions();
      applyDefaultOpen();
      openFromHash();
      document.addEventListener("keydown", handleKeydown);
    };

    init();
  }
}

new Accordion();
