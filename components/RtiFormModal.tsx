"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/Modal.module.css";
import { X, Loader2, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface RtiApplication {
  id: number;
  applicant: string;
  email: string;
  status: "Pending" | "Approved" | "Rejected";
  receipt_no?: string;
  document_url?: string | null;
  remarks?: string | null;
  user_id?: string;
  created_at?: string;
}

interface RtiFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<RtiApplication>) => Promise<void> | void;
  initialData?: RtiApplication | null;
}

export default function RtiFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData 
}: RtiFormModalProps) {
  const [formData, setFormData] = useState<Partial<RtiApplication>>({
    applicant: "",
    email: "",
    status: "Pending"
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ applicant: "", email: "", status: "Pending" });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.applicant?.trim()) newErrors.applicant = "Name is required";
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.modalOverlay} onClick={onClose}>
          <motion.div 
            className={styles.modalContent} 
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{initialData ? "Edit Application" : "New RTI Application"}</h2>
              <button className={styles.closeButton} onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGrid}>
                  {initialData?.receipt_no && (
                    <div className="form-group">
                      <label className={styles.label}>Application Receipt Number</label>
                      <input
                        type="text"
                        value={initialData.receipt_no}
                        readOnly
                        style={{ backgroundColor: 'var(--surface-hover)', cursor: 'not-allowed', fontWeight: 600, color: 'var(--accent-color)' }}
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label className={styles.label}>Applicant Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.applicant}
                      onChange={e => setFormData({ ...formData, applicant: e.target.value })}
                      style={errors.applicant ? { borderColor: 'var(--error-color)' } : {}}
                      disabled={loading}
                    />
                    {errors.applicant && <p className={styles.errorText}>{errors.applicant}</p>}
                  </div>

                  <div className="form-group">
                    <label className={styles.label}>Email Address</label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      style={errors.email ? { borderColor: 'var(--error-color)' } : {}}
                      disabled={loading}
                    />
                    {errors.email && <p className={styles.errorText}>{errors.email}</p>}
                  </div>

                  <div className="form-group">
                    <label className={styles.label}>Current Status</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                      disabled={loading}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  {initialData && (
                    <div className="form-group">
                      <label className={styles.label}>Remarks (Official Use)</label>
                      <textarea
                        rows={3}
                        placeholder="Add internal notes or status reasons..."
                        value={formData.remarks || ""}
                        onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> {initialData ? "Update Application" : "Submit Application"}</>}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
