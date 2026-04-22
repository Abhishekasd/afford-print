import React, { useEffect, useRef, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { motion, useScroll, useSpring } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { 
  Upload, Smartphone, Clock, ShieldCheck, CheckCircle2, 
  ChevronDown, FileText, LayoutDashboard, ExternalLink, Trash2 
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
    const context = canvas.getContext('2d')

    // Preload images
    const loadedImages = []
    let loadedCount = 0

    for (let i = 0; i < frameCount; i++) {
      const img = new Image()
      img.src = currentFrame(i)
      img.onload = () => {
        loadedCount++
        if (loadedCount === frameCount) {
          renderFrame(0)
        }
      }
      loadedImages.push(img)
    }
    setImages(loadedImages)

    const renderFrame = (index) => {
      if (loadedImages[index]) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        
        // Draw image aspect fill
        const img = loadedImages[index]
        const ratio = Math.max(canvas.width / img.width, canvas.height / img.height)
        const centerShift_x = (canvas.width - img.width * ratio) / 2
        const centerShift_y = (canvas.height - img.height * ratio) / 2
        
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio)
      }
    }

    // GSAP Sequence
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

    window.addEventListener('resize', () => renderFrame(sequence.frame))
    return () => window.removeEventListener('resize', () => renderFrame(sequence.frame))
  }, [])

  return (
    <div className="hero-sequence-container" style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
          instructions: `${copies} copies`,
          status: 'pending'
        }
      ])

      if (dbError) throw dbError

      // 3. Open WhatsApp
      const waMsg = `Hello Afford Print! I just placed an order.\nName: ${name}\nCopies: ${copies}\nFile: ${publicUrlData.publicUrl}`
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

        {/* Scene 6: Transparency */}
        <section className="scene" style={{ background: 'var(--surface-dim)' }}>
          <div className="scene-content">
            <h2 className="headline-lg" style={{ textAlign: 'center' }}>No hidden fees. Just green growth.</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '48px' }}>
              <div className="glass-card" style={{ width: '300px', textAlign: 'center' }}>
                <h3>Standard B&W</h3>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent)', margin: '16px 0' }}>₹1 <span style={{ fontSize: '1rem', color: 'var(--on-surface-variant)' }}>/ pg</span></div>
                <p>Academic standard output.</p>
              </div>
              <div className="glass-card" style={{ width: '300px', textAlign: 'center', border: '2px solid var(--accent)' }}>
                <h3>Premium Color</h3>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent)', margin: '16px 0' }}>₹5 <span style={{ fontSize: '1rem', color: 'var(--on-surface-variant)' }}>/ pg</span></div>
                <p>Vivid research presentations.</p>
              </div>
            </div>
          </div>
        </section>

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
              
              <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', textAlign: 'left' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <label style={{ fontWeight: 600 }}>Full Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--outline)' }} />
                  <label style={{ fontWeight: 600 }}>WhatsApp Number</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 0000000000" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--outline)' }} />
                </div>
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
                  <button 
                    className="button button-accent" 
                    style={{ width: '100%', marginTop: '32px' }} 
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
      
      <footer style={{ padding: '80px 40px', background: '#0a1a2b', color: 'white', textAlign: 'center' }}>
        <div className="brand" style={{ color: 'white', marginBottom: '24px' }}>AFFORD PRINT</div>
        <p style={{ opacity: 0.6 }}>© 2026 Afford Print. Built with precision for students.</p>
      </footer>
    </div>
  )
}

function AdminDashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
    const subscription = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  const fetchOrders = async () => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (error) console.error(error)
    else setOrders(data)
    setLoading(false)
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
    <div className="page-shell" style={{ padding: '40px' }}>
      <header className="nav-container" style={{ marginBottom: '40px' }}>
        <Link to="/" className="brand">AFFORD PRINT</Link>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Order Management</h1>
      </header>

      <main className="glass-card">
        {loading ? <p role="status">Loading orders...</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
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
                    <td style={{ padding: '12px' }}>
                      <strong>{order.name}</strong><br />
                      <small>{order.phone}</small>
                    </td>
                    <td>
                      <a href={order.file_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}>
                        <FileText size={16} /> View File <ExternalLink size={14} />
                      </a>
                    </td>
                    <td>
                      <select 
                        value={order.status} 
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        style={{ padding: '4px', borderRadius: '4px' }}
                        aria-label={`Change status for ${order.name}'s order`}
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
