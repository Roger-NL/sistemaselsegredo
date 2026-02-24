# CONFIGURAÇÃO: SISTEMA DE TTS (TEXT-TO-SPEECH)

## 🎯 OBJETIVO
Implementar uma solução de áudio para shadow learning que seja gratuita, ilimitada e de alta qualidade (Vozes Google).

## 🛠️ ESPECIFICAÇÕES TÉCNICAS
- **Motor Primário:** Web Speech API (Nativa do navegador com filtro rigoroso APENAS para vozes premium/Neural, bloqueando vozes robóticas como MS David).
- **Motor Secundário (Fallback Nuvem 1):** Youdao Cloud Audio API (Motor Neural Gratuito de Altíssima Fidelidade).
- **Motor Terciário (Fallback Nuvem 2):** Google Translate TTS API (Cliente `tw-ob` otimizado).
- **Funcionalidades Necessárias:**
    - Botão de reprodução ao lado de cada frase em inglês.
    - Controle de velocidade (0.8x para iniciantes, 1.0x normal).
    - Detecção automática de texto dentro de `{{english|portuguese}}`.

## 📝 CHECKLIST DE IMPLEMENTAÇÃO
- [x] Criar Hook `useTTS.ts` para gerenciar áudio.
- [x] Criar Componente `AudioButton.tsx`.
- [x] Injetar `AudioButton` no renderizador `PillarOperationalView.tsx`.
- [x] Testar em navegadores Chrome/Safari/Edge. (Verificado por Gemini CLI em 24/02/2026)
- [x] Update Cloud Fallback para motor Youdao Neural / Bloquear Vozes Robóticas nativas.
