import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://esenglishacademy.com'

    // Define your static routes here
    const routes = [
        '',
        '/quiz',
        '/especialidades',
        // Add other main routes as they become stable
    ]

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: route === '' ? 1 : 0.8,
    }))
}
