"use client";

import { ReactLenis as Lenis } from "@studio-freight/react-lenis";

export function ReactLenis({ children }: { children: React.ReactNode }) {
    return (
        <Lenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
            {children}
        </Lenis>
    );
}
