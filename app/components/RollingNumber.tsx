"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface RollingNumberProps {
    value: number;
    className?: string;
}

const variants = {
    initial: (dir: number) => ({
        y: dir > 0 ? "100%" : "-100%",
    }),
    animate: {
        y: "0%",
    },
    exit: (dir: number) => ({
        y: dir > 0 ? "-100%" : "100%",
    }),
};


export default function RollingNumber({ value, className = "" }: RollingNumberProps) {
    const [prevValue, setPrevValue] = useState(value);
    const [direction, setDirection] = useState(1);
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        if (value !== prevValue) {
            setDirection(value > prevValue ? 1 : -1);
            setPrevValue(value);
        }
    }, [value, prevValue]);

    if (shouldReduceMotion) {
        return (
            <span className={`relative inline-flex items-center justify-center align-middle tabular-nums ${className}`}>
                <span className="inline-flex items-center justify-center leading-none select-none">
                    {value}
                </span>
            </span>
        );
    }

    return (
        <span className={`relative inline-flex items-center justify-center overflow-hidden h-[1.3em] min-w-[1.2ch] align-middle tabular-nums ${className}`}>
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                <motion.span
                    key={value}
                    custom={direction}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{
                        type: "spring",
                        stiffness: 450,
                        damping: 32,
                        mass: 0.6,
                    }}
                    className="inline-flex items-center justify-center leading-none select-none"
                >
                    {value}
                </motion.span>
            </AnimatePresence>
        </span>
    );
}
