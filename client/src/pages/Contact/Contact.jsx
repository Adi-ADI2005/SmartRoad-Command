import { motion } from 'framer-motion'
import '../About/StubPage.css'

export default function Contact() {
  const handleSubmit = (e) => { e.preventDefault(); alert('Message sent! (demo)') }

  return (
    <motion.div
      className="stub-page"
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
    >
      <div className="stub-hero">
        <div className="stub-icon"><i className="bi bi-envelope-fill" /></div>
        <h1>CONTACT</h1>
        <p>Get in touch with the Smart Traffic AI team. Report issues, request features, or connect with our engineers.</p>
      </div>

      <form className="stub-form" onSubmit={handleSubmit}>
        <input type="text"  placeholder="Your Name"    required />
        <input type="email" placeholder="Email Address" required />
        <input type="text"  placeholder="Subject" />
        <textarea rows={5}  placeholder="Your message…" required />
        <button type="submit">SEND MESSAGE</button>
      </form>
    </motion.div>
  )
}
