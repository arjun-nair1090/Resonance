"use client";

import { HTMLMotionProps, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    glowOnHover?: boolean;
}

export function GlassCard({
    children,
    className,
    glowOnHover = true,
    ...props
}: GlassCardProps) {
    return (
        <motion.div
            className={cn(
                "relative overflow-hidden rounded-2xl glass-panel transition-all duration-500",
                glowOnHover &&
                "hover:border-white/20 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]",
                className
            )}
            whileHover={glowOnHover ? { y: -5, scale: 1.02 } : {}}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            {...props}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            {children}
        </motion.div>
    );
}
