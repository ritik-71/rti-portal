"use client";

import { motion } from "framer-motion";

export default function AnalyticsPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '24px', backgroundColor: 'var(--surface-color)', borderRadius: 'var(--border-radius-lg)', minHeight: '60vh' }}
    >
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '16px' }}>Advanced Analytics</h1>
      <p style={{ color: 'var(--text-secondary)' }}>
        This nested route is active. Deep-dive analytics, custom reporting, and performance metrics will be available here.
      </p>
    </motion.div>
  );
}
