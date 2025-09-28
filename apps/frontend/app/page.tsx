"use client";
import React, { useEffect, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { 
  Palette, Users, Download, Zap, ArrowRight, Github, 
  Play, Layers, Share2 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

const AnimatedSection = ({
  children,
  className = '',
  id
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) => {
  const controls = useAnimation();
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
      }}
      className={className}
      id={id}
    >
      {children}
    </motion.div>
  );
};

const DrawingCursor = ({ x, y, name }: { x: string; y: string; name: string }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left: x, top: y }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: 1, 
      scale: 1,
      x: [0, 10, -5, 8, 0],
      y: [0, -8, 15, -3, 0]
    }}
    transition={{ 
      opacity: { duration: 0.3, delay: 1.2 },
      scale: { duration: 0.3, delay: 1.2 },
      x: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 },
      y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }
    }}
  >
    <div className="w-3 h-3 bg-gray-200 rounded-full border border-gray-900 shadow-sm" />
    <div className="absolute -top-6 -left-2 bg-white text-gray-900 text-xs px-2 py-1 rounded whitespace-nowrap">
      {name}
    </div>
  </motion.div>
);

function LandingPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Palette className="w-4 h-4 text-gray-900" />
              </div>
              <span className="text-xl font-semibold text-white">DrawFlow</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              {['Features', 'Demo', 'Pricing'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {item}
                </a>
              ))}
              <button className="bg-white text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm" onClick={() => router.push(`/canvas/${uuidv4()}`)}>
                Try Now
              </button>
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center space-x-2 bg-gray-800 px-3 py-1 rounded-full border border-gray-700 mb-8">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-400">Real-time collaboration</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-light text-white mb-6 leading-tight">
              Sketch Ideas That
              <span className="block font-normal">Come to Life</span>
            </h1>

            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Create beautiful hand-drawn style diagrams and wireframes. 
              Collaborate in real-time and export anywhere.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-white text-gray-900 px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-gray-200 transition-colors">
                <span>Start Drawing Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button className="border border-gray-700 text-gray-300 px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-gray-800 transition-colors">
                <Github className="w-4 h-4" />
                <span>View on GitHub</span>
              </button>
            </div>
          </motion.div>
          
          {/* Demo Preview */}
          <motion.div 
            className="mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="bg-black rounded-xl border border-gray-800 overflow-hidden mx-auto max-w-4xl">
              <div className="bg-gray-900 px-4 py-3 border-b border-gray-800 flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full" />
                <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                <div className="w-3 h-3 bg-green-400 rounded-full" />
                <span className="ml-4 text-sm text-gray-500">DrawFlow - Collaborative Drawing</span>
                <div className="ml-auto flex items-center space-x-2">
                  <div className="flex -space-x-1">
                    <div className="w-5 h-5 bg-blue-500 rounded-full border border-gray-900 text-xs flex items-center justify-center text-white font-medium">A</div>
                    <div className="w-5 h-5 bg-green-500 rounded-full border border-gray-900 text-xs flex items-center justify-center text-white font-medium">S</div>
                    <div className="w-5 h-5 bg-purple-500 rounded-full border border-gray-900 text-xs flex items-center justify-center text-white font-medium">J</div>
                  </div>
                  <span className="text-xs text-gray-500">3 online</span>
                </div>
              </div>
              <div className="h-80 bg-black relative overflow-hidden">
                {/* Simple Drawing Elements */}
                <motion.svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 400 300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <motion.rect
                    x="50"
                    y="100"
                    width="80"
                    height="50"
                    fill="none"
                    stroke="#9CA3AF"
                    strokeWidth="2"
                    rx="4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 1, duration: 1, ease: "easeInOut" }}
                  />
                  <motion.circle
                    cx="280"
                    cy="125"
                    r="25"
                    fill="none"
                    stroke="#9CA3AF"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 1.5, duration: 0.8, ease: "easeInOut" }}
                  />
                  <motion.path
                    d="M140 125 L245 125"
                    stroke="#9CA3AF"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrow)"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 2, duration: 0.6, ease: "easeInOut" }}
                  />
                  <defs>
                    <marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                      <polygon points="0 0, 8 3, 0 6" fill="#9CA3AF" />
                    </marker>
                  </defs>
                </motion.svg>

                {/* User Cursors */}
                <DrawingCursor x="20%" y="40%" name="Alex" />
                <DrawingCursor x="65%" y="30%" name="Sam" />
                <DrawingCursor x="45%" y="60%" name="Jo" />

                {/* Play Button - only show when not playing */}
                {!isPlaying && (
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: isPlaying ? 0 : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <button
                      className="bg-gray-800 rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-700 hover:scale-105"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      <Play className="w-6 h-6 text-gray-200 ml-1" fill="currentColor" />
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <AnimatedSection className="py-20 bg-black" id="features">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light text-white mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Simple tools designed to help you create and collaborate effortlessly.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Palette,
                title: "Hand-drawn Style",
                description: "Natural, sketchy aesthetic that makes diagrams feel approachable and engaging."
              },
              {
                icon: Users,
                title: "Real-time Collaboration",
                description: "Work together seamlessly. See changes and cursors as they happen."
              },
              {
                icon: Download,
                title: "Export Anywhere",
                description: "Save as PNG, SVG, or PDF. Perfect for presentations and documentation."
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Built for performance. No lag, just smooth and responsive drawing."
              },
              {
                icon: Layers,
                title: "Infinite Canvas",
                description: "Never run out of space. Pan and zoom without boundaries."
              },
              {
                icon: Share2,
                title: "Easy Sharing",
                description: "Share with a link. Control access and collaborate with anyone."
              }
            ].map((feature) => {
              const isComingSoon = ['Export Anywhere', 'Infinite Canvas', 'Easy Sharing'].includes(feature.title);
              
              return (
                <div
                  key={feature.title}
                  className={`text-center p-6 transition-opacity ${isComingSoon ? 'opacity-50' : ''}`}
                >
                  <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <feature.icon className="w-6 h-6 text-gray-200" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2 flex items-center justify-center h-7">
                    <span>{feature.title}</span>
                    {isComingSoon && (
                      <span className="ml-2 text-xs bg-blue-600 text-white font-semibold px-2 py-0.5 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection className="py-20">
        <div className="max-w-2xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-light text-white mb-4">
            Ready to start creating?
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Join creators who use DrawFlow to bring their ideas to life.
          </p>
          <button className="bg-white text-gray-900 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 mx-auto">
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </AnimatedSection>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                <Palette className="w-4 h-4 text-black" />
              </div>
              <span className="font-semibold text-white">DrawFlow</span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-400">&copy; 2025 DrawFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;