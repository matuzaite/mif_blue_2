'use client';

import Sidebar from '@/components/Sidebar/Sidebar';
import NewsCarousel from '@/components/NewsCarousel/NewsCarousel';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <Sidebar />
      <div className={styles.contentArea}>
        <NewsCarousel initialItems={[]} />
      </div>
    </main>
  );
}
