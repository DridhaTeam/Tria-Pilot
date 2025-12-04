"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

const values = [
    {
        title: "Kindness",
        description:
            "We believe in technology that amplifies our humanity. Kindness is not just a value; it's the lens through which we build every interaction, ensuring our AI serves with empathy and understanding.",
    },
    {
        title: "Trust",
        description:
            "Trust is earned through transparency and consistency. We build systems that are reliable, secure, and explainable, so you can confidently integrate AI into your daily life.",
    },
    {
        title: "Quality",
        description:
            "Excellence is our baseline. We strive for precision in every algorithm and elegance in every interface, delivering experiences that feel polished, professional, and profound.",
    },
    {
        title: "Simplicity",
        description:
            "Complexity should be hidden, not imposed. Our goal is to make advanced intelligence feel intuitive and effortless, removing barriers between you and your potential.",
    },
];

export default function ValuesScroll() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeValue, setActiveValue] = useState(0);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    const smoothProgress = useSpring(scrollYProgress, { damping: 20, stiffness: 100 });

    // Update active value based on scroll
    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (latest) => {
            const index = Math.min(
                Math.floor(latest * values.length),
                values.length - 1
            );
            setActiveValue(index);
        });
        return () => unsubscribe();
    }, [scrollYProgress]);

    return (
        <section ref={containerRef} className="relative h-[300vh] bg-cream">
            <div className="sticky top-0 h-screen flex items-center overflow-hidden">
                <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 w-full h-full items-center">

                    {/* Left Column: Sticky List */}
                    <div className="relative flex flex-col justify-center h-full">
                        <div className="space-y-8 relative z-10">
                            {values.map((value, index) => (
                                <motion.div
                                    key={index}
                                    animate={{
                                        opacity: activeValue === index ? 1 : 0.3,
                                        x: activeValue === index ? 20 : 0,
                                    }}
                                    transition={{ duration: 0.5 }}
                                    className="cursor-pointer"
                                    onClick={() => {
                                        // Scroll to section logic could go here
                                    }}
                                >
                                    <h3 className="text-4xl md:text-6xl font-serif text-charcoal">
                                        {value.title}
                                    </h3>
                                </motion.div>
                            ))}
                        </div>

                        {/* SVG Connector (Simplified for demo) */}
                        <svg className="absolute top-0 right-0 h-full w-24 pointer-events-none hidden md:block" style={{ right: "-3rem" }}>
                            <motion.path
                                d="M 0,50 C 50,50 50,50 100,50"
                                // This would need complex calculation to match active item position
                                // For now, we'll use a simple indicator line
                                className="stroke-peach stroke-[3px] fill-none"
                            />
                        </svg>
                        <motion.div
                            className="absolute left-0 w-1 bg-peach rounded-full"
                            style={{
                                top: `calc(50% - 100px + ${activeValue * 80}px)`, // Approximate position
                                height: 60,
                            }}
                            layoutId="activeIndicator"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />

                    </div>

                    {/* Right Column: Content */}
                    <div className="relative h-full flex items-center">
                        <div className="relative w-full h-64 overflow-hidden">
                            {values.map((value, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{
                                        opacity: activeValue === index ? 1 : 0,
                                        y: activeValue === index ? 0 : 50,
                                        pointerEvents: activeValue === index ? "auto" : "none"
                                    }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute inset-0 flex items-center"
                                >
                                    <p className="text-xl md:text-2xl text-charcoal/80 font-sans leading-relaxed">
                                        {value.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
