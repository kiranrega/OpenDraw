'use client';

import React, { useEffect, useState } from 'react';
import { motion, useAnimation, useInView, Variants } from 'framer-motion';
import { 
  Palette, Users, Download, Zap, ArrowRight, CheckCircle, Star, Github, 
  Twitter, Play, Sparkles, Layers, Share2, Lock, Smartphone 
} from 'lucide-react';

const AnimatedSection = ({ id, children, className = '' }: {id?:string, children: React.ReactNode, className?: string }) => {
  const controls = useAnimation();
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

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
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const FloatingShape = ({ delay = 0, children }: { delay?: number, children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ 
      opacity: 1, 
      y: [20, -10, 20],
      rotate: [0, 2, -2, 0]
    }}
    transition={{ 
      opacity: { delay, duration: 0.6 },
      y: { delay: delay + 0.5, duration: 4, repeat: Infinity, ease: "easeInOut" },
      rotate: { delay: delay + 0.7, duration: 6, repeat: Infinity, ease: "easeInOut" }
    }}
    className="absolute"
  >
    {children}
  </motion.div>
);

const DrawingCursor = ({ x, y, color, name }: { x: string, y: string, color: string, name: string }) => (
  <motion.div
    className="absolute"
    style={{ left: x, top: y }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: 1, 
      scale: 1,
      x: [0, 20, -10, 15, 0],
      y: [0, -15, 25, -10, 0]
    }}
    transition={{ 
      opacity: { duration: 0.3 },
      scale: { duration: 0.3 },
      x: { duration: 3, repeat: Infinity, ease: "easeInOut" },
      y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
    }}
  >
    <div className={`w-4 h-4 ${color} rounded-full border-2 border-white shadow-lg`} />
    <div className="absolute -top-8 -left-2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
      {name}
    </div>
  </motion.div>
);

function LandingPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants:Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 overflow-x-hidden">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">DrawFlow</span>
            </motion.div>
            <nav className="hidden md:flex items-center space-x-8">
              {['Features', 'Demo', 'Pricing'].map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-slate-300 hover:text-white transition-colors"
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  {item}
                </motion.a>
              ))}
              <motion.button 
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-200"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(99, 102, 241, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                Try Now
              </motion.button>
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        {/* Floating Background Elements */}
        <FloatingShape delay={0}>
          <div className="w-20 h-20 bg-indigo-500/20 rounded-full blur-xl opacity-60" style={{ top: '10%', left: '10%' }} />
        </FloatingShape>
        <FloatingShape delay={0.2}>
          <div className="w-16 h-16 bg-purple-500/20 rounded-lg blur-xl opacity-60" style={{ top: '20%', right: '15%' }} />
        </FloatingShape>
        <FloatingShape delay={0.4}>
          <div className="w-12 h-12 bg-emerald-500/20 rounded-full blur-xl opacity-60" style={{ bottom: '30%', left: '20%' }} />
        </FloatingShape>
        <FloatingShape delay={0.6}>
          <div className="w-14 h-14 bg-teal-500/20 rounded-lg blur-xl opacity-60" style={{ bottom: '20%', right: '10%' }} />
        </FloatingShape>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            className="text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-medium text-purple-200">New: Real-time collaboration is here!</span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
            >
              Sketch Ideas That
              <motion.span 
                className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent block"
                initial={{ backgroundPosition: "0% 50%" }}
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                Come to Life
              </motion.span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-xl text-purple-200 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Create beautiful hand-drawn style diagrams and wireframes. Collaborate in real-time, 
              export anywhere, and bring your ideas to life with our intuitive drawing tool.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.button 
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl flex items-center space-x-2 text-lg font-semibold"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 15px 30px rgba(99, 102, 241, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <span>Start Drawing Free</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </motion.button>

              <motion.button 
                className="border-2 border-slate-600/50 text-slate-300 px-8 py-4 rounded-xl flex items-center space-x-2 text-lg font-semibold bg-slate-800/60 backdrop-blur-sm"
                whileHover={{ 
                  scale: 1.05,
                  borderColor: "#64748B",
                  backgroundColor: "rgba(51, 65, 85, 0.8)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Github className="w-5 h-5" />
                <span>View on GitHub</span>
              </motion.button>
            </motion.div>
          </motion.div>
          
          {/* Interactive Demo Preview */}
          <motion.div 
            className="mt-16"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
          >
            <motion.div 
              className="backdrop-blur-2xl bg-white/10 rounded-2xl border border-white/20 shadow-2xl overflow-hidden mx-auto max-w-4xl"
              whileHover={{ y: -5, boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="bg-slate-800/60 px-6 py-4 border-b border-slate-600/50 flex items-center space-x-2">
                <motion.div className="w-3 h-3 bg-red-500 rounded-full" whileHover={{ scale: 1.2 }} />
                <motion.div className="w-3 h-3 bg-yellow-500 rounded-full" whileHover={{ scale: 1.2 }} />
                <motion.div className="w-3 h-3 bg-green-500 rounded-full" whileHover={{ scale: 1.2 }} />
                <span className="ml-4 text-sm text-slate-300">DrawFlow - Collaborative Drawing</span>
                <motion.div 
                  className="ml-auto flex items-center space-x-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 bg-indigo-500 rounded-full border-2 border-white" />
                    <div className="w-6 h-6 bg-emerald-500 rounded-full border-2 border-white" />
                    <div className="w-6 h-6 bg-purple-500 rounded-full border-2 border-white" />
                  </div>
                  <span className="text-xs text-slate-400">3 users online</span>
                </motion.div>
              </div>
              <div className="h-80 bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
                {/* Animated Drawing Elements */}
                <motion.svg
                  className="absolute inset-0 w-full h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <motion.rect
                    x="50"
                    y="60"
                    width="120"
                    height="80"
                    fill="none"
                    stroke="#6366F1"
                    strokeWidth="2"
                    rx="8"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ delay: 1.2, duration: 1.5, ease: "easeInOut" }}
                  />
                  <motion.circle
                    cx="300"
                    cy="100"
                    r="40"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ delay: 1.8, duration: 1.2, ease: "easeInOut" }}
                  />
                  <motion.path
                    d="M180 100 L250 100"
                    stroke="#10B981"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ delay: 2.5, duration: 0.8, ease: "easeInOut" }}
                  />
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#10B981" />
                    </marker>
                  </defs>
                </motion.svg>

                {/* Animated User Cursors */}
                <DrawingCursor x="20%" y="30%" color="bg-indigo-500" name="Alex" />
                <DrawingCursor x="60%" y="45%" color="bg-emerald-500" name="Sarah" />
                <DrawingCursor x="40%" y="65%" color="bg-purple-500" name="Mike" />

                {/* Play Button Overlay */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isPlaying ? 0 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.button
                    className="bg-white/10 backdrop-blur-sm rounded-full p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    <Play className="w-8 h-8 text-indigo-400 ml-1" fill="currentColor" />
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <AnimatedSection id="features" className="py-20 bg-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={itemVariants} className="text-4xl font-bold text-white mb-4">
              Everything you need to create
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Powerful features designed to help you sketch, collaborate, and share your ideas effortlessly.
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Palette,
                title: "Hand-drawn Style",
                description: "Create diagrams with a natural, hand-drawn aesthetic that makes your ideas feel more approachable and engaging.",
                color: "from-indigo-500 to-indigo-600",
                bgColor: "from-indigo-500/10 to-indigo-600/10"
              },
              {
                icon: Users,
                title: "Real-time Collaboration",
                description: "Work together with your team in real-time. See cursors, edits, and comments as they happen.",
                color: "from-purple-500 to-purple-600",
                bgColor: "from-purple-500/10 to-purple-600/10"
              },
              {
                icon: Download,
                title: "Export Anywhere",
                description: "Export your creations as PNG, SVG, or PDF. Perfect for presentations, documentation, and sharing.",
                color: "from-emerald-500 to-emerald-600",
                bgColor: "from-emerald-500/10 to-emerald-600/10"
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Built for speed and performance. No lag, no delays - just smooth, responsive drawing every time.",
                color: "from-teal-500 to-teal-600",
                bgColor: "from-teal-500/10 to-teal-600/10"
              },
              {
                icon: Layers,
                title: "Infinite Canvas",
                description: "Never run out of space. Pan, zoom, and create without boundaries on our infinite drawing canvas.",
                color: "from-cyan-500 to-cyan-600",
                bgColor: "from-cyan-500/10 to-cyan-600/10"
              },
              {
                icon: Share2,
                title: "Easy Sharing",
                description: "Share your drawings with a simple link. Control permissions and collaborate with anyone, anywhere.",
                color: "from-pink-500 to-pink-600",
                bgColor: "from-pink-500/10 to-pink-600/10"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`bg-gradient-to-br ${feature.bgColor} backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:border-white/20 hover:shadow-lg transition-all duration-300 group cursor-pointer`}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <motion.div 
                  className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-slate-100 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Testimonials Section */}
      <AnimatedSection className="py-20 bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={itemVariants} className="text-4xl font-bold text-white mb-4">
              Loved by creators worldwide
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Join thousands of designers, developers, and teams who trust DrawFlow for their creative workflow.
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                name: "Sarah Chen",
                role: "Product Designer at Stripe",
                content: "DrawFlow has revolutionized how our team collaborates on wireframes. The real-time editing is seamless and the hand-drawn style makes our ideas more approachable.",
                avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
              },
              {
                name: "Marcus Rodriguez",
                role: "Engineering Manager at Figma",
                content: "The infinite canvas and lightning-fast performance make DrawFlow our go-to tool for technical diagrams. It's like having a digital whiteboard that never runs out of space.",
                avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
              },
              {
                name: "Emily Watson",
                role: "UX Lead at Airbnb",
                content: "I love how DrawFlow makes complex system diagrams feel approachable. The export options are fantastic - from quick PNGs to print-ready PDFs.",
                avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="backdrop-blur-2xl bg-white/5 p-8 rounded-2xl border border-white/10 shadow-lg hover:shadow-xl hover:border-white/20 transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center space-x-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                  />
                  <div>
                    <h4 className="font-semibold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection className="py-20 bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-4xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ready to bring your ideas to life?
          </motion.h2>
          <motion.p 
            className="text-xl text-teal-100 mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Join thousands of creators who use DrawFlow to sketch, collaborate, and share their best ideas.
          </motion.p>
          <motion.button 
            className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2 mx-auto"
            whileHover={{ scale: 1.05, boxShadow: "0 15px 30px rgba(16, 185, 129, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <span>Get Started Free</span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.div>
          </motion.button>
        </div>
      </AnimatedSection>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="flex flex-col md:flex-row justify-between items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">DrawFlow</span>
            </div>
            <div className="flex items-center space-x-6">
              <motion.a 
                href="#" 
                className="text-slate-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.2, rotate: 5 }}
              >
                <Github className="w-5 h-5" />
              </motion.a>
              <motion.a 
                href="#" 
                className="text-slate-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.2, rotate: -5 }}
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>
          <motion.div 
            className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <p>&copy; 2025 DrawFlow. All rights reserved.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;