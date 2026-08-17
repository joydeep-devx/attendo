import { Link } from 'react-router-dom'
import { motion } from 'motion/react'

const MotionRouterLink = motion.create(Link)

function MotionLink({ children, className, ...props }) {
  return (
    <MotionRouterLink
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={className}
      {...props}
    >
      {children}
    </MotionRouterLink>
  )
}

export default MotionLink