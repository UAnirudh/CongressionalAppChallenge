import { expect, it } from 'vitest';
import robots from '../src/app/robots';
import sitemap from '../src/app/sitemap';

it('publishes a robots sitemap URL and every public page on the production host', () => {
  const sitemapUrl = robots().sitemap;
  expect(sitemapUrl).toBe('https://anirudhaarin.vercel.app/sitemap.xml');

  const urls = sitemap().map(({ url }) => url);
  expect(urls).toHaveLength(45);
  expect(new Set(urls).size).toBe(urls.length);
  expect(urls).toContain('https://anirudhaarin.vercel.app/');
  expect(urls).toContain('https://anirudhaarin.vercel.app/guide');
  expect(urls).toContain('https://anirudhaarin.vercel.app/samples/projectile-range');
  expect(urls.every((url) => url.startsWith('https://anirudhaarin.vercel.app/'))).toBe(true);
});
