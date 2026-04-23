import React, { useEffect, useRef, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { 
  Upload, Smartphone, Clock, ShieldCheck, CheckCircle2, 
  ChevronDown, FileText, LayoutDashboard, ExternalLink, Trash2,
  Image, Paperclip, PenTool, BookOpen, Edit3, Globe, Layout, User
} from 'lucide-react'
import { supabase } from './lib/supabase'
import './App.css'

gsap.registerPlugin(ScrollTrigger)

// --- Helper Components ---

function HeroAnimation() {
  const canvasRef = useRef(null)
  const [images, setImages] = useState([])
  const frameCount = 80
  const currentFrame = (index) => `/hero-animation/afford hero image_${index.toString().padStart(3, '0')}.jpg`

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
        <p style={{ fontSize: '1.5rem', marginTop: '24px', maxWidth: '600px', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
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
      { name: 'Copy Writing', price: 'Based on content', desc: 'Clear, neat handwritten work.', icon: <Edit3 size={24} /> }
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

        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
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
            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
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
        <div className="responsive-grid" style={{ marginTop: '80px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', textAlign: 'center' }}>
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

function CustomCursor({ mousePos, isHovering }) {
  // Glow uses springs for that cinematic "trailing" feel
  const glowX = useSpring(mousePos.x, { damping: 10, stiffness: 50 })
  const glowY = useSpring(mousePos.y, { damping: 10, stiffness: 50 })

  return (
    <>
      <motion.div 
        className="custom-cursor" 
        animate={{
          scale: isHovering ? 4 : 1,
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
          scale: isHovering ? 1.5 : 1,
          opacity: isHovering ? 0.8 : 0.4
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
  const [copies, setCopies] = useState(1)
  const [file, setFile] = useState(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [uploading, setUploading] = useState(false)
  const [printType, setPrintType] = useState('B&W')

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
    const handleMouseOver = (e) => {
      if (e.target.closest('button, a, .glass-card')) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseover', handleMouseOver)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseover', handleMouseOver)
      lenis.destroy()
    }
  }, [])

  const handleUpload = async () => {
    if (!file || !name || !phone) {
      alert('Please fill all fields and select a file.')
      return
    }

    setUploading(true)
    try {
      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `orders/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('print-files')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 2. Create DB entry
      const { data: publicUrlData } = supabase.storage.from('print-files').getPublicUrl(filePath)
      
      const { error: dbError } = await supabase.from('orders').insert([
        {
          name,
          phone,
          file_url: publicUrlData.publicUrl,
          instructions: `${copies} copies, ${printType} print`,
          status: 'pending'
        }
      ])

      if (dbError) throw dbError

      // 3. Open WhatsApp
      const waMsg = `Hello Afford Print! I just placed an order.\nName: ${name}\nCopies: ${copies}\nType: ${printType} print\nFile: ${publicUrlData.publicUrl}`
      window.open(`https://wa.me/919027442522?text=${encodeURIComponent(waMsg)}`, '_blank')
      
      alert('Order placed successfully!')
    } catch (error) {
      console.error(error)
      alert('Upload failed. Note: Ensure you have created the "print-files" bucket in Supabase Storage and defined RLS policies.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="page-shell">
      <CustomCursor mousePos={mousePos} isHovering={isHovering} />
      
      <nav className="top-nav">
        <div className="nav-container">
          <Link to="/" className="brand">AFFORD PRINT</Link>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link to="/admin" style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LayoutDashboard size={18} /> Admin
            </Link>
            <a className="button button-primary" href="#upload">Upload Now</a>
          </div>
        </div>
      </nav>

      <main>
        {/* Scene 1: Hero (Cinematic Image Sequence) */}
        <HeroAnimation />

        {/* Scene 2: Problem */}
        <section className="scene" style={{ background: '#f8fafd' }}>
          <div className="scene-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
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
              style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', marginTop: '48px' }}
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
          <div className="scene-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '80px' }}>
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
            <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
              <h2 className="headline-lg">Convert Your Files Now.</h2>
              <div className="upload-zone">
                <input 
                  type="file" 
                  id="file-input" 
                  style={{ display: 'none' }} 
                  onChange={(e) => setFile(e.target.files[0])} 
                />
                <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
                  <Upload size={64} color="var(--primary)" style={{ marginBottom: '24px' }} />
                  <h3>{file ? file.name : 'Drag & drop your PDF or DOC'}</h3>
                  <p>Secure Supabase-backed storage. Max 20MB.</p>
                </label>
              </div>
              
              <div className="responsive-grid" style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', textAlign: 'left' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <label style={{ fontWeight: 600 }}>Full Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--outline)' }} />
                  <label style={{ fontWeight: 600 }}>WhatsApp Number</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 0000000000" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--outline)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label id="copies-label" style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Copies</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <button 
                        onClick={() => setCopies(c => Math.max(1, c-1))} 
                        className="button" 
                        style={{ padding: '8px 16px', background: '#eee' }}
                        aria-label="Decrease copies"
                      >
                        -
                      </button>
                      <strong aria-labelledby="copies-label">{copies}</strong>
                      <button 
                        onClick={() => setCopies(c => c+1)} 
                        className="button" 
                        style={{ padding: '8px 16px', background: '#eee' }}
                        aria-label="Increase copies"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Print Type</label>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" name="printType" value="B&W" checked={printType === 'B&W'} onChange={(e) => setPrintType(e.target.value)} />
                        Black & White
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" name="printType" value="Color" checked={printType === 'Color'} onChange={(e) => setPrintType(e.target.value)} />
                        Colored
                      </label>
                    </div>
                  </div>

                  <button 
                    className="button button-accent" 
                    style={{ width: '100%', marginTop: '16px' }} 
                    onClick={handleUpload}
                    disabled={uploading}
                    aria-busy={uploading}
                  >
                    {uploading ? 'Processing...' : 'Submit to WhatsApp'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer style={{ padding: '80px 24px', background: '#0a1a2b', color: 'white', textAlign: 'center' }}>
        <div className="brand" style={{ color: 'white', marginBottom: '16px' }}>AFFORD PRINT</div>
        <p style={{ fontSize: '1.2rem', marginBottom: '24px', opacity: 0.9 }}>
          Affordable printing and digital services — built for students.
        </p>
        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px', opacity: 0.8 }}>
          <div>📞 Call / WhatsApp: <br /><strong>9027442522</strong></div>
          <div>🚚 Home Delivery <br />Available</div>
        </div>
        <p style={{ opacity: 0.4, fontSize: '0.9rem' }}>© 2026 Afford Print. Print Smart. Do More. Pay Less.</p>
      </footer>
    </div>
  )
}

function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('adminAuth') === 'true')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [error, setError] = useState('')

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [adminTab, setAdminTab] = useState('orders')
  const [portfolioItems, setPortfolioItems] = useState([])
  const [portTitle, setPortTitle] = useState('')
  const [portCategory, setPortCategory] = useState('printing')
  const [portFile, setPortFile] = useState(null)
  const [portUploading, setPortUploading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders()
      fetchPortfolio()
      const subscription = supabase
        .channel('orders-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
        .subscribe()

      return () => {
        supabase.removeChannel(subscription)
      }
    }
  }, [isAuthenticated])

  const fetchOrders = async () => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (error) console.error(error)
    else setOrders(data)
    setLoading(false)
  }

  const fetchPortfolio = async () => {
    const { data, error } = await supabase.from('portfolio').select('*').order('created_at', { ascending: false })
    if (error) console.error(error)
    else setPortfolioItems(data || [])
  }

  const handlePortfolioUpload = async (e) => {
    e.preventDefault()
    if (!portFile || !portTitle) return alert('Fill all fields')
    setPortUploading(true)
    try {
      const fileExt = portFile.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `portfolio/${fileName}`

      const { error: uploadError } = await supabase.storage.from('portfolio-files').upload(filePath, portFile)
      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage.from('portfolio-files').getPublicUrl(filePath)

      const { error: dbError } = await supabase.from('portfolio').insert([
        { title: portTitle, category: portCategory, image_url: publicUrlData.publicUrl }
      ])
      if (dbError) throw dbError

      alert('Portfolio item added!')
      setPortTitle('')
      setPortFile(null)
      e.target.reset()
      fetchPortfolio()
    } catch (err) {
      console.error(err)
      alert('Upload failed. Ensure portfolio table and portfolio-files bucket exist.')
    } finally {
      setPortUploading(false)
    }
  }

  const deletePortfolioItem = async (id) => {
    if (confirm('Delete this portfolio item?')) {
      await supabase.from('portfolio').delete().eq('id', id)
      fetchPortfolio()
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (loginEmail === 'abhisheksharma06022006@gmail.com' && loginPassword === 'abhishek5561') {
      setIsAuthenticated(true)
      sessionStorage.setItem('adminAuth', 'true')
      setError('')
    } else {
      setError('Invalid admin credentials.')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('adminAuth')
  }

  if (!isAuthenticated) {
    return (
      <div className="page-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--surface-dim)' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card" 
          style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}
        >
          <div className="brand" style={{ marginBottom: '32px' }}>AFFORD PRINT</div>
          <h2 className="headline-sm" style={{ marginBottom: '24px' }}>Admin Authentication</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Email Address</label>
              <input 
                type="email" 
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@example.com"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--outline)' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Password</label>
              <input 
                type="password" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--outline)' }}
                required
              />
            </div>
            {error && <p style={{ color: '#e74c3c', fontSize: '0.9rem' }}>{error}</p>}
            <button type="submit" className="button button-primary" style={{ marginTop: '16px' }}>Login to Dashboard</button>
          </form>
          <Link to="/" style={{ display: 'block', marginTop: '24px', opacity: 0.6, fontSize: '0.9rem', textDecoration: 'none' }}>← Back to Public Site</Link>
        </motion.div>
      </div>
    )
  }

  const updateStatus = async (id, status) => {
    await supabase.from('orders').update({ status }).eq('id', id)
  }

  const deleteOrder = async (id) => {
    if (confirm('Delete this order?')) {
      await supabase.from('orders').delete().eq('id', id)
    }
  }

  return (
    <div className="page-shell" style={{ padding: '24px' }}>
      <header className="nav-container" style={{ marginBottom: '40px', flexDirection: 'column', height: 'auto', gap: '20px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Link to="/" className="brand">AFFORD PRINT</Link>
          <button onClick={handleLogout} className="button" style={{ background: '#eee', padding: '8px 16px' }}>Logout</button>
        </div>
        <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
          <button onClick={() => setAdminTab('orders')} className={`button ${adminTab === 'orders' ? 'button-primary' : ''}`} style={{ padding: '8px 16px' }}>Orders</button>
          <button onClick={() => setAdminTab('portfolio')} className={`button ${adminTab === 'portfolio' ? 'button-primary' : ''}`} style={{ padding: '8px 16px' }}>Portfolio</button>
        </div>
      </header>

      <main className="glass-card" style={{ padding: '12px' }}>
      <main className="glass-card" style={{ padding: '12px' }}>
        {adminTab === 'orders' ? (
          loading ? <p role="status">Loading orders...</p> : (
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <caption>Incoming Student Print Orders</caption>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--outline-variant)' }}>
                    <th scope="col" style={{ padding: '12px' }}>Customer</th>
                    <th scope="col">File</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ fontWeight: 600 }}>{order.name}</div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>{order.phone}</div>
                      </td>
                      <td>
                        <a href={order.file_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          View PDF <ExternalLink size={14} />
                        </a>
                        <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '4px' }}>{order.instructions}</div>
                      </td>
                      <td>
                        <select 
                          value={order.status} 
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <button 
                          onClick={() => deleteOrder(order.id)} 
                          style={{ color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer' }}
                          aria-label="Delete order"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div style={{ padding: '16px' }}>
            <h2 className="headline-sm">Add Portfolio Item</h2>
            <form onSubmit={handlePortfolioUpload} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
              <input type="text" placeholder="Title (e.g. Bio PPT)" value={portTitle} onChange={e => setPortTitle(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--outline)', flex: 1, minWidth: '200px' }} />
              <select value={portCategory} onChange={e => setPortCategory(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--outline)' }}>
                <option value="printing">Printing</option>
                <option value="academic">Academic</option>
                <option value="digital">Digital</option>
              </select>
              <input type="file" accept="image/*,application/pdf" onChange={e => setPortFile(e.target.files[0])} required style={{ padding: '12px' }} />
              <button type="submit" className="button button-primary" disabled={portUploading}>{portUploading ? 'Uploading...' : 'Upload Work'}</button>
            </form>

            <h2 className="headline-sm">Current Portfolio</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
              {portfolioItems.map(item => (
                <div key={item.id} style={{ border: '1px solid var(--outline-variant)', borderRadius: '8px', padding: '12px' }}>
                  <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px', marginBottom: '12px' }} />
                  <div style={{ fontWeight: 600 }}>{item.title}</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '12px', textTransform: 'capitalize' }}>{item.category}</div>
                  <button onClick={() => deletePortfolioItem(item.id)} style={{ color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Trash2 size={16} /> Delete</button>
                </div>
              ))}
              {portfolioItems.length === 0 && <p style={{ opacity: 0.6 }}>No portfolio items uploaded yet.</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  )
}

export default App
