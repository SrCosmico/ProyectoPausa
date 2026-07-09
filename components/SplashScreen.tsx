"use client";

import { motion } from "framer-motion";

export default function SplashScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#F7F7F7] overflow-hidden">
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center"
      >
        {/* LOGO */}
        <div className="relative w-56 h-52">
          {/* Azul */}
          <motion.div
            initial={{ x: -180, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
              duration: 1,
              ease: "easeOut",
            }}
            className="absolute left-4 top-16 w-28 h-28 rounded-full bg-[#A8D0F6]/80"
          />

          {/* Morado */}
          <motion.div
            initial={{ x: 180, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
              duration: 1,
              delay: 0.15,
              ease: "easeOut",
            }}
            className="absolute right-4 top-16 w-28 h-28 rounded-full bg-[#C9B2D8]/80"
          />

          {/* Verde */}
          <motion.div
            initial={{ y: -180, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 1,
              delay: 0.3,
              ease: "easeOut",
            }}
            className="absolute left-14 top-0 w-28 h-28 rounded-full bg-[#B8C1B9]/85"
          />

          {/* Estrella */}
          <motion.div
            initial={{
              scale: 0,
              rotate: -180,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              rotate: 0,
              opacity: 1,
            }}
            transition={{
              delay: 1.2,
              duration: 0.8,
              type: "spring",
              stiffness: 180,
            }}
            className="absolute left-[78px] top-[74px]"
          >
            <div className="text-white text-7xl drop-shadow-md">✦</div>
          </motion.div>
        </div>

        {/* PAUSA */}
        <motion.h1
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 1.8,
            duration: 0.8,
          }}
          className="text-7xl font-extrabold text-[#4F5273] mt-2"
        >
          Pausa.
        </motion.h1>

        {/* SLOGAN */}
        <motion.p
          initial={{
            opacity: 0,
            letterSpacing: "0.6em",
          }}
          animate={{
            opacity: 1,
            letterSpacing: "0.25em",
          }}
          transition={{
            delay: 2.4,
            duration: 0.8,
          }}
          className="mt-4 text-lg text-[#8A8EA5] uppercase font-medium"
        >
          Tu Refugio Mental
        </motion.p>

        {/* Respiración suave */}
        <motion.div
          animate={{
            scale: [1, 1.03, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute"
        />
      </motion.div>
    </div>
  );
}