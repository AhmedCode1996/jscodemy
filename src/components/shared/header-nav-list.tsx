"use client";

import { useState } from "react";
import Link from "next/link";

import { AnimatePresence, motion } from "motion/react";

import type { HoverdNavType } from "@/data/links";
import { LINKS } from "@/data/links";

const HeaderNavList = () => {
  const [hoverdNavItem, setHoverdNavItem] = useState<HoverdNavType | null>(
    "Home",
  );

  return (
    <nav
      onMouseLeave={() => setHoverdNavItem(null)}
      className="mx-auto w-fit py-2 px-2 border-2 border-muted rounded-2xl shadow-md transition-shadow duration-300 ease-in-out backdrop-blur-lg hover:shadow-sm hover:bg-white/5 dark:hover:bg-black/5 bg-white/5 dark:bg-black/5"
    >
      <ul className="flex items-center justify-center gap-4 divide-x divide-muted">
        {LINKS.map((link) => (
          <li key={link.label} className="px-2 py-0.5 relative">
            <AnimatePresence>
              {hoverdNavItem === link.label && (
                <motion.div
                  className="absolute inset-0 bg-gray-300 dark:bg-gray-800 z-[9] rounded-md"
                  layoutId="hovered-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: {
                      type: "spring",
                      stiffness: 100,
                      damping: 20,
                    },
                  }}
                  exit={{
                    opacity: 0,
                    transition: {
                      duration: 0.3,
                      ease: "easeInOut",
                    },
                  }}
                />
              )}
            </AnimatePresence>
            <Link
              className="relative z-10"
              onMouseEnter={() => setHoverdNavItem(link.label)}
              href={link.href}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default HeaderNavList;
