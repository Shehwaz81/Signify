'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50 dark:from-gray-900 dark:to-black transition-all duration-700 ease-in-out">
      {/* Hero Section */}
      <section className="pt-32 pb-24 text-center overflow-hidden relative">
        {/* Enhanced animated background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            initial={{ scale: 1.1, opacity: 0.2 }}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-indigo-300 via-purple-400 to-pink-400 dark:from-indigo-700 dark:via-purple-900 dark:to-pink-900 rounded-full filter blur-3xl transform -translate-x-1/2"
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative z-10 mx-auto max-w-4xl px-6"
        >
          {/* Enhanced title with gradient text */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8, type: "spring", stiffness: 100 }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-7xl font-extrabold leading-tight">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Effortless Sign Language
              </span>
              <br />
              <span className="bg-gradient-to-r from-pink-600 via-red-600 to-orange-600 bg-clip-text text-transparent">
                Translation
              </span>
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12"
          >
            Experience the future of communication with AI-powered recognition of ASL gestures, 
            including moving letters (J, Z) and common gestures like HELLO and THANK_YOU
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-col sm:flex-row justify-center gap-6"
          >
            <motion.a
              href="/real-time-sign"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(99, 102, 241, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🚀
                </motion.div>
                Try Real-Time Recognition
              </span>
            </motion.a>
            
            <motion.a
              href="/emotion"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(236, 72, 153, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-10 py-5 border-2 border-pink-500 text-pink-600 dark:text-pink-400 rounded-2xl font-bold text-lg hover:bg-pink-500 hover:text-white transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  😊
                </motion.div>
                Emotion Detection
              </span>
            </motion.a>
          </motion.div>
        </motion.div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl"
            >
              <div className="text-4xl mb-4">🎥</div>
              <h3 className="text-xl font-semibold mb-2">Capture</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Use your camera to capture sign language gestures in real-time
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl"
            >
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">Analyze</h3>
              <p className="text-gray-600 dark:text-gray-300">
                AI processes gestures using Google's MediaPipe technology
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl"
            >
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">Translate</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get instant text translation of your sign language gestures
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
