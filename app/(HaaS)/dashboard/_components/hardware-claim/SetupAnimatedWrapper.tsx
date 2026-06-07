"use client";

import { motion, AnimatePresence } from "framer-motion";


interface SetupAnimatedWrapperProps {
    isComplete: boolean;
    children: React.ReactNode;
}

export function SetupAnimatedWrapper({ isComplete, children }: SetupAnimatedWrapperProps) {
    return (
        <>
            <AnimatePresence>
                {!isComplete && (
                    <motion.div
                        className="w-full"
                        initial={{ opacity: 1, height: "auto" }}
                        exit={{
                            opacity: 0,
                            height: 0,
                            overflow: "hidden",
                            marginTop: 0,
                            marginBottom: 0
                        }}
                        transition={{
                            duration: 0.8,
                            ease: "easeInOut"
                        }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
