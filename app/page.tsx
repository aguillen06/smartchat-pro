export default function Home() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Symtri AI SmartChat - AI-Powered Website Chat</title>
        <meta name="description" content="24/7 AI chat that captures leads, answers questions, and books appointments. Bilingual support. Deploy in 2 weeks." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        
        <style dangerouslySetInnerHTML={{__html: `
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f9fafb;
            overflow-x: hidden;
          }
          
          /* Animations */
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
          
          .fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
            opacity: 0;
          }
          
          .delay-1 { animation-delay: 0.1s; }
          .delay-2 { animation-delay: 0.2s; }
          .delay-3 { animation-delay: 0.3s; }
          .delay-4 { animation-delay: 0.4s; }
          
          .pulse {
            animation: pulse 1.5s ease infinite;
          }
          
          /* Canvas Container */
          .hero-canvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
          }
          
          .hero-content {
            position: relative;
            z-index: 1;
          }
        `}} />
      </head>
      <body>
        {/* Header */}
        <header style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #e5e7eb',
          padding: '1rem 2rem',
          zIndex: 1000
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
              SYMTRI <span style={{ color: '#10B981' }}>AI</span>
            </div>
            <a href="https://calendly.com/symtri-ai/30min" target="_blank" rel="noopener noreferrer" style={{
              backgroundColor: '#10B981',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '9999px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              transition: 'transform 0.2s'
            }}>
              Schedule Demo
            </a>
          </div>
        </header>

        {/* Hero with Animated Background */}
        <section style={{
          position: 'relative',
          paddingTop: '8rem',
          paddingBottom: '4rem',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          background: 'linear-gradient(to bottom, #f9fafb, #ffffff)'
        }}>
          <canvas id="grid-canvas" className="hero-canvas" />
          
          <div className="hero-content fade-in-up" style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 2rem',
            textAlign: 'center',
            width: '100%'
          }}>
            <div className="fade-in-up delay-1" style={{
              display: 'inline-block',
              backgroundColor: '#10B981',
              color: 'white',
              padding: '0.5rem 1.5rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              marginBottom: '2rem'
            }}>
              SMARTCHAT
            </div>
            
            <h1 className="fade-in-up delay-2" style={{
              fontSize: '4rem',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: '1.5rem',
              lineHeight: 1.1
            }}>
              AI Chat That <span style={{ color: '#10B981' }}>Converts</span>
            </h1>
            
            <p className="fade-in-up delay-3" style={{
              fontSize: '1.25rem',
              color: '#64748b',
              maxWidth: '800px',
              margin: '0 auto 3rem',
              lineHeight: 1.6
            }}>
              24/7 AI chatbot that captures leads, answers questions, and books appointments in English and Spanish. Deploy in 7-10 days, see ROI in 30 days.
            </p>

            <div className="fade-in-up delay-4" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <a href="https://calendly.com/symtri-ai/30min" target="_blank" rel="noopener noreferrer" style={{
                backgroundColor: '#10B981',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '9999px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                transition: 'transform 0.2s'
              }}>
                Start Free Consultation
              </a>
              <a href="tel:+19566921385" style={{
                border: '2px solid #10B981',
                color: '#10B981',
                backgroundColor: 'transparent',
                padding: '1rem 2rem',
                borderRadius: '9999px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                transition: 'transform 0.2s'
              }}>
                Call (956) 692-1385
              </a>
            </div>

            <div style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
              display: 'flex',
              gap: '2rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <span>✓ 7-10 day deployment</span>
              <span>✓ Bilingual (EN/ES)</span>
              <span>✓ No contracts</span>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section style={{
          backgroundColor: '#0f172a',
          color: 'white',
          padding: '4rem 2rem',
          marginBottom: '4rem'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: '3rem'
            }}>
              The Problem with Website Chat
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: '#10B981', marginBottom: '0.5rem' }}>70%</div>
                <div style={{ color: '#94a3b8' }}>of website visitors leave without engaging</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: '#10B981', marginBottom: '0.5rem' }}>24/7</div>
                <div style={{ color: '#94a3b8' }}>visitors need support outside business hours</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: '#10B981', marginBottom: '0.5rem' }}>$2.5K</div>
                <div style={{ color: '#94a3b8' }}>average monthly cost per live chat agent</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: '#10B981', marginBottom: '0.5rem' }}>15+</div>
                <div style={{ color: '#94a3b8' }}>qualified leads lost per month</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ maxWidth: '1200px', margin: '0 auto 4rem', padding: '0 2rem' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            textAlign: 'center',
            color: '#0f172a',
            marginBottom: '3rem'
          }}>
            Everything You Need
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {[
              { icon: '💬', title: 'AI-Powered Conversations', desc: 'Natural responses in English and Spanish using your knowledge base' },
              { icon: '📧', title: 'Automatic Lead Capture', desc: 'Collects emails and phone numbers naturally during conversations' },
              { icon: '📊', title: 'Real-Time Dashboard', desc: 'Track conversations, leads, and analytics in one place' },
              { icon: '⚡', title: '7-10 Day Setup', desc: 'We handle everything - you just provide business info' },
              { icon: '🌙', title: '24/7 Availability', desc: 'Never miss a lead, even after hours and weekends' },
              { icon: '🔒', title: 'Secure & Reliable', desc: 'Enterprise-grade security with HIPAA compliance available' }
            ].map((feature, i) => (
              <div key={i} style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.2s'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>{feature.title}</h3>
                <p style={{ color: '#64748b' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section style={{
          backgroundColor: '#f9fafb',
          padding: '4rem 2rem',
          marginBottom: '4rem'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              textAlign: 'center',
              color: '#0f172a',
              marginBottom: '3rem'
            }}>
              Get Started in 3 Steps
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '3rem'
            }}>
              {[
                { num: 1, title: 'Schedule Consultation', desc: 'Book a 30-minute call to discuss your business needs' },
                { num: 2, title: 'We Build & Customize', desc: 'We set up your chatbot, train it, and match your branding' },
                { num: 3, title: 'Go Live', desc: 'Copy one line of code to your website and start capturing leads' }
              ].map((step) => (
                <div key={step.num} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#10B981',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: 700,
                    margin: '0 auto 1.5rem'
                  }}>{step.num}</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>{step.title}</h3>
                  <p style={{ color: '#64748b' }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section style={{ maxWidth: '1200px', margin: '0 auto 4rem', padding: '0 2rem' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            textAlign: 'center',
            color: '#0f172a',
            marginBottom: '1rem'
          }}>
            Simple, Transparent Pricing
          </h2>
          <p style={{
            textAlign: 'center',
            color: '#64748b',
            fontSize: '1.125rem',
            marginBottom: '3rem'
          }}>
            Deploy in 7-10 days. See ROI in 30 days.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            {[
              { name: 'STARTER', price: 297, setup: 1500, features: ['1,000 conversations/month', 'Bilingual (EN/ES)', 'Lead capture', 'Email notifications'], popular: false },
              { name: 'PROFESSIONAL', price: 397, setup: 1500, features: ['3,000 conversations/month', 'CRM integration', 'Calendar booking', 'Priority support'], popular: true },
              { name: 'HEALTHCARE', price: 597, setup: 2000, features: ['HIPAA compliant', 'BAA included', 'Unlimited conversations', 'Dedicated support'], popular: false }
            ].map((plan) => (
              <div key={plan.name} style={{
                backgroundColor: plan.popular ? '#10B981' : 'white',
                padding: '2rem',
                borderRadius: '1rem',
                border: plan.popular ? '2px solid #10B981' : '2px solid #e5e7eb',
                boxShadow: plan.popular ? '0 8px 16px rgba(16, 185, 129, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.05)',
                transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                color: plan.popular ? 'white' : '#64748b'
              }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '1rem', opacity: plan.popular ? 1 : 0.7 }}>
                  {plan.name} {plan.popular && '(MOST POPULAR)'}
                </div>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: plan.popular ? 'white' : '#0f172a', marginBottom: '0.5rem' }}>
                  ${plan.price}<span style={{ fontSize: '1.25rem', fontWeight: 400, opacity: 0.7 }}>/mo</span>
                </div>
                <div style={{ fontSize: '0.875rem', marginBottom: '2rem', opacity: 0.7 }}>+ ${plan.setup.toLocaleString()} setup fee</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0' }}>
                  {plan.features.map((feature, i) => (
                    <li key={i} style={{ marginBottom: '0.75rem' }}>✓ {feature}</li>
                  ))}
                </ul>
                <a href="https://calendly.com/symtri-ai/30min" target="_blank" rel="noopener noreferrer" style={{
                  display: 'block',
                  textAlign: 'center',
                  backgroundColor: plan.popular ? 'white' : 'white',
                  color: '#10B981',
                  border: plan.popular ? 'none' : '2px solid #10B981',
                  padding: '0.75rem',
                  borderRadius: '9999px',
                  textDecoration: 'none',
                  fontWeight: 600
                }}>
                  Get Started
                </a>
              </div>
            ))}
          </div>

          <p style={{
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '0.875rem',
            marginTop: '2rem'
          }}>
            Special offer: First 5 customers get 50% off setup fee
          </p>
        </section>

        {/* CTA */}
        <section style={{
          backgroundColor: '#0f172a',
          color: 'white',
          padding: '4rem 2rem',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            marginBottom: '1rem'
          }}>
            Ready to Capture More Leads?
          </h2>
          <p style={{
            fontSize: '1.125rem',
            color: '#94a3b8',
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            Schedule a free consultation and see how Symtri AI SmartChat can transform your website into a 24/7 lead generation machine.
          </p>
          <a href="https://calendly.com/symtri-ai/30min" target="_blank" rel="noopener noreferrer" style={{
            backgroundColor: '#10B981',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '9999px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '1rem',
            display: 'inline-block'
          }}>
            Schedule Free Consultation
          </a>
        </section>

        {/* Footer */}
        <footer style={{
          backgroundColor: '#1e293b',
          color: '#94a3b8',
          padding: '3rem 2rem',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'white',
              marginBottom: '1rem'
            }}>
              SYMTRI <span style={{ color: '#10B981' }}>AI</span>
            </div>
            <p style={{ marginBottom: '1rem' }}>
              Learn AI. Automate Growth.
            </p>
            <p style={{ fontSize: '0.875rem' }}>
              Based in Brownsville, Texas 🇺🇸
            </p>
            <p style={{ fontSize: '0.875rem', marginTop: '2rem' }}>
              © 2025 Symtri AI LLC. All rights reserved.
            </p>
          </div>
        </footer>

        {/* Grid Animation Script */}
        <script dangerouslySetInnerHTML={{__html: `
          class GridAnimation {
            constructor(canvas) {
              this.canvas = canvas;
              this.ctx = canvas.getContext('2d');
              this.particles = [];
              this.mouse = { x: null, y: null, radius: 150 };
              
              this.resize();
              this.init();
              this.animate();
              
              window.addEventListener('resize', () => this.resize());
              canvas.addEventListener('mousemove', (e) => {
                const rect = canvas.getBoundingClientRect();
                this.mouse.x = e.clientX - rect.left;
                this.mouse.y = e.clientY - rect.top;
              });
              canvas.addEventListener('mouseleave', () => {
                this.mouse.x = null;
                this.mouse.y = null;
              });
            }
            
            resize() {
              this.canvas.width = this.canvas.offsetWidth;
              this.canvas.height = this.canvas.offsetHeight;
            }
            
            init() {
              this.particles = [];
              const spacing = 80;
              const cols = Math.ceil(this.canvas.width / spacing);
              const rows = Math.ceil(this.canvas.height / spacing);
              
              for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                  this.particles.push({
                    x: i * spacing,
                    y: j * spacing,
                    baseX: i * spacing,
                    baseY: j * spacing,
                    vx: 0,
                    vy: 0
                  });
                }
              }
            }
            
            animate() {
              this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
              
              this.particles.forEach(p => {
                let dx = this.mouse.x - p.x;
                let dy = this.mouse.y - p.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let forceX = 0, forceY = 0;
                
                if (distance < this.mouse.radius) {
                  let force = (this.mouse.radius - distance) / this.mouse.radius;
                  forceX = (dx / distance) * force * -30;
                  forceY = (dy / distance) * force * -30;
                }
                
                p.vx += (p.baseX - p.x) * 0.05 + forceX * 0.02;
                p.vy += (p.baseY - p.y) * 0.05 + forceY * 0.02;
                p.vx *= 0.95;
                p.vy *= 0.95;
                p.x += p.vx;
                p.y += p.vy;
                
                this.ctx.fillStyle = 'rgba(100, 116, 139, 0.3)';
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                this.ctx.fill();
              });
              
              this.particles.forEach((p1, i) => {
                this.particles.slice(i + 1).forEach(p2 => {
                  let dx = p1.x - p2.x;
                  let dy = p1.y - p2.y;
                  let distance = Math.sqrt(dx * dx + dy * dy);
                  
                  if (distance < 100) {
                    this.ctx.strokeStyle = \`rgba(16, 185, 129, \${(1 - distance / 100) * 0.2})\`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                  }
                });
              });
              
              requestAnimationFrame(() => this.animate());
            }
          }
          
          window.addEventListener('load', () => {
            const canvas = document.getElementById('grid-canvas');
            if (canvas) new GridAnimation(canvas);
          });
        `}} />
      </body>
    </html>
  );
}
