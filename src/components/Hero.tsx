"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
            {/* Fluid Gradient Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-peach/30 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-orange-200/30 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
                <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] bg-cream rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-6 text-center z-10">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.2,
                                delayChildren: 0.3,
                            },
                        },
                    }}
                >
                    <motion.h1
                        variants={{
                            hidden: { opacity: 0, y: 40 },
                            visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } },
                        }}
                        className="text-6xl md:text-8xl lg:text-9xl font-serif text-charcoal tracking-tight leading-[0.9]"
                    >
                        AI-Powered <br />
                        <span className="italic">Fashion Try-On</span>
                    </motion.h1>

                    <motion.p
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } },
                        }}
                        className="mt-8 text-lg md:text-xl text-charcoal/70 max-w-2xl mx-auto font-sans"
                    >
                        Connect influencers and brands with virtual try-on capabilities, intelligent ad generation, and seamless collaboration.
                    </motion.p>

                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } },
                        }}
                        className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link
                            href="/register"
                            className="px-8 py-4 bg-charcoal text-cream text-sm font-medium rounded-full hover:bg-charcoal/90 transition-colors"
                        >
                            Get Started Free
                        </Link>
                        <Link
                            href="/login"
                            className="px-8 py-4 border border-charcoal/20 text-charcoal text-sm font-medium rounded-full hover:bg-charcoal/5 transition-colors"
                        >
                            Log In
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
