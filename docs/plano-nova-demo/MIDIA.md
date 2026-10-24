# Biblioteca da cafeteria — integração aprovada em 24/10/2026

As 12 imagens aprovadas estão integradas à história de Lucas e BASEDSPEAK. Os originais PNG permanecem intactos em `output/image-tests/cafe/`: piloto aprovado `pilot-04-handmade-comic.png` + sequências 02–12. As primeiras três alternativas de piloto não integram a demo.

## Entrega web

- `public/demo/cafe/v2/images/`: 12 WebPs a 960×640 e 12 variantes móveis a 640×427, qualidade 48/effort 6. Total desktop aproximadamente 907 KiB; mobile 449 KiB. As quatro referências anteriores somavam 3.739 KiB, portanto a sequência completa nova reduz o peso total em cerca de 76% no desktop e 88% no celular.
- Um `picture` escolhe o arquivo móvel até 760px. As versões já comprimidas são servidas sem nova transformação do Next. A entrada e a conversa não montam todas as 12 imagens simultaneamente.
- Preenchimento proporcional com `object-fit: cover`: a imagem ocupa a coluna esquerda inteira em computador/tablet, sem faixas vazias nem deformação. O enquadramento pode recortar bordas para preencher a área; os arquivos originais permanecem intactos. As pistas também aparecem em texto acessível: seu nome é based; o outro copo leva LUCAS.
- `manifest.json` registra dimensões, bytes, origem e SHA-256 dos originais. `node scripts/optimize-cafe-images.mjs` reproduz a exportação sem geração remota nem alteração de originais. É necessário ter os PNGs locais aprovados para executá-lo.
- V01 encontro; V02 detalhe LUCAS; V03 desculpa; V04 copo BASEDSPEAK; V05 prova do café; V06 risco; V07 copo salvo; V08 cansaço; V09 convite; V10 mesa; V11 aprendendo inglês; V12 despedida.
- As quatro referências JPG antigas foram removidas de `public`. Não há referências ativas a SARAH nem a números de pedido na interface/roteiro novo. Os documentos históricos mantêm o registro da versão antiga.

## Áudio preservado

Os 50 IDs e todos os textos em inglês permanecem iguais. Traduções em português foram ajustadas ao personagem masculino. A chave do cache depende do texto inglês e dos parâmetros de síntese: nenhuma nova geração é necessária por trocar imagem, nome visual ou nível. A validação real anterior de 50 IDs/46 MP3s segue documentada em [VALIDACAO-AUDIO-COMPLETA.md](VALIDACAO-AUDIO-COMPLETA.md). Nesta integração não houve geração, upload ou alteração do ledger remoto.

## Verificação

Testes decodificam todas as 24 variantes WebP, verificam dimensões, orçamento total de bytes e alcance das 12 cenas pelo grafo. Verificam também o hash de todos os textos de áudio contra a versão anterior. Os 12 hashes dos PNGs originais foram reconferidos após exportar.

Amostras WebP e uma folha de contato foram inspecionadas localmente; a inspeção interativa do layout no navegador permanece pendente. O bloqueio de permissão da sessão anterior não foi contornado. A duração aproximada de 30 minutos ainda depende de teste com participantes.

## Ajuste posterior da apresentação — 24/10/2026

A pedido do responsável, nome textual agora é based em minúsculas; nomes impressos nos PNGs/WebPs não foram alterados. A descrição acessível permanece no alt; a legenda visual sob a imagem foi retirada para evitar dois inícios concorrentes. Situação e título aparecem acima da cena. Pedido aparece como pista textual apenas nas comparações V02/V04. A faixa da arte no celular ganhou largura integral e mais altura.
