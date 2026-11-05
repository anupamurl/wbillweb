'use client';

import { useEffect } from 'react';

/**
 * Scroll reveals, as progressive enhancement. Until this runs, and for
 * visitors who prefer reduced motion, every `.wb-reveal` element is simply
 * visible. Once it runs it opts the page in (`.wb-js-reveal` on <html>) and
 * marks each element `data-shown` the first time it nears the viewport.
 * A MutationObserver picks up content that arrives on client navigation.
 */
export default function RevealObserver() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const root = document.documentElement;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-shown', '');
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    const scan = (scope: ParentNode) => {
      scope.querySelectorAll<HTMLElement>('.wb-reveal:not([data-shown])').forEach((el) => {
        // Anything already above the fold on arrival shows straight away.
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) el.setAttribute('data-shown', '');
        else io.observe(el);
      });
    };

    scan(document);
    root.classList.add('wb-js-reveal');

    const mo = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.matches('.wb-reveal')) scan(node.parentElement ?? document);
            else scan(node);
          }
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      root.classList.remove('wb-js-reveal');
    };
  }, []);

  return null;
}
