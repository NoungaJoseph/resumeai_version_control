import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore
import anime from 'animejs/lib/anime.es.js';
import * as echarts from 'echarts';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';

interface LandingPageProps {
  onStart: () => void;
}

type ViewState = 'home' | 'pricing' | 'about' | 'contact';

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [view, setView] = useState<ViewState>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Canvas Ref for Particles
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // --- 1. PARTICLE SYSTEM ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles: any[] = [];
    const particleCount = 50;

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74, 155, 142, ${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw connections
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(74, 155, 142, ${0.1 * (1 - distance / 100)})`;
            ctx.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // --- 2. SCROLL OBSERVER ---
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          
          // Counter Animations
          if (entry.target.hasAttribute('data-count')) {
            const target = entry.target;
            const finalValue = parseFloat(target.getAttribute('data-count') || '0');
            
            anime({
              targets: { value: 0 },
              value: finalValue,
              duration: 2000,
              easing: 'easeOutQuart',
              update: function(anim: any) {
                const currentValue = parseFloat(anim.animatables[0].target.value as string);
                if (finalValue >= 1000) {
                  target.textContent = Math.floor(currentValue).toLocaleString();
                } else if (finalValue % 1 !== 0) {
                  target.textContent = currentValue.toFixed(1);
                } else {
                  target.textContent = Math.floor(currentValue).toString();
                }
              }
            });
            observer.unobserve(target);
          }
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.reveal, [data-count]');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [view]); // Re-run when view changes

  // --- 3. ECHARTS (About Page) ---
  useEffect(() => {
    if (view === 'about' && chartRef.current) {
      const myChart = echarts.init(chartRef.current);
      const option = {
        backgroundColor: 'transparent',
        title: {
          text: 'Our Growth Journey',
          textStyle: { color: '#ffffff' }
        },
        tooltip: { trigger: 'axis' },
        legend: {
          data: ['Resumes Created', 'Users'],
          textStyle: { color: '#ffffff' },
          bottom: 0
        },
        grid: { containLabel: true, bottom: 30 },
        xAxis: {
          type: 'category',
          data: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025'],
          axisLabel: { color: '#ffffff' },
          axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } }
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#ffffff' },
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
        },
        series: [
          {
            name: 'Resumes Created',
            type: 'line',
            data: [0, 5000, 15000, 30000, 50000],
            itemStyle: { color: '#4a9b8e' },
            smooth: true
          },
          {
            name: 'Users',
            type: 'line',
            data: [0, 2000, 8000, 18000, 35000],
            itemStyle: { color: '#ff6b6b' },
            smooth: true
          }
        ]
      };
      myChart.setOption(option);
      
      const handleResize = () => myChart.resize();
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        myChart.dispose();
      }
    }
  }, [view]);

  // --- 4. TYPEWRITER ---
  useEffect(() => {
    if (view === 'home') {
      const text = "Career Journey";
      const el = document.getElementById('typewriter-text');
      if (el) {
        el.textContent = '';
        let i = 0;
        const type = () => {
          if (i < text.length) {
            el.textContent += text.charAt(i);
            i++;
            setTimeout(type, 100);
          }
        };
        setTimeout(type, 1000);
      }
    }
  }, [view]);

  // --- AI DEMO LOGIC ---
  const [demoInput, setDemoInput] = useState("Managed team of 5, used React, improved performance by 20%");
  const [demoRole, setDemoRole] = useState("software-engineer");
  const [demoOutput, setDemoOutput] = useState<string | null>(null);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleDemoGenerate = () => {
    setIsDemoLoading(true);
    setTimeout(() => {
      let text = '';
      if (demoRole === 'software-engineer') {
        text = `Led cross-functional team of 5 developers in architecting scalable frontend solutions using React.js, implementing performance optimization strategies that <span class="text-sage font-semibold">improved application speed by 20%</span> and enhanced user experience across multiple platforms.`;
      } else if (demoRole === 'marketing-specialist') {
        text = `Orchestrated comprehensive social media strategies and content marketing campaigns, <span class="text-sage font-semibold">increasing engagement by 150%</span> and driving brand awareness across multiple digital platforms.`;
      } else {
        text = `Managed stakeholder relationships and financial planning, <span class="text-sage font-semibold">reducing costs by 25%</span> through strategic resource allocation.`;
      }
      setDemoOutput(text);
      setIsDemoLoading(false);
    }, 1500);
  };

  // --- RENDER HELPERS ---
  const NavLink = ({ to, label }: { to: ViewState, label: string }) => (
    <button 
      onClick={() => {
        setView(to);
        setIsMobileMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      className={`text-sm font-medium transition-colors ${view === to ? 'text-teal font-bold' : 'text-white hover:text-teal'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="font-body text-white min-h-screen relative overflow-x-hidden bg-gradient-to-br from-navy to-[#111827]">
      {/* Background Canvas */}
      <canvas 
        ref={canvasRef} 
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-40"
      />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glassmorphism">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer" onClick={() => setView('home')}>
              <div className="text-2xl font-display font-bold landing-gradient-text">
                ResumeAI
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <NavLink to="home" label="Home" />
                <NavLink to="pricing" label="Pricing" />
                <NavLink to="about" label="About" />
                <NavLink to="contact" label="Contact" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={onStart}
                className="bg-teal hover:bg-teal/80 text-white px-6 py-2 rounded-lg font-medium transition-all hover:scale-105 shadow-lg shadow-teal/20"
              >
                Start Building
              </button>
              {/* Mobile Menu Button */}
              <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-navy border-t border-white/10 p-4 flex flex-col space-y-4">
             <NavLink to="home" label="Home" />
             <NavLink to="pricing" label="Pricing" />
             <NavLink to="about" label="About" />
             <NavLink to="contact" label="Contact" />
          </div>
        )}
      </nav>

      {/* --- HOME VIEW --- */}
      {view === 'home' && (
        <>
          {/* Hero Section */}
          <section className="min-h-screen flex items-center justify-center pt-16 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left animate-slide-in-up">
                <h1 className="text-5xl lg:text-7xl font-display font-bold mb-6 leading-tight">
                  Transform Your<br/>
                  <span id="typewriter-text" className="landing-gradient-text typewriter inline-block min-h-[1.2em]"></span>
                </h1>
                <p className="text-xl lg:text-2xl mb-8 text-gray-200 leading-relaxed">
                  Powered by Google's Gemini 2.5 Flash AI, transform rough career notes into polished, 
                  industry-standard resumes, CVs, and cover letters that get you noticed.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                  <button 
                    onClick={onStart}
                    className="bg-coral hover:bg-coral/80 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-coral/20"
                  >
                    Start Free Trial
                  </button>
                  <button 
                    onClick={() => setView('about')}
                    className="border-2 border-white text-white hover:bg-white hover:text-navy px-8 py-4 rounded-lg font-semibold text-lg transition-all"
                  >
                    Learn More
                  </button>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-8 text-sm text-gray-300">
                  <div className="flex items-center"><span className="w-2 h-2 bg-teal rounded-full mr-2"></span>50k+ Created</div>
                  <div className="flex items-center"><span className="w-2 h-2 bg-sage rounded-full mr-2"></span>95% Success</div>
                  <div className="flex items-center"><span className="w-2 h-2 bg-coral rounded-full mr-2"></span>500 FCFA</div>
                </div>
              </div>
              
              <div className="relative animate-float hidden lg:block">
                <div className="relative z-10 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                   {/* Mock UI */}
                   <div className="w-full h-64 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg mb-4 flex items-center justify-center">
                      <div className="text-center p-6">
                         <div className="w-16 h-16 bg-teal rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">✨</div>
                         <h3 className="font-bold text-xl mb-2">AI Processing</h3>
                         <p className="text-sm text-gray-400">Optimizing keywords & structure...</p>
                      </div>
                   </div>
                   <div className="space-y-3">
                      <div className="h-3 bg-white/10 rounded w-3/4"></div>
                      <div className="h-3 bg-white/10 rounded w-full"></div>
                      <div className="h-3 bg-white/10 rounded w-5/6"></div>
                   </div>
                </div>
                <div className="absolute -top-6 -right-6 bg-teal text-white px-4 py-2 rounded-lg font-semibold shadow-lg animate-pulse-custom" style={{ animationDelay: '1s' }}>
                    AI Powered
                </div>
                <div className="absolute -bottom-6 -left-6 bg-coral text-white px-4 py-2 rounded-lg font-semibold shadow-lg animate-pulse-custom" style={{ animationDelay: '2s' }}>
                    Instant PDF
                </div>
              </div>
            </div>
          </section>

          {/* AI Demo Section */}
          <section className="py-20 bg-white/5 relative z-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16 reveal">
                <h2 className="text-4xl lg:text-5xl font-display font-bold mb-6">
                  See the <span className="landing-gradient-text">Magic</span> in Action
                </h2>
                <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                  Watch as our AI transforms your rough notes into professional content.
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="reveal">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-200">Your Rough Notes</label>
                      <textarea 
                        className="w-full p-4 rounded-lg bg-white/90 text-charcoal resize-none h-32 focus:ring-2 focus:ring-teal border-none outline-none transition-all"
                        value={demoInput}
                        onChange={(e) => setDemoInput(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-200">Target Role</label>
                      <select 
                        className="w-full p-4 rounded-lg bg-white/90 text-charcoal focus:ring-2 focus:ring-teal border-none outline-none"
                        value={demoRole}
                        onChange={(e) => setDemoRole(e.target.value)}
                      >
                        <option value="software-engineer">Software Engineer</option>
                        <option value="marketing-specialist">Marketing Specialist</option>
                        <option value="project-manager">Project Manager</option>
                      </select>
                    </div>
                    <button 
                      onClick={handleDemoGenerate}
                      disabled={isDemoLoading}
                      className="w-full bg-teal hover:bg-teal/80 text-white py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isDemoLoading ? 'Generating...' : 'Generate with AI ✨'}
                    </button>
                  </div>
                </div>
                
                <div className="reveal">
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 min-h-[300px]">
                    <h3 className="text-2xl font-semibold mb-6 text-teal">Professional Output</h3>
                    {demoOutput ? (
                      <div className="bg-white/5 rounded-lg p-4 border-l-4 border-teal animate-fade-in">
                        <p className="text-gray-200 leading-relaxed" dangerouslySetInnerHTML={{ __html: demoOutput }} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-40 text-gray-400 italic border-2 border-dashed border-white/10 rounded-lg">
                        Click Generate to see the transformation
                      </div>
                    )}
                    <div className="mt-6 flex items-center text-sm text-gray-300">
                      <span className="w-2 h-2 bg-teal rounded-full mr-2 animate-pulse"></span>
                      Optimized for ATS systems
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Templates Carousel */}
          <section className="py-20 relative z-10">
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 reveal">
                  <h2 className="text-4xl lg:text-5xl font-display font-bold mb-6">
                    Professional <span className="landing-gradient-text">Templates</span>
                  </h2>
                </div>
                
                <Splide options={{
                   type: 'loop',
                   perPage: 3,
                   gap: '2rem',
                   autoplay: true,
                   breakpoints: {
                      768: { perPage: 1 },
                      1024: { perPage: 2 }
                   }
                }}>
                   {[
                     { name: "Modern", desc: "Clean, 2-column layout", icon: "💻" },
                     { name: "Classic", desc: "Traditional, top-down", icon: "📄" },
                     { name: "Sidebar", desc: "High-contrast layout", icon: "📊" },
                     { name: "Minimalist", desc: "Elegant whitespace", icon: "⚡" },
                     { name: "Corporate", desc: "High-end executive", icon: "🏢" },
                     { name: "Academic", desc: "Research focused", icon: "🎓" }
                   ].map((tpl, idx) => (
                     <SplideSlide key={idx}>
                        <div className="bg-white rounded-2xl p-6 mx-2 hover-lift transition-all h-full flex flex-col">
                           <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
                              <span className="text-6xl">{tpl.icon}</span>
                           </div>
                           <h3 className="text-xl font-semibold mb-2 text-charcoal">{tpl.name}</h3>
                           <p className="text-gray-600 mb-4 flex-1">{tpl.desc}</p>
                           <button onClick={onStart} className="w-full bg-navy text-white py-2 rounded hover:bg-navy/90">Use Template</button>
                        </div>
                     </SplideSlide>
                   ))}
                </Splide>
             </div>
          </section>

          {/* Success Stats */}
          <section className="py-20 bg-white/5 relative z-10">
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                   {[
                     { label: "Resumes Created", val: "50000" },
                     { label: "Success Rate %", val: "95" },
                     { label: "Jobs Landed", val: "1200" },
                     { label: "Avg Rating", val: "4.9" }
                   ].map((stat, i) => (
                     <div key={i}>
                        <div className="text-4xl font-bold landing-gradient-text mb-2" data-count={stat.val}>0</div>
                        <div className="text-gray-300">{stat.label}</div>
                     </div>
                   ))}
                </div>
             </div>
          </section>
        </>
      )}

      {/* --- PRICING VIEW --- */}
      {view === 'pricing' && (
        <section className="pt-24 pb-16 min-h-screen relative z-10">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16 reveal">
                 <h1 className="text-4xl lg:text-6xl font-display font-bold mb-6">
                    Simple <span className="landing-gradient-text">Pricing</span>
                 </h1>
                 <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                    Pay only for what you use. No subscriptions, no hidden fees.
                 </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                 {/* Single */}
                 <div className="bg-white/5 rounded-2xl p-8 border border-white/10 hover-lift reveal">
                    <div className="text-center">
                       <h3 className="text-2xl font-semibold mb-4">Single Download</h3>
                       <div className="text-5xl font-bold mb-2 landing-gradient-text">500 FCFA</div>
                       <ul className="space-y-4 text-left my-8 text-gray-300 text-sm">
                          {['1 Resume/CV', 'All Templates', 'AI Generation', 'PDF Export'].map(f => (
                             <li key={f} className="flex items-center"><span className="text-teal mr-2">✓</span>{f}</li>
                          ))}
                       </ul>
                       <button onClick={onStart} className="w-full bg-teal hover:bg-teal/80 text-white py-3 rounded-lg font-semibold">Get Started</button>
                    </div>
                 </div>

                 {/* Pro */}
                 <div className="bg-white/10 rounded-2xl p-8 border-2 border-teal relative hover-lift reveal transform scale-105 shadow-2xl shadow-teal/10">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-teal text-white px-4 py-1 rounded-full text-sm font-bold">Most Popular</div>
                    <div className="text-center">
                       <h3 className="text-2xl font-semibold mb-4">Professional</h3>
                       <div className="text-5xl font-bold mb-2 landing-gradient-text">1,500 FCFA</div>
                       <ul className="space-y-4 text-left my-8 text-gray-300 text-sm">
                          {['5 Documents', 'All Templates', 'Priority Support', '30-day Access'].map(f => (
                             <li key={f} className="flex items-center"><span className="text-teal mr-2">✓</span>{f}</li>
                          ))}
                       </ul>
                       <button onClick={onStart} className="w-full bg-coral hover:bg-coral/80 text-white py-3 rounded-lg font-semibold">Choose Plan</button>
                    </div>
                 </div>

                 {/* Enterprise */}
                 <div className="bg-white/5 rounded-2xl p-8 border border-white/10 hover-lift reveal">
                    <div className="text-center">
                       <h3 className="text-2xl font-semibold mb-4">Enterprise</h3>
                       <div className="text-5xl font-bold mb-2 text-white">Custom</div>
                       <ul className="space-y-4 text-left my-8 text-gray-300 text-sm">
                          {['Unlimited Docs', 'Custom Templates', 'API Access', 'Dedicated Support'].map(f => (
                             <li key={f} className="flex items-center"><span className="text-teal mr-2">✓</span>{f}</li>
                          ))}
                       </ul>
                       <button onClick={() => setView('contact')} className="w-full border border-teal text-teal hover:bg-teal hover:text-white py-3 rounded-lg font-semibold">Contact Sales</button>
                    </div>
                 </div>
              </div>
           </div>
        </section>
      )}

      {/* --- ABOUT VIEW --- */}
      {view === 'about' && (
        <section className="pt-24 pb-16 min-h-screen relative z-10">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
                 <div className="reveal">
                    <h1 className="text-4xl lg:text-6xl font-display font-bold mb-6">
                       Our <span className="landing-gradient-text">Story</span>
                    </h1>
                    <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                       ResumeAI Builder was born from a simple observation: millions of talented professionals struggle to 
                       effectively communicate their value. Founded in 2024, we leverage Google's Gemini AI to democratize 
                       professional career services.
                    </p>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="bg-white/5 p-6 rounded-xl">
                          <div className="text-2xl mb-2">🎯</div>
                          <h3 className="font-bold mb-1">Mission</h3>
                          <p className="text-xs text-gray-400">Accessible career tools for everyone.</p>
                       </div>
                       <div className="bg-white/5 p-6 rounded-xl">
                          <div className="text-2xl mb-2">🚀</div>
                          <h3 className="font-bold mb-1">Vision</h3>
                          <p className="text-xs text-gray-400">Leading AI platform in Africa.</p>
                       </div>
                    </div>
                 </div>
                 <div className="reveal bg-white/5 rounded-2xl p-4 border border-white/10 h-[400px]">
                    <div ref={chartRef} style={{ width: '100%', height: '100%' }}></div>
                 </div>
              </div>

              {/* Team */}
              <div className="text-center mb-12 reveal">
                 <h2 className="text-3xl font-display font-bold mb-4">Meet the Team</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[
                    { name: "Amara Diallo", role: "Founder & CEO", init: "AD", color: "bg-teal" },
                    { name: "Moussa Koné", role: "CTO", init: "MK", color: "bg-coral" },
                    { name: "Fatou Sow", role: "Head of Design", init: "FS", color: "bg-sage" }
                 ].map((member, i) => (
                    <div key={i} className="bg-white/5 p-8 rounded-2xl border border-white/10 text-center hover-lift reveal">
                       <div className={`w-24 h-24 ${member.color}/20 rounded-full flex items-center justify-center mx-auto mb-6`}>
                          <span className={`text-3xl font-bold text-${member.color.replace('bg-', '')}`}>{member.init}</span>
                       </div>
                       <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                       <p className={`text-sm font-medium mb-4 ${member.color.replace('bg-', 'text-')}`}>{member.role}</p>
                    </div>
                 ))}
              </div>
           </div>
        </section>
      )}

      {/* --- CONTACT VIEW --- */}
      {view === 'contact' && (
        <section className="pt-24 pb-16 min-h-screen relative z-10">
           <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16 reveal">
                 <h1 className="text-4xl lg:text-6xl font-display font-bold mb-6">
                    Get in <span className="landing-gradient-text">Touch</span>
                 </h1>
                 <p className="text-xl text-gray-200">
                    We're here to help with your resume building needs.
                 </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                 {[
                    { icon: "📧", title: "Email", val: "support@resumeai.builder" },
                    { icon: "💬", title: "Chat", val: "Available 9AM-6PM" },
                    { icon: "📱", title: "Phone", val: "+223 12 345 6789" }
                 ].map((method, i) => (
                    <div key={i} className="bg-white/5 p-6 rounded-xl text-center border border-white/10 hover-lift reveal">
                       <div className="text-3xl mb-4">{method.icon}</div>
                       <h3 className="font-bold mb-2">{method.title}</h3>
                       <p className="text-sm text-gray-400">{method.val}</p>
                    </div>
                 ))}
              </div>

              <div className="bg-white/5 rounded-2xl p-8 border border-white/10 reveal">
                 <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Message sent!"); }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <label className="block text-sm font-medium mb-2 text-gray-300">First Name</label>
                          <input type="text" className="w-full p-3 rounded-lg bg-white/10 border border-white/10 focus:border-teal outline-none text-white" required />
                       </div>
                       <div>
                          <label className="block text-sm font-medium mb-2 text-gray-300">Last Name</label>
                          <input type="text" className="w-full p-3 rounded-lg bg-white/10 border border-white/10 focus:border-teal outline-none text-white" required />
                       </div>
                    </div>
                    <div>
                       <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
                       <input type="email" className="w-full p-3 rounded-lg bg-white/10 border border-white/10 focus:border-teal outline-none text-white" required />
                    </div>
                    <div>
                       <label className="block text-sm font-medium mb-2 text-gray-300">Message</label>
                       <textarea rows={4} className="w-full p-3 rounded-lg bg-white/10 border border-white/10 focus:border-teal outline-none text-white resize-none" required></textarea>
                    </div>
                    <button type="submit" className="w-full bg-teal hover:bg-teal/80 text-white py-4 rounded-lg font-bold transition-all">
                       Send Message
                    </button>
                 </form>
              </div>
           </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 relative z-10 bg-navy/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <div className="text-2xl font-display font-bold landing-gradient-text mb-4">ResumeAI Builder</div>
           <div className="flex justify-center space-x-6 mb-6 text-sm text-gray-400">
              <button onClick={() => setView('home')} className="hover:text-teal">Home</button>
              <button onClick={() => setView('about')} className="hover:text-teal">About</button>
              <button onClick={() => setView('contact')} className="hover:text-teal">Contact</button>
              <button className="hover:text-teal">Privacy</button>
           </div>
           <p className="text-gray-500 text-xs">© 2025 ResumeAI Builder. Powered by Google's Gemini AI.</p>
        </div>
      </footer>
    </div>
  );
};