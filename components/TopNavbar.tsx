"use client";

import { Bell, Search, User, Settings, HelpCircle, LogOut } from "lucide-react";
import styles from "@/styles/TopNavbar.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

export default function TopNavbar() {
  const [userName, setUserName] = useState("Admin User");
  const [email, setEmail] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const router = useRouter();
  const { showToast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const session = await authService.getSession();
        if (session?.user?.email) {
          setUserName(session.user.user_metadata?.full_name || session.user.email.split('@')[0]);
          setEmail(session.user.email);
        }
      } catch (e) {
        // Handle no session gracefully
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.signOut();
      showToast("Logged out successfully", "success");
      router.push("/login");
    } catch (error: any) {
      showToast("Error logging out", "error");
    }
  };

  const toggleDropdown = (name: string) => {
    setOpenDropdown(prev => prev === name ? null : name);
  };

  return (
    <nav className={styles.topNavbar}>
      <div className={styles.searchBar}>
        <Search className={styles.searchIcon} size={18} />
        <input 
          type="text" 
          placeholder="Global search (Cmd + K)" 
          className={`form-control ${styles.searchInput}`}
        />
      </div>

      <div className={styles.actions} ref={dropdownRef}>
        {/* Help Menu */}
        <div style={{ position: 'relative' }}>
          <motion.div 
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.9 }} 
            className={styles.iconBtn}
            onClick={() => toggleDropdown("help")}
          >
            <HelpCircle size={20} />
          </motion.div>
          <AnimatePresence>
            {openDropdown === "help" && (
              <motion.div 
                className={styles.dropdownMenu}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <div className={styles.dropdownHeader}>
                  <strong style={{ fontSize: '0.95rem' }}>Support</strong>
                </div>
                <a href="#" className={styles.dropdownItem}>Documentation</a>
                <a href="#" className={styles.dropdownItem}>Contact Support</a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <motion.div 
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.9 }} 
            className={styles.iconBtn}
            onClick={() => toggleDropdown("notifications")}
          >
            <Bell size={20} />
            <span style={{ 
              position: 'absolute', 
              top: '6px', 
              right: '6px', 
              width: '8px', 
              height: '8px', 
              backgroundColor: 'var(--error-color)', 
              borderRadius: '50%',
              border: '2px solid white'
            }}></span>
          </motion.div>
          <AnimatePresence>
            {openDropdown === "notifications" && (
              <motion.div 
                className={styles.dropdownMenu}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{ width: '300px' }}
              >
                <div className={styles.dropdownHeader}>
                  <strong style={{ fontSize: '0.95rem' }}>Notifications</strong>
                </div>
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No new notifications
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Profile */}
        <div style={{ position: 'relative' }}>
          <div className={styles.userProfile} onClick={() => toggleDropdown("profile")}>
            <div className={styles.avatar}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className={styles.userName}>{userName}</span>
          </div>
          <AnimatePresence>
            {openDropdown === "profile" && (
              <motion.div 
                className={styles.dropdownMenu}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <div className={styles.dropdownHeader}>
                  <strong style={{ fontSize: '0.95rem', display: 'block' }}>{userName}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{email}</span>
                </div>
                <div className={styles.dropdownItem} onClick={() => { setOpenDropdown(null); router.push('/dashboard'); }}>
                  <User size={16} /> My Profile
                </div>
                <div className={styles.dropdownItem} onClick={() => { setOpenDropdown(null); router.push('/dashboard'); }}>
                  <Settings size={16} /> Settings
                </div>
                <div className={styles.dropdownDivider}></div>
                <div className={styles.dropdownItem} onClick={handleLogout} style={{ color: 'var(--error-color)' }}>
                  <LogOut size={16} /> Sign out
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
