"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";

const products = [
    { id: "copilot", label: "Copilot", image: "https://images.unsplash.com/photo-1684369175836-8344718a932c?q=80&w=1000&auto=format&fit=crop" },
    { id: "bing", label: "Bing", image: "https://images.unsplash.com/photo-1633259584604-afbc29b18087?q=80&w=1000&auto=format&fit=crop" },
    { id: "edge", label: "Edge", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop" },
    { id: "groupme", label: "GroupMe", image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop" },
];

export default function ProductSwitcher() {
    const [activeTab, setActiveTab] = useState(products[0].id);

    return (
        <section className="py-20 container mx-auto px-6">
            <div className="flex flex-col items-center">
                <div className="flex p-1 bg-white/50 backdrop-blur-sm rounded-full border border-subtle mb-12">
                    {products.map((product) => (
                        <button
                            key={product.id}
                            onClick={() => setActiveTab(product.id)}
                            className={cn(
                                "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                                activeTab === product.id
                                    ? "bg-white shadow-sm text-charcoal"
                                    : "text-charcoal/60 hover:text-charcoal"
                            )}
                        >
                            {product.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden bg-gray-100 shadow-2xl">
                    <AnimatePresence mode="wait">
                        {products.map(
                            (product) =>
                                product.id === activeTab && (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, scale: 1.02 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute inset-0"
                                    >
                                        <Image
                                            src={product.image}
                                            alt={product.label}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/20" />
                                        <div className="absolute bottom-0 left-0 p-12">
                                            <h3 className="text-4xl font-serif text-white mb-4">{product.label}</h3>
                                            <p className="text-white/80 max-w-md">
                                                Experience the power of AI with {product.label}. Redefining productivity and creativity.
                                            </p>
                                        </div>
                                    </motion.div>
                                )
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
