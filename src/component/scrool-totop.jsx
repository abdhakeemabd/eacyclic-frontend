import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    const timeout = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1);

    // Track page view in Google Analytics (GA4)
    // This fires on every React route change — critical for SPAs
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: pathname + search,
        page_title: document.title,
      });
    }

    return () => clearTimeout(timeout);
  }, [pathname, search]);

  return null;
}

export default ScrollToTop;

