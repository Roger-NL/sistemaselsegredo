"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export function useTTS() {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Speed configuration: defaults to 1.0. Can be toggled to 0.8 for slow mode.
    const [speed, setSpeed] = useState<number>(1.0);

    const toggleSpeed = useCallback(() => {
        setSpeed((prev) => (prev === 1.0 ? 0.8 : 1.0));
    }, []);

    // Ensure we load voices (some browsers load them asynchronously)
    useEffect(() => {
        const loadVoices = () => {
            window.speechSynthesis.getVoices();
        };
        if ("speechSynthesis" in window) {
            loadVoices();
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    const playPremiumCloudTTS = useCallback((text: string, currentSpeed: number) => {
        // 1º Tentar usar o Youdao (Tem um motor Neural muito mais humano e natural que o Google gratuito)
        // type=2 é Inglês Americano (US), type=1 é Britânico (UK)
        const youdaoUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=2`;
        const audio = new Audio(youdaoUrl);

        if (currentSpeed !== 1.0) {
            audio.playbackRate = currentSpeed;
        }

        audio.onended = () => {
            setIsPlaying(false);
        };

        audio.onerror = () => {
            // 2º Se falhar (ex: CORS ou limite), faz fallback automático para o Google com cliente 'tw-ob' (melhor que gtx)
            console.log("[TTS] Youdao Neural engine failed. Falling back to Google HQ...");
            const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en-US&client=tw-ob`;
            const fallbackAudio = new Audio(googleUrl);

            if (currentSpeed !== 1.0) fallbackAudio.playbackRate = currentSpeed;

            fallbackAudio.onended = () => setIsPlaying(false);
            fallbackAudio.onerror = () => {
                setIsPlaying(false);
                console.log("[TTS] All cloud fallbacks failed.");
            };

            audioRef.current = fallbackAudio;
            fallbackAudio.play().catch(() => setIsPlaying(false));
        };

        audioRef.current = audio;
        audio.play().catch(() => {
            setIsPlaying(false);
        });
    }, []);

    const stop = useCallback(() => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        setIsPlaying(false);
    }, []);

    const speak = useCallback((text: string, forceSpeed?: number) => {
        if (!text || text.trim().length === 0) return;

        // Stop any currently playing audio first
        stop();
        setIsPlaying(true);

        const currentSpeed = forceSpeed || speed;

        // Small delay to let the browser engine 'breathe' after a cancel()
        setTimeout(() => {
            // Try Web Speech API first
            if ("speechSynthesis" in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = "en-US";
                utterance.rate = currentSpeed;

                const voices = window.speechSynthesis.getVoices();

                // VETO LIST: The most notoriously robotic voices that ruin the experience
                const isRobotic = (name: string) => {
                    const n = name.toLowerCase();
                    return n.includes("david") || n.includes("zira") || n.includes("mark") ||
                        n.includes("desktop") || n.includes("hazel");
                };

                // Premium human-like voices priority
                const priorityList = [
                    "Microsoft Aria Online (Natural)", // Edge top tier
                    "Microsoft Guy Online (Natural)",
                    "Microsoft Jenny Online (Natural)",
                    "Google US English", // Chrome high quality
                    "Google UK English Female",
                    "Samantha", // macOS
                    "Daniel", // macOS premium
                    "Siri", // iOS/macOS
                    "Natural",
                    "Neural",
                    "Online"
                ];

                let preferredVoice = null;
                for (const name of priorityList) {
                    preferredVoice = voices.find(v => v.name.includes(name) && v.lang.startsWith("en") && !isRobotic(v.name));
                    if (preferredVoice) break;
                }

                // Se não achou nenhuma Premium, e todas as outras vozes nativas são muito robóticas (ex: MS David),
                // é preferível ABORTAR a voz nativa e usar a nuvem (Youdao/Google) que é muito mais humana!
                if (!preferredVoice) {
                    const fallbackNative = voices.find(v => v.lang === "en-US" && !isRobotic(v.name)) ||
                        voices.find(v => v.lang.startsWith("en") && !isRobotic(v.name));

                    if (fallbackNative) {
                        preferredVoice = fallbackNative;
                    }
                }

                if (preferredVoice) {
                    utterance.voice = preferredVoice;
                    utterance.onend = () => setIsPlaying(false);
                    utterance.onerror = (e) => {
                        console.log("[TTS] Native failed or interrupted, switching to Premium Cloud.");
                        playPremiumCloudTTS(text, currentSpeed);
                    };
                    window.speechSynthesis.speak(utterance);
                } else {
                    // Sem vozes humanas nativas instaladas. Bloqueou o MS David. Usar Nuvem!
                    console.log("[TTS] Only robotic native voices found. Forcing Premium Cloud TTS.");
                    playPremiumCloudTTS(text, currentSpeed);
                }
            } else {
                // Browser doesn't support Web Speech API
                playPremiumCloudTTS(text, currentSpeed);
            }
        }, 50);
    }, [speed, stop, playPremiumCloudTTS]);

    return {
        speak,
        stop,
        toggleSpeed,
        speed,
        isPlaying,
    };
}
