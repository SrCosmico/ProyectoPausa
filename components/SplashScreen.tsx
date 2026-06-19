"use client";

import { motion } from "framer-motion";

export default function SplashScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#F5F5F5]">
      <div className="flex flex-col items-center">

        <div className="relative w-52 h-52">

          <motion.div
            initial={{ x: -120, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute left-0 top-14 w-28 h-28 rounded-full bg-[#A8D0F0]/80"
          />

          <motion.div
            initial={{ x: 120, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute right-0 top-14 w-28 h-28 rounded-full bg-[#C9B2D8]/80"
          />

          <motion.div
            initial={{ y: -120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="absolute left-12 top-0 w-28 h-28 rounded-full bg-[#B7C0B8]/80"
          />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 1,
              type: "spring",
              stiffness: 250,
            }}
            className="absolute left-[72px] top-[72px] text-5xl text-white"
          >
            ★
          </motion.div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="text-7xl font-bold text-[#4E5072]"
        >
          Pausa.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="tracking-[0.4em] text-[#8D8FA5] mt-2"
        >
          TU REFUGIO MENTAL
        </motion.p>
      </div>
    </div>
  );
}