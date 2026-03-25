const PTABS_SELECTORS = {
  root: ".ptabs",
  legacyTab: ".ptab",
  legacyLabel: ".ptab-name",
  tablist: ".ptabs__list",
  tab: ".ptabs__tab",
  panel: ".ptabs__panel",
};

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const prefersReducedMotion = () =>
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isMobileViewport = () =>
  window.matchMedia && window.matchMedia("(max-width: 959px)").matches;

const isVisible = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);

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
  return base || "tab";
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

const getFocusableInPanel = (panel) =>
  Array.from(panel.querySelectorAll(focusableSelector)).filter((node) => isVisible(node));

const updatePanelTabIndex = (panel, isActive) => {
  if (!panel) return;
  if (!isActive) {
    panel.setAttribute("tabindex", "-1");
    return;
  }
  const focusables = getFocusableInPanel(panel);
  panel.setAttribute("tabindex", focusables.length === 0 ? "0" : "-1");
};

const setPanelInteractivity = (panel, interactive) => {
  if (interactive) {
    panel.removeAttribute("inert");
    panel.removeAttribute("aria-hidden");
  } else {
    panel.setAttribute("inert", "");
    panel.setAttribute("aria-hidden", "true");
  }
};

const openAccordionChain = (target) => {
  const item = target?.closest?.(".paccordion__item");
  if (!item) return;
  const chain = [];
  let current = item;
  while (current) {
    chain.push(current);
    const parent = current.parentElement?.closest?.(".paccordion__item");
    current = parent || null;
  }
  chain.reverse().forEach((accordionItem) => {
    const button = accordionItem.querySelector(":scope > .paccordion__heading > .paccordion__button");
    if (!button) return;
    if (button.getAttribute("aria-expanded") === "true") return;
    button.click();
  });
};

class PTabs {
  constructor(root) {
    this.root = root;
    this.tablist = null;
    this.viewport = null;
    this.nav = null;
    this.prevButton = null;
    this.nextButton = null;
    this.tabs = [];
    this.panels = [];
    this.resizeObserver = null;
    this.init();
  }

  init() {
    this.normalizeLegacyMarkup();
    this.tablist = this.root.querySelector(PTABS_SELECTORS.tablist);
    this.tabs = Array.from(this.root.querySelectorAll(PTABS_SELECTORS.tab));
    this.panels = Array.from(this.root.querySelectorAll(PTABS_SELECTORS.panel));

    if (!this.tablist || this.tabs.length === 0) return;

    this.ensureNav();
    this.setupRoles();
    this.setupTablistLabel();
    this.bindEvents();
    this.activateInitialTab();
    this.openFromHash();
    window.addEventListener("hashchange", () => this.openFromHash());
    this.observeResize();
  }

  normalizeLegacyMarkup() {
    const legacyTabs = Array.from(this.root.querySelectorAll(PTABS_SELECTORS.legacyTab));
    if (legacyTabs.length === 0) return;

    if (!this.root.querySelector(PTABS_SELECTORS.tablist)) {
      const list = document.createElement("div");
      list.className = "ptabs__list";
      list.setAttribute("role", "tablist");
      this.root.insertBefore(list, legacyTabs[0]);
    }

    const list = this.root.querySelector(PTABS_SELECTORS.tablist);

    legacyTabs.forEach((panelEl, index) => {
      panelEl.classList.add("ptabs__panel");
      panelEl.setAttribute("role", "tabpanel");

      const label = panelEl.querySelector(PTABS_SELECTORS.legacyLabel);
      const labelText = label?.textContent?.trim() || `Tab ${index + 1}`;
      const panelId = panelEl.id || ensureUniqueId(slugify(labelText));
      panelEl.id = panelId;

      const tabId = ensureUniqueId(`tab-${panelId}`);
      const tabButton = document.createElement("button");
      tabButton.type = "button";
      tabButton.className = "ptabs__tab";
      tabButton.setAttribute("role", "tab");
      tabButton.id = tabId;
      tabButton.setAttribute("aria-controls", panelId);
      tabButton.textContent = labelText;
      list.appendChild(tabButton);

      panelEl.setAttribute("aria-labelledby", tabId);
      panelEl.setAttribute("tabindex", "-1");

      if (label) {
        label.setAttribute("aria-hidden", "true");
        label.setAttribute("hidden", "");
      }
    });
  }

  ensureNav() {
    const existingNav = this.root.querySelector(".ptabs__nav");
    if (existingNav) {
      this.nav = existingNav;
      this.viewport = existingNav.querySelector(".ptabs__viewport");
      this.prevButton = existingNav.querySelector(".ptabs__chevron--prev");
      this.nextButton = existingNav.querySelector(".ptabs__chevron--next");
      return;
    }

    const firstPanel = this.root.querySelector(PTABS_SELECTORS.panel) || null;
    const nav = document.createElement("div");
    nav.className = "ptabs__nav";

    const prev = document.createElement("button");
    prev.type = "button";
    prev.className = "ptabs__chevron ptabs__chevron--prev";
    prev.setAttribute("aria-label", "Poprzednia zakładka");
    prev.innerHTML = "";

    const next = document.createElement("button");
    next.type = "button";
    next.className = "ptabs__chevron ptabs__chevron--next";
    next.setAttribute("aria-label", "Następna zakładka");
    next.innerHTML = "";

    const viewport = document.createElement("div");
    viewport.className = "ptabs__viewport";
    viewport.appendChild(this.tablist);

    nav.appendChild(prev);
    nav.appendChild(viewport);
    nav.appendChild(next);

    this.root.insertBefore(nav, firstPanel);

    this.nav = nav;
    this.viewport = viewport;
    this.prevButton = prev;
    this.nextButton = next;
  }

  setupRoles() {
    this.tablist.setAttribute("role", "tablist");

    this.tabs.forEach((tab, index) => {
      tab.setAttribute("role", "tab");
      if (!tab.hasAttribute("aria-selected")) {
        tab.setAttribute("aria-selected", "false");
      }
      tab.setAttribute("tabindex", "-1");
      if (!tab.id) {
        tab.id = ensureUniqueId(`ptab-${index + 1}`);
      }
      const panelId = tab.getAttribute("aria-controls");
      const panel = panelId ? this.root.querySelector(`#${CSS.escape(panelId)}`) : null;
      if (panel) {
        panel.classList.add("ptabs__panel");
        panel.setAttribute("role", "tabpanel");
        panel.setAttribute("aria-labelledby", tab.id);
        panel.setAttribute("tabindex", panel.getAttribute("tabindex") || "-1");
      }
    });
  }

  setupTablistLabel() {
    if (!this.tablist) return;
    if (this.tablist.hasAttribute("aria-label") || this.tablist.hasAttribute("aria-labelledby")) {
      return;
    }

    const explicitLabelId = this.root.getAttribute("data-ptabs-labelledby");
    if (explicitLabelId && document.getElementById(explicitLabelId)) {
      this.tablist.setAttribute("aria-labelledby", explicitLabelId);
      return;
    }

    const container = this.root.closest(".ptabs-container");
    const heading = container?.querySelector(".ptabs-container__title");
    if (heading) {
      if (!heading.id) {
        heading.id = ensureUniqueId(slugify(heading.textContent || "ptabs"));
      }
      this.tablist.setAttribute("aria-labelledby", heading.id);
      return;
    }

    this.tablist.setAttribute("aria-label", "Zakładki");
  }

  bindEvents() {
    this.tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        if (tab.getAttribute("aria-selected") === "true") return;
        this.activateTab(tab, { focus: true });
      });
      tab.addEventListener("keydown", (event) => this.handleKeydown(event, tab));
    });

    if (this.prevButton && this.nextButton && this.viewport) {
      this.prevButton.addEventListener("click", () => this.scrollByStep(-1));
      this.nextButton.addEventListener("click", () => this.scrollByStep(1));
      this.viewport.addEventListener("scroll", () => this.updateChevronState());
    }
  }

  activateInitialTab() {
    const selected = this.tabs.find((tab) => tab.getAttribute("aria-selected") === "true");
    this.activateTab(selected || this.tabs[0], { focus: false, scroll: false });
  }

  activateTab(tab, { focus = true, scroll = false } = {}) {
    if (!tab) return;

    const panelId = tab.getAttribute("aria-controls");
    const panel = panelId ? this.root.querySelector(`#${CSS.escape(panelId)}`) : null;

    this.tabs.forEach((item) => {
      item.setAttribute("aria-selected", "false");
      item.setAttribute("tabindex", "-1");
      item.classList.remove("ptabs__tab--active");
      item.classList.remove("ptabs__tab--adjacent-left");
      item.classList.remove("ptabs__tab--adjacent-right");
    });

    this.panels.forEach((pane) => {
      pane.setAttribute("hidden", "");
      pane.classList.remove("ptabs__panel--active");
      setPanelInteractivity(pane, false);
      updatePanelTabIndex(pane, false);
    });

    tab.setAttribute("aria-selected", "true");
    tab.setAttribute("tabindex", "0");
    tab.classList.add("ptabs__tab--active");

    const activeIndex = this.tabs.indexOf(tab);
    const prevTab = this.tabs[activeIndex - 1];
    const nextTab = this.tabs[activeIndex + 1];
    if (prevTab) prevTab.classList.add("ptabs__tab--adjacent-right");
    if (nextTab) nextTab.classList.add("ptabs__tab--adjacent-left");
    if (panel) {
      panel.removeAttribute("hidden");
      panel.classList.add("ptabs__panel--active");
      setPanelInteractivity(panel, true);
      updatePanelTabIndex(panel, true);
    }

    if (focus) tab.focus();
    if (scroll && panel) {
      const behavior = prefersReducedMotion() ? "auto" : "smooth";
      panel.scrollIntoView({ behavior, block: "start" });
    }
    this.updateChevronState();
    this.updateSidePadding();
    this.ensureTabInView(tab);
    this.updateChevronCenter();
  }

  handleKeydown(event, tab) {
    const key = event.key;
    const currentIndex = this.tabs.indexOf(tab);
    if (currentIndex === -1) return;

    const isVertical = this.tablist.getAttribute("aria-orientation") === "vertical";

    if (key === "ArrowRight" || (key === "ArrowDown" && isVertical)) {
      event.preventDefault();
      const next = this.tabs[(currentIndex + 1) % this.tabs.length];
      this.activateTab(next, { focus: true });
      return;
    }

    if (key === "ArrowLeft" || (key === "ArrowUp" && isVertical)) {
      event.preventDefault();
      const prev = this.tabs[(currentIndex - 1 + this.tabs.length) % this.tabs.length];
      this.activateTab(prev, { focus: true });
      return;
    }

    if (key === "Home") {
      event.preventDefault();
      this.activateTab(this.tabs[0], { focus: true });
      return;
    }

    if (key === "End") {
      event.preventDefault();
      this.activateTab(this.tabs[this.tabs.length - 1], { focus: true });
      return;
    }

    if (key === "Enter" || key === " ") {
      event.preventDefault();
      this.activateTab(tab, { focus: true });
      return;
    }

    if (key === "Tab" && !event.shiftKey) {
      const panelId = tab.getAttribute("aria-controls");
      const panel = panelId ? this.root.querySelector(`#${CSS.escape(panelId)}`) : null;
      if (!panel) return;
      event.preventDefault();
      const focusables = getFocusableInPanel(panel);
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        panel.focus();
      }
    }
  }

  observeResize() {
    if (!this.viewport) return;
    if ("ResizeObserver" in window) {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateChevronState();
        this.updateSidePadding();
        this.updateChevronCenter();
      });
      this.resizeObserver.observe(this.viewport);
      this.resizeObserver.observe(this.tablist);
    } else {
      window.addEventListener("resize", () => {
        this.updateChevronState();
        this.updateSidePadding();
        this.updateChevronCenter();
      });
    }
    this.updateChevronState();
    this.updateSidePadding();
    this.updateChevronCenter();
  }

  scrollByStep(direction) {
    if (!this.viewport) return;
    const active = this.tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || this.tabs[0];
    const currentIndex = this.tabs.indexOf(active);
    const targetIndex = Math.min(
      this.tabs.length - 1,
      Math.max(0, currentIndex + direction)
    );
    const target = this.tabs[targetIndex];
    this.activateTab(target, { focus: true });
  }

  ensureTabInView(tab) {
    if (!this.viewport || !tab) return;
    if (isMobileViewport()) {
      const viewportWidth = this.viewport.clientWidth;
      const tabWidth = tab.offsetWidth;
      const maxScroll = Math.max(0, this.tablist.scrollWidth - viewportWidth);
      const activeIndex = this.tabs.indexOf(tab);
      let targetScroll = tab.offsetLeft - (viewportWidth - tabWidth) / 2;
      if (activeIndex === 0) {
        targetScroll = 0;
      } else if (activeIndex === this.tabs.length - 1) {
        targetScroll = maxScroll;
      }
      targetScroll = Math.max(0, Math.min(maxScroll, targetScroll));

      this.viewport.scrollTo({
        left: targetScroll,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
      return;
    }

    const tabRect = tab.getBoundingClientRect();
    const viewportRect = this.viewport.getBoundingClientRect();
    const leftOverflow = tabRect.left < viewportRect.left;
    const rightOverflow = tabRect.right > viewportRect.right;
    if (!leftOverflow && !rightOverflow) return;

    const gap = 12;
    const offsetLeft = tab.offsetLeft;
    const offsetRight = offsetLeft + tab.offsetWidth;
    let targetScroll = this.viewport.scrollLeft;

    if (leftOverflow) {
      targetScroll = Math.max(0, offsetLeft - gap);
    } else if (rightOverflow) {
      targetScroll = Math.max(0, offsetRight - this.viewport.clientWidth + gap);
    }

    this.viewport.scrollTo({
      left: targetScroll,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }

  updateSidePadding() {
    if (!this.viewport || !this.tablist) return;
    if (!isMobileViewport()) {
      this.tablist.style.setProperty("--ptabs-side-padding-left", "0px");
      this.tablist.style.setProperty("--ptabs-side-padding-right", "0px");
      return;
    }
    const active = this.tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || this.tabs[0];
    if (!active) return;
    const viewportWidth = this.viewport.clientWidth;
    const tabWidth = active.offsetWidth;
    const activeIndex = this.tabs.indexOf(active);
    const remaining = Math.max(0, viewportWidth - tabWidth);

    let leftPadding = 0;
    let rightPadding = 0;
    if (activeIndex === 0) {
      leftPadding = 0;
      rightPadding = 0;
    } else if (activeIndex === this.tabs.length - 1) {
      leftPadding = 0;
      rightPadding = 0;
    } else {
      leftPadding = remaining / 2;
      rightPadding = remaining / 2;
    }

    this.tablist.style.setProperty("--ptabs-side-padding-left", `${leftPadding}px`);
    this.tablist.style.setProperty("--ptabs-side-padding-right", `${rightPadding}px`);
  }

  updateChevronState() {
    if (!this.viewport || !this.prevButton || !this.nextButton) return;
    const overflow = this.tablist.scrollWidth > this.viewport.clientWidth + 1;
    this.nav?.classList.toggle("ptabs__nav--overflow", overflow);

    if (!overflow) {
      this.prevButton.setAttribute("aria-disabled", "true");
      this.nextButton.setAttribute("aria-disabled", "true");
      this.prevButton.classList.add("ptabs__chevron--hidden");
      this.nextButton.classList.add("ptabs__chevron--hidden");
      this.nav?.classList.remove("ptabs__nav--show-prev", "ptabs__nav--show-next");
      return;
    }

    const active = this.tabs.find((tab) => tab.getAttribute("aria-selected") === "true");
    const activeIndex = active ? this.tabs.indexOf(active) : 0;

    const disablePrev = activeIndex === 0;
    const disableNext = activeIndex === this.tabs.length - 1;

    this.prevButton.toggleAttribute("disabled", disablePrev);
    this.nextButton.toggleAttribute("disabled", disableNext);
    this.prevButton.setAttribute("aria-disabled", disablePrev ? "true" : "false");
    this.nextButton.setAttribute("aria-disabled", disableNext ? "true" : "false");
    this.prevButton.classList.toggle("ptabs__chevron--hidden", disablePrev);
    this.nextButton.classList.toggle("ptabs__chevron--hidden", disableNext);

    this.nav?.classList.toggle("ptabs__nav--show-prev", !disablePrev);
    this.nav?.classList.toggle("ptabs__nav--show-next", !disableNext);
  }

  updateChevronCenter() {
    if (!this.nav || !this.tablist || this.tabs.length === 0) return;
    const target =
      this.tabs.find((tab) => tab.getAttribute("aria-selected") !== "true") || this.tabs[0];
    if (!target) return;
    const navRect = this.nav.getBoundingClientRect();
    const tabRect = target.getBoundingClientRect();
    const center = tabRect.top - navRect.top + tabRect.height / 2;
    if (!Number.isFinite(center)) return;
    this.nav.style.setProperty("--ptabs-chevron-center-top", `${center}px`);
    this.nav.style.setProperty("--ptabs-chevron-translate", "-50%");
  }

  openFromHash() {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;

    const target = document.getElementById(hash);
    if (!target) return;

    if (!this.root.contains(target)) return;

    const tab = target.closest("[role='tab']");
    const panel = target.closest("[role='tabpanel']");

    if (tab) {
      this.activateTab(tab, { focus: true, scroll: true });
      return;
    }

    if (panel) {
      const labelledBy = panel.getAttribute("aria-labelledby");
      const ownerTab = labelledBy ? this.root.querySelector(`#${CSS.escape(labelledBy)}`) : null;
      this.activateTab(ownerTab, { focus: false, scroll: false });
    }

    const behavior = prefersReducedMotion() ? "auto" : "smooth";
    setTimeout(() => {
      openAccordionChain(target);
      target.scrollIntoView({ behavior, block: "start" });
    }, 0);
  }
}

const initPTabs = () => {
  const roots = Array.from(document.querySelectorAll(PTABS_SELECTORS.root));
  roots.forEach((root) => new PTabs(root));
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPTabs);
} else {
  initPTabs();
}
