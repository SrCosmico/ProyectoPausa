"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function SplashScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 overflow-hidden">
      
      {/* Brillos decorativos */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1.5 }}
        className="absolute w-96 h-96 rounded-full bg-blue-200 blur-3xl -left-20 top-20"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ duration: 1.8 }}
        className="absolute w-96 h-96 rounded-full bg-purple-200 blur-3xl right-0 bottom-0"
      />

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.85,
          filter: "blur(12px)",
        }}
        animate={{
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
        }}
        transition={{
          duration: 1.4,
          ease: "easeOut",
        }}
        className="relative"
      >
        <Image
          src="/logo-pausa.png"
          alt="Pausa"
          width={700}
          height={240}
          priority
        />
      </motion.div>
    </div>
  );
}