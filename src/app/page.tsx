'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar/Sidebar';
import NewsCarousel from '@/components/NewsCarousel/NewsCarousel';
import styles from './page.module.css';

export default function Home() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Suteikiame 1 sekundės pauzę, kad naršyklė "atsikvėptų"
    // prieš kraunant React komponentus (S6 Tizen suderinamumo fiksas)
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1000);

    // Valymas, kad išvengtume atminties nuotėkio
    return () => clearTimeout(timer);
  }, []);

  // Jei nesame pasiruošę - rodom juodą ekraną
  if (!isReady) {
    return <div style={{ background: '#000', width: '100vw', height: '100vh' }} />;
  }

  // Kai viskas pasiruošę - kraunam komponentus
  return (
    <main className={styles.main}>
      <Sidebar />
      <div className={styles.contentArea}>
        <NewsCarousel initialItems={[]} />
      </div>
    </main>
  );
}