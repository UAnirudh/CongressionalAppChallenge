import type { MetadataRoute } from 'next';
import { exercises } from '@/lib/exercises';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['/', '/samples', '/guide'];
  return [
    ...pages.map((page) => ({ url: new URL(page, SITE_URL).toString() })),
    ...exercises.map(({ id }) => ({
      url: new URL(`/samples/${id}`, SITE_URL).toString(),
    })),
  ];
}
