"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import styles from "@/styles/Navbar.module.css";
import { LogOut, FileText } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <FileText size={24} />
        <Link href="/dashboard" className={styles.brandLink}>RTI Portal</Link>
      </div>
      <div className={styles.navItems}>
        {userEmail && <span className={styles.userInfo}>{userEmail}</span>}
        <button onClick={handleLogout} className={styles.logoutBtn} title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
}
