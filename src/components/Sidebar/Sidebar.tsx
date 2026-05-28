'use client';
import { useState, useEffect } from 'react';
// IŠIMTA: import Image from 'next/image';
import styles from './Sidebar.module.scss';

export default function Sidebar() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // S6 saugus laiko formatavimas (be toLocaleTimeString)
  const getFormattedTime = (d: Date | null) => {
    if (!d) return '--:--';
    const hh = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
    const mm = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
    return hh + ':' + mm;
  };

  // S6 saugus datos formatavimas (be toLocaleDateString)
  const getFormattedDate = (d: Date | null) => {
    if (!d) return '...';
    const months = [
      'Sausio', 'Vasario', 'Kovo', 'Balandžio', 'Gegužės', 'Birželio', 
      'Liepos', 'Rugpjūčio', 'Rugsėjo', 'Spalio', 'Lapkričio', 'Gruodžio'
    ];
    return d.getDate() + ' ' + months[d.getMonth()];
  };

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logoContainer}>
        {/* PAKEISTA Į PAPRASTĄ <img> TAG'Ą */}
        <img
          src="/VU_MIF_herbai.png"
          alt="VU MIF Herbai"
          style={{ width: '300px', height: 'auto', filter: 'brightness(0) invert(1)' }}
        />
      </div>

      {/* Live Clock */}
      <div className={styles.clockSection}>
        <p className={styles.time}>{getFormattedTime(time)}</p>
        <p className={styles.date}>{getFormattedDate(time)}</p>
      </div>

      {/* Bottom section */}
      <div className={styles.bottomSection}>
        <p className={`${styles.socialLabel} brand-font`}>
          Sekite VU MIF naujienas
        </p>

        {/* Social Icons */}
        <div className={styles.socialIcons}>
          <div className={styles.iconWrapper}>
            <svg viewBox="0 0 24 24" fill="white">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </div>
          <div className={styles.iconWrapper}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none" />
            </svg>
          </div>
          <div className={styles.iconWrapper}>
            <svg viewBox="0 0 24 24" fill="white">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </div>
        </div>

        <p className={styles.website}>www.mif.vu.lt</p>
      </div>
    </aside>
  );
}
