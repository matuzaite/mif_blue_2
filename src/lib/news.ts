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

    root.querySelectorAll('img').forEach(function(img) {
        // Pakeista: .getAttribute('data-src')?.trim() → su && patikrinimu
        var rawDataSrc = img.getAttribute('data-src');
        var dataSrc = rawDataSrc ? rawDataSrc.trim() : '';

        var rawSrc = img.getAttribute('src');
        var src = rawSrc ? rawSrc.trim() : '';

        // Pakeista: ?? → ternary su !== null && !== undefined
        var best: string | null;
        if (dataSrc && !dataSrc.startsWith('data:')) {
            best = dataSrc;
        } else if (src && !src.startsWith('data:')) {
            best = src;
        } else {
            best = null;
        }

        if (best) {
            try {
                img.setAttribute('src', new URL(best, BASE).href);
            } catch (error) {
                // Pakeista: tuščias catch {} → catch (error) {}
                img.setAttribute('src', best);
            }
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
            .map(function(item) {
                // Pakeista: ?.text ?? '' → && patikrinimai su ternary
                var titleNode = item.querySelector('title');
                var titleRaw = titleNode && titleNode.text ? titleNode.text : '';
                var title = titleRaw.replace(/<[^>]*>?/gm, '').trim();

                var linkNode = item.querySelector('link');
                var link = (linkNode && linkNode.text ? linkNode.text : '').trim();

                var pubDateNode = item.querySelector('pubDate');
                var pubDate = pubDateNode && pubDateNode.text ? pubDateNode.text : '';

                var date = new Date(
                    pubDate && !isNaN(Date.parse(pubDate)) ? pubDate : Date.now()
                ).toLocaleDateString('lt-LT');

                var descNode = item.querySelector('description');
                // Pakeista: ?.innerHTML ?? '' → && patikrinimai su ternary
                var description = descNode && descNode.innerHTML ? descNode.innerHTML : '';

                if (description.includes('<![CDATA[')) {
                    // Pakeista: .replaceAll() → .split().join()
                    description = description.split('<![CDATA[').join('').split(']]>').join('');
                }
                description = fixImageSrcs(description);

                var id = link ? link : Math.random().toString();
                return { id: id, title: title, link: link, date: date, category: 'Naujiena', description: description, image: '' };
            });

    } catch (error) {
        console.error('News fetch error:', error);
        return [];
    }
}
