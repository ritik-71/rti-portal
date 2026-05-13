"use client";

import { Bell, Search, User, Settings, HelpCircle } from "lucide-react";
import styles from "@/styles/TopNavbar.module.css";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { authService } from "@/services/authService";

export default function TopNavbar() {
  const [userName, setUserName] = useState("Admin User");

  useEffect(() => {
    const getUser = async () => {
      const session = await authService.getSession();
      if (session?.user?.email) {
        setUserName(session.user.user_metadata?.full_name || session.user.email.split('@')[0]);
      }
    };
    getUser();
  }, []);

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

      <div className={styles.actions}>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className={styles.iconBtn}>
          <HelpCircle size={20} />
        </motion.div>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className={styles.iconBtn} style={{ position: 'relative' }}>
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
        
        <div className={styles.userProfile}>
          <div className={styles.avatar}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className={styles.userName}>{userName}</span>
        </div>
      </div>
    </nav>
  );
}
