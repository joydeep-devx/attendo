import MainLayout from './layouts/MainLayout'
import AppRoutes from './routes/AppRoutes'
import { motion } from 'motion/react'

function App() {
  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      ></motion.div>
      <AppRoutes />
    </MainLayout>
  )
}

export default App