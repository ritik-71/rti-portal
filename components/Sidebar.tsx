"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Search, 
  BarChart3, 
  Settings, 
  LogOut,
  ShieldCheck
} from "lucide-react";
import { authService } from "@/services/authService";
import { useToast } from "@/components/ToastProvider";
import styles from "@/styles/Sidebar.module.css";
import { motion } from "framer-motion";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();

  const handleLogout = async () => {
    try {
      await authService.signOut();
      showToast("Logged out successfully", "success");
      router.push("/login");
    } catch (error: any) {
      showToast("Error logging out", "error");
    }
  };

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Applications", icon: FileText, path: "/dashboard" }, // In a real app, this might be separate
    { name: "Track RTI", icon: Search, path: "/track" },
    { name: "Analytics", icon: BarChart3, path: "/dashboard" }, // We'll add this section
    { name: "Settings", icon: Settings, path: "/dashboard" },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <ShieldCheck className="text-accent-color" size={28} />
        <span className={styles.logo}>RTI Portal</span>
      </div>

      <nav className={styles.sidebarNav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <Link key={item.name} href={item.path} style={{ textDecoration: 'none' }}>
              <motion.div 
                className={`${styles.navItem} ${isActive ? styles.activeItem : ""}`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
