"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Brain, Headphones, Zap, Shield } from "lucide-react";
import { useEffect, useState } from "react";

export default function AuthBackground() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const [mounted, setMounted] = useState(false);

    const springConfig = { damping: 25, stiffness: 700 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    // Parallax layers
    const layer1X = useTransform(springX, [-0.5, 0.5], [-20, 20]);
    const layer1Y = useTransform(springY, [-0.5, 0.5], [-20, 20]);

    const layer2X = useTransform(springX, [-0.5, 0.5], [-40, 40]);
    const layer2Y = useTransform(springY, [-0.5, 0.5], [-40, 40]);

    useEffect(() => {
        setMounted(true);
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth) - 0.5;
            const y = (e.clientY / window.innerHeight) - 0.5;
            mouseX.set(x);
            mouseY.set(y);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    if (!mounted) return <div className="absolute inset-0 bg-[#050505]" />;

    return (
        <div className="absolute inset-0 bg-[#050505] overflow-hidden pointer-events-none">
            {/* Background Texture - Grid */}
            <div className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: 'linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Ambient Glows */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-900/10 via-black to-emerald-900/10 opacity-60" />

            {/* Glowing Orbs */}
            <motion.div
                style={{ x: layer1X, y: layer1Y }}
                className="absolute top-[-10%] left-[-10%] w-[50vh] h-[50vh] bg-violet-600/10 rounded-full blur-[120px]"
            />
            <motion.div
                style={{ x: layer2X, y: layer2Y }}
                className="absolute bottom-[-10%] right-[-10%] w-[50vh] h-[50vh] bg-emerald-600/10 rounded-full blur-[120px]"
            />

            {/* Mindset - Top Left */}
            <FloatingIcon
                icon={Brain}
                className="absolute top-[10%] left-[5%] lg:left-[10%] text-violet-400"
                delay={0}
                moveX={layer2X}
                moveY={layer2Y}
            />

            {/* Listening - Top Right */}
            <FloatingIcon
                icon={Headphones}
                className="absolute top-[15%] right-[5%] lg:right-[10%] text-cyan-400"
                delay={1.5}
                moveX={layer1X}
                moveY={layer1Y}
            />

            {/* Reflex - Bottom Left */}
            <FloatingIcon
                icon={Zap}
                className="absolute bottom-[10%] left-[5%] lg:left-[10%] text-emerald-400"
                delay={0.8}
                moveX={layer1X}
                moveY={layer1Y}
            />

            {/* Security - Bottom Right */}
            <FloatingIcon
                icon={Shield}
                className="absolute bottom-[15%] right-[5%] lg:right-[10%] text-rose-400"
                delay={2.2}
                moveX={layer2X}
                moveY={layer2Y}
            />

            <div className="absolute bottom-6 left-0 right-0 text-center text-[10px] text-slate-700 font-mono tracking-widest opacity-40">
                AMBIENTE_SEGURO // CONEXÃO_CRIPTOGRAFADA_V2.4
            </div>
        </div>
    );
}

function FloatingIcon({ icon: Icon, className, delay, moveX, moveY }: any) {
    return (
        <motion.div
            style={{ x: moveX, y: moveY }}
            className={`flex items-center justify-center ${className}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay }}
        >
            <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay }}
                className={`
                    relative w-12 h-12 lg:w-16 lg:h-16 rounded-2xl 
                    bg-white/5 border border-white/10 backdrop-blur-sm
                    flex items-center justify-center shadow-xl
                `}
            >
                <div className="absolute inset-0 bg-current opacity-[0.03] rounded-2xl" />
                <Icon size={24} className="lg:w-8 lg:h-8" strokeWidth={1.5} />
            </motion.div>
        </motion.div>
    );
}
