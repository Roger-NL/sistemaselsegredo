# ES ACADEMY - MASTER CONFIG & LOG
**REGRA DE OURO:** NUNCA apagar ou modificar linhas antigas. Apenas adicionar novas linhas ao final do arquivo. Modificações são permitidas apenas para marcar os checkmarks [ ] como [x].

**REGRA DE ISOLAMENTO:** Ao editar conteúdos (Pilares), selecionar SEMPRE apenas uma "Parte" (Módulo) por vez. NUNCA modificar partes não selecionadas. O restante do arquivo deve permanecer INTACTO para evitar erros de contexto.

## 📋 STATUS GERAL DO PROJETO
- [x] Implementação de TTS (Google/Web Speech) - **CONCLUÍDO**
- [x] Conteúdo Real: Pilar 1 - **CONCLUÍDO**
- [x] Conteúdo Real: Pilar 2 - **CONCLUÍDO**
- [ ] Conteúdo Real: Pilar 3
- [ ] Conteúdo Real: Pilar 4
- [ ] Conteúdo Real: Pilar 5
- [ ] Conteúdo Real: Pilar 6
- [ ] Conteúdo Real: Pilar 7
- [ ] Conteúdo Real: Pilar 8
- [ ] Conteúdo Real: Pilar 9
- [ ] Conteúdo Real: Especialidades (Todas)
- [ ] Integração de Pagamento Real (Stripe/Mercado Pago)
- [ ] Painel Admin: Gestão de Alunos e Aprovação

---

## 🛠️ LOG DE EXECUÇÃO (HISTÓRICO)
- [x] Criar pasta `configuracoes` no diretório raiz. (24/02/2026)
- [x] Criar arquivo `MASTER_CONFIG.md` com as regras de preservação. (24/02/2026)
- [x] Criar arquivo `TTS_CONFIG.md`.
- [x] Criar arquivos de conteúdo `PILAR_01.md` até `PILAR_09.md`.
- [x] Definir estratégia técnica para TTS ilimitado.
- [x] Iniciar implementação técnica do TTS.
- [x] Concluir criação do Hook `useTTS.ts`, Componente `AudioButton.tsx` e injeção em `PillarOperationalView` e `TranslatablePhrase`.
- [x] Conferência e validação técnica do sistema TTS concluída. (24/02/2026)
- [ ] Refinar qualidade da voz para modelos mais humanos e naturais (Neural/Natural).
- [x] Implementada lógica de seleção de vozes "Neural" e "Online" para máxima qualidade gratuita. (24/02/2026)
- [!] Ajuste 1: A qualidade da voz ainda soa robótica. Iniciando refinamento profundo de seleção de motores de voz. (24/02/2026)
- [x] FIX: Erro '{}' na Web Speech API corrigido com lógica de fallback resiliente e debounce. (24/02/2026)
- [x] Ajuste 2: Falha detectada no fallback do Google (Erro 403 ou CORS). Implementando URL alternativa e tratamento de erro silencioso. (24/02/2026)
- [x] Ajuste 3: VOZES ROBÓTICAS BLOQUEADAS. Implementado sistema de prioridade de vozes Premium (Neural/Natural/Online) e fallback nativo de nuvem (Youdao Neural). (24/02/2026)
- [ ] Validar e testar no browser (Chrome/Edge/Safari).
- [x] Refatorar `pillars-content.ts` dividindo em arquivos individuais e criar novo conteúdo exclusivo para Pilar 2. (24/02/2026)
