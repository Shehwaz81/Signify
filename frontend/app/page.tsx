'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/app/components/navbar'; // Adjust this import path as needed

// Basic face detection using FaceDetector API (experimental)
export default function HomePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function initWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Webcam access error:', err);
      }
    }

    function detectFaces() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!video || !canvas || !ctx) return;

      if (!(window as any).FaceDetector) {
        console.warn('FaceDetector API is not supported in this browser.');
        return;
      }
      const faceDetector = new (window as any).FaceDetector({ fastMode: true });
      const drawLoop = async () => {
        if (video.readyState === 4) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          try {
            const faces = await faceDetector.detect(video);
            faces.forEach((face: any) => {
              const { x, y, width, height } = face.boundingBox;
              ctx.strokeStyle = '#4F46E5';
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.lineJoin = 'round';
              ctx.strokeRect(x, y, width, height);
            });
          } catch (e) {
            console.error('Face detection failed:', e);
          }
        }
        requestAnimationFrame(drawLoop);
      };
      drawLoop();
    }

    initWebcam().then(detectFaces);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50 dark:from-gray-900 dark:to-black transition-all duration-700 ease-in-out">
      {/* Use your updated Navbar component here */}
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-24 text-center overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            initial={{ scale: 1.1, opacity: 0.2 }}
            animate={{ scale: 1, opacity: 0.1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute top-0 left-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-indigo-300 to-purple-400 dark:from-indigo-700 dark:to-purple-900 rounded-full filter blur-3xl transform -translate-x-1/2"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative z-10 mx-auto max-w-3xl px-6"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Effortless Sign Language Translation
          </h1>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Real-time AI-powered conversion of hand gestures into text — bridging communication gaps with elegant precision.
          </p>
          <div className="mt-10 flex justify-center gap-6">
            <motion.a
              href="/#demo"
              whileHover={{ scale: 1.05 }}
              className="px-8 py-4 bg-indigo-600 text-white rounded-full font-semibold shadow-xl hover:bg-indigo-500 transition-all duration-300"
            >
              See Demo
            </motion.a>
            <motion.a
              href="/#explore"
              whileHover={{ scale: 1.05 }}
              className="px-8 py-4 border-2 border-indigo-600 text-indigo-600 rounded-full font-semibold hover:bg-indigo-600 hover:text-white transition-all duration-300"
            >
              Explore Features
            </motion.a>
          </div>
        </motion.div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            Live Demo Showcase
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Experience Signify’s real-time sign-to-text conversion in action.
          </p>
          <div className="mt-8 aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden shadow-2xl">
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Live Demo"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* Explore Section */}
      <section id="explore" className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 grid gap-12 md:grid-cols-3">
          {[
            { title: 'Real-Time Precision', desc: 'Instant text output for every gesture.' },
            { title: 'Robust Accuracy', desc: 'AI model optimized to 99%+ reliability.' },
            { title: 'Seamless Integration', desc: 'Embed into apps & devices effortlessly.' },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              whileHover={{ scale: 1.03 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 + 0.4 }}
              className="relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl transition-all duration-500"
            >
              <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-700 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 dark:text-indigo-200 font-bold">{i + 1}</span>
              </div>
              <h3 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">
                {f.title}
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Webcam Section */}
      <section id="webcam" className="py-24 bg-white dark:bg-gray-800 transition-colors duration-500">
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold text-gray-900 dark:text-white"
          >
            Live Webcam Face Detection
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-4 text-gray-600 dark:text-gray-300"
          >
            Stream your webcam and see faces highlighted in real-time.
          </motion.p>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-10 mx-auto relative max-w-full rounded-3xl overflow-hidden shadow-2xl ring-4 ring-indigo-200 dark:ring-indigo-700"
            style={{ aspectRatio: '16/9' }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
            />
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-indigo-600 transition-colors duration-500">
        <div className="max-w-3xl mx-auto px-6 text-center text-white">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold">
            Get in Touch
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-4">
            Questions? Feedback? Let’s connect!
          </motion.p>
          <form className="mt-8 grid gap-6">
            <input type="text" placeholder="Name" className="w-full p-4 rounded-xl text-gray-900" />
            <input type="email" placeholder="Email" className="w-full p-4 rounded-xl text-gray-900" />
            <textarea rows={4} placeholder="Message" className="w-full p-4 rounded-xl text-gray-900" />
            <motion.button
              whileHover={{ scale: 1.05 }}
              type="submit"
              className="w-full px-6 py-4 bg-white text-indigo-600 rounded-full font-semibold shadow-xl hover:shadow-none transition-all duration-300"
            >
              Send Message
            </motion.button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} Signify Inc. All rights reserved.
      </footer>
    </div>
  );
}

