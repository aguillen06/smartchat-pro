# Symtri AI Design System
**Complete reference for creating consistent product pages**

*Last Updated: December 17, 2025*

---

## 🎨 Brand Colors
```css
/* Primary Accent */
--teal-primary: #10B981;      /* Main brand color */
--teal-dark: #0D9488;         /* Darker variation for dashboard/widget */

/* Text Colors */
--text-primary: #0f172a;      /* Headlines, strong emphasis */
--text-secondary: #64748b;    /* Body text, descriptions */
--text-muted: #94a3b8;        /* Subtle text, captions */

/* Backgrounds */
--bg-white: #ffffff;          /* Main background */
--bg-light: #f9fafb;          /* Alternate sections */
--bg-dark: #0f172a;           /* Dark sections (Problem, CTA, Footer) */
--bg-dark-alt: #1e293b;       /* Footer background */

/* UI Elements */
--border-light: #e5e7eb;      /* Borders, dividers */
```

---

## 📝 Typography

### Fonts
```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

**Primary Font:** `Inter` - Body text, descriptions, UI elements  
**Display Font:** `Space Grotesk` - Headlines (optional)

### Font Sizes
```css
/* Headlines */
h1: 4rem (64px) - Hero headlines
h2: 2.5rem (40px) - Section titles
h3: 1.25rem (20px) - Card titles

/* Body */
body: 1rem (16px) - Default
large: 1.25rem (20px) - Hero subtext
small: 0.875rem (14px) - Captions, labels
```

### Font Weights
- 300: Light
- 400: Regular
- 500: Medium
- 600: Semi-bold
- 700: Bold
- 800: Extra-bold (hero headlines)

---

## 🎭 Animated Mesh Background

### HTML Structure
```html
<section style="position: relative; min-height: 100vh; overflow: hidden;">
  <canvas id="grid-canvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0;"></canvas>
  
  <div style="position: relative; z-index: 1;">
    <!-- Your content here -->
  </div>
</section>
```

### JavaScript Animation Code
```javascript
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
    
    // Update particles
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
      
      // Draw dots (lighter for main site style)
      this.ctx.fillStyle = 'rgba(100, 116, 139, 0.15)';
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    // Draw connecting lines
    this.particles.forEach((p1, i) => {
      this.particles.slice(i + 1).forEach(p2 => {
        let dx = p1.x - p2.x;
        let dy = p1.y - p2.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          // Lighter opacity for subtle effect
          this.ctx.strokeStyle = `rgba(16, 185, 129, ${(1 - distance / 100) * 0.08})`;
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

// Initialize on page load
window.addEventListener('load', () => {
  const canvas = document.getElementById('grid-canvas');
  if (canvas) new GridAnimation(canvas);
});
```

**Key Parameters:**
- `spacing: 80` - Distance between grid points
- `mouse.radius: 150` - Mouse interaction radius
- `rgba(16, 185, 129, 0.08)` - Line opacity (lighter = more subtle)
- `rgba(100, 116, 139, 0.15)` - Dot opacity

---

## 🏗️ Page Structure Template
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Product Name - Symtri AI</title>
  <meta name="description" content="Product description for SEO">
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  
  <style>
    /* CSS Variables */
    :root {
      --teal-primary: #10B981;
      --teal-dark: #0D9488;
      --text-primary: #0f172a;
      --text-secondary: #64748b;
      --text-muted: #94a3b8;
      --bg-white: #ffffff;
      --bg-light: #f9fafb;
      --bg-dark: #0f172a;
      --border-light: #e5e7eb;
    }
    
    /* Base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: var(--text-secondary);
      line-height: 1.6;
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
    
    .fade-in-up {
      animation: fadeInUp 0.6s ease-out forwards;
      opacity: 0;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <!-- Hero with Canvas -->
  <!-- Problem Section -->
  <!-- Features Section -->
  <!-- How It Works -->
  <!-- Pricing -->
  <!-- CTA -->
  <!-- Footer -->
  
  <!-- Scripts -->
  <script src="/js/components.js"></script>
  <script>
    // Grid animation code here
  </script>
</body>
</html>
```

---

## 📦 Component Patterns

### 1. Header (Fixed)
```html
<header style="
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 2rem;
  z-index: 1000;
">
  <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
    <div style="font-size: 1.5rem; font-weight: 700; color: #0f172a;">
      SYMTRI <span style="color: #10B981;">AI</span>
    </div>
    <nav>
      <!-- Nav links -->
    </nav>
    <a href="https://calendly.com/symtri-ai/30min" style="
      background: #10B981;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 9999px;
      text-decoration: none;
      font-weight: 600;
    ">Schedule Demo</a>
  </div>
</header>
```

### 2. Hero Section with Badge
```html
<section style="
  position: relative;
  padding: 8rem 2rem 4rem;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
">
  <canvas id="grid-canvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0;"></canvas>
  
  <div style="position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; text-align: center;">
    <!-- Badge -->
    <div style="
      display: inline-block;
      background: #10B981;
      color: white;
      padding: 0.5rem 1.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      margin-bottom: 2rem;
    ">PRODUCT NAME</div>
    
    <!-- Headline -->
    <h1 style="
      font-size: 4rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 1.5rem;
      line-height: 1.1;
    ">
      Main Headline <span style="color: #10B981;">Green Accent</span>
    </h1>
    
    <!-- Subheadline -->
    <p style="
      font-size: 1.25rem;
      color: #64748b;
      max-width: 800px;
      margin: 0 auto 3rem;
    ">
      Product description and value proposition
    </p>
    
    <!-- CTAs -->
    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
      <a href="#" style="
        background: #10B981;
        color: white;
        padding: 1rem 2rem;
        border-radius: 9999px;
        text-decoration: none;
        font-weight: 600;
      ">Primary CTA</a>
      <a href="#" style="
        border: 2px solid #10B981;
        color: #10B981;
        padding: 1rem 2rem;
        border-radius: 9999px;
        text-decoration: none;
        font-weight: 600;
      ">Secondary CTA</a>
    </div>
    
    <!-- Trust Indicators -->
    <div style="
      margin-top: 2rem;
      font-size: 0.875rem;
      color: #94a3b8;
      display: flex;
      gap: 2rem;
      justify-content: center;
    ">
      <span>✓ Feature 1</span>
      <span>✓ Feature 2</span>
      <span>✓ Feature 3</span>
    </div>
  </div>
</section>
```

### 3. Problem Section (Dark Background)
```html
<section style="
  background: #0f172a;
  color: white;
  padding: 4rem 2rem;
">
  <div style="max-width: 1200px; margin: 0 auto;">
    <h2 style="
      font-size: 2.5rem;
      font-weight: 700;
      text-align: center;
      margin-bottom: 3rem;
    ">The Problem with [Topic]</h2>
    
    <div style="
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    ">
      <div style="text-align: center;">
        <div style="font-size: 3rem; font-weight: 800; color: #10B981; margin-bottom: 0.5rem;">70%</div>
        <div style="color: #94a3b8;">Stat description</div>
      </div>
      <!-- Repeat for more stats -->
    </div>
  </div>
</section>
```

### 4. Features Grid
```html
<section style="max-width: 1200px; margin: 4rem auto; padding: 0 2rem;">
  <h2 style="
    font-size: 2.5rem;
    font-weight: 700;
    text-align: center;
    color: #0f172a;
    margin-bottom: 3rem;
  ">Everything You Need</h2>
  
  <div style="
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  ">
    <div style="
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    ">
      <div style="font-size: 2rem; margin-bottom: 1rem;">🎯</div>
      <h3 style="font-size: 1.25rem; font-weight: 600; color: #0f172a; margin-bottom: 0.5rem;">Feature Title</h3>
      <p style="color: #64748b;">Feature description</p>
    </div>
    <!-- Repeat for more features -->
  </div>
</section>
```

### 5. Pricing Cards
```html
<section style="max-width: 1200px; margin: 4rem auto; padding: 0 2rem;">
  <h2 style="text-align: center; font-size: 2.5rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem;">
    Simple, Transparent Pricing
  </h2>
  <p style="text-align: center; color: #64748b; font-size: 1.125rem; margin-bottom: 3rem;">
    Deploy in 7-10 days. See ROI in 30 days.
  </p>
  
  <div style="
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    max-width: 900px;
    margin: 0 auto;
  ">
    <!-- Standard Plan -->
    <div style="
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      border: 2px solid #e5e7eb;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    ">
      <div style="font-size: 0.875rem; font-weight: 700; color: #64748b; letter-spacing: 0.1em; margin-bottom: 1rem;">
        STARTER
      </div>
      <div style="font-size: 3rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem;">
        $297<span style="font-size: 1.25rem; font-weight: 400; color: #64748b;">/mo</span>
      </div>
      <div style="color: #64748b; font-size: 0.875rem; margin-bottom: 2rem;">
        + $1,500 setup fee
      </div>
      <ul style="list-style: none; padding: 0; margin: 0 0 2rem 0; color: #64748b;">
        <li style="margin-bottom: 0.75rem;">✓ Feature 1</li>
        <li style="margin-bottom: 0.75rem;">✓ Feature 2</li>
        <li style="margin-bottom: 0.75rem;">✓ Feature 3</li>
      </ul>
      <a href="#" style="
        display: block;
        text-align: center;
        background: white;
        color: #10B981;
        border: 2px solid #10B981;
        padding: 0.75rem;
        border-radius: 9999px;
        text-decoration: none;
        font-weight: 600;
      ">Get Started</a>
    </div>
    
    <!-- Popular Plan (Highlighted) -->
    <div style="
      background: #10B981;
      padding: 2rem;
      border-radius: 1rem;
      border: 2px solid #10B981;
      box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
      transform: scale(1.05);
      color: white;
    ">
      <div style="font-size: 0.875rem; font-weight: 700; letter-spacing: 0.1em; margin-bottom: 1rem;">
        PROFESSIONAL (MOST POPULAR)
      </div>
      <div style="font-size: 3rem; font-weight: 800; margin-bottom: 0.5rem;">
        $397<span style="font-size: 1.25rem; font-weight: 400; opacity: 0.8;">/mo</span>
      </div>
      <div style="font-size: 0.875rem; margin-bottom: 2rem; opacity: 0.8;">
        + $1,500 setup fee
      </div>
      <ul style="list-style: none; padding: 0; margin: 0 0 2rem 0;">
        <li style="margin-bottom: 0.75rem;">✓ Feature 1</li>
        <li style="margin-bottom: 0.75rem;">✓ Feature 2</li>
        <li style="margin-bottom: 0.75rem;">✓ Feature 3</li>
      </ul>
      <a href="#" style="
        display: block;
        text-align: center;
        background: white;
        color: #10B981;
        padding: 0.75rem;
        border-radius: 9999px;
        text-decoration: none;
        font-weight: 600;
      ">Get Started</a>
    </div>
    
    <!-- Third plan same as first style -->
  </div>
</section>
```

### 6. CTA Section
```html
<section style="
  background: #0f172a;
  color: white;
  padding: 4rem 2rem;
  text-align: center;
">
  <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem;">
    Ready to Transform Your Business?
  </h2>
  <p style="
    font-size: 1.125rem;
    color: #94a3b8;
    max-width: 600px;
    margin: 0 auto 2rem;
  ">
    CTA description text
  </p>
  <a href="https://calendly.com/symtri-ai/30min" style="
    background: #10B981;
    color: white;
    padding: 1rem 2rem;
    border-radius: 9999px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1rem;
    display: inline-block;
  ">Schedule Free Consultation</a>
</section>
```

### 7. Footer
```html
<footer style="
  background: #1e293b;
  color: #94a3b8;
  padding: 3rem 2rem;
">
  <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
    <div style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 1rem;">
      SYMTRI <span style="color: #10B981;">AI</span>
    </div>
    <p style="margin-bottom: 1rem;">Learn AI. Automate Growth.</p>
    <p style="font-size: 0.875rem;">Based in Brownsville, Texas 🇺🇸</p>
    <p style="font-size: 0.875rem; margin-top: 2rem;">
      © 2025 Symtri AI LLC. All rights reserved.
    </p>
  </div>
</footer>
```

---

## 📐 Layout Guidelines

### Spacing
- Section padding: `4rem 2rem`
- Element gaps: `1rem`, `2rem`, `3rem`
- Max content width: `1200px`
- Card padding: `2rem`

### Border Radius
- Buttons: `9999px` (fully rounded)
- Cards: `1rem` (16px)
- Badges: `9999px` (fully rounded)

### Shadows
- Light: `0 4px 6px rgba(0, 0, 0, 0.05)`
- Medium: `0 8px 16px rgba(16, 185, 129, 0.3)`

---

## 🔗 External Links

### Required CTAs
- Primary: https://calendly.com/symtri-ai/30min
- Phone: tel:+19566921385
- Email: hello@symtri.ai

### Social Links (if needed)
- LinkedIn: [Add when available]
- Twitter: [Add when available]

---

## 📱 Responsive Breakpoints
```css
/* Mobile first approach */
@media (max-width: 768px) {
  h1 { font-size: 2.5rem; }
  h2 { font-size: 2rem; }
  .grid { grid-template-columns: 1fr; }
}

@media (min-width: 769px) and (max-width: 1024px) {
  /* Tablet styles */
}

@media (min-width: 1025px) {
  /* Desktop styles */
}
```

---

## 🚀 Deployment Checklist

### Before Launch
- [ ] Update page title and meta description
- [ ] Replace placeholder content
- [ ] Test all CTAs (Calendly, phone, email)
- [ ] Verify pricing numbers
- [ ] Check all links work
- [ ] Test on mobile
- [ ] Verify mesh animation works
- [ ] Add to sitemap

### File Locations
- **Static HTML pages:** `/public/[product]-landing.html`
- **Next.js pages:** `/app/[product]/page.tsx`
- **Shared components:** `/js/components.js`
- **Assets:** `/public/images/`, `/public/icons/`

---

## 🎯 Product Page Naming Convention

**Format:** `[product]-landing.html` or `/[product]/`

**Examples:**
- SmartChat: `/smartchat/` or `smartchat-landing.html`
- PhoneBot: `/phonebot/` or `phonebot-landing.html`
- LeadFlow: `/leadflow/` or `leadflow-landing.html`

---

## 📋 Content Template

Use this template for new product pages:
```markdown
# [Product Name] Landing Page Content

## Hero
- Badge: [PRODUCT NAME]
- Headline: [Main Value Prop] <green accent word>
- Subheadline: [Detailed description, 20-30 words]
- CTA 1: Start Free Trial / Schedule Consultation
- CTA 2: See Demo / Call Now
- Trust: ✓ [Feature 1] ✓ [Feature 2] ✓ [Feature 3]

## Problem Section (4 stats)
1. [Percentage]% - [Problem description]
2. [Number] - [Problem description]
3. $[Amount] - [Cost problem]
4. [Number]+ - [Missed opportunity]

## Features (6 cards)
1. 🎯 [Feature] - [Description]
2. 📧 [Feature] - [Description]
3. 📊 [Feature] - [Description]
4. ⚡ [Feature] - [Description]
5. 🌙 [Feature] - [Description]
6. 🔒 [Feature] - [Description]

## How It Works (3 steps)
1. [Action] - [Description]
2. [Action] - [Description]
3. [Action] - [Description]

## Pricing (3 tiers)
- Starter: $297/mo + $1,500 setup
- Professional: $397/mo + $1,500 setup (POPULAR)
- Healthcare/Enterprise: $597-797/mo + $2,000 setup

## CTA
- Headline: Ready to [Outcome]?
- Description: [Value prop, 20-30 words]
- Button: Schedule Free Consultation
```

---

## 🛠️ Quick Start: New Product Page
```bash
# 1. Copy PhoneBot template
cp ~/Symtri-Ai/website/phonebot/index.html ~/smartchat-pro/public/newproduct-landing.html

# 2. Replace product name
sed -i '' 's/PhoneBot/NewProduct/g' ~/smartchat-pro/public/newproduct-landing.html
sed -i '' 's/PHONEBOT/NEWPRODUCT/g' ~/smartchat-pro/public/newproduct-landing.html

# 3. Update hero headline
sed -i '' 's/AI Calls That/AI [New Thing] That/g' ~/smartchat-pro/public/newproduct-landing.html

# 4. Update problem stats (manually edit the file)
# 5. Update features (manually edit the file)
# 6. Update pricing if different
# 7. Test and deploy
```

---

## 📞 Support

Questions about the design system?
- Contact: Andres Guillen, CEO
- Email: hello@symtri.ai
- Phone: (956) 692-1385

---

*This design system ensures all Symtri AI product pages maintain consistent branding, user experience, and conversion optimization.*
