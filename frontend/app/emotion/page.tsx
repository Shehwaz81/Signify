'use client';

import { motion } from 'framer-motion';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/solid'; // Using an example icon from Heroicons

export default function AiFeature1Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50 dark:from-gray-900 dark:to-black flex items-center justify-center transition-all duration-700 ease-in-out p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center max-w-2xl mx-auto bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-2xl ring-4 ring-indigo-100 dark:ring-indigo-700"
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6 text-indigo-600 dark:text-indigo-400"
        >
          <WrenchScrewdriverIcon className="h-20 w-20 mx-auto" />
        </motion.div>
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4"
        >
          This AI Feature is Under Development
        </motion.h1>
        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-lg text-gray-600 dark:text-gray-300 mb-8"
        >
          We're actively working on bringing this exciting functionality to you. Please check back later for updates!
        </motion.p>
        <motion.a
          href="/"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-indigo-600 text-white rounded-full font-semibold shadow-lg hover:bg-indigo-500 transition-colors duration-300"
        >
          Go back to Home
        </motion.a>
      </motion.div>
    </div>
  );
}
