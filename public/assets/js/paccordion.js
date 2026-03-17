/* Reveal Panel component (BEM: .paccordion):
 * - Based on WAI-ARIA APG accordion pattern (button + region).
 * - IMPORTANT: do not use tablist/tab/tabpanel roles for this component.
 * - Multi-expand: opening one does not close others.
 * - Supports nested reveals.
 * - Hash anchors auto-open ancestors so the target becomes visible.
 */

(() => {
  let autoId = 0;
  let autoSlug = 0;

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
    const target = panel.scrollHeight;

    panel.getBoundingClientRect();

    requestAnimationFrame(() => {
      panel.style.height = `${target}px`;
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
    const start = panel.scrollHeight;
    panel.style.height = `${start}px`;

    panel.getBoundingClientRect();

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

  const openAncestorsFor = (target) => {
    let current = target?.parentElement || null;
    while (current) {
      const item = closestItem(current);
      if (!item) break;
      openItem(item);
      current = item.parentElement;
    }
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

  const focusTarget = (target) => {
    if (!target) return;
    const focusable = target.matches?.(
      "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"
    );
    if (focusable) target.focus({ preventScroll: true });
    else {
      const item = closestItem(target);
      const { button } = item ? getParts(item) : { button: null };
      button?.focus?.({ preventScroll: true });
    }
  };

  const scrollToHash = () => {
    const raw = window.location.hash || "";
    const id = raw.startsWith("#") ? raw.slice(1) : "";
    if (!id) return;
    const target = document.getElementById(decodeURIComponent(id));
    if (!target) return;
    openAncestorsFor(target);
    target.scrollIntoView({ block: "start" });
    focusTarget(target);
  };

  const getGroupButtons = (withinEl) => {
    const group = withinEl.closest("[data-paccordion-group]") || document;
    return Array.from(group.querySelectorAll(".paccordion__button")).filter((btn) => !btn.closest("[hidden]"));
  };

  const initItem = (itemEl) => {
    const { button, panel } = getParts(itemEl);
    if (!button || !panel) return;

    // Cap visual indentation at level 4 if deeper nesting exists.
    if (!itemEl.classList.contains("paccordion__item--l1") &&
        !itemEl.classList.contains("paccordion__item--l2") &&
        !itemEl.classList.contains("paccordion__item--l3") &&
        !itemEl.classList.contains("paccordion__item--l4")) {
      itemEl.classList.add("paccordion__item--l4");
    }

    const itemId = ensureItemId(itemEl);

    // Resilient ids for ARIA hooks.
    if (!button.id) {
      autoId += 1;
      button.id = `paccordion-button-${itemId || autoId}`;
    }
    if (!panel.id) {
      panel.id = `paccordion-panel-${itemId || button.id.replace(/^paccordion-button-/, "")}`;
    }
    if (!button.getAttribute("aria-controls")) button.setAttribute("aria-controls", panel.id);

    // WCAG/APG: role="region" only on level 1 (avoid landmark overload).
    const isLevel1 = itemEl.classList.contains("paccordion__item--l1");
    if (isLevel1) {
      panel.setAttribute("role", "region");
      panel.setAttribute("aria-labelledby", button.id);
    } else {
      panel.removeAttribute("role");
      panel.removeAttribute("aria-labelledby");
    }

    // Normalize initial state.
    // Default: all closed (HTML baseline). JS opens only if data-open is present.
    setExpanded(button, false);
    panel.setAttribute("hidden", "");
  };

  const onClick = (ev) => {
    const button = ev.target?.closest?.(".paccordion__button");
    if (!button) return;
    const itemEl = button.closest(".paccordion__item");
    if (!itemEl) return;
    ev.preventDefault();
    toggleItem(itemEl);
  };

  const onKeyDown = (ev) => {
    const button = ev.target?.closest?.(".paccordion__button");
    if (!button) return;

    // APG-like focus navigation among headers within the nearest group.
    const key = ev.key;
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(key)) return;

    const buttons = getGroupButtons(button);
    const idx = buttons.indexOf(button);
    if (idx === -1) return;

    ev.preventDefault();
    let nextIdx = idx;
    if (key === "ArrowDown") nextIdx = Math.min(buttons.length - 1, idx + 1);
    if (key === "ArrowUp") nextIdx = Math.max(0, idx - 1);
    if (key === "Home") nextIdx = 0;
    if (key === "End") nextIdx = buttons.length - 1;
    buttons[nextIdx]?.focus();
  };

  const onBeforeMatch = (ev) => {
    openAncestorsFor(ev.target);
  };

  const init = () => {
    document.querySelectorAll(".paccordion__item").forEach(initItem);
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown);

    // Default open (editor-defined): data-open on paccordion__item.
    document.querySelectorAll(".paccordion__item[data-open]").forEach((itemEl) => {
      const val = itemEl.getAttribute("data-open");
      if (val === null || val === "" || val === "true" || val === "1") {
        openAncestorsImmediate(itemEl);
        openItemImmediate(itemEl);
      }
    });

    window.addEventListener("hashchange", scrollToHash);
    scrollToHash();

    document.addEventListener("beforematch", onBeforeMatch);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
