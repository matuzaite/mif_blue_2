'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import styles from './NewsCarousel.module.scss';

interface NewsCarouselProps {
  initialItems: any[];
}

export default function NewsCarousel({ initialItems }: NewsCarouselProps) {
  const [items, setItems] = useState<any[]>(initialItems);
  const itemsRef = useRef(items);
  useEffect(() => { itemsRef.current = items; }, [items]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoRotateTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // XMLHttpRequest — universally supported on all Tizen versions,
    // avoids any fetch/AbortController compatibility issues on S6.
    const fetchLatestNews = () => {
      var xhr = new XMLHttpRequest();
      // Naudojame pilną absoliutų IP adresą, kad veiktų iš file:// aplinkos
      xhr.open('GET', 'http://193.219.91.103:11857/api/news?t=' + new Date().getTime() + '&r=' + Math.random(), true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          try {
            var freshData = JSON.parse(xhr.responseText);
            // Jei gavome naujienų, pakeičiame karuselės duomenis
            if (freshData && freshData.length > 0) {
              setItems(freshData);
              // Apsauga: jei buvome 5 slaide, o naujienų liko tik 4, grįžtame į pradžią
              setCurrentIndex(function (prev) { return prev >= freshData.length ? 0 : prev; });
            }
          } catch (e) {
            console.error('Klaida gaunant šviežias naujienas:', e);
          }
        }
      };
      xhr.send();
    };

    // Iškviečiame funkciją iškart, kai tik komponentas atsiranda ekrane
    fetchLatestNews();

    // Automatiškai ir tyliai fone ieškome naujų žinių kas 30 minučių (1800000 ms)
    var updateInterval = setInterval(fetchLatestNews, 1800000);

    return function () { clearInterval(updateInterval); };
  }, []);

  const startAutoRotation = useCallback(() => {
    if (autoRotateTimerRef.current) clearInterval(autoRotateTimerRef.current);
    autoRotateTimerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % itemsRef.current.length);
    }, 30000); // Tiksliai 30 sekundžių vienai skaidrei
  }, []);

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

  // Reset scroll position when the slide changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [currentIndex]);

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
      window.location.reload();
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