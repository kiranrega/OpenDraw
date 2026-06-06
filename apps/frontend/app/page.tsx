"use client";
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, Users, Download, Zap, ArrowRight, Github, 
  Layers, Share2, Menu, X 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

// ScrollReveal component using native IntersectionObserver
const ScrollReveal = ({ 
  children, 
  className = "", 
  id 
}: { 
  children: React.ReactNode | ((isVisible: boolean) => React.ReactNode); 
  className?: string;
  id?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-[10px]"
      } ${className}`}
      id={id}
    >
      {typeof children === 'function' ? children(isVisible) : children}
    </div>
  );
};

// Colored Drawing Cursor for collaborative feel
const DrawingCursor = ({ x, y, name, color }: { x: string; y: string; name: string; color: string }) => (
  <motion.div
    className="absolute pointer-events-none z-20"
    style={{ left: x, top: y }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: 1, 
      scale: 1,
      x: [0, 15, -8, 10, 0],
      y: [0, -10, 20, -5, 0]
    }}
    transition={{ 
      opacity: { duration: 0.3, delay: 0.8 },
      scale: { duration: 0.3, delay: 0.8 },
      x: { duration: 5, repeat: Infinity, ease: "easeInOut" },
      y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
    }}
  >
    <svg className="w-5 h-5 drop-shadow-sm" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.5 3V17.25L9.75 12.75L15 21L17.25 19.5L12 11.25H18L4.5 3Z" fill={color} stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
    <div className="absolute top-4 left-4 text-[10px] font-semibold text-white px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap" style={{ backgroundColor: color }}>
      {name}
    </div>
  </motion.div>
);

function LandingPage() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between selection:bg-gray-800">
      <style>{`
        @keyframes cardFadeIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-card-fade-in {
          animation: cardFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Header */}
      <header className="bg-gray-955/80 backdrop-blur-md border-b border-gray-900 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Palette className="w-4 h-4 text-gray-950" />
              </div>
              <span className="text-xl font-semibold text-white">OpenDraw</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {['Features', 'Demo'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
                >
                  {item}
                </a>
              ))}
              <button 
                className="bg-white text-gray-950 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium cursor-pointer" 
                onClick={() => router.push(`/canvas/${uuidv4()}`)}
              >
                Try Now
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-400 hover:text-white focus:outline-none p-2 rounded-md hover:bg-gray-900 cursor-pointer"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-gray-900 bg-gray-950 py-4 px-6 space-y-4 shadow-sm absolute left-0 right-0 top-full z-50">
            <a
              href="#features"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-gray-400 hover:text-white transition-colors text-base font-medium py-1"
            >
              Features
            </a>
            <a
              href="#demo"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-gray-400 hover:text-white transition-colors text-base font-medium py-1"
            >
              Demo
            </a>
            <button
              className="w-full bg-white text-gray-950 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium cursor-pointer"
              onClick={() => {
                setIsMobileMenuOpen(false);
                router.push(`/canvas/${uuidv4()}`);
              }}
            >
              Try Now
            </button>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="demo" className="pt-16 pb-20 bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Column: Headline, Subtext, CTA Buttons */}
            <div className="text-center md:text-left flex flex-col justify-center">
              <h1 className="text-5xl md:text-6xl font-light text-white mb-6 leading-tight tracking-tight">
                Sketch Ideas That{" "}
                <span className="block font-normal text-gray-400">Come to Life</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed font-normal">
                Create beautiful hand-drawn style diagrams and wireframes. 
                Collaborate in real-time and export anywhere.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center">
                <button 
                  className="w-full sm:w-auto bg-gray-900 text-white border border-gray-800 px-6 py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-850 transition-colors font-medium cursor-pointer" 
                  onClick={() => router.push('/signin')}
                >
                  <span>Start Drawing Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a 
                  href="https://github.com/kiranrega/OpenDraw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto border border-gray-700 text-gray-300 px-6 py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-900 transition-colors font-medium cursor-pointer"
                >
                  <Github className="w-4 h-4" />
                  <span>View on GitHub</span>
                </a>
              </div>
            </div>

            {/* Right Column: Styled mock canvas card */}
            <div className="w-full">
              <div className="bg-white rounded-xl border border-gray-200 shadow-xl p-4 relative overflow-hidden h-80 flex flex-col justify-between select-none">
                {/* Grid background for canvas feel */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                
                <div className="relative flex-1 w-full h-full">
                  <svg className="w-full h-full" viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Sketchy Rectangle */}
                    {/* Top edge */}
                    <path d="M 62 50 C 150 48, 250 52, 338 49" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
                    {/* Right edge */}
                    <path d="M 336 47 C 339 90, 334 130, 337 172" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
                    {/* Bottom edge */}
                    <path d="M 339 170 C 250 173, 150 168, 60 171" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
                    {/* Left edge */}
                    <path d="M 62 173 C 59 130, 64 90, 61 48" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
                    
                    {/* Label "Wireframe" inside the rectangle */}
                    <text x="200" y="110" textAnchor="middle" dominantBaseline="middle" fill="#1f2937" className="font-semibold text-lg font-mono">
                      Wireframe
                    </text>
                    
                    {/* A few hand-drawn style lines */}
                    {/* Line 1 (blue arrow pointing to wireframe) */}
                    <path d="M 25 110 C 35 110, 45 115, 52 110" stroke="#3b82f6" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <path d="M 46 105 L 53 110 L 46 115" stroke="#3b82f6" strokeWidth="2" fill="none" strokeLinecap="round" />
                    
                    {/* Line 2 (green underline or decoration) */}
                    <path d="M 120 135 C 160 140, 200 130, 280 136" stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round" />
                    
                    {/* Line 3 (yellow curly cue) */}
                    <path d="M 285 75 C 310 65, 320 95, 295 90 C 280 85, 290 60, 305 70" stroke="#f59e0b" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </svg>
                  
                  {/* Collaborative Cursors */}
                  <DrawingCursor x="25%" y="30%" name="Alex" color="#3b82f6" />
                  <DrawingCursor x="72%" y="20%" name="Sam" color="#10b981" />
                  <DrawingCursor x="48%" y="60%" name="Jo" color="#a855f7" />
                </div>
                
                {/* Bottom Footer bar of mock canvas */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-auto relative z-10 bg-white">
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-1.5">
                      <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white text-[10px] flex items-center justify-center text-white font-semibold shadow-sm">A</div>
                      <div className="w-6 h-6 bg-emerald-500 rounded-full border-2 border-white text-[10px] flex items-center justify-center text-white font-semibold shadow-sm">S</div>
                      <div className="w-6 h-6 bg-purple-500 rounded-full border-2 border-white text-[10px] flex items-center justify-center text-white font-semibold shadow-sm">J</div>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">3 online</span>
                  </div>
                  <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 font-mono font-medium">canvas.opendraw</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <ScrollReveal className="py-20 bg-gray-900 border-t border-gray-950" id="features">
        {(isVisible: boolean) => (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4 tracking-tight">
                Built for how ideas actually work
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Draw freely. Collaborate live. No setup required.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  icon: Zap,
                  title: "Lightning Fast",
                  description: "Built for performance. No lag, just smooth and responsive drawing."
                }
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className={`bg-gray-950 border border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group cursor-pointer ${
                      isVisible ? 'animate-card-fade-in' : 'opacity-0'
                    }`}
                    style={{ 
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: 'forwards'
                    }}
                  >
                    <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Bottom Strip of features */}
            <div className="mt-12 pt-8 border-t border-gray-800 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Download className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-300">Export Anywhere</span>
                <span className="text-[10px] bg-gray-950 border border-gray-800 text-gray-500 px-1.5 py-0.5 rounded font-medium">Coming soon</span>
              </div>
              <div className="text-gray-800 hidden sm:inline">•</div>
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-300">Infinite Canvas</span>
                <span className="text-[10px] bg-gray-950 border border-gray-800 text-gray-500 px-1.5 py-0.5 rounded font-medium">Coming soon</span>
              </div>
              <div className="text-gray-800 hidden sm:inline">•</div>
              <div className="flex items-center space-x-2">
                <Share2 className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-300">Easy Sharing</span>
                <span className="text-[10px] bg-gray-950 border border-gray-800 text-gray-500 px-1.5 py-0.5 rounded font-medium">Coming soon</span>
              </div>
            </div>
          </div>
        )}
      </ScrollReveal>

      {/* CTA Section */}
      <ScrollReveal className="py-20 bg-gray-950 border-t border-gray-900">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4 tracking-tight">
            Ready to think visually?
          </h2>
          <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
            Open a canvas. Invite your team. Start in seconds.
          </p>
          <button 
            className="bg-gray-900 text-white border border-gray-800 px-8 py-3 rounded-lg hover:bg-gray-850 transition-colors flex items-center space-x-2 mx-auto font-medium shadow-sm hover:shadow-md cursor-pointer"
            onClick={() => router.push('/signin')}
          >
            <span>Start Drawing Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </ScrollReveal>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Left: wordmark + copyright */}
            <div className="flex items-center space-x-3 text-white">
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                <Palette className="w-3.5 h-3.5 text-gray-950" />
              </div>
              <span className="font-semibold text-base">OpenDraw</span>
              <span className="text-gray-500 text-sm">© 2025 OpenDraw</span>
            </div>
            {/* Right: links */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm">
              <a 
                href="https://github.com/kiranrega/OpenDraw"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors font-medium cursor-pointer"
              >
                GitHub
              </a>
              <a 
                href="#"
                className="text-gray-400 hover:text-white transition-colors font-medium cursor-pointer"
              >
                Documentation
              </a>
              <a 
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors font-medium cursor-pointer"
              >
                Twitter
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;