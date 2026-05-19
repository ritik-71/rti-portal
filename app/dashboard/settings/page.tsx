"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { authService } from "@/services/authService";

export default function SettingsPage() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const session = await authService.getSession();
        if (session?.user?.email) {
          setEmail(session.user.email);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchUser();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '24px', backgroundColor: 'var(--surface-color)', borderRadius: 'var(--border-radius-lg)', minHeight: '60vh' }}
    >
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '16px' }}>Account Settings</h1>
      
      <div style={{ marginTop: '24px' }}>
        <div className="form-group" style={{ maxWidth: '400px' }}>
          <label className="form-label">Email Address</label>
          <input type="text" value={email} disabled />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Email address is tied to your administrative account and cannot be changed here.
          </p>
        </div>
        
        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--error-color)', marginBottom: '12px' }}>Danger Zone</h2>
          <button className="btn-danger">Reset Security Keys</button>
        </div>
      </div>
    </motion.div>
  );
}
