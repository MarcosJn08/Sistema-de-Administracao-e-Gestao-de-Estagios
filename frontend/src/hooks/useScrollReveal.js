import { useEffect } from 'react';

export default function useScrollReveal(pageRef) {
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const elements = Array.from(page.querySelectorAll('[data-reveal]'));
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let observer;
    let frame = 0;

    const reveal = (element) => {
      element.classList.add('is-visible');
      observer?.unobserve(element);
    };

    if (!motion.matches && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) reveal(entry.target);
          });
        },
        { threshold: 0.16, rootMargin: '0px 0px -64px 0px' },
      );

      elements.forEach((element) => {
        if (element.getBoundingClientRect().top >= window.innerHeight - 24) {
          element.classList.add('reveal-pending');
          observer.observe(element);
        }
      });
    }

    const updateProgress = () => {
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      const progress = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
      page.style.setProperty('--scroll-progress', String(progress));
      frame = 0;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateProgress);
    };
    const onFocus = (event) => {
      const element = event.target.closest('[data-reveal]');
      if (element) reveal(element);
    };
    const onMotionChange = () => {
      if (motion.matches) {
        observer?.disconnect();
        elements.forEach(reveal);
      }
    };

    const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(onScroll) : null;
    resizeObserver?.observe(page);
    page.addEventListener('focusin', onFocus);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    motion.addEventListener('change', onMotionChange);
    updateProgress();

    return () => {
      observer?.disconnect();
      resizeObserver?.disconnect();
      cancelAnimationFrame(frame);
      page.removeEventListener('focusin', onFocus);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      motion.removeEventListener('change', onMotionChange);
      elements.forEach((element) => element.classList.remove('reveal-pending', 'is-visible'));
      page.style.removeProperty('--scroll-progress');
    };
  }, [pageRef]);
}
