"use client";

import { useState } from "react";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/styles/Auth.module.css";
import { useToast } from "@/components/ToastProvider";
import { 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail,
  Zap,
  BarChart,
  Users
} from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.signIn(email, password);
      showToast("Welcome back!", "success");
      router.push("/dashboard");
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authSidebar}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
            <ShieldCheck size={40} className="text-accent-color" />
            <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em' }}>RTI PORTAL</span>
          </div>
          <h1 className={styles.sidebarTitle}>Empowering Transparency.</h1>
          <p className={styles.sidebarText}>
            The official portal for managing and tracking Right to Information requests with enterprise-grade efficiency.
          </p>

          <div className={styles.featureList}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><Zap size={20} /></div>
              <div>
                <div style={{ fontWeight: 600 }}>Real-time Tracking</div>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Monitor applications with instant updates.</div>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><BarChart size={20} /></div>
              <div>
                <div style={{ fontWeight: 600 }}>Advanced Analytics</div>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Comprehensive insights for administrators.</div>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><Users size={20} /></div>
              <div>
                <div style={{ fontWeight: 600 }}>Public Access</div>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Secure tracking for every citizen.</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className={styles.authContent}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.authHeader}>
            <h2 className={styles.authTitle}>Login</h2>
            <p className={styles.authSubtitle}>Enter your credentials to access the dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className={styles.authForm}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  placeholder="name@government.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '44px' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <Link href="#" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Forgot password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '44px', paddingRight: '44px' }}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px' }}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><ArrowRight size={20} /> Sign In</>}
            </button>
          </form>

          <div className={styles.authFooter}>
            Don&apos;t have an account? <Link href="/signup" style={{ fontWeight: 600 }}>Create one now</Link>
          </div>

          <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
            <Link href="/track" style={{ color: 'var(--accent-color)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Track Application Status <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
