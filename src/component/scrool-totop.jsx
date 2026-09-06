import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const timeout = setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 1); 
    return () => clearTimeout(timeout);
  }, [pathname]);

  return null;
}

export default ScrollToTop;

