import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: ['/', '/termos', '/privacidade'],
            disallow: ['/admin/', '/api/', '/dashboard', '/perfil', '/configuracoes', '/boletim', '/pilar/', '/especialidades/', '/agendamentos'],
        },
        sitemap: 'https://basedspeak.com/sitemap.xml',
    }
}
