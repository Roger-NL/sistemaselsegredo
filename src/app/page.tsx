"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Rocket } from "lucide-react";

// ============================================================================
// LANDING PAGE
// Página inicial com chamada para ação e botão para entrar no sistema
// ============================================================================

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Círculos decorativos que simulam órbitas */}
        {[200, 300, 400, 500].map((size, i) => (
          <div
            key={size}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-800/30"
            style={{ width: size, height: size }}
          />
        ))}
        {/* Glow central */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl" />
      </div>

      {/* Conteúdo principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-2xl"
      >
        {/* Logo / Título */}
        <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
          <span className="text-amber-400">ES</span> English Academy
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 mb-8">
          Domine o inglês através de uma jornada cósmica. <br />
          9 Pilares. 3 Especializações. Um universo de possibilidades.
        </p>

        {/* Botão principal */}
        <Link href="/dashboard">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-lg px-8 py-4 rounded-full shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-shadow"
          >
            <Rocket className="w-5 h-5" />
            Entrar na Academia
          </motion.button>
        </Link>

        {/* Info extra */}
        <p className="mt-8 text-sm text-zinc-600">
          Sua jornada para a fluência começa aqui.
        </p>
      </motion.div>
    </main>
  );
}
