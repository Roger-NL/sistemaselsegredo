import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://basedspeak.com'

    // Define your static routes here
    const routes = [
        '',
        '/termos',
        '/privacidade',
    ]

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'weekly' as const : 'monthly' as const,
        priority: route === '' ? 1 : 0.4,
    }))
}
