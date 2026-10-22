import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'StarMatch — Editorial Astrological Synastry',
    short_name: 'StarMatch',
    description: 'Deterministic 0.1° Ephemeris Compatibility & Synastry Reports',
    start_url: '/',
    display: 'standalone',
    background_color: '#050505',
    theme_color: '#050505',
    orientation: 'portrait',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    shortcuts: [
      {
        name: 'Check Crush',
        url: '/',
        description: 'Instant synastry check for your crush',
      },
      {
        name: "Today's Pair Do/Don't",
        url: '/?shortcut=dodont',
        description: 'Daily transit protocol and weekly pair forecast',
      },
      {
        name: 'My Birth Chart',
        url: '/chart',
        description: 'Free personal birth chart and natal table',
      },
    ],
  };
}
