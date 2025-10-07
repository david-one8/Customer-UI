import { useEffect, useRef } from 'react';

/**
 * Infinite scroll hook that triggers callback when scrolling near bottom
 */
export function useInfiniteScroll(callback, hasMore, loading) {
  const observerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          callback();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [callback, hasMore, loading]);

  return observerRef;
}
