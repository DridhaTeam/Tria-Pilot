'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Menu,
    X,
    LogOut,
    Sparkles,
    Camera,
    ShoppingBag,
    LayoutDashboard,
    Mail,
    User,
    Box,
    Megaphone,
    Home,
} from 'lucide-react'
import { useUser } from '@/lib/react-query/hooks'

export default function Header() {
    const pathname = usePathname()
    const router = useRouter()
    const { data: user, isLoading } = useUser()
    const [scrolled, setScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Hide on auth pages
    const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register')

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    if (isAuthPage) {
        return null
    }

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', { method: 'POST' })
            if (response.ok) {
                router.push('/login')
                router.refresh()
            }
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    // Navigation links based on auth state and role
    const influencerLinks = [
        { href: '/influencer/try-on', label: 'Try-On Studio', icon: Camera },
        { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
        { href: '/influencer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/inbox', label: 'Inbox', icon: Mail },
        { href: '/profile', label: 'Profile', icon: User },
    ]

    const brandLinks = [
        { href: '/brand/marketplace', label: 'Marketplace', icon: ShoppingBag },
        { href: '/brand/products', label: 'Products', icon: Box },
        { href: '/brand/campaigns', label: 'Campaigns', icon: Megaphone },
        { href: '/inbox', label: 'Inbox', icon: Mail },
        { href: '/profile', label: 'Profile', icon: User },
    ]

    const publicLinks = [
        { href: '#features', label: 'Features' },
        { href: '#try-on', label: 'Virtual Try-On' },
        { href: '#brands', label: 'For Brands' },
        { href: '#influencers', label: 'For Influencers' },
    ]

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/')
    const links = user?.role === 'BRAND' ? brandLinks : user?.role === 'INFLUENCER' ? influencerLinks : []
    const userInitial = user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? 'bg-cream/80 backdrop-blur-lg border-b border-subtle/50'
                    : 'bg-transparent'
                }`}
        >
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="text-2xl font-serif font-bold text-charcoal">
                        TRIA
                    </Link>

                    {/* Desktop Navigation */}
                    {user ? (
                        // Logged in navigation
                        <nav className="hidden md:flex items-center gap-1">
                            {links.map((link) => {
                                const Icon = link.icon
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${isActive(link.href)
                                                ? 'bg-charcoal text-cream'
                                                : 'text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {link.label}
                                    </Link>
                                )
                            })}
                        </nav>
                    ) : (
                        // Public navigation
                        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-charcoal/70">
                            {publicLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="hover:text-charcoal transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    )}

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                {/* User Avatar */}
                                <div className="hidden md:flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-peach to-orange-300 flex items-center justify-center text-charcoal font-semibold">
                                        {userInitial}
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 text-sm text-charcoal/70 hover:text-charcoal transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="hidden md:flex items-center gap-4">
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-charcoal/80 hover:text-charcoal transition-colors"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-5 py-2 bg-charcoal text-cream text-sm font-medium rounded-full hover:bg-charcoal/90 transition-colors"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-2"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6 text-charcoal" />
                            ) : (
                                <Menu className="w-6 h-6 text-charcoal" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-cream border-t border-subtle"
                    >
                        <div className="container mx-auto px-6 py-6 space-y-4">
                            {user ? (
                                <>
                                    {/* User Info */}
                                    <div className="flex items-center gap-3 pb-4 border-b border-subtle">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-peach to-orange-300 flex items-center justify-center text-charcoal font-semibold text-lg">
                                            {userInitial}
                                        </div>
                                        <div>
                                            <p className="font-medium text-charcoal">{user.name || user.email}</p>
                                            <p className="text-sm text-charcoal/60">{user.role}</p>
                                        </div>
                                    </div>

                                    {/* Nav Links */}
                                    {links.map((link) => {
                                        const Icon = link.icon
                                        return (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive(link.href)
                                                        ? 'bg-charcoal text-cream'
                                                        : 'text-charcoal/70 hover:bg-charcoal/5'
                                                    }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                                {link.label}
                                            </Link>
                                        )
                                    })}

                                    <button
                                        onClick={() => {
                                            handleLogout()
                                            setMobileMenuOpen(false)
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    {publicLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block px-4 py-3 text-charcoal/70 hover:text-charcoal transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                    <div className="pt-4 border-t border-subtle space-y-3">
                                        <Link
                                            href="/login"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block w-full py-3 text-center text-charcoal font-medium rounded-full border border-subtle hover:bg-charcoal/5 transition-colors"
                                        >
                                            Log In
                                        </Link>
                                        <Link
                                            href="/register"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block w-full py-3 text-center bg-charcoal text-cream font-medium rounded-full hover:bg-charcoal/90 transition-colors"
                                        >
                                            Get Started
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    )
}
