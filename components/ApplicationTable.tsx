"use client";

import { useState } from "react";
import styles from "@/styles/Dashboard.module.css";
import { Edit2, Trash2, MoreVertical, Eye } from "lucide-react";
import { RtiApplication } from "./RtiFormModal";
import Skeleton from "./Skeleton";
import { motion, AnimatePresence } from "framer-motion";

interface ApplicationTableProps {
  applications: RtiApplication[];
  onEdit: (app: RtiApplication) => void;
  onDelete: (id: number) => void;
  onStatusChange?: (id: number, newStatus: string) => void;
  isLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export default function ApplicationTable({ 
  applications, 
  onEdit, 
  onDelete, 
  onStatusChange,
  isLoading = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange
}: ApplicationTableProps) {
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Pending": return "status-pending";
      case "Approved": return "status-approved";
      case "Rejected": return "status-rejected";
      default: return "";
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    if (!onStatusChange) return;
    setUpdatingId(id);
    try {
      await onStatusChange(id, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Receipt Number</th>
            <th>Applicant Details</th>
            <th>Status</th>
            <th>Submission Date</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  <td><Skeleton width="100px" /></td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <Skeleton width="150px" height="16px" />
                      <Skeleton width="120px" height="12px" />
                    </div>
                  </td>
                  <td><Skeleton width="80px" height="24px" className="status-badge" /></td>
                  <td><Skeleton width="100px" /></td>
                  <td><div style={{ display: 'flex', justifyContent: 'flex-end' }}><Skeleton width="60px" /></div></td>
                </tr>
              ))
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className={styles.emptyState}>
                    <p>No applications found in this view.</p>
                  </div>
                </td>
              </tr>
            ) : (
              applications.map((app, index) => (
                <motion.tr 
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td style={{ fontWeight: 600, color: 'var(--accent-color)', fontSize: '0.875rem' }}>
                    {app.receipt_no || `RTI-${2026}-${app.id.toString().padStart(4, '0')}`}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600 }}>{app.applicant}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{app.email}</span>
                    </div>
                  </td>
                  <td>
                    {onStatusChange ? (
                      <select 
                        className={`${styles.inlineSelect} ${getStatusClass(app.status)}`}
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        disabled={updatingId === app.id}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    ) : (
                      <span className={`status-badge ${getStatusClass(app.status)}`}>
                        {app.status}
                      </span>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {app.created_at ? new Date(app.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    }) : "N/A"}
                  </td>
                  <td>
                    <div className={styles.actions} style={{ justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => onEdit(app)} 
                        className={styles.iconButton}
                        title="Edit"
                        disabled={updatingId === app.id}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(app.id)} 
                        className={`${styles.iconButton} ${styles.deleteIcon}`}
                        title="Delete"
                        disabled={updatingId === app.id}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </AnimatePresence>
        </tbody>
      </table>

      {onPageChange && totalPages > 1 && (
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>
          <div className={styles.pageControls}>
            <button 
              className={styles.pageBtn}
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              Previous
            </button>
            <button 
              className={styles.pageBtn}
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
