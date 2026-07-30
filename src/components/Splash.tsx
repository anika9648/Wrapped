"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { SLOGAN, SUPPORTING_COLORS } from "@/lib/constants";

type Stage = "logo" | "confetti" | "slogan" | "done";

export default function Splash({ onFinish }: { onFinish: () => void }) {
  const [stage, setStage] = useState<Stage>("logo");
  const fired = useRef(false);

  useEffect(() => {
    const t1 = setTimeout(() => setStage("confetti"), 1400);
    const t2 = setTimeout(() => setStage("slogan"), 3000);
    const t3 = setTimeout(() => setStage("done"), 4600);
    const t4 = setTimeout(() => onFinish(), 5200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onFinish]);

  useEffect(() => {
    if (stage === "confetti" && !fired.current) {
      fired.current = true;
      confetti({
        particleCount: 160,
        spread: 100,
        startVelocity: 45,
        gravity: 0.9,
        origin: { y: 0.2 },
        colors: SUPPORTING_COLORS,
      });
      setTimeout(
        () =>
          confetti({
            particleCount: 100,
            spread: 120,
            startVelocity: 35,
            gravity: 0.8,
            origin: { y: 0.1 },
            colors: SUPPORTING_COLORS,
          }),
        350
      );
    }
  }, [stage]);

  return (
    <AnimatePresence>
      {stage !== "done" && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {stage === "logo" && (
            <motion.div
              key="logo"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="flex h-full w-full items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, #52ebcf 0%, #ff9292 55%, #ffff47 100%)",
              }}
            >
              <span className="text-6xl font-bold tracking-tight text-white drop-shadow-sm">
                Wrapped
              </span>
            </motion.div>
          )}

          {stage === "confetti" && (
            <motion.div
              key="confetti"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex h-full w-full items-center justify-center bg-white"
            />
          )}

          {stage === "slogan" && (
            <motion.div
              key="slogan"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="flex h-full w-full items-center justify-center bg-white px-8"
            >
              <p className="max-w-sm text-center text-2xl font-semibold text-[#1f2430]">
                {SLOGAN}
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
