const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'area[href]',
    '[contenteditable="true"]'
].join(', ');

const TABINDEX_MAIN = '4';
const DEBOUNCE_DELAY = 1000;
const EXCLUDED_SELECTOR = '.swiper';

export class wcag {
    constructor() {
        this.init();
    }

    init() {
        this.applyTabindex();
        this.observe();
    }

    isExcluded(el) {
        return !!el.closest(EXCLUDED_SELECTOR);
    }

    applyTabindex() {
        const mains = Array.from(document.body.children).filter(
            el => el.tagName === 'MAIN'
        );

        mains.forEach(main => {
            main.querySelectorAll(FOCUSABLE_SELECTOR).forEach(el => {
                if (el.getAttribute('tabindex') !== '-1' && !el.hasAttribute('tabindex') && !this.isExcluded(el)) {
                    el.setAttribute('tabindex', TABINDEX_MAIN);
                }
            });
        });
    }

    observe() {
        const mains = Array.from(document.body.children).filter(
            el => el.tagName === 'MAIN'
        );

        if (!mains.length) return;

        let debounceTimer = null;
        const observer = new MutationObserver((mutations) => {
            const relevant = mutations.some(m => !m.target.closest(EXCLUDED_SELECTOR));
            if (!relevant) return;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => this.applyTabindex(), DEBOUNCE_DELAY);
        });

        mains.forEach(main => {
            observer.observe(main, { childList: true, subtree: true });
        });
    }
}

