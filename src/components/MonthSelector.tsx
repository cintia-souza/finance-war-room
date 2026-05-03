"use client";
import { useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHaptic } from "@/hooks/useHaptic";
import { getMonthLabel } from "@/lib/utils";

interface MonthSelectorProps {
  currentMonth: string;
  direction: number;
  onNavigate: (dir: number) => void;
}

export function MonthSelector({ currentMonth, direction, onNavigate }: MonthSelectorProps) {
  const haptic = useHaptic();
  const constraintsRef = useRef(null);

  const monthLabel = getMonthLabel(currentMonth);

  const handleNav = (dir: number) => {
    haptic.navigate();
    onNavigate(dir);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold) {
      handleNav(1);
    } else if (info.offset.x > threshold) {
      handleNav(-1);
    }
  };

  return (
    <nav className="mb-6" aria-label="Navegação por mês">
      <div className="flex items-center justify-between">
        <motion.button
          whileTap={{ scale: 0.8, x: -3 }}
          onClick={() => handleNav(-1)}
          className="text-t-muted hover:bg-t-surface rounded-full p-2 transition-colors"
          aria-label="Mês anterior"
        >
          <ChevronLeft size={20} />
        </motion.button>

        <div ref={constraintsRef} className="relative flex-1 overflow-hidden">
          <motion.div
            drag="x"
            dragConstraints={constraintsRef}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="flex cursor-grab items-center justify-center active:cursor-grabbing"
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentMonth}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="relative px-4 py-1"
              >
                {/* Indicador deslizante com layoutId */}
                <motion.div
                  layoutId="month-indicator"
                  className="bg-t-surface absolute inset-0 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
                <p className="text-t-text relative text-sm font-bold capitalize" aria-live="polite">
                  {monthLabel}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        <motion.button
          whileTap={{ scale: 0.8, x: 3 }}
          onClick={() => handleNav(1)}
          className="text-t-muted hover:bg-t-surface rounded-full p-2 transition-colors"
          aria-label="Próximo mês"
        >
          <ChevronRight size={20} />
        </motion.button>
      </div>

      {/* Dots indicadores */}
      <div className="mt-2 flex justify-center gap-1" aria-hidden="true">
        {[-1, 0, 1].map((offset) => (
          <motion.div
            key={offset}
            className="h-1 rounded-full"
            animate={{
              width: offset === 0 ? 16 : 4,
              backgroundColor: offset === 0 ? "var(--t-accent)" : "var(--t-border)",
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </nav>
  );
}
