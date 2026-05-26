import { fetchNews } from '@/lib/news';

export const dynamic = 'force-dynamic'; // Ensures the API always gets fresh data

// No-cache headers: prevents the S6 Tizen browser from resuming stale
// session data when MagicInfo switches back to the news schedule.
const NO_CACHE_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET() {
    try {
        const news = await fetchNews();
        return new Response(JSON.stringify(news), { headers: NO_CACHE_HEADERS });
    } catch (error) {
        console.error("API Error:", error);
        return new Response(JSON.stringify([]), { headers: NO_CACHE_HEADERS });
    }
}