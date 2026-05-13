"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { applicationService } from "@/services/applicationService";
import ApplicationTable from "@/components/ApplicationTable";
import RtiFormModal, { RtiApplication } from "@/components/RtiFormModal";
import styles from "@/styles/Dashboard.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  BarChart2, 
  Clock, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  Calendar,
  Filter
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const ITEMS_PER_PAGE = 10;

const chartData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
];

export default function Dashboard() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<RtiApplication[]>([]);
  
  // Filtering & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<RtiApplication | null>(null);

  const fetchApplications = useCallback(async (page: number, searchStr: string, status: string) => {
    setLoading(true);
    try {
      const response = await applicationService.fetchApplications(page, ITEMS_PER_PAGE, searchStr, status);
      
      if (response.data) {
        setApplications(response.data);
        setTotalCount(response.total || response.data.length);
      } else {
        setApplications(Array.isArray(response) ? response : []);
        setTotalCount(Array.isArray(response) ? response.length : 0);
      }
    } catch (error: any) {
      showToast(error.message || "Failed to fetch applications", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const checkSession = async () => {
      const session = await authService.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      fetchApplications(currentPage, search, statusFilter);
    };
    checkSession();
  }, [router, currentPage, search, statusFilter, fetchApplications]);

  const handleSaveApplication = async (data: Partial<RtiApplication>) => {
    try {
      if (editingApp) {
        const updated = await applicationService.updateApplication(editingApp.id, data);
        setApplications(prev => prev.map(app => app.id === editingApp.id ? updated : app));
        showToast("Application updated successfully", "success");
      } else {
        const created = await applicationService.createApplication(data);
        setApplications(prev => [created, ...prev]);
        setTotalCount(prev => prev + 1);
        showToast("Application created successfully", "success");
      }
      setIsModalOpen(false);
      setEditingApp(null);
    } catch (error: any) {
      showToast(error.message || "Failed to save application", "error");
    }
  };

  const handleDeleteApplication = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      const previousApps = [...applications];
      setApplications(prev => prev.filter(app => app.id !== id));
      try {
        await applicationService.deleteApplication(id);
        setTotalCount(prev => prev - 1);
        showToast("Application deleted successfully", "success");
      } catch (error: any) {
        setApplications(previousApps);
        showToast(error.message || "Failed to delete application", "error");
      }
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    const previousApps = [...applications];
    setApplications(prev => prev.map(app => app.id === id ? { ...app, status: newStatus as any } : app));
    try {
      await applicationService.updateApplication(id, { status: newStatus as any });
      showToast("Status updated successfully", "success");
    } catch (error: any) {
      setApplications(previousApps);
      showToast(error.message || "Failed to update status", "error");
    }
  };

  const stats = [
    { label: "Total Applications", value: totalCount, icon: BarChart2, trend: "+12%", color: "#3b82f6" },
    { label: "Pending Review", value: applications.filter(a => a.status === "Pending").length, icon: Clock, trend: "Active", color: "#f59e0b" },
    { label: "Approved RTIs", value: applications.filter(a => a.status === "Approved").length, icon: CheckCircle2, trend: "+5%", color: "#10b981" },
    { label: "Rejected", value: applications.filter(a => a.status === "Rejected").length, icon: XCircle, trend: "0%", color: "#ef4444" },
  ];

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  return (
    <div className={styles.dashboardContainer}>
      <motion.header 
        className={styles.dashboardHeader}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div>
          <h1 className={styles.dashboardTitle}>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back to the RTI management system.</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingApp(null); setIsModalOpen(true); }}>
          <Plus size={20} />
          <span>New Application</span>
        </button>
      </motion.header>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            className={styles.statCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className={styles.statLabel}>
              <stat.icon size={18} style={{ color: stat.color }} />
              {stat.label}
            </div>
            <div className={styles.statValue}>{stat.value}</div>
            <div className={styles.statTrend} style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              {stat.trend}
            </div>
          </motion.div>
        ))}
      </div>

      <div className={styles.mainGrid}>
        {/* Left: Table Section */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Applications</h2>
            <div className={styles.controls}>
              <div className={styles.searchInput}>
                <Search className={styles.searchInputIcon} size={18} />
                <input 
                  type="text" 
                  placeholder="Search applicants..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className={styles.filterSelect}>
                <select 
                  className="btn-secondary"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className={styles.tableContainer}>
            <ApplicationTable 
              applications={applications} 
              onEdit={(app) => { setEditingApp(app); setIsModalOpen(true); }}
              onDelete={handleDeleteApplication}
              onStatusChange={handleStatusChange}
              isLoading={loading}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        {/* Right: Analytics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <motion.div 
            className={styles.sectionCard}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Monthly Volume</h2>
              <Calendar size={18} className="text-muted" />
            </div>
            <div style={{ padding: '20px', height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="var(--accent-color)" fillOpacity={1} fill="url(#colorVal)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Insights</h2>
              <TrendingUp size={18} className="text-muted" />
            </div>
            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Your response rate is up <strong>8%</strong>. Processing speed is within the target range.
              </p>
              <div style={{ height: '8px', width: '100%', backgroundColor: '#f1f5f9', borderRadius: '4px' }}>
                <motion.div 
                  style={{ height: '100%', backgroundColor: 'var(--success-color)', borderRadius: '4px' }}
                  initial={{ width: 0 }}
                  animate={{ width: '70%' }}
                  transition={{ duration: 1 }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '8px' }}>
                <span className="text-muted">Target Met</span>
                <span className="font-bold">70%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <RtiFormModal
            isOpen={isModalOpen}
            onClose={() => { setIsModalOpen(false); setEditingApp(null); }}
            onSubmit={handleSaveApplication}
            initialData={editingApp}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
