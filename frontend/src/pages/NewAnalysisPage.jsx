import React, { useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  ArrowRight, 
  Sparkles, 
  Check, 
  Upload, 
  Info,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

export const NewAnalysisPage = () => {
  const navigate = useNavigate();
  const { setActiveWorkspaceId, refreshWorkspaces, showToast } = useApp();

  const sanctInputId = useId();
  const recInputId = useId();
  const compInputId = useId();

  // Wizard Steps: 1 (Upload) -> 2 (Cleaning Summary) -> 3 (Analyzing) -> 4 (Analysis Briefing)
  const [step, setStep] = useState(1);
  const [workspaceName, setWorkspaceName] = useState('Constituency Audit — Aug 2026');
  const [description, setDescription] = useState('Prepared for State Vigilance & District Magistrate Review');
  
  // Selected files
  const [sanctionedFile, setSanctionedFile] = useState(null);
  const [recommendedFile, setRecommendedFile] = useState(null);
  const [completedFile, setCompletedFile] = useState(null);

  // Results State
  const [createdWorkspace, setCreatedWorkspace] = useState(null);
  const [cleaningSummary, setCleaningSummary] = useState(null);
  const [analysisSummary, setAnalysisSummary] = useState(null);
  
  // Loading & Error States
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Dynamic Readiness Calculation
  let readinessPct = 0;
  if (workspaceName.trim()) readinessPct += 25;
  if (sanctionedFile) readinessPct += 50;
  if (recommendedFile) readinessPct += 12.5;
  if (completedFile) readinessPct += 12.5;
  if (!sanctionedFile) readinessPct = 0; // In standard state before file upload

  // ----------------------------------------------------
  // STEP 1: UPLOAD & INGESTION
  // ----------------------------------------------------
  const handleUploadAndClean = async (e) => {
    if (e) e.preventDefault();
    if (!workspaceName.trim()) {
      showToast('Please enter a workspace name', 'warning');
      return;
    }
    if (!sanctionedFile) {
      showToast('Sanctioned works CSV file is required', 'warning');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg(null);

      // 1. Create Workspace
      const ws = await api.createWorkspace({
        name: workspaceName.trim(),
        description: description.trim() || undefined
      });
      setCreatedWorkspace(ws);
      setActiveWorkspaceId(ws.id);

      // 2. Upload Files for Ingestion & Automated Cleaning
      const formData = new FormData();
      formData.append('sanctioned_file', sanctionedFile);
      if (recommendedFile) formData.append('recommended_file', recommendedFile);
      if (completedFile) formData.append('completed_file', completedFile);

      const cleanRes = await api.uploadDataset(ws.id, formData);
      setCleaningSummary(cleanRes);
      await refreshWorkspaces();

      showToast('Dataset validated and canonical schema mapped!', 'success');
      setStep(2); // Move to Warnings Summary
    } catch (err) {
      setErrorMsg(err.message || 'Failed to upload and validate dataset.');
      showToast('Upload validation error: ' + err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // ----------------------------------------------------
  // STEP 2 -> 3: RUN SYNCHRONOUS ML ANALYSIS
  // ----------------------------------------------------
  const handleExecuteAnalysis = async () => {
    if (!createdWorkspace) return;

    try {
      setIsProcessing(true);
      setStep(3); // Show locked progress screen
      setErrorMsg(null);

      // Synchronous API Call to ML Engine
      const result = await api.runAnalysis(createdWorkspace.id);
      setAnalysisSummary(result);
      await refreshWorkspaces();

      showToast('ML Analysis and Rule Evaluation Complete!', 'success');
      setStep(4); // Show Briefing
    } catch (err) {
      setErrorMsg(err.message || 'ML Scoring Pipeline execution failed.');
      showToast('Analysis failed: ' + err.message, 'error');
      setStep(2); // Revert to previous step on error
    } finally {
      setIsProcessing(false);
    }
  };

  // ----------------------------------------------------
  // STEP 4: ENTER COMMAND CENTER
  // ----------------------------------------------------
  const handleEnterCommandCenter = () => {
    if (createdWorkspace) {
      setActiveWorkspaceId(createdWorkspace.id);
    }
    navigate('/dashboard');
  };

  return (
    <div className="flex-col gap-6" style={{ maxWidth: '1440px', margin: '0 auto' }}>
      {/* Main Page Header */}
      <div>
        <h1 className="text-display" style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
          Create Analysis Session
        </h1>
        <p className="text-body-secondary" style={{ marginTop: '6px', fontSize: '13.5px', color: 'var(--color-text-secondary)' }}>
          Upload constituency source data and prepare it for canonical normalization.
        </p>
      </div>

      {/* Step Progress Bar */}
      <div className="na-progress-bar">
        <div className="na-step-item">
          <div className={`na-step-num ${step >= 1 ? 'active' : 'inactive'}`}>1</div>
          <span style={{ color: step >= 1 ? '#00f2fe' : '#64748b', fontWeight: step === 1 ? 700 : 500 }}>
            Upload Dataset
          </span>
        </div>

        <div style={{ height: '1px', flex: 1, background: step >= 2 ? 'rgba(0, 242, 254, 0.4)' : 'rgba(255, 255, 255, 0.06)', margin: '0 16px' }} />

        <div className="na-step-item">
          <div className={`na-step-num ${step >= 2 ? 'active' : 'inactive'}`}>2</div>
          <span style={{ color: step >= 2 ? '#00f2fe' : '#64748b', fontWeight: step === 2 ? 700 : 500 }}>
            Validation &amp; Cleaning
          </span>
        </div>

        <div style={{ height: '1px', flex: 1, background: step >= 3 ? 'rgba(0, 242, 254, 0.4)' : 'rgba(255, 255, 255, 0.06)', margin: '0 16px' }} />

        <div className="na-step-item">
          <div className={`na-step-num ${step >= 3 ? 'active' : 'inactive'}`}>3</div>
          <span style={{ color: step >= 3 ? '#00f2fe' : '#64748b', fontWeight: step === 3 ? 700 : 500 }}>
            ML Analysis Summary
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="card" style={{ background: 'rgba(239, 68, 68, 0.08)', borderColor: 'var(--color-critical)', padding: 'var(--space-5)' }}>
          <div className="flex items-start gap-3">
            <AlertTriangle size={22} color="var(--color-critical)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <h3 className="text-heading-3" style={{ color: 'var(--color-critical-text)', margin: '0 0 var(--space-2)' }}>
                Dataset Validation Rejection
              </h3>
              <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-primary)', lineHeight: '1.5' }}>
                {errorMsg}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* STEP 1: UPLOAD DATASET WIZARD                      */}
      {/* ================================================== */}
      {step === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.9fr) minmax(0, 1.1fr)', gap: 'var(--space-5)', alignItems: 'start' }}>
          {/* Left Column: Main Form & Feeds Card */}
          <div className="na-main-card">
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.01em', margin: '0 0 4px 0' }}>
                Create Analysis Session &amp; Upload Data
              </h2>
              <p className="text-body-secondary" style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                Provide the official session metadata and upload raw MPLADS files.
              </p>
            </div>

            {/* Session Details Form */}
            <div className="flex-col gap-4">
              <div>
                <label className="na-form-label">
                  ANALYSIS SESSION NAME <span style={{ color: 'var(--color-critical)' }}>*</span>
                </label>
                <input 
                  type="text"
                  className="na-form-input"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Constituency Audit — Aug 2026"
                  required
                />
              </div>

              <div>
                <label className="na-form-label">
                  SESSION DESCRIPTION / AUDIT NOTES
                </label>
                <input 
                  type="text"
                  className="na-form-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Prepared for State Vigilance & District Magistrate Review"
                />
              </div>
            </div>

            {/* Constituency Data Feeds */}
            <div className="flex-col gap-3" style={{ paddingTop: '8px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  CONSTITUENCY DATA FEEDS
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  All required source files are staged below for ingestion.
                </div>
              </div>

              {/* Feed 1: Sanctioned Works CSV (Required) */}
              <div className={`na-feed-card ${sanctionedFile ? 'has-file' : ''}`}>
                <div className="flex items-start gap-3">
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px' }}>
                    <FileText size={16} color="var(--color-accent-teal)" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        1. Sanctioned Works Report (.csv)
                      </span>
                      <span className="badge badge-critical" style={{ fontSize: '9px', padding: '1px 6px' }}>
                        REQUIRED
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '3px' }}>
                      Canonical fields: Work Code / ID • Sanction Amount • Work • Sanction Date • Status
                    </div>
                  </div>
                </div>

                <div>
                  <input 
                    id={sanctInputId}
                    type="file" 
                    accept=".csv"
                    style={{ display: 'none' }}
                    onChange={(e) => setSanctionedFile(e.target.files[0] || null)}
                  />
                  <label 
                    htmlFor={sanctInputId}
                    className="btn btn-secondary btn-sm"
                    style={{ cursor: 'pointer', fontSize: '11px', padding: '5px 12px', whiteSpace: 'nowrap' }}
                  >
                    {sanctionedFile ? sanctionedFile.name.substring(0, 18) + '...' : 'Choose File'}
                  </label>
                </div>
              </div>

              {/* Feed 2: Recommended Works CSV (Optional) */}
              <div className={`na-feed-card ${recommendedFile ? 'has-file' : ''}`}>
                <div className="flex items-start gap-3">
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px' }}>
                    <FileText size={16} color="var(--color-text-secondary)" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        2. Recommended Works Proposals (.csv)
                      </span>
                      <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', fontSize: '9px', padding: '1px 6px' }}>
                        OPTIONAL
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '3px' }}>
                      Used for recommendation-date and administrative sanction-delay intelligence.
                    </div>
                  </div>
                </div>

                <div>
                  <input 
                    id={recInputId}
                    type="file" 
                    accept=".csv"
                    style={{ display: 'none' }}
                    onChange={(e) => setRecommendedFile(e.target.files[0] || null)}
                  />
                  <label 
                    htmlFor={recInputId}
                    className="btn btn-secondary btn-sm"
                    style={{ cursor: 'pointer', fontSize: '11px', padding: '5px 12px', whiteSpace: 'nowrap' }}
                  >
                    {recommendedFile ? recommendedFile.name.substring(0, 18) + '...' : 'Choose File'}
                  </label>
                </div>
              </div>

              {/* Feed 3: Completed Works CSV (Optional) */}
              <div className={`na-feed-card ${completedFile ? 'has-file' : ''}`}>
                <div className="flex items-start gap-3">
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px' }}>
                    <FileText size={16} color="var(--color-text-secondary)" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        3. Completed Works &amp; Disbursements (.csv)
                      </span>
                      <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', fontSize: '9px', padding: '1px 6px' }}>
                        OPTIONAL
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                      Used for completion matching and financial variance analysis.
                    </div>
                  </div>
                </div>

                <div>
                  <input 
                    id={compInputId}
                    type="file" 
                    accept=".csv"
                    style={{ display: 'none' }}
                    onChange={(e) => setCompletedFile(e.target.files[0] || null)}
                  />
                  <label 
                    htmlFor={compInputId}
                    className="btn btn-secondary btn-sm"
                    style={{ cursor: 'pointer', fontSize: '11px', padding: '5px 12px', whiteSpace: 'nowrap' }}
                  >
                    {completedFile ? completedFile.name.substring(0, 18) + '...' : 'Choose File'}
                  </label>
                </div>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex-between items-center" style={{ paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <button 
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate('/workspaces')}
                disabled={isProcessing}
                style={{ color: '#94a3b8' }}
              >
                Cancel
              </button>

              <button 
                type="button"
                className="btn-cyan-cta"
                onClick={handleUploadAndClean}
                disabled={isProcessing || !sanctionedFile}
                style={{ opacity: !sanctionedFile ? 0.6 : 1 }}
              >
                <Upload size={15} strokeWidth={2.5} />
                <span>{isProcessing ? 'Validating & Ingesting...' : 'Validate & Ingest Dataset'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Ingestion Control / Dataset Readiness Panel */}
          <div className="na-readiness-panel">
            <div>
              <div style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--color-accent-teal)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>
                INGESTION CONTROL
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
                Dataset readiness
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', marginTop: '3px', lineHeight: '1.4' }}>
                Before analysis begins, every file passes through schema verification.
              </div>
            </div>

            {/* Semi-Circle Radial Gauge */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 0 6px' }}>
              <div style={{ position: 'relative', width: '160px', height: '88px', overflow: 'hidden' }}>
                <svg viewBox="0 0 160 90" style={{ width: '100%', height: '100%' }}>
                  {/* Background Track */}
                  <path
                    d="M 20 80 A 60 60 0 0 1 140 80"
                    fill="none"
                    stroke="var(--color-surface-elevated)"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Progress Arc */}
                  <path
                    d="M 20 80 A 60 60 0 0 1 140 80"
                    fill="none"
                    stroke="var(--color-accent-cyan)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="188.5"
                    strokeDashoffset={sanctionedFile ? "0" : "188.5"}
                    style={{ transition: 'stroke-dashoffset 0.4s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', bottom: '6px', left: '0', right: '0', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', fontFamily: 'var(--font-sans)', lineHeight: '1' }}>
                    {sanctionedFile ? '100%' : '0%'}
                  </div>
                  <div style={{ fontSize: '10.5px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    ready
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Status Checklist Cards */}
            <div className="flex-col gap-2.5">
              {/* Item 1: Session metadata */}
              <div className="na-readiness-item">
                <div className="flex items-center gap-2.5">
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--color-normal)' }} />
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Session metadata
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--color-normal-text)', fontWeight: 600 }}>
                  Complete
                </span>
              </div>

              {/* Item 2: Required CSV */}
              <div className="na-readiness-item">
                <div className="flex items-center gap-2.5">
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: sanctionedFile ? 'var(--color-normal)' : 'var(--color-high)' }} />
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Required CSV
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: sanctionedFile ? 'var(--color-normal-text)' : 'var(--color-high-text)', fontWeight: 600 }}>
                  {sanctionedFile ? 'Uploaded' : 'Awaiting upload'}
                </span>
              </div>

              {/* Item 3: Schema validation */}
              <div className="na-readiness-item">
                <div className="flex items-center gap-2.5">
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#475569' }} />
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#94a3b8' }}>
                    Schema validation
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Locked
                </span>
              </div>

              {/* Item 4: ML analysis */}
              <div className="na-readiness-item">
                <div className="flex items-center gap-2.5">
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#475569' }} />
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#94a3b8' }}>
                    ML analysis
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Locked
                </span>
              </div>
            </div>

            {/* Footer Block */}
            <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-accent-teal)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                SOURCE LINEAGE PRESERVED
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                Original uploads remain traceable.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* STEP 2: AUTOMATED CLEANING & WARNINGS SUMMARY       */}
      {/* ================================================== */}
      {step === 2 && cleaningSummary && (
        <div className="na-main-card">
          <div className="flex items-center gap-3">
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={22} color="var(--color-normal)" />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
                Data Validation &amp; Ingestion Successful
              </h2>
              <p className="text-caption" style={{ color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Workspace: <strong style={{ color: 'var(--color-text-primary)' }}>{createdWorkspace?.name}</strong> • ID: <code>{createdWorkspace?.id}</code>
              </p>
            </div>
          </div>

          {/* Ingested Counts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
            <div className="na-feed-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>✓ Sanctioned Works Ingested</span>
              <p style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'var(--color-accent-teal)' }}>
                {cleaningSummary.sanctioned_count} Records
              </p>
            </div>

            <div className="na-feed-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>✓ Recommended Proposals</span>
              <p style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
                {cleaningSummary.recommended_count} Records
              </p>
            </div>

            <div className="na-feed-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>✓ Completed / Disbursed Matches</span>
              <p style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
                {cleaningSummary.completed_count} Records
              </p>
            </div>
          </div>

          {/* Canonical Column Normalization Mapping Table */}
          {cleaningSummary.normalized_columns && cleaningSummary.normalized_columns.length > 0 && (
            <div style={{ background: 'var(--color-surface-elevated)', padding: 'var(--space-4)', borderRadius: '10px', border: '1px solid var(--color-border-subtle)' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-3)' }}>
                <Check size={16} color="var(--color-normal)" />
                <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                  Canonical Column Aliases Matched ({cleaningSummary.normalized_columns.length})
                </h4>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'left', color: '#64748b' }}>
                      <th style={{ padding: '6px 8px' }}>Canonical Target Field</th>
                      <th style={{ padding: '6px 8px' }}>Matched File Column</th>
                      <th style={{ padding: '6px 8px' }}>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cleaningSummary.normalized_columns.map((col, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '6px 8px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {col.label}
                        </td>
                        <td style={{ padding: '6px 8px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent-teal)' }}>
                          {col.matched_column}
                        </td>
                        <td style={{ padding: '6px 8px' }}>
                          <span className={`badge ${col.is_required ? 'badge-critical' : 'badge-info'}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                            {col.is_required ? 'REQUIRED' : 'OPTIONAL'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex-between items-center" style={{ paddingTop: '8px' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => setStep(1)}
            >
              Back to Upload
            </button>

            <button 
              className="btn-cyan-cta"
              onClick={handleExecuteAnalysis}
              disabled={isProcessing}
            >
              <Cpu size={15} strokeWidth={2.5} />
              <span>Continue to ML Risk Analysis</span>
            </button>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* STEP 3: SYNCHRONOUS ML ANALYSIS SCREEN (LOCKED)    */}
      {/* ================================================== */}
      {step === 3 && (
        <div className="na-main-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0, 242, 254, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)', border: '2px solid #00f2fe' }}>
            <Cpu size={32} color="#00f2fe" className="animate-spin" />
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
            Executing ML Intelligence Pipeline
          </h2>
          <p className="text-body-secondary" style={{ maxWidth: '520px', margin: '0 auto var(--space-6)', color: 'var(--color-text-secondary)' }}>
            Running Pure Python Isolation Forest anomaly detector, applying statutory MPLADS compliance rules, and formulating hybrid priority indices.
          </p>

          <div style={{ maxWidth: '440px', margin: '0 auto', textAlign: 'left', background: 'var(--color-surface-elevated)', padding: 'var(--space-4)', borderRadius: '10px', border: '1px solid var(--color-border-subtle)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
            <p style={{ margin: '4px 0', color: 'var(--color-accent-cyan)' }}>[✓] Extracting 6-feature multivariate vectors</p>
            <p style={{ margin: '4px 0', color: 'var(--color-accent-cyan)' }}>[✓] Fitting Isolation Forest Model (100 Trees, Sample 256)</p>
            <p style={{ margin: '4px 0', color: 'var(--color-accent-cyan)' }}>[✓] Evaluating 5 Statutory Rule compliance thresholds</p>
            <p style={{ margin: '4px 0', color: 'var(--color-accent-cyan)' }}>[⋯] Formulating composite S_risk = 0.60 × S_ml + 0.40 × S_rule</p>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* STEP 4: ANALYSIS BRIEFING SUMMARY                  */}
      {/* ================================================== */}
      {step === 4 && analysisSummary && (
        <div className="na-main-card">
          <div className="flex items-center gap-3">
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0, 242, 254, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={22} color="var(--color-accent-cyan)" />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
                Analysis Complete: {analysisSummary.workspace_name}
              </h2>
              <p className="text-caption" style={{ color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Processed on {new Date(analysisSummary.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* High-level Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
            <div className="na-feed-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px', borderLeft: '3px solid var(--color-accent-cyan)' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Total Projects</span>
              <p style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>{analysisSummary.total_scored}</p>
            </div>

            <div className="na-feed-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px', borderLeft: '3px solid #f59e0b' }}>
              <span style={{ fontSize: '11px', color: '#64748b' }}>ML Anomalies (S_ml ≥70)</span>
              <p style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#fbbf24' }}>
                {analysisSummary.anomalies_count}
              </p>
            </div>

            <div className="na-feed-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px', borderLeft: '3px solid #ef4444' }}>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Critical Risk (S_risk ≥75)</span>
              <p style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#f87171' }}>
                {analysisSummary.critical_count}
              </p>
            </div>

            <div className="na-feed-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px', borderLeft: '3px solid #f59e0b' }}>
              <span style={{ fontSize: '11px', color: '#64748b' }}>High Risk (S_risk ≥60)</span>
              <p style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#fbbf24' }}>
                {analysisSummary.high_count}
              </p>
            </div>

            <div className="na-feed-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px', borderLeft: '3px solid #10b981' }}>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Normal / Low Risk</span>
              <p style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#34d399' }}>
                {analysisSummary.normal_count}
              </p>
            </div>
          </div>

          <div className="flex-between items-center" style={{ paddingTop: '8px' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/workspaces')}
            >
              Return to Workspaces Hub
            </button>

            <button 
              className="btn-cyan-cta"
              onClick={handleEnterCommandCenter}
            >
              <span>Enter Command Center</span>
              <ArrowUpRight size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      {/* Footer Caption */}
      <div style={{ textAlign: 'center', fontSize: '11px', color: '#475569', marginTop: '12px' }}>
        <strong style={{ color: '#64748b', letterSpacing: '0.04em' }}>MPLAD INTELLIGENCE</strong> • AI-assisted audit • human review required for enforcement
      </div>
    </div>
  );
};
