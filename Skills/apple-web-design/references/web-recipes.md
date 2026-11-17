# Receitas para web

Valores propostos para este kit, não tokens oficiais Apple. Ajuste identidade, contraste e densidade ao conteúdo; examine tokens existentes antes de importar estilos.

## Base discreta

```css
.apple-surface {
  --ui-bg: #f5f5f7;
  --ui-surface: #ffffff;
  --ui-text: #1d1d1f;
  --ui-muted: #56565c;
  --ui-action: #005ac1;
  --ui-divider: #d2d2d7;
  --ui-radius-control: 0.75rem;
  --ui-radius-panel: 1.5rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: var(--ui-text);
  background: var(--ui-bg);
}
```

Espaçamentos como 4/8/12/16/24/32/48/64 CSS px, convertidos em rem quando apropriado, ajudam a manter coerência. Corpo entre 1 e 1.125rem com entrelinha confortável é um início para leitura, não obrigação para toda UI. Use clamp em títulos editoriais; títulos operacionais devem deixar espaço para ações e conteúdo.

## Composição por tarefa

- Marketing: promessa específica, demonstração real do produto, CTA claro e ritmo variado; não invente depoimentos ou métricas.
- Dashboard: título e ação principal, resumo quando ajuda uma decisão, lista/tabela legível e filtros previsíveis. Cards só quando agrupam informação de verdade.
- Aprendizagem: cena e tarefa em destaque, fala legível, áudio com texto equivalente e progresso discreto. Evite distrações durante diálogos.
- Preferências: agrupe por finalidade; mantenha rótulo, descrição e controle juntos. Distinga salvar explicitamente de salvar automaticamente.

## Material com fallback

```css
.floating-toolbar { background: #ffffff; }
@supports (backdrop-filter: blur(16px)) {
  .floating-toolbar {
    background: rgb(255 255 255 / 92%);
    backdrop-filter: blur(16px);
  }
}
@media (prefers-reduced-transparency: reduce) {
  .floating-toolbar { background: #ffffff; backdrop-filter: none; }
}
@media (prefers-reduced-motion: reduce) {
  .floating-toolbar { animation: none; transition: none; }
}
```

Confira contraste com os fundos reais atrás do material. Se houver tema escuro, defina tokens próprios e valide ambos; não inverta cores indiscriminadamente. Só inclua estes exemplos no produto quando necessários.
