import React, { useEffect, useRef, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { 
  Upload, Smartphone, Clock, ShieldCheck, CheckCircle2, 
  ChevronDown, FileText,
  Image, Paperclip, PenTool, BookOpen, PenLine, Globe, Layout, User, MessageCircle,
  Zap, Lightbulb, Target, ExternalLink, Sun, Moon
} from 'lucide-react'
import { supabase } from './lib/supabase'
import './App.css'

const whatsappStyles = `
  .whatsapp-btn {
    transition: all 0.3s ease;
  }
  .whatsapp-btn:hover, .whatsapp-btn:focus {
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(39, 174, 96, 0.6);
  }
  .theme-toggle {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: var(--on-surface);
    padding: 8px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }
  .theme-toggle:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(15deg);
  }
  .dark .theme-toggle {
    background: rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.1);
    color: var(--accent);
  }
`

gsap.registerPlugin(ScrollTrigger)

const getAssetPath = (path) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${import.meta.env.BASE_URL}${cleanPath}`;
};

// --- Helper Components ---

function HeroAnimation() {
  const canvasRef = useRef(null)
  const [images, setImages] = useState([])
  const frameCount = 80
  const currentFrame = (index) => getAssetPath(`/hero-animation/afford hero image_${index.toString().padStart(3, '0')}.jpg`)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const loadedImages = []
    let loadedCount = 0

    const renderFrame = (index) => {
      const img = loadedImages[index]
      if (!img || !canvas || !context) return
      
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      
      const ratio = Math.max(canvas.width / img.width, canvas.height / img.height)
      const centerShift_x = (canvas.width - img.width * ratio) / 2
      const centerShift_y = (canvas.height - img.height * ratio) / 2
      
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio)
    }

    for (let i = 0; i < frameCount; i++) {
      const img = new window.Image()
      img.src = currentFrame(i)
      img.onload = () => {
        loadedImages[i] = img
        loadedCount++
        if (loadedCount === frameCount) {
          setImages(loadedImages)
          renderFrame(0)
          
          const sequence = { frame: 0 }
          gsap.to(sequence, {
            frame: frameCount - 1,
            snap: 'frame',
            ease: 'none',
            scrollTrigger: {
              trigger: '.hero-sequence-container',
              start: 'top top',
              end: '+=300%',
              scrub: 0.5,
              pin: true,
            },
            onUpdate: () => renderFrame(sequence.frame)
          })
        }
      }
    }

    const handleResize = () => {
      // Find current frame from scroll progress if possible, or just render frame 0
      renderFrame(0)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      ScrollTrigger.getAll().forEach(st => st.kill())
    }
  }, [])

  return (
    <div className="hero-sequence-container" style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      <div className="scene-content" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', textAlign: 'center' }}>
        <motion.h1 
          className="display-xl"
          style={{ color: 'white', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Print Smarter,<br />Not Harder.
        </motion.h1>
        <p style={{ fontSize: 'clamp(1rem, 4vw, 1.5rem)', marginTop: '24px', maxWidth: '600px', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)', padding: '0 20px' }}>
          The cinematic, high-speed printing solution designed for students who value precision over chaos.
        </p>

      </div>
    </div>
  )
}

function PricingSection() {
  const [activeTab, setActiveTab] = useState('printing')
  const [portfolioItems, setPortfolioItems] = useState([])

  useEffect(() => {
    const fetchPortfolio = async () => {
      const { data, error } = await supabase.from('portfolio').select('*').order('created_at', { ascending: false })
      if (!error) setPortfolioItems(data || [])
    }
    fetchPortfolio()
  }, [])

  const currentPortfolio = portfolioItems.filter(item => item.category === activeTab)

  const categories = {
    printing: [
      { name: 'Black & White', price: '₹1 / page', desc: 'High-quality for notes & docs.', icon: <FileText size={24} /> },
      { name: 'Color Printing', price: '₹5 / page', desc: 'Vibrant prints for presentations.', icon: <Image size={24} /> },
      { name: 'Spiral Binding', price: '₹25 / file', desc: 'Strong, neat practical files.', icon: <Paperclip size={24} /> }
    ],
    academic: [
      { name: 'Assignment Writing', price: 'Based on content', desc: 'Neat & formatted assignments.', icon: <PenTool size={24} /> },
      { name: 'Practical Files', price: 'Based on pages', desc: 'Well-structured presentation.', icon: <BookOpen size={24} /> },
      { name: 'Copy Writing', price: 'Based on content', desc: 'Clear, neat handwritten work.', icon: <PenLine size={24} /> }
    ],
    digital: [
      { name: 'Website Creation', price: 'From ₹499', desc: 'Simple, responsive student sites.', icon: <Globe size={24} /> },
      { name: 'PPT Design', price: '₹30 (7-8 slides)', desc: 'Academic-focused structures.', icon: <Layout size={24} /> },
      { name: 'Resume Design', price: 'From ₹50', desc: 'Professional student resumes.', icon: <User size={24} /> }
    ]
  }

  return (
    <section className="scene" id="pricing" style={{ background: 'var(--surface)' }}>
      <div className="scene-content">
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 className="headline-lg">Premium Services. Student Prices.</h2>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
            {Object.keys(categories).map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`button ${activeTab === cat ? 'button-primary' : ''}`}
                style={{ 
                  textTransform: 'capitalize', 
                  padding: '12px 24px', 
                  background: activeTab === cat ? 'var(--primary)' : 'rgba(0,0,0,0.05)', 
                  color: activeTab === cat ? 'white' : 'var(--on-surface)',
                  borderRadius: '30px',
                  minWidth: '120px'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="responsive-grid">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'contents' }}
            >
              {categories[activeTab].map((item, idx) => (
                <motion.div 
                  key={item.name}
                  className="glass-card"
                  whileHover={{ y: -5, boxShadow: 'var(--glass-glow)' }}
                >
                  <div style={{ color: 'var(--primary)', marginBottom: '16px' }}>{item.icon}</div>
                  <h3 style={{ marginBottom: '8px' }}>{item.name}</h3>
                  <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '16px' }}>{item.desc}</p>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>{item.price}</div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Past Work / Portfolio Gallery */}
        {currentPortfolio.length > 0 && (
          <div style={{ marginTop: '80px' }}>
            <h3 className="headline-sm" style={{ textAlign: 'center', marginBottom: '32px' }}>Our Past Work</h3>
            <div className="responsive-grid">
              <AnimatePresence mode="popLayout">
                {currentPortfolio.map((item, idx) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className="glass-card"
                    style={{ padding: '0', overflow: 'hidden' }}
                    whileHover={{ y: -5, boxShadow: 'var(--glass-glow)' }}
                  >
                    <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                    <div style={{ padding: '16px', textAlign: 'center', fontWeight: 600 }}>{item.title}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Why Choose Us */}
        <div className="responsive-grid" style={{ marginTop: '80px', textAlign: 'center' }}>
          {[
            { label: 'Transparent Pricing', icon: '💎' },
            { label: 'Affordable Rates', icon: '💰' },
            { label: 'Student Friendly', icon: '🎓' },
            { label: '24/7 Service', icon: '⏰' },
            { label: 'No Hidden Charges', icon: '✔️' }
          ].map(trust => (
            <div key={trust.label} style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{trust.icon}</div>
              {trust.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- Website Portfolio Data & Component ---

const PORTFOLIO_PROJECTS = [
  {
    id: 1,
    title: "ResumAI",
    url: "https://magnificent-toffee-843956.netlify.app/",
    image: "/portfolio/resumai.png",
    spark: "To create a high-impact digital identity that turns resumes into career-defining documents.",
    fix: "Eliminated the 'boring resume' syndrome with high-performance animations and cinematic layouts.",
    icon: <User size={32} />
  },
  {
    id: 2,
    title: "MultiTool Verse",
    url: "https://multitoolverse.netlify.app/",
    image: "/portfolio/multitool_verse.png",
    spark: "A vision for a centralized digital workshop where developers and students find everything they need in one place.",
    fix: "Solved tool-switching fatigue by consolidating utility tools into a single, high-speed interface.",
    icon: <Zap size={32} />
  },
  {
    id: 3,
    title: "Learning Hub",
    url: "https://tvslearninghub.netlify.app/",
    image: "/portfolio/learning_hub.png",
    spark: "To bridge the gap between complex academic resources and student accessibility.",
    fix: "Reduced navigation friction for educational content, making complex materials easy to digest.",
    icon: <BookOpen size={32} />
  },
  {
    id: 4,
    title: "Morning Muse",
    url: "https://morningmuse.netlify.app/",
    image: "/portfolio/morning_muse.png",
    spark: "Created to redefine the morning routine as a source of creative inspiration rather than a drain.",
    fix: "Solved the 'morning brain fog' by delivering structured, inspiring content at the peak of focus.",
    icon: <Target size={32} />
  },
  {
    id: 5,
    title: "The Age Clock",
    url: "https://theageclock.netlify.app/",
    image: "/portfolio/age_clock.png",
    spark: "To provide a visceral, real-time visualization of life's most precious asset: Time.",
    fix: "Turned abstract biological data into a grounding, philosophical tool for daily perspective.",
    icon: <Clock size={32} />
  },
  {
    id: 6,
    title: "LetterCraft AI",
    url: "https://lettercraftai.netlify.app/",
    image: "/portfolio/lettercraft.png",
    spark: "Harnessing AI to remove the anxiety and time-sink of formal correspondence.",
    fix: "Instant generation of professional, tone-accurate letters, saving hours of manual drafting.",
    icon: <PenLine size={32} />
  },
  {
    id: 7,
    title: "Electrical Works",
    url: "https://shrihariomelectricalworks.netlify.app/",
    image: "/portfolio/electrical_works.png",
    spark: "To bring traditional trade services into the modern digital era with professional visibility.",
    fix: "Solved the local service discovery gap with a trust-focused, clear digital storefront.",
    icon: <ShieldCheck size={32} />
  },
  {
    id: 8,
    title: "Krishna Play Way",
    url: "https://krishnaplaywayschool.netlify.app/",
    image: "/portfolio/krishna_playway.png",
    spark: "Building a transparent window into the world of early childhood education for parents.",
    fix: "Enhanced trust and communication between schools and parents through a vibrant digital portal.",
    icon: <Globe size={32} />
  }
];

function WebsitePortfolio() {
  return (
    <section className="scene" id="portfolio" style={{ height: 'auto', padding: '100px 24px' }}>
      <div className="scene-content">
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 className="headline-lg">Websites We Built. Stories We Told.</h2>
          <p style={{ maxWidth: '600px', margin: '0 auto', opacity: 0.7 }}>
            Every project starts with a problem. Here is how we solved them through creative design and precision engineering.
          </p>
        </div>

        <div className="portfolio-stack">
          {PORTFOLIO_PROJECTS.map((project, index) => (
            <div key={project.id} className={`case-study-row ${index % 2 === 0 ? '' : 'row-reverse'}`}>
              <motion.div 
                className="case-study-visual"
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                onClick={() => window.open(project.url, '_blank')}
              >
                <div className="browser-frame">
                  <div className="browser-top">
                    <div className="browser-dots">
                      <span className="dot red"></span>
                      <span className="dot yellow"></span>
                      <span className="dot green"></span>
                    </div>
                    <div className="url-bar">{project.url.replace('https://', '')}</div>
                  </div>
                  <div className="browser-content">
                    {project.image ? (
                      <img src={getAssetPath(project.image)} alt={project.title} className="project-preview-img" loading="lazy" decoding="async" />
                    ) : (
                      <div className={`placeholder-screenshot gradient-${(project.id % 4) + 1}`}>
                        <ExternalLink size={40} color="white" />
                        <span style={{ fontWeight: 600 }}>Click to Visit Live Site</span>
                      </div>
                    )}
                    <div className="live-overlay">
                      <div className="live-badge">
                        <span className="pulse-dot"></span> LIVE SITE
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="case-study-text"
                initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="story-label">Success Story 0{project.id}</div>
                <h3 className="headline-sm-responsive" style={{ color: 'var(--on-background)' }}>{project.title}</h3>
                
                <div className="story-item">
                  <div className="story-icon">{project.icon}</div>
                  <div className="story-body">
                    <h4 style={{ color: 'var(--primary)', fontWeight: 700 }}>The Spark (Why?)</h4>
                    <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>{project.spark}</p>
                  </div>
                </div>

                <div className="story-item">
                  <div className="story-icon"><CheckCircle2 size={32} color="var(--accent)" /></div>
                  <div className="story-body">
                    <h4 style={{ color: 'var(--accent)', fontWeight: 700 }}>The Fix (How?)</h4>
                    <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>{project.fix}</p>
                  </div>
                </div>

                <motion.a 
                  href={project.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="button button-primary"
                  style={{ marginTop: '32px', gap: '12px' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Explore Live Project <ExternalLink size={20} />
                </motion.a>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CustomCursor({ mousePos, isHovering }) {
  // Glow uses springs for that cinematic "trailing" feel
  const glowX = useSpring(mousePos.x, { damping: 15, stiffness: 100 })
  const glowY = useSpring(mousePos.y, { damping: 15, stiffness: 100 })

  return (
    <>
      <motion.div 
        className="custom-cursor" 
        animate={{
          scale: isHovering ? 3 : 1,
          backgroundColor: isHovering ? 'rgba(39, 174, 96, 0.4)' : 'var(--primary)',
          border: isHovering ? '1px solid var(--accent)' : 'none'
        }}
        style={{ 
          x: mousePos.x, // Raw coordinate for zero lag
          y: mousePos.y, // Raw coordinate for zero lag
          left: 0, 
          top: 0,
          translateX: '-50%',
          translateY: '-50%'
        }}
      />
      <motion.div 
        className="cursor-glow" 
        animate={{
          scale: isHovering ? 1.8 : 1,
          opacity: isHovering ? 1 : 0.6,
          border: isHovering ? '1px solid rgba(39, 174, 96, 0.3)' : '1px solid rgba(39, 174, 96, 0)'
        }}
        style={{ 
          x: glowX, 
          y: glowY, 
          left: 0, 
          top: 0 
        }}
      />
    </>
  )
}

// --- Main Pages ---

function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme')
      if (saved) return saved
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  })
  
  // New Form State
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [serviceType, setServiceType] = useState('B/W Printing')
  const [quantity, setQuantity] = useState('')
  const [instructions, setInstructions] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const lenis = new Lenis()
    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
    
    const scenes = gsap.utils.toArray('.scene')
    scenes.forEach((scene, i) => {
      const content = scene.querySelector('.scene-content')
      if (content) {
        gsap.fromTo(content, 
          { opacity: 0, scale: 0.9, y: 100 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: scene,
              start: 'top 70%',
              end: 'top 20%',
              toggleActions: 'play none none reverse',
            }
          }
        )
      }
    })

    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY })
    
    const checkHover = (element) => {
      if (element && element.closest) {
        return element.closest('button, a, .glass-card, .browser-frame')
      }
      return false
    }

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        const touch = e.touches[0]
        setMousePos({ x: touch.clientX, y: touch.clientY })
        
        // Mobile "Hover" detection: Check what's under the finger
        const element = document.elementFromPoint(touch.clientX, touch.clientY)
        setIsHovering(!!checkHover(element))
      }
    }
    
    const handleMouseOver = (e) => {
      setIsHovering(!!checkHover(e.target))
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseover', handleMouseOver)
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchstart', handleTouchMove, { passive: true })
    window.addEventListener('touchend', () => setIsHovering(false))

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseover', handleMouseOver)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchstart', handleTouchMove)
      window.removeEventListener('touchend', () => setIsHovering(false))
      lenis.destroy()
    }
  }, [])

  const handleWhatsAppRedirect = (e) => {
    e.preventDefault()
    
    const newErrors = {}
    if (!name.trim() || name.length > 50) newErrors.name = 'Name is required (max 50 chars).'
    if (!/^\+?\d{10,15}$/.test(phone)) newErrors.phone = 'Valid phone number is required (10-15 digits).'
    
    const validServices = ['B/W Printing', 'Color Printing', 'Binding', 'Assignment Writing', 'PPT Creation', 'Website Creation', 'Packaging Services']
    if (!validServices.includes(serviceType)) newErrors.serviceType = 'Invalid service selected.'
    
    if (quantity && (!Number.isInteger(Number(quantity)) || Number(quantity) < 0 || quantity.toString().length > 5)) {
      newErrors.quantity = 'Invalid quantity.'
    }
    
    if (instructions.length > 500) newErrors.instructions = 'Instructions exceed 500 characters.'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})

    const escapeHtml = (unsafe) => {
      return (unsafe || '').replace(/[&<"'>]/g, function (match) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        }[match];
      });
    }

    const safeName = escapeHtml(name)
    const safePhone = escapeHtml(phone)
    const safeService = escapeHtml(serviceType)
    const safeQuantity = escapeHtml(quantity)
    const safeInstructions = escapeHtml(instructions)

    const messageTemplate = `Hi, I want to use AFFORD PRINT service:\n\nName: ${safeName}\nPhone: ${safePhone}\n\nService: ${safeService}\nDetails: ${safeQuantity}\n\nInstructions:\n${safeInstructions}\n\nI will send the file here.`

    const redirectUrl = `https://wa.me/919027442522?text=${encodeURIComponent(messageTemplate)}`
    window.location.href = redirectUrl
  }

  return (
    <div className="page-shell">
      <style>{whatsappStyles}</style>
      <CustomCursor mousePos={mousePos} isHovering={isHovering} />
      
      <nav className="top-nav">
        <div className="nav-container">
          <Link to="/" className="brand">AFFORD PRINT</Link>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button 
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className="theme-toggle"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <a className="button button-primary" href="#upload">Upload Now</a>
          </div>
        </div>
      </nav>

      <main>
        {/* Scene 1: Hero (Cinematic Image Sequence) */}
        <HeroAnimation />

        {/* Scene 2: Problem */}
        <section className="scene" style={{ background: '#f8fafd' }}>
          <div className="scene-content responsive-grid" style={{ alignItems: 'center' }}>
            <div>
              <h2 className="headline-lg">Deadlines don't wait. Neither should you.</h2>
              <p>Chaotic paper piles, expensive printers, and closed shops shouldn't stand between you and your submission.</p>
            </div>
            <div className="glass-card" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '4rem' }}>📚 ⌛ 📑</div>
            </div>
          </div>
        </section>

        {/* Scene 3: Solution */}
        <section className="scene">
          <div className="scene-content">
            <h2 className="headline-lg" style={{ textAlign: 'center' }}>A Stitched Service Experience.</h2>
            <motion.div 
              className="responsive-grid"
              style={{ marginTop: '48px' }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.2 }
                }
              }}
            >
              {[
                { Icon: Smartphone, title: 'Mobile First', desc: 'Order from your phone in seconds. No desktop required.' },
                { Icon: Clock, title: '24/7 Availability', desc: 'Upload at midnight, pick up at dawn. We never sleep.' },
                { Icon: ShieldCheck, title: 'Secure RLS', desc: 'Your documents are protected with high-level security.' }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  className="glass-card"
                  variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                  whileHover={{ y: -10, boxShadow: 'var(--glass-glow)' }}
                >
                  <item.Icon size={40} color="var(--primary)" />
                  <h3 style={{ marginTop: '16px' }}>{item.title}</h3>
                  <p>{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Scene 4: Velocity (Parallax Background) */}
        <section className="scene scene-gradient" style={{ overflow: 'hidden' }}>
          <motion.div 
            className="scene-content" 
            style={{ textAlign: 'center' }}
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <h2 className="display-xl" style={{ color: 'white' }}>Velocity defined.</h2>
            <p style={{ fontSize: '1.25rem', opacity: 0.9 }}>2-second upload-to-confirmation flow. Built for the sprint.</p>
          </motion.div>
          {/* Animated velocity lines */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.2 }}>
            {[...Array(5)].map((_, i) => (
              <motion.div 
                key={i}
                style={{ 
                  position: 'absolute', 
                  top: `${i * 25}%`, 
                  left: '-20%', 
                  width: '40%', 
                  height: '2px', 
                  background: 'white' 
                }}
                animate={{ left: '120%' }}
                transition={{ duration: 1 + Math.random(), repeat: Infinity, ease: 'linear', delay: i * 0.2 }}
              />
            ))}
          </div>
        </section>

        {/* Scene 5: Technical Precision */}
        <section className="scene">
          <div className="scene-content responsive-grid" style={{ alignItems: 'center' }}>
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '8px 16px', background: 'rgba(39, 174, 96, 0.1)', color: 'var(--accent)', borderRadius: '20px', width: 'fit-content' }}>75 GSM Premium</div>
              <h3>Laser Precision.</h3>
              <p>Every page is a testament to clarity. No ink bleeds, just crisp text.</p>
            </div>
            <div>
              <h2 className="headline-lg">Quality that speaks for itself.</h2>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><CheckCircle2 color="var(--accent)" /> High-density monochrome laser</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><CheckCircle2 color="var(--accent)" /> Vivid color precision</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><CheckCircle2 color="var(--accent)" /> Professional binding options</li>
              </ul>
            </div>
          </div>
        </section>

        <WebsitePortfolio />

        <PricingSection />

        {/* Scene 7: Community */}
        <section className="scene">
          <div className="scene-content" style={{ textAlign: 'center' }}>
            <h2 className="headline-lg">Trusted by 1,000+ Students.</h2>
            <p>From thesis submissions to last-minute assignment prints.</p>
          </div>
        </section>

        {/* Scene 8: The Action */}
        <section className="scene" id="upload">
          <div className="scene-content">
            <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <h2 className="headline-lg" style={{ textAlign: 'center', marginBottom: '8px' }}>Send Request via WhatsApp</h2>
              <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '32px' }}>Fill out the details below and we'll connect with you instantly.</p>
              
              <div aria-live="polite" style={{ color: '#e74c3c', fontSize: '0.9rem', marginBottom: '16px', textAlign: 'center' }}>
                {Object.values(errors).map((err, i) => <div key={i}>{err}</div>)}
              </div>

              <form onSubmit={handleWhatsAppRedirect} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
                <div>
                  <label htmlFor="name" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Full Name *</label>
                  <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" maxLength={50} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${errors.name ? '#e74c3c' : 'var(--outline)'}` }} required />
                </div>
                
                <div>
                  <label htmlFor="phone" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Phone Number *</label>
                  <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 0000000000" maxLength={15} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${errors.phone ? '#e74c3c' : 'var(--outline)'}` }} required />
                </div>

                <div>
                  <label htmlFor="serviceType" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Service Type *</label>
                  <select id="serviceType" value={serviceType} onChange={(e) => setServiceType(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--outline)', background: 'var(--surface)' }} required>
                    <option value="B/W Printing">B/W Printing</option>
                    <option value="Color Printing">Color Printing</option>
                    <option value="Binding">Binding</option>
                    <option value="Assignment Writing">Assignment Writing</option>
                    <option value="PPT Creation">PPT Creation</option>
                    <option value="Website Creation">Website Creation</option>
                    <option value="Packaging Services">Packaging Services</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="quantity" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Pages / Quantity</label>
                  <input id="quantity" type="number" min="0" max="99999" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 50" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${errors.quantity ? '#e74c3c' : 'var(--outline)'}` }} />
                </div>

                <div>
                  <label htmlFor="instructions" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Instructions</label>
                  <textarea id="instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Any special requests?" maxLength={500} rows={4} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${errors.instructions ? '#e74c3c' : 'var(--outline)'}`, resize: 'vertical' }} />
                </div>

                <button 
                  type="submit"
                  className="button button-accent whatsapp-btn" 
                  style={{ width: '100%', marginTop: '16px', padding: '16px', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} 
                  disabled={!name.trim() || !phone.trim() || !serviceType}
                >
                  <MessageCircle size={24} /> Send on WhatsApp
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      
      <footer style={{ padding: '80px 24px', background: '#0a1a2b', color: 'white', textAlign: 'center' }}>
        <div className="brand" style={{ color: 'white', marginBottom: '16px' }}>AFFORD PRINT</div>
        <p style={{ fontSize: '1.2rem', marginBottom: '24px', opacity: 0.9 }}>
          Affordable printing and digital services — built for students.
        </p>
        <div className="responsive-grid" style={{ marginBottom: '40px', opacity: 0.8 }}>
          <div>📞 Call / WhatsApp: <br /><strong>9027442522</strong></div>
          <div>🚚 Home Delivery <br />Available</div>
        </div>
        <p style={{ opacity: 0.4, fontSize: '0.9rem' }}>© 2026 Afford Print. Print Smart. Do More. Pay Less.</p>
      </footer>
    </div>
  )
}

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </Router>
  )
}

export default App
