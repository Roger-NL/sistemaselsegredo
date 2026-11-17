# Skills de UI do BasedSpeak

Instaladas em 16/11/2026. Esta pasta contém os arquivos reais; a pasta de skills do Codex contém links simbólicos para cada skill. Mover ou apagar o projeto quebra esses links. As skills ficam disponíveis no próximo turno; caso a lista não atualize, reabra o chat/app.

| Chamada | Finalidade | Origem |
| --- | --- | --- |
| `$apple-web-design` | Design web inspirado na Apple, com preview responsivo | Skill local baseada nas Apple HIG; não oficial da Apple |
| `$frontend-design` | Direção visual e implementação de interfaces | anthropics/skills |
| `$web-design-guidelines` | Revisão de UI, usabilidade e acessibilidade | vercel-labs/agent-skills |
| `$vercel-react-best-practices` | Implementação e desempenho de React/Next.js | vercel-labs/agent-skills |
| `$motion-design` | Ritmo, expressão e narrativa das animações | LottieFiles/motion-design-skill |
| `$animate` | Construir movimentos com curvas e duração consistentes | emilkowalski/skills |
| `$gestures` | Arrastar e soltar com acompanhamento direto do ponteiro | emilkowalski/skills |
| `$choreograph` | Coordenar personagem, objeto e reação | emilkowalski/skills |
| `$review-animations` | Revisar fluidez, origem e interrupção dos movimentos | emilkowalski/skills |
| `$rive` | Criar e integrar animações com o CLI oficial | rive-app/skills |
| `$rive-character-rigging` | Articulação e inspeção de poses | itxys/rive-character-rigging-skill; comunidade |

## Exemplos de chamada

> Use $apple-web-design para criar uma proposta da tela de estudo. Preserve a identidade BasedSpeak e mostre preview mobile e desktop.

> Use $frontend-design para propor uma direção visual da página indicada, respeitando as referências anexadas.

> Use $web-design-guidelines para revisar src/app/page.tsx e src/features/landing, com atenção a teclado, contraste e mobile.

> Use $vercel-react-best-practices para revisar o desempenho dos componentes da rota /demo.

Para combinar: use $apple-web-design como direção estética, $vercel-react-best-practices para implementação e $web-design-guidelines para revisão. Não é preciso carregar todas para uma tarefa pequena. A direção explícita do usuário prevalece sobre a preferência estética de qualquer skill.

## Fontes e manutenção

Para o curso novo **Primeiros encontros**, a combinação usada é `frontend-design`, `motion-design`, `gestures`, `rive` e `review-animations`. A rota local é `/dev/primeiros-encontros`.

O Rive CLI oficial 1.9.2 está em `/Users/rogera/.rive/bin/rive`. O pipeline dos cinco personagens está em `assets/first-encounters/characters/build.py` e exporta arquivos locais. Não publica um website. As skills ficam vinculadas ao Codex para descoberta automática a partir do próximo turno; também podem ser lidas diretamente nesta sessão.

- Apple HIG: https://developer.apple.com/design/human-interface-guidelines/
- Anthropic: https://github.com/anthropics/skills/tree/main/skills/frontend-design
- Vercel: https://github.com/vercel-labs/agent-skills
- Guidelines web: https://vercel.com/design/guidelines

`sources.json` registra commits instalados; não há atualizações automáticas. As skills externas foram preservadas, com metadados de interface adicionados. A skill de revisão da Vercel consulta guidelines atuais ao ser executada. Licenças presentes nas pastas originais foram mantidas. As skills são instruções; o preview é produzido ao executar uma tarefa de UI, não ao instalar este kit.
