'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Sun, Moon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Demo', href: '/#demo' },
  { name: 'Explore', href: '/#explore' },
  { name: 'Emotion AI', href: '/emotion' },
  { name: 'ASL Translator', href: '/asl' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname() || '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -120 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className={`fixed top-0 w-full z-50 backdrop-blur-lg transition-colors duration-500 ease-in-out ${
        scrolled
          ? 'bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 shadow-2xl'
          : 'bg-white/60 dark:bg-black/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-10 flex justify-between items-center h-16">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Link href="/" className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            Signify
          </Link>
        </motion.div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map(link => {
            const active = pathname === link.href.split('#')[0];
            const special = link.name === 'Emotion AI' || link.name === 'ASL Translator';
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative text-sm font-semibold transition-all duration-300 ${
                  active
                    ? 'text-white after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-white'
                    : special
                      ? 'text-indigo-600 dark:text-indigo-300 hover:text-red-500'
                      : 'text-gray-800 dark:text-gray-200 hover:text-white'
                }`}
              >
                {link.name}
                {special && (
                  <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-red-500 hover:w-full transition-all duration-500 rounded-full"></span>
                )}
              </Link>
            );
          })}

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-yellow-300" />
            ) : (
              <Moon className="h-5 w-5 text-gray-800" />
            )}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setOpen(o => !o)} aria-label="Toggle menu" className="p-2">
            <motion.div animate={open ? 'open' : 'closed'}>
              <motion.span
                className="block w-6 h-0.5 bg-gray-800 dark:bg-gray-200 mb-1"
                variants={{ closed: { rotate: 0, y: 0 }, open: { rotate: 45, y: 6 } }}
              />
              <motion.span
                className="block w-6 h-0.5 bg-gray-800 dark:bg-gray-200 mb-1"
                variants={{ closed: { opacity: 1 }, open: { opacity: 0 } }}
              />
              <motion.span
                className="block w-6 h-0.5 bg-gray-800 dark:bg-gray-200"
                variants={{ closed: { rotate: 0, y: 0 }, open: { rotate: -45, y: -6 } }}
              />
            </motion.div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="md:hidden fixed inset-0 bg-indigo-700/95 backdrop-blur-lg p-6 flex flex-col"
          >
            <button onClick={() => setOpen(false)} className="self-end mb-8 p-2">
              <X className="h-6 w-6 text-white" />
            </button>
            <ul className="flex-grow space-y-6">
              {navLinks.map((link, idx) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`text-xl font-semibold transition-colors duration-300 ${
                      link.name === 'Emotion AI' || link.name === 'ASL Translator'
                        ? 'text-red-400 hover:text-red-600'
                        : 'text-white hover:text-indigo-200'
                    }`}
                  >
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="mt-auto flex justify-center">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-300" /> : <Moon className="h-5 w-5 text-white" />}
                <span className="text-white font-medium">Theme</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}