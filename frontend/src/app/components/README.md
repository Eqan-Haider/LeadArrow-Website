# LeadArrow — File Structure Guide

## Where each file goes in your Next.js project

```
src/
└── app/
    ├── page.js                          ← MAIN PAGE (assembles all components)
    └── components/
        ├── BackgroundSystem.jsx         ← Animated particle canvas + ambient orbs + grid
        ├── Navbar.jsx                   ← Fixed glassmorphic navbar with premium logo
        ├── HeroSection.jsx              ← Hero headline, 3D alert card, CTAs
        ├── ContentSections.jsx          ← "How It Works" + "Features" sections
        ├── IntegrationsAndFaq.jsx       ← Integrations grid + FAQ accordion
        ├── PricingSection.jsx           ← Pricing cards + consultation tab + modal trigger
        ├── StatsCTAFooter.jsx           ← Stats bar + Final CTA + Footer
        └── BookingModal.jsx             ← Calendly booking modal
```

## Setup steps

1. Copy `page.js` → `src/app/page.js`
2. Create folder `src/app/components/`
3. Copy all `.jsx` files → `src/app/components/`
4. In `BookingModal.jsx` replace `https://calendly.com/` with your actual Calendly link
5. Make sure `public/leadarrow-logo.png` exists in your `/public` folder
6. Run `npm run dev`

## What was upgraded

| Area | What changed |
|---|---|
| Background | Live particle canvas with connecting lines, 5 ambient orbs at 140px blur, spinning 3D rings, CSS grid overlay, noise grain |
| Navbar | Floating pill with backdrop-blur-2xl, glowing logo container, breathing pulse ring, radar dot, shimmer sweep CTA |
| Hero | 85px font-black headline, multi-color gradient text, 3D rotating cube, 6s floating card animation, macOS-style alert card with progress bar |
| Cards | All glass: `bg-slate-950/70 backdrop-blur-xl`, top shimmer lines, left border sweep on hover, neon box shadows |
| Buttons | Shimmer sweep, dual-layer gradients, scale + shadow transitions |
| New sections | Integrations grid (8 platforms) + more strip, FAQ accordion with animated +/rotate |
| Pricing | Hyper-reflective featured card with blue bloom, shimmer sweep Buy Now button |
| Footer | 5-column, social links, hover glow on logo |
| Modal | Glassmorphic booking modal with backdrop blur |

## No external dependencies required
Everything uses vanilla Tailwind CSS + inline styles. No Framer Motion, no GSAP needed.
