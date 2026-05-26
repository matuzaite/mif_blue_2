'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './NewsCarousel.module.scss';

interface NewsCarouselProps {
  initialItems: any[];
}

export default function NewsCarousel({ initialItems }: NewsCarouselProps) {
  const router = useRouter();
  const [items, setItems] = useState<any[]>(initialItems);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoRotateTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // AbortController prevents memory leaks if the component unmounts mid-request
    // (e.g. when MagicInfo switches schedules).
    const controller = new AbortController();

    const fetchLatestNews = async () => {
      try {
        // Naudojame ir laiką, ir Math.random(), nes TV vidiniai laikrodžiai dažnai būna "užšalę"
        const res = await fetch(
          `/api/news?t=${new Date().getTime()}&r=${Math.random()}`,
          { signal: controller.signal }
        );

        const freshData = await res.json();

        // Jei gavome naujienų, pakeičiame karuselės duomenis
        if (freshData && freshData.length > 0) {
          setItems(freshData);
          // Apsauga: jei buvome 5 slaide, o naujienų liko tik 4, grįžtame į pradžią
          setCurrentIndex((prev) => (prev >= freshData.length ? 0 : prev));
        }
      } catch (error) {
        // AbortError is expected when the component unmounts — not a real error.
        if ((error as Error).name !== 'AbortError') {
          console.error("Klaida gaunant šviežias naujienas:", error);
        }
      }
    };

    // Iškviečiame funkciją iškart, kai tik komponentas atsiranda ekrane
    fetchLatestNews();

    // Automatiškai ir tyliai fone ieškome naujų žinių kas 30 minučių (1800000 ms)
    const updateInterval = setInterval(fetchLatestNews, 1800000);

    return () => {
      controller.abort(); // Cancel any in-flight request — crucial for S6 stability
      clearInterval(updateInterval);
    };
  }, []);

  const startAutoRotation = useCallback(() => {
    if (autoRotateTimerRef.current) clearInterval(autoRotateTimerRef.current);
    autoRotateTimerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % items.length);
    }, 36000); // 36 seconds per slide
  }, [items.length]);

  useEffect(() => {
    if (items.length === 0) return;
    startAutoRotation();
    return () => {
      if (autoRotateTimerRef.current) clearInterval(autoRotateTimerRef.current);
    };
  }, [items.length, startAutoRotation]);

  const handleDotClick = (idx: number) => {
    setCurrentIndex(idx);
    startAutoRotation(); // Reset timer
  };

  const scrollPosRef = useRef(0);
  const isPausedRef = useRef(false);

  // Sync the pause state without restarting the animation loop
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // 1. Reset scroll position ONLY when the slide actually changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      scrollPosRef.current = 0;
    }
  }, [currentIndex]);

  // 2. High-performance scroll engine built for older TVs
  useEffect(() => {
    let animationFrameId: number = 0;

    const delayTimeout = setTimeout(() => {
      if (!scrollRef.current) return;

      // CACHE heights ONCE. This saves the S6 from burning out its CPU.
      const scrollHeight = scrollRef.current.scrollHeight;
      const clientHeight = scrollRef.current.clientHeight;

      // If text doesn't overflow, don't waste memory running a loop
      if (scrollHeight <= clientHeight) return;

      const scrollAnimation = () => {
        // If the browser/tab is hidden by MagicInfo, pause execution to save CPU.
        // We still re-queue the frame so the loop resumes immediately when visible again.
        if (document.hidden) {
          animationFrameId = requestAnimationFrame(scrollAnimation);
          return;
        }

        if (scrollRef.current && !isPausedRef.current) {
          if (scrollPosRef.current + clientHeight < scrollHeight - 2) {
            scrollPosRef.current += 0.5; // Scroll speed (approx 30px per sec on 60fps)
            const newScrollTop = Math.floor(scrollPosRef.current);

            // ONLY write to the DOM if the pixel actually changed to prevent flickering
            if (scrollRef.current.scrollTop !== newScrollTop) {
              scrollRef.current.scrollTop = newScrollTop;
            }
          }
        }
        // Keep the loop alive seamlessly
        animationFrameId = requestAnimationFrame(scrollAnimation);
      };

      animationFrameId = requestAnimationFrame(scrollAnimation);
    }, 2000);

    return () => {
      clearTimeout(delayTimeout);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [currentIndex]); // Now only triggers when the slide changes, not on hover
  // When MagicInfo hides the webview, stop JS execution immediately.
  // This prevents the rAF loop and any pending timers from exhausting
  // the S6's limited RAM while the other schedule is on screen.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        window.stop();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // When MagicInfo switches BACK to this schedule, the S6's memory may
  // already be corrupted from the previous session. A soft reload after
  // 1 s wipes the state and gives the browser a clean slate.
  useEffect(() => {
    let reloadTimer: ReturnType<typeof setTimeout> | null = null;

    const handleResume = () => {
      if (!document.hidden) {
        reloadTimer = setTimeout(() => {
          window.location.href = window.location.href;
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleResume);
    return () => {
      document.removeEventListener('visibilitychange', handleResume);
      if (reloadTimer) clearTimeout(reloadTimer);
    };
  }, []);

  useEffect(() => {
    // Daily hard reload at 3 AM to clear memory
    const now = new Date();
    const night = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + (now.getHours() >= 3 ? 1 : 0),
      3, 0, 0
    );
    const msToNight = night.getTime() - now.getTime();

    const reloadTimeout = setTimeout(() => {
      // Safer than reload() on Tizen — avoids the white-screen-of-death
      // caused by a corrupted cache on the Samsung S6 browser engine.
      window.location.href = window.location.href;
    }, msToNight);

    return () => clearTimeout(reloadTimeout);
  }, []);



  if (items.length === 0) return <div className={styles.loading}>Naujienų nerasta</div>;

  return (
    <div className={styles.carouselWrapper}>
      <div className={styles.newsContainer}>
        {items.map((item, idx) => {
          const isActive = idx === currentIndex;

          return (
            <div
              key={idx}
              className={`${styles.slide} ${isActive ? styles.activeSlide : styles.inactiveSlide}`}
            >
              {/* Left Column: Image and Headline */}
              <div className={styles.leftColumn}>


                <div className={styles.headlineContainer}>
                  <h2 className={styles.headline}>{item.title}</h2>
                </div>
              </div>

              {/* Right Column: Date and Clean Paragraphs */}
              <div className={styles.rightColumn}>
                <div className={styles.dateLabel}>
                  {item.category} | {item.date}
                </div>

                <div
                  ref={isActive ? scrollRef : null}
                  className={styles.articleBody}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                  tabIndex={0}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {/* Progress dots */}
        <div className={styles.progressContainer}>
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              className={`${styles.dot} ${idx === currentIndex ? styles.activeDot : styles.inactiveDot}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
