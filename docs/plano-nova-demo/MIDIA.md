# Biblioteca da cafeteria — estado de produção

Fonte aprovada: `output/pdf/BasedSpeak_Demo_Experiencia_Visual.pdf`, páginas 47–52. O inventário literal de V01–V09, C01–C30 e U01–U20 está em `src/features/demo/content/media.ts`.

- As nove imagens finais e cinquenta gravações **não existem ainda**. Seus caminhos de publicação estão declarados, com `ready: false`.
- As quatro artes de apresentação são referências conceituais locais em `public/demo/cafe/v1/previews/`. Não representam nove artes finais. A interface identifica essa condição e usa texto para distinguir pedidos #18/#24.
- Áudio indisponível não dispara geração, fetch de TTS ou pedido de microfone. O botão explica a indisponibilidade e permite continuar.
- Produção ElevenLabs/Blob está preservada para execução explicitamente autorizada. Nenhuma geração, upload, download externo ou chamada ao cache remoto foi executada.

Para aceitar a entrega pública: produzir/revisar as nove cenas e as duas vozes distintas nos cinquenta contextos; instalar os arquivos nos caminhos do manifesto; marcar somente os arquivos revisados como prontos; verificar URLs no build local e repetir os testes de reprodução, ordem, interrupção e retomada. Não usar o cache órbita como biblioteca final.

Esta pendência impede declarar a demo pronta para publicação. Não impede verificar o motor e a interface localmente.
