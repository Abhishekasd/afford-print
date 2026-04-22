# Afford Print - Cinematic Student Print Hub

A high-performance, cinematic web experience designed for students. Built with technical precision, high-trust aesthetics, and seamless WhatsApp integration.

## 🚀 Key Features

- **9-Scene Cinematic Storytelling**: Scroll-driven narrative using GSAP and Lenis.
- **Magnetic Interaction System**: Custom cursor trail and spring-based glow effects.
- **Real-time Admin Dashboard**: Manage orders, track status, and view files in real-time with Supabase.
- **Instant WhatsApp Checkout**: Automated payload generation for one-click order confirmation.
- **Mobile-First Design**: Fully responsive, glassmorphic UI optimized for the student lifestyle.

## 🛠 Tech Stack

- **Framework**: React + Vite
- **Animations**: GSAP, Framer Motion, Lenis (Smooth Scroll)
- **Backend**: Supabase (Database + Storage)
- **Icons**: Lucide React
- **Typography**: Space Grotesk (Display) & Inter (Body)

## 📦 Setup Instructions

1. **Clone the repository** and install dependencies:
   ```bash
   npm install
   ```

2. **Supabase Configuration**:
   - Create a project on [Supabase](https://supabase.com/).
   - Create a Storage Bucket named `print-files` and set its privacy to **Public** (or configure RLS).
   - Create a table named `orders` with the following columns:
     - `id` (uuid, primary key)
     - `name` (text)
     - `phone` (text)
     - `file_url` (text)
     - `instructions` (text)
     - `status` (text, default: 'pending')
     - `created_at` (timestamp)
   - Update `.env` with your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

3. **Run locally**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## 🎨 Design Tokens

- **Primary Blue**: `#0A3D62` (Trust)
- **Accent Green**: `#27AE60` (Action)
- **Glass Blur**: `8px`
- **Typography**: Editorial Display (Space Grotesk)

## 📋 Success Metrics

- **Performance**: LCP < 1.5s
- **Conversion**: WhatsApp CTA CTR targets > 15%
- **Experience**: Zero-jank cinematic scroll storytelling.

---
© 2026 Afford Print. Stitched with care for the student community.
