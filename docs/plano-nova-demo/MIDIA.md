# Biblioteca da cafeteria — estado de produção

Fonte narrativa aprovada: `output/pdf/BasedSpeak_Demo_Experiencia_Visual.pdf`, páginas 47–52. Inventário literal de V01–V09, C01–C30 e U01–U20 em `src/features/demo/content/media.ts`. A [revisão aprovada](REVISAO-EXPERIENCIA-E-AUDIO.md) substitui a produção estática de voz por cache global sob demanda e uma única voz configurada no servidor.

- As nove imagens finais continuam pendentes (`ready: false`). As quatro artes locais em `public/demo/cafe/v1/previews/` são referências conceituais identificadas na interface. Texto distingue pedidos #18/#24.
- Os cinquenta IDs de fala usam `delivery: server-cache`. Não correspondem necessariamente a cinquenta arquivos: textos e parâmetros iguais compartilham uma única chave e um único MP3.
- Somente clicar em Ouvir solicita áudio. O cliente envia o ID; normalização, parâmetros, coordenação Firestore e geração ElevenLabs ocorrem no servidor. O MP3 é persistido no Blob antes de ser devolvido. Replay e velocidade local reutilizam esse arquivo.
- Após autorização para habilitar áudio: C01 foi gerado com ElevenLabs e persistido no Blob existente; três replays concorrentes receberam o mesmo arquivo. Firestore registra `ready` e `providerAttemptCount: 1`. Depois, a rodada completa validou tecnicamente todos os 50 IDs/46 MP3s únicos, incluindo decodificação, replays concorrentes e persistência após reinício, sem geração adicional. Ver [VALIDACAO-AUDIO-COMPLETA.md](VALIDACAO-AUDIO-COMPLETA.md). Testes automáticos continuam simulados.
- Sem configuração ou com falha de áudio, o texto e a história continuam disponíveis. Não há fallback que gere sem persistência nem repetição de tentativa após resultado incerto.

Antes da publicação: produzir/revisar as nove cenas finais; concluir a revisão editorial de pronúncia com a voz configurada; repetir os testes visuais e de reprodução. Não apagar registros `speech_audio_cache_v3` ou aplicar TTL: são a proteção durável contra geração duplicada. Não usar o cache órbita como biblioteca final.

A identidade e o motor estão implementados localmente. A arte final, a escuta editorial e a validação de duração com participantes permanecem pendentes.
