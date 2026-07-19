import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'BasedSpeak',
        short_name: 'BasedSpeak',
        description: 'Prática guiada de inglês com missões e feedback.',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
            {
                src: '/basedspeak-tab.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
