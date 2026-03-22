import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'BasedSpeak',
        short_name: 'BasedSpeak',
        description: 'Domine o inglês através da jornada da BasedSpeak.',
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
