import Sidebar from '@/components/Sidebar/Sidebar';
import NewsCarousel from '@/components/NewsCarousel/NewsCarousel';
import styles from './page.module.css';
import { fetchNews } from '@/lib/news'; // Importuojame tiesioginę duomenų gavimo funkciją

// Ši eilutė nurodo serveriui niekada neįsiminti puslapio (no-cache)
// ir visada sugeneruoti naują versiją, kai tik MagicINFO atnaujina ekraną.
export const dynamic = 'force-dynamic';

// Paverčiame komponentą asinchroniniu (async)
export default async function Home() {
  // Serveris pats ištraukia naujienas PRIEŠ išsiųsdamas puslapį į televizorių!
  const newsItems = await fetchNews();

  return (
    <main className={styles.main}>
      <Sidebar />
      <div className={styles.contentArea}>
        {/* Dabar į karuselę paduodame tikras naujienas, o ne tuščią masyvą */}
        <NewsCarousel initialItems={newsItems} />
      </div>
    </main>
  );
}
