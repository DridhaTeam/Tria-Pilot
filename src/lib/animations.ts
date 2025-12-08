'use client'

import { Variants } from 'framer-motion'

// ============================================
// ANIMATION VARIANTS
// Centralized animation configurations for consistent UX
// ============================================

// Page Transitions
export const pageVariants: Variants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
        },
    },
}

// Stagger container for lists
export const staggerContainer: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1,
        },
    },
}

// Individual list items
export const staggerItem: Variants = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.95,
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
        },
    },
}

// Card hover effects
export const cardHover: Variants = {
    initial: {
        scale: 1,
        y: 0,
    },
    hover: {
        scale: 1.02,
        y: -4,
        transition: {
            duration: 0.2,
            ease: 'easeOut',
        },
    },
    tap: {
        scale: 0.98,
        transition: {
            duration: 0.1,
        },
    },
}

// Button interactions
export const buttonVariants: Variants = {
    initial: {
        scale: 1,
    },
    hover: {
        scale: 1.02,
        transition: {
            duration: 0.15,
            ease: 'easeOut',
        },
    },
    tap: {
        scale: 0.98,
        transition: {
            duration: 0.1,
        },
    },
}

// Modal/Dialog animations
export const modalVariants: Variants = {
    initial: {
        opacity: 0,
        scale: 0.95,
        y: 10,
    },
    animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.2,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: 10,
        transition: {
            duration: 0.15,
        },
    },
}

// Overlay/backdrop fade
export const overlayVariants: Variants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { duration: 0.2 },
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.15 },
    },
}

// Fade in animation
export const fadeIn: Variants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { duration: 0.3 },
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.2 },
    },
}

// Slide up animation
export const slideUp: Variants = {
    initial: {
        opacity: 0,
        y: 30,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: { duration: 0.2 },
    },
}

// Scale fade animation
export const scaleFade: Variants = {
    initial: {
        opacity: 0,
        scale: 0.9,
    },
    animate: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    exit: {
        opacity: 0,
        scale: 0.9,
        transition: { duration: 0.2 },
    },
}

// Image loading animation
export const imageLoad: Variants = {
    initial: {
        opacity: 0,
        filter: 'blur(10px)',
    },
    animate: {
        opacity: 1,
        filter: 'blur(0px)',
        transition: {
            duration: 0.4,
            ease: 'easeOut',
        },
    },
}

// Toast notification animation
export const toastVariants: Variants = {
    initial: {
        opacity: 0,
        y: 50,
        scale: 0.9,
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    exit: {
        opacity: 0,
        y: 20,
        scale: 0.9,
        transition: { duration: 0.2 },
    },
}

// ============================================
// ANIMATION HELPERS
// ============================================

// Transition presets
export const transitions = {
    spring: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
    },
    smooth: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
    },
    fast: {
        duration: 0.15,
        ease: 'easeOut',
    },
    slow: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
    },
} as const

// Hover/tap props for motion components
export const interactiveProps = {
    whileHover: 'hover',
    whileTap: 'tap',
    initial: 'initial',
    animate: 'initial',
}

// Card interaction props
export const cardInteraction = {
    variants: cardHover,
    initial: 'initial',
    whileHover: 'hover',
    whileTap: 'tap',
}

// Button interaction props
export const buttonInteraction = {
    variants: buttonVariants,
    initial: 'initial',
    whileHover: 'hover',
    whileTap: 'tap',
}
