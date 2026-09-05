import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Hawa Distribution & Trading | هوا للتوزيع والتجارة',
        short_name: 'Hawa',
        description: 'شركة هوا للتوزيع والتجارة - المنصة الرائدة لعرض وتوزيع منتجات الوكالات للمحلات والتجار بالجملة.',
        start_url: '/',
        display: 'standalone',
        background_color: '#FFFFFF',
        theme_color: '#0B192C',
        icons: [
            {
                src: '/android-chrome-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/android-chrome-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
