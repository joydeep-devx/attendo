import { motion } from "motion/react";

function Reveal({ children, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay }}
        >
            {children}
        </motion.div>
    );
}

export default Reveal