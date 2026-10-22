import type { MetadataRoute } from 'next';
import { ALL_CANONICAL_SLUGS } from '@/lib/synastry/seo-pairs';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://starmatch.app';
  const stableDate = new Date('2026-10-22T00:00:00.000Z');

  // Core high-value routes
  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: stableDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/chart`,
      lastModified: stableDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/forecast`,
      lastModified: stableDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/compatibility`,
      lastModified: stableDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/invite`,
      lastModified: stableDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/waitlist`,
      lastModified: stableDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // All 78 unique zodiac compatibility landing pages
  const compatibilityRoutes: MetadataRoute.Sitemap = ALL_CANONICAL_SLUGS.map((slug) => ({
    url: `${baseUrl}/compatibility/${slug}`,
    lastModified: stableDate,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...coreRoutes, ...compatibilityRoutes];
}
