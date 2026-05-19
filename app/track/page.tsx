"use client";

import { useState } from "react";
import { Search, ArrowLeft, Loader2, Calendar, User, Mail, Info } from "lucide-react";
import Link from "next/link";
import styles from "@/styles/Track.module.css";
import { motion, AnimatePresence } from "framer-motion";

export default function TrackPage() {
  const [receiptNo, setReceiptNo] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptNo.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`/api/track?receipt_no=${receiptNo.trim()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Application not found");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.trackContainer}>
      <motion.div 
        className={styles.trackHeader}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={styles.trackTitle}>Track Your Application</h1>
        <p className={styles.trackSubtitle}>
          Enter your unique receipt number to check the real-time status of your RTI request.
        </p>
      </motion.div>

      <motion.div 
        className={styles.searchCard}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <form onSubmit={handleTrack} className={styles.searchGroup}>
          <input
            type="text"
            className={styles.trackInput}
            placeholder="e.g. RTI-2026-0042"
            value={receiptNo}
            onChange={(e) => setReceiptNo(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn-primary" disabled={loading} style={{ height: 'auto', padding: '0 24px' }}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Search size={20} /> Search</>}
          </button>
        </form>

        <AnimatePresence>
          {error && (
            <motion.p 
              className="text-error" 
              style={{ marginTop: '16px', textAlign: 'center', fontWeight: 500 }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {error}
            </motion.p>
          )}

          {result && (
            <motion.div 
              className={styles.resultCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={styles.resultHeader}>
                <div>
                  <div className={styles.receiptLabel}>Receipt Number</div>
                  <div className={styles.receiptValue}>{result.receipt_no}</div>
                </div>
                <div className={`status-badge status-${result.status.toLowerCase()}`}>
                  {result.status}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className={styles.detailRow}>
                  <div className={styles.detailLabel} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={14} /> Applicant
                  </div>
                  <div className={styles.detailValue}>{result.applicant}</div>
                </div>
                <div className={styles.detailRow}>
                  <div className={styles.detailLabel} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={14} /> Filed On
                  </div>
                  <div className={styles.detailValue}>
                    {new Date(result.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              {result.remarks && (
                <div className={styles.remarksBox}>
                  <div className={styles.remarksTitle}>Latest Update</div>
                  <p className={styles.remarksText}>{result.remarks}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={18} />
          Back to Portal
        </Link>
      </div>
    </div>
  );
}
