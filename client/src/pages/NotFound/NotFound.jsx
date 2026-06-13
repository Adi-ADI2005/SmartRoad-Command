import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import './NotFound.css'

export default function NotFound() {
  return (
    <motion.div
      className="notfound-page"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
    >
      <div className="nf-code">404</div>
      <h1>SIGNAL LOST</h1>
      <p>The page you're looking for has gone offline. Return to the command center.</p>
      <Link to="/" className="nf-btn">
        <i className="bi bi-arrow-left-circle-fill" /> RETURN HOME
      </Link>
    </motion.div>
  )
}
