"use client";

import { useState, useCallback, useRef, useEffect } from "react";

type VoiceStrategy = "native-first" | "cloud-first";

function getVoiceStrategy(): VoiceStrategy {
    if (typeof navigator === "undefined") {
        return "native-first";
    }

    const ua = navigator.userAgent.toLowerCase();
    const vendor = navigator.vendor.toLowerCase();
    const isOpera = ua.includes("opr/") || ua.includes("opera");
    const isFirefox = ua.includes("firefox");
    const isSafari = vendor.includes("apple") && !ua.includes("crios") && !ua.includes("fxios") && !ua.includes("edgios") && !ua.includes("opr/");

    if (isSafari || isOpera || isFirefox) {
        return "cloud-first";
    }

    return "native-first";
}

function isRoboticVoiceName(name: string) {
    const normalized = name.toLowerCase();
    return [
        "david",
        "zira",
        "mark",
        "desktop",
        "hazel",
        "fred",
        "lekha",
        "rina",
        "tessa",
        "veena",
        "karen",
        "moira",
    ].some((item) => normalized.includes(item));
}

function pickPreferredNativeVoice(voices: SpeechSynthesisVoice[]) {
    const priorityList = [
        "Google US English",
        "Google UK English Female",
        "Google UK English Male",
        "Microsoft Aria Online (Natural)",
        "Microsoft Guy Online (Natural)",
        "Microsoft Jenny Online (Natural)",
        "Samantha",
        "Daniel",
        "Karen",
        "Moira",
        "Siri",
        "Natural",
        "Neural",
        "Online",
    ];

    for (const preferredName of priorityList) {
        const match = voices.find((voice) => {
            const isEnglish = voice.lang === "en-US" || voice.lang.startsWith("en-");
            return isEnglish && voice.name.includes(preferredName) && !isRoboticVoiceName(voice.name);
        });

        if (match) {
            return match;
        }
    }

    return (
        voices.find((voice) => voice.lang === "en-US" && !isRoboticVoiceName(voice.name)) ||
        voices.find((voice) => voice.lang.startsWith("en") && !isRoboticVoiceName(voice.name)) ||
        null
    );
}

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

    const playPremiumCloudTTS = useCallback((text: string, currentSpeed: number, onFailure?: () => void) => {
        const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en-US&client=tw-ob`;
        const googleAudio = new Audio(googleUrl);

        if (currentSpeed !== 1.0) {
            googleAudio.playbackRate = currentSpeed;
        }

        googleAudio.onended = () => {
            setIsPlaying(false);
        };

        googleAudio.onerror = () => {
            console.log("[TTS] Google cloud voice failed. Trying secondary fallback...");
            const youdaoUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=2`;
            const fallbackAudio = new Audio(youdaoUrl);

            if (currentSpeed !== 1.0) {
                fallbackAudio.playbackRate = currentSpeed;
            }

            fallbackAudio.onended = () => setIsPlaying(false);
            fallbackAudio.onerror = () => {
                setIsPlaying(false);
                onFailure?.();
            };

            audioRef.current = fallbackAudio;
            fallbackAudio.play().catch(() => {
                setIsPlaying(false);
                onFailure?.();
            });
        };

        audioRef.current = googleAudio;
        googleAudio.play().catch(() => {
            setIsPlaying(false);
            onFailure?.();
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
        const voiceStrategy = getVoiceStrategy();

        // Small delay to let the browser engine 'breathe' after a cancel()
        setTimeout(() => {
            const speakWithNativeVoice = () => {
                if (!("speechSynthesis" in window)) {
                    playPremiumCloudTTS(text, currentSpeed);
                    return;
                }

                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = "en-US";
                utterance.rate = currentSpeed;

                const voices = window.speechSynthesis.getVoices();
                const preferredVoice = pickPreferredNativeVoice(voices);

                if (preferredVoice) {
                    utterance.voice = preferredVoice;
                    utterance.onend = () => setIsPlaying(false);
                    utterance.onerror = () => {
                        console.log("[TTS] Native voice failed, switching to cloud voice.");
                        playPremiumCloudTTS(text, currentSpeed);
                    };
                    window.speechSynthesis.speak(utterance);
                } else {
                    playPremiumCloudTTS(text, currentSpeed);
                }
            };

            if (voiceStrategy === "cloud-first") {
                playPremiumCloudTTS(text, currentSpeed, speakWithNativeVoice);
                return;
            }

            speakWithNativeVoice();
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
