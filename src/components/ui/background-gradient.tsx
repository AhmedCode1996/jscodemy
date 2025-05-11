import { CSSProperties, PropsWithChildren } from "react";

import * as motion from "motion/react-client";

import clsx from "clsx";

interface BackgroundGradientProps extends PropsWithChildren {
  className?: string;
  variant?: keyof typeof COLOR_VARIANTS;
  showGrid?: boolean;
}

const COLOR_VARIANTS = {
  emerald: {
    gradient: "from-emerald-500/20 via-transparent to-transparent",
    accent: "from-emerald-500/30",
    text: "drop-shadow-[0_0_32px_rgba(16,185,129,0.4)]",
  },
  violet: {
    gradient: "from-violet-500/20 via-transparent to-transparent",
    accent: "from-violet-500/30",
    text: "drop-shadow-[0_0_32px_rgba(139,92,246,0.4)]",
  },
  orange: {
    gradient: "from-orange-500/20 via-transparent to-transparent",
    accent: "from-orange-500/30",
    text: "drop-shadow-[0_0_32px_rgba(249,115,22,0.4)]",
  },
  purple: {
    gradient: "from-purple-500/20 via-transparent to-transparent",
    accent: "from-purple-500/30",
    text: "drop-shadow-[0_0_32px_rgba(168,85,247,0.4)]",
  },
  red: {
    gradient: "from-red-500/20 via-transparent to-transparent",
    accent: "from-red-500/30",
    text: "drop-shadow-[0_0_32px_rgba(239,68,68,0.4)]",
  },
  blue: {
    gradient: "from-blue-500/20 via-transparent to-transparent",
    accent: "from-blue-500/30",
    text: "drop-shadow-[0_0_32px_rgba(59,130,246,0.4)]",
  },
  cyan: {
    gradient: "from-cyan-500/20 via-transparent to-transparent",
    accent: "from-cyan-500/30",
    text: "drop-shadow-[0_0_32px_rgba(6,182,212,0.4)]",
  },
  gray: {
    gradient: "from-gray-500/20 via-transparent to-transparent",
    accent: "from-gray-500/30",
    text: "drop-shadow-[0_0_32px_rgba(107,114,128,0.4)]",
  },
} as const;

const AnimatedGrid = () => (
  <motion.div
    className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)]"
    animate={{
      backgroundPosition: ["0% 0%", "100% 100%"],
    }}
    transition={{
      duration: 40,
      repeat: Number.POSITIVE_INFINITY,
      ease: "linear",
    }}
  >
    <div className="h-full w-full [background-image:repeating-linear-gradient(100deg,#64748B_0%,#64748B_1px,transparent_1px,transparent_4%)] opacity-20" />
  </motion.div>
);

export function BackgroundGradient({
  className,
  variant = "cyan",
  showGrid = true,
  children,
}: BackgroundGradientProps) {
  const variantStyles = COLOR_VARIANTS[variant];

  return (
    <div
      className={clsx(
        "relative min-h-screen w-full overflow-hidden",
        "bg-white dark:bg-black/5",
        className,
      )}
    >
      {showGrid && <AnimatedGrid />}

      {children && (
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {children}
        </motion.div>
      )}

      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <div className="absolute inset-0 [mask-image:radial-gradient(90%_60%_at_50%_50%,#000_40%,transparent)]">
          <div
            className={clsx(
              "absolute inset-0 bg-gradient-to-br",
              variantStyles.gradient,
            )}
          />

          <motion.div
            className={clsx(
              "absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--accent-color)/20%,transparent_70%)]",
              "blur-[120px]",
            )}
            style={
              {
                "--accent-color": `var(--${variant}-500)`,
              } as CSSProperties
            }
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className={clsx(
              "absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--accent-color)/10%,transparent)]",
              "blur-[80px]",
            )}
            style={
              {
                "--accent-color": `var(--${variant}-400)`,
              } as CSSProperties
            }
            animate={{
              scale: [1.1, 1, 1.1],
            }}
            transition={{
              duration: 12,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
