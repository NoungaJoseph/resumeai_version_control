
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// @ts-ignore
import anime from 'animejs/lib/anime.es.js';
import * as echarts from 'echarts';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { Logo } from './Logo';

type ViewState = 'home' | 'pricing' | 'about' | 'contact' | 'privacy' | 'terms';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const onStart = () => navigate('/edit');
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
              update: function (anim: any) {
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
  }, [view]);

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
          data: ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'],
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
            data: [0, 15000, 30000, 50000],
            itemStyle: { color: '#4a9b8e' },
            smooth: true
          },
          {
            name: 'Users',
            type: 'line',
            data: [0, 8000, 18000, 35000],
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
      const text = "Ready-for-Anything.";
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
              <Logo variant="dark" className="landing-logo" textClassName="text-white landing-gradient-text" />
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
                  From Rough Notes to<br />
                  <span id="typewriter-text" className="landing-gradient-text typewriter inline-block min-h-[1.2em]"></span>
                </h1>
                <p className="text-xl lg:text-2xl mb-8 text-gray-200 leading-relaxed">
                  Stop stressing over your resume. We help you shape your career journey into a clear, professional story that stands out.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                  <button
                    onClick={onStart}
                    className="bg-coral hover:bg-coral/80 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-coral/20"
                  >
                    Get Started
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
                  <div className="flex items-center"><span className="w-2 h-2 bg-coral rounded-full mr-2"></span>300 FCFA</div>
                </div>
              </div>

              <div className="relative animate-float hidden lg:block">
                <div className="relative z-10 rounded-2xl shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500 overflow-hidden border border-white/10">
                  <img src="/hero-main.png" alt="AI Resume Builder Interface" className="w-full h-auto" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
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
                  <div className="relative">
                    {/* AI DIAGRAM IMAGE */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/20 mb-6">
                      <img src="/hero-main.png" alt="AI Processing" className="w-full h-auto rounded-lg shadow-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 min-h-[200px]">
                      <h3 className="text-xl font-semibold mb-4 text-teal">Live Output</h3>
                      {demoOutput ? (
                        <div className="bg-white/5 rounded-lg p-4 border-l-4 border-teal animate-fade-in">
                          <p className="text-gray-200 leading-relaxed" dangerouslySetInnerHTML={{ __html: demoOutput }} />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-20 text-gray-400 italic border-2 border-dashed border-white/10 rounded-lg">
                          Click Generate above to see result
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Templates Carousel */}
          <section className="py-20 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10 reveal">
                <h2 className="text-4xl lg:text-5xl font-display font-bold mb-6">
                  Professional <span className="landing-gradient-text">Templates</span>
                </h2>
              </div>

              {/* TEMPLATES IMAGE GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 reveal">
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 hover-lift">
                  <img src="/templates-showcase.png" alt="Templates Showcase" className="w-full h-auto" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 hover-lift">
                  <img src="/ai-transformation.png" alt="Resume Transformation" className="w-full h-auto" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
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
                  { name: "Modern", desc: "Clean, 2-column layout", img: "/1.jpg" },
                  { name: "Classic", desc: "Traditional, top-down", img: "/2.jpg" },
                  { name: "Sidebar", desc: "High-contrast layout", img: "/3.jpg" },
                  { name: "Minimalist", desc: "Elegant whitespace", img: "/4.jpg" },
                  { name: "Corporate", desc: "High-end executive", img: "/5.jpg" },
                  { name: "Academic", desc: "Research focused", img: "/6.jpg" }
                ].map((tpl, idx) => (
                  <SplideSlide key={idx}>
                    <div className="bg-white rounded-2xl p-6 mx-2 hover-lift transition-all h-full flex flex-col border border-slate-100">
                      <div className="aspect-[210/297] bg-slate-100 rounded-lg mb-4 overflow-hidden border border-slate-200 relative group-hover:shadow-md transition-all">
                        <img
                          src={tpl.img}
                          alt={`${tpl.name} Resume Template`}
                          className="w-full h-full object-cover object-top"
                          onError={(e) => {
                            // Fallback until images are loaded
                            (e.target as HTMLImageElement).src = `https://placehold.co/400x600/e2e8f0/1e293b?text=${tpl.name}`;
                          }}
                        />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-charcoal">{tpl.name}</h3>
                      <p className="text-gray-600 mb-4 flex-1 text-sm">{tpl.desc}</p>
                      <button onClick={onStart} className="w-full bg-navy text-white py-2.5 rounded-lg hover:bg-navy/90 font-medium transition-colors">Use Template</button>
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

            <div className="flex justify-center mb-20">
              {/* Single Plan */}
              <div className="bg-white/5 rounded-2xl p-8 border border-white/10 hover-lift reveal max-w-md w-full relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-teal text-white text-xs font-bold px-3 py-1 rounded-bl-lg">BEST VALUE</div>
                <div className="text-center">
                  <h3 className="text-2xl font-semibold mb-4">Pay Per Download</h3>
                  <div className="text-5xl font-bold mb-2 landing-gradient-text">300 FCFA</div>
                  <p className="text-gray-400 text-sm mb-6">No subscriptions. Pay only when you're ready.</p>

                  <ul className="space-y-4 text-left my-8 text-gray-300 text-sm">
                    {['Professional Resume/CV', 'Unlimited Edits', 'All Premium Templates', 'AI Content Generation', 'Instant PDF Download'].map(f => (
                      <li key={f} className="flex items-center"><span className="text-teal mr-2">✓</span>{f}</li>
                    ))}
                  </ul>
                  <button onClick={onStart} className="w-full bg-teal hover:bg-teal/80 text-white py-4 rounded-lg font-bold text-lg shadow-lg shadow-teal/20 transition-all hover:scale-105">Get Started</button>
                </div>
              </div>
            </div>

            {/* Pricing FAQ Section */}
            <div className="max-w-4xl mx-auto mb-20 reveal">
              <h2 className="text-3xl font-bold mb-10 text-center">Frequently Asked Questions</h2>
              <p className="text-gray-400 text-center mb-8">Everything you need to know about our pricing and services</p>
              <div className="grid gap-6">
                {[
                  { q: "How does the 300 FCFA pricing work?", a: "You pay 300 FCFA for each resume, CV, or cover letter you download. There are no subscription fees, no hidden costs, and no automatic renewals. You only pay when you're satisfied with your document and ready to download." },
                  { q: "What payment methods do you accept?", a: "We accept mobile money payments (MTN Mobile Money, Orange Money), credit/debit cards, and PayPal. All payments are processed securely through our trusted payment partners." },
                  { q: "Can I edit my resume after downloading?", a: "Yes! You can continue editing your resume in our builder even after downloading. However, each new download will require a separate payment of 300 FCFA." },
                  { q: "Do you offer refunds?", a: "Yes, we offer a 100% satisfaction guarantee. If you're not happy with the quality of your resume, contact us within 7 days of purchase for a full refund." },
                  { q: "Are the templates ATS-friendly?", a: "Absolutely! All our templates are designed to be compatible with Applicant Tracking Systems (ATS). They use standard fonts, proper formatting, and avoid elements that could confuse ATS software." },
                  { q: "Can I use ResumeAI Builder on my phone?", a: "Yes! ResumeAI Builder is fully responsive and works great on mobile devices, tablets, and desktop computers. You can create and edit your resume anywhere, anytime." }
                ].map((faq, i) => (
                  <div key={i} className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <h3 className="font-bold text-teal mb-2">{faq.q}</h3>
                    <p className="text-gray-300 text-sm">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan Comparison Table */}

            {/* CTA */}
            <div className="text-center max-w-3xl mx-auto bg-gradient-to-br from-teal/20 to-navy/50 p-12 rounded-3xl border border-teal/30 reveal">
              <h2 className="text-3xl font-bold mb-4">Ready to Create Your Professional Resume?</h2>
              <p className="text-gray-300 mb-8">Join thousands of professionals who've transformed their careers with our AI-powered resume builder.</p>
              <div className="flex justify-center gap-4 flex-col sm:flex-row">
                <button onClick={onStart} className="bg-coral hover:bg-coral/80 text-white px-8 py-3 rounded-lg font-bold shadow-lg">Get Started</button>
              </div>
              <p className="text-xs text-gray-400 mt-6">300 FCFA per download • No subscription • 100% satisfaction guarantee</p>
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
                  ResumeAI Builder was founded in 2025 with a bold vision: to bridge the gap between talent and opportunity in Africa and beyond. We observed that countless skilled professionals were missing out on life-changing career opportunities simply because their resumes didn't effectively communicate their true value.
                </p>
                <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                  Our team combined deep expertise in Human Resources with cutting-edge Artificial Intelligence (Google Gemini) to create a platform that doesn't just format text—it elevates careers. We are committed to providing accessible, high-quality tools that empower every individual to tell their professional story with confidence and precision.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/5 p-6 rounded-xl">
                    <div className="text-2xl mb-2">🎯</div>
                    <h3 className="font-bold mb-1">Mission</h3>
                    <p className="text-xs text-gray-400">To democratize access to premium career development tools for everyone, everywhere.</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-xl">
                    <div className="text-2xl mb-2">🚀</div>
                    <h3 className="font-bold mb-1">Vision</h3>
                    <p className="text-xs text-gray-400">To be the leading catalyst for professional growth and employment in Africa.</p>
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
              <p className="text-gray-400">Passionate experts dedicated to your success.</p>
            </div>
            <div className="flex justify-center">
              {[
                { name: "Nounga Joseph", role: "Founder & Lead Developer", init: "NJ", color: "bg-teal" }
              ].map((member, i) => (
                <div key={i} className="bg-white/5 p-8 rounded-2xl border border-white/10 text-center hover-lift reveal max-w-sm w-full">
                  <div className={`w-32 h-32 ${member.color}/20 rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <span className={`text-4xl font-bold text-${member.color.replace('bg-', '')}`}>{member.init}</span>
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">{member.name}</h3>
                  <p className={`text-base font-medium mb-4 ${member.color.replace('bg-', 'text-')}`}>{member.role}</p>
                  <p className="text-gray-400 text-sm">Passionate about building tools that empower professionals to achieve their career goals.</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- PRIVACY POLICY VIEW --- */}
      {view === 'privacy' && (
        <section className="pt-24 pb-16 min-h-screen relative z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 reveal">
            <h1 className="text-4xl font-display font-bold mb-8">Privacy Policy</h1>
            <div className="space-y-6 text-gray-300 leading-relaxed">
              <p>Last updated: November 28, 2025</p>
              <p>At ResumeAI Builder, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.</p>

              <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Information We Collect</h2>
              <p>We collect information that you provide directly to us, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Personal information (name, email address, phone number) provided in your resume.</li>
                <li>Professional information (work experience, education, skills) entered into the builder.</li>
                <li>Payment information processed by our secure payment providers.</li>
              </ul>

              <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Generate and format your resume and cover letter.</li>
                <li>Process your payments for downloads.</li>
                <li>Improve our AI algorithms and user experience.</li>
                <li>Communicate with you about your account and updates.</li>
              </ul>

              <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Data Security</h2>
              <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your resume data is processed primarily on your device (client-side) to maximize privacy.</p>

              <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at privacy@resumeaibuilder.com.</p>
            </div>
          </div>
        </section>
      )}

      {/* --- TERMS OF SERVICE VIEW --- */}
      {view === 'terms' && (
        <section className="pt-24 pb-16 min-h-screen relative z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 reveal">
            <h1 className="text-4xl font-display font-bold mb-8">Terms of Service</h1>
            <div className="space-y-6 text-gray-300 leading-relaxed">
              <p>Last updated: November 28, 2025</p>
              <p>Please read these Terms of Service carefully before using ResumeAI Builder.</p>

              <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
              <p>By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.</p>

              <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Use of Service</h2>
              <p>You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account. You agree not to use the service for any illegal or unauthorized purpose.</p>

              <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Payment and Refunds</h2>
              <p>Our service operates on a pay-per-download basis. Prices are clearly displayed before purchase. We offer a satisfaction guarantee and will provide refunds for valid quality issues reported within 7 days of purchase.</p>

              <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Intellectual Property</h2>
              <p>The service and its original content (excluding content provided by you), features, and functionality are and will remain the exclusive property of ResumeAI Builder and its licensors.</p>

              <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Limitation of Liability</h2>
              <p>In no event shall ResumeAI Builder be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.</p>
            </div>
          </div>
        </section>
      )}

      {/* --- CONTACT VIEW --- */}
      {view === 'contact' && (
        <section className="pt-24 pb-16 min-h-screen relative z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 reveal">
              <h1 className="text-4xl lg:text-6xl font-display font-bold mb-6">
                Get in <span className="landing-gradient-text">Touch</span>
              </h1>
              <p className="text-xl text-gray-200">
                We're here to help with your resume building needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {[
                { icon: "📧", title: "Email", val: "noungajoseph58@gmail.com" },
                { icon: "💬", title: "Chat", val: "Available 9AM-6PM" },
                { icon: "📱", title: "Phone", val: "+237 671063170" }
              ].map((method, i) => (
                <div key={i} className="bg-white/5 p-6 rounded-xl text-center border border-white/10 hover-lift reveal">
                  <div className="text-3xl mb-4">{method.icon}</div>
                  <h3 className="font-bold mb-2">{method.title}</h3>
                  <p className="text-sm text-gray-400 select-all">{method.val}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
              {/* Contact Form */}
              <div className="bg-white/5 rounded-2xl p-8 border border-white/10 reveal">
                <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
                {/* Use Formspree endpoint */}
                <form className="space-y-6" action="https://formspree.io/f/xldknpve" method="POST" onSubmit={(e) => { if (!confirm("Send message?")) e.preventDefault(); }}>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">First Name</label>
                      <input name="firstName" type="text" className="w-full p-3 rounded-lg bg-white/10 border border-white/10 focus:border-teal outline-none text-white" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Last Name</label>
                      <input name="lastName" type="text" className="w-full p-3 rounded-lg bg-white/10 border border-white/10 focus:border-teal outline-none text-white" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
                    <input name="email" type="email" className="w-full p-3 rounded-lg bg-white/10 border border-white/10 focus:border-teal outline-none text-white" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Message</label>
                    <textarea name="message" rows={4} className="w-full p-3 rounded-lg bg-white/10 border border-white/10 focus:border-teal outline-none text-white resize-none" required></textarea>
                  </div>
                  <button type="submit" className="w-full bg-teal hover:bg-teal/80 text-white py-4 rounded-lg font-bold transition-all">
                    Send Message
                  </button>
                </form>
              </div>

              {/* Business Hours */}
              <div className="reveal space-y-8">
                <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                  <h3 className="text-xl font-bold mb-6 text-teal">Customer Support</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-gray-300">Monday - Friday</span>
                      <span className="text-white font-medium">9:00 AM - 6:00 PM GMT</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-gray-300">Saturday</span>
                      <span className="text-white font-medium">10:00 AM - 4:00 PM GMT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Sunday</span>
                      <span className="text-gray-400">Closed</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                  <h3 className="text-xl font-bold mb-6 text-coral">Technical Support</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-gray-300">Monday - Friday</span>
                      <span className="text-white font-medium">8:00 AM - 8:00 PM GMT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Sat - Sun</span>
                      <span className="text-white font-medium">10:00 AM - 6:00 PM GMT</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-4 italic">* Emergency support available 24/7 for critical issues</p>
                </div>
              </div>
            </div>

            {/* Contact FAQ */}
            <div className="max-w-4xl mx-auto mb-20 reveal">
              <h2 className="text-3xl font-bold mb-10 text-center">Quick Answers</h2>
              <p className="text-gray-400 text-center mb-8">Quick answers to common questions</p>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { q: "How much does ResumeAI Builder cost?", a: "ResumeAI Builder costs 500 FCFA per download. You only pay when you're satisfied with your resume and ready to download it. There are no subscription fees or hidden costs." },
                  { q: "Can I edit my resume after downloading?", a: "Yes, you can continue editing your resume in our builder even after downloading. However, each new download will require a separate payment of 500 FCFA." },
                  { q: "What payment methods do you accept?", a: "We accept mobile money payments (MTN Mobile Money, Orange Money), credit/debit cards, and PayPal. All payments are processed securely through our trusted payment partners." },
                  { q: "Is my data safe with ResumeAI Builder?", a: "Absolutely! We use client-side processing, which means your data never leaves your device. We don't store your personal information or resume content on our servers." },
                  { q: "Do you offer refunds?", a: "Yes, we offer a 100% satisfaction guarantee. If you're not happy with the quality of your resume, contact us within 7 days of purchase for a full refund." },
                  { q: "Can I use ResumeAI Builder on my phone?", a: "Yes! ResumeAI Builder is fully responsive and works great on mobile devices, tablets, and desktop computers. You can create and edit your resume anywhere, anytime." }
                ].map((faq, i) => (
                  <div key={i} className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <h3 className="font-bold text-teal mb-2">{faq.q}</h3>
                    <p className="text-gray-300 text-sm">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center max-w-3xl mx-auto bg-gradient-to-br from-navy to-teal/20 p-12 rounded-3xl border border-teal/30 reveal">
              <h2 className="text-3xl font-bold mb-4">Ready to Build Your Professional Resume?</h2>
              <p className="text-gray-300 mb-8">Don't wait to advance your career. Start creating your professional resume today!</p>
              <div className="flex justify-center gap-4 flex-col sm:flex-row">
                <button onClick={onStart} className="bg-teal hover:bg-teal/80 text-white px-8 py-3 rounded-lg font-bold shadow-lg">Start Building Now</button>
                <button onClick={onStart} className="border border-white hover:bg-white hover:text-navy text-white px-8 py-3 rounded-lg font-bold">Try Free Demo</button>
              </div>
              <p className="text-xs text-gray-400 mt-6">500 FCFA per download • No subscription • 100% satisfaction guarantee</p>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 relative z-10 bg-navy/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <Logo variant="dark" className="landing-logo" textClassName="text-white landing-gradient-text" />
          </div>
          <p className="text-gray-400 mb-6">Transforming careers with AI-powered resume building technology.</p>
          <div className="flex justify-center space-x-6 mb-6 text-sm text-gray-400">
            <button onClick={() => { setView('privacy'); window.scrollTo(0, 0); }} className="hover:text-teal">Privacy Policy</button>
            <button onClick={() => { setView('terms'); window.scrollTo(0, 0); }} className="hover:text-teal">Terms of Service</button>
            <button onClick={() => { setView('contact'); window.scrollTo(0, 0); }} className="hover:text-teal">Contact</button>
          </div>
          <p className="text-gray-500 text-xs">© 2025 ResumeAI Builder. All rights reserved. Powered by Google's Gemini AI.</p>
        </div>
      </footer>
    </div>
  );
};
