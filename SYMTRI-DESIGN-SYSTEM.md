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

See full documentation for complete HTML template with all sections.

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

---

## 🚀 Quick Start: New Product Page

```bash
# 1. Copy PhoneBot template
cp ~/Symtri-Ai/website/phonebot/index.html ~/smartchat-pro/public/newproduct-landing.html

# 2. Replace product name
sed -i '' 's/PhoneBot/NewProduct/g' ~/smartchat-pro/public/newproduct-landing.html

# 3. Update content and deploy
```

---

*This design system ensures all Symtri AI product pages maintain consistent branding, user experience, and conversion optimization.*
