# Biblioteca da cafeteria — estado de produção

Fonte narrativa aprovada: `output/pdf/BasedSpeak_Demo_Experiencia_Visual.pdf`, páginas 47–52. Inventário literal de V01–V09, C01–C30 e U01–U20 em `src/features/demo/content/media.ts`. A [revisão aprovada](REVISAO-EXPERIENCIA-E-AUDIO.md) substitui a produção estática de voz por cache global sob demanda e uma única voz configurada no servidor.

- As nove imagens finais continuam pendentes (`ready: false`). As quatro artes locais em `public/demo/cafe/v1/previews/` são referências conceituais identificadas na interface. Texto distingue pedidos #18/#24.
- Os cinquenta IDs de fala usam `delivery: server-cache`. Não correspondem necessariamente a cinquenta arquivos: textos e parâmetros iguais compartilham uma única chave e um único MP3.
- Somente clicar em Ouvir solicita áudio. O cliente envia o ID; normalização, parâmetros, coordenação Firestore e geração ElevenLabs ocorrem no servidor. O MP3 é persistido no Blob antes de ser devolvido. Replay e velocidade local reutilizam esse arquivo.
- Não houve geração, upload, consulta ao cache remoto ou validação de gravação real nesta execução. Provedor, Blob e Firestore foram simulados nos testes.
- Sem configuração ou com falha de áudio, o texto e a história continuam disponíveis. Não há fallback que gere sem persistência nem repetição de tentativa após resultado incerto.

Antes da publicação: produzir/revisar as nove cenas finais; validar a voz configurada e a reprodução em uma execução especificamente autorizada; verificar a configuração existente de Firebase Admin/Blob; repetir os testes visuais e de reprodução. Não apagar registros `speech_audio_cache_v3` ou aplicar TTL: são a proteção durável contra geração duplicada. Não usar o cache órbita como biblioteca final.

A identidade e o motor estão implementados localmente. A arte final, a revisão de gravações reais e a validação de duração com participantes permanecem pendentes.
