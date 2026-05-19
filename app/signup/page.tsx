"use client";

import { useState, useEffect } from "react";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/styles/Auth.module.css";
import { useToast } from "@/components/ToastProvider";
import { 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  User, 
  Mail, 
  Lock,
  Zap,
  BarChart,
  Users
} from "lucide-react";
import { motion } from "framer-motion";

export default function SignupPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authService.getSession();
        if (session) {
          router.push("/dashboard");
        } else {
          setLoading(false);
        }
      } catch (e) {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.signUp(email, password, name);
      showToast("Account created! Please check your email or login.", "success");
      router.push("/login");
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
          <h1 className={styles.sidebarTitle}>Start Managing with Precision.</h1>
          <p className={styles.sidebarText}>
            Join the modern administrative workforce and streamline your RTI workflow today.
          </p>

          <div className={styles.featureList}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><Zap size={20} /></div>
              <div>
                <div style={{ fontWeight: 600 }}>Effortless Setup</div>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Get started in minutes with our intuitive UI.</div>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><BarChart size={20} /></div>
              <div>
                <div style={{ fontWeight: 600 }}>Data Sovereignty</div>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Secure, RLS-protected database architecture.</div>
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
            <h2 className={styles.authTitle}>Create Account</h2>
            <p className={styles.authSubtitle}>Register to start managing RTI applications.</p>
          </div>

          <form onSubmit={handleSignup} className={styles.authForm}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '44px' }}
                  required
                />
              </div>
            </div>

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
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '44px' }}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px' }}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><ArrowRight size={20} /> Create Account</>}
            </button>
          </form>

          <div className={styles.authFooter}>
            Already have an account? <Link href="/login" style={{ fontWeight: 600 }}>Log in here</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
