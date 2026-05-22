import config from '@/config/portal.config.json';
import { parse } from 'node-html-parser';

const BASE = 'https://mif.vu.lt/lt3/';

function fixImageSrcs(html: string): string {
    if (!html) return html;
    const root = parse(html);
    
    // Remove the first image which is the Joomla injected thumbnail
    const firstImg = root.querySelector('img');
    if (firstImg) {
        const parent = firstImg.parentNode as any;
        firstImg.remove();
        if (parent && parent.tagName === 'P' && parent.text.trim() === '' && parent.childNodes.length === 0) {
            parent.remove();
        }
    }

    root.querySelectorAll('img').forEach(img => {
        const dataSrc = img.getAttribute('data-src')?.trim();
        const src = img.getAttribute('src')?.trim();
        const best = (dataSrc && !dataSrc.startsWith('data:') ? dataSrc : null)
                  ?? (src && !src.startsWith('data:') ? src : null);
        if (best) {
            try { img.setAttribute('src', new URL(best, BASE).href); }
            catch { img.setAttribute('src', best); }
        }
    });
    return root.innerHTML;
}

export async function fetchNews() {
    try {
        const res = await fetch(config.feeds.naujienos, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            cache: 'no-store',
            next: { revalidate: 0 },
        });
        const xml = await res.text();
        const root = parse(xml, { lowerCaseTagName: true });

        return root.querySelectorAll('item')
            .slice(0, config.scraping.maxItems)
            .map(item => {
                const title = (item.querySelector('title')?.text ?? '').replace(/<[^>]*>?/gm, '').trim();
                const link  = (item.querySelector('link')?.text ?? '').trim();
                const pubDate = item.querySelector('pubDate')?.text ?? '';
                const date = new Date(
                    pubDate && !isNaN(Date.parse(pubDate)) ? pubDate : Date.now()
                ).toLocaleDateString('lt-LT');

                let description = item.querySelector('description')?.innerHTML ?? '';
                if (description.includes('<![CDATA[')) {
                    description = description.replaceAll('<![CDATA[', '').replaceAll(']]>', '');
                }
                description = fixImageSrcs(description);

                return { id: link || Math.random().toString(), title, link, date, category: 'Naujiena', description, image: '' };
            });

    } catch (error) {
        console.error('News fetch error:', error);
        return [];
    }
}
