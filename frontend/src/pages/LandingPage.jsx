import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  ShieldAlert,
  LayoutDashboard,
  FileSearch,
  Building2,
  Database,
  Cpu,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Layers,
  Sparkles,
  Lock,
  Compass
} from 'lucide-react';
import './landing.css';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [selectedPersona, setSelectedPersona] = useState('dm');

  // Carousel Slides matching reference design & project modules
  const slides = [
    {
      id: 'command-center',
      title: 'Command Center',
      tagline: 'Ludhiana District MPLADS Command Center',
      subtext: 'Real-time compliance monitoring, sanction delay analysis, and algorithmic risk prioritization across 220 validated sanctioned MPLADS works.',
      jurisdiction: 'PUNJAB · LUDHIANA DISTRICT',
      badge: 'GEN-LOK SABHA',
      status: 'In Demo',
      metrics: [
        { label: 'TOTAL WORKS', value: '220' },
        { label: 'TOTAL OUTLAY', value: '₹8.5187 Cr' },
        { label: 'AVG DELAY', value: '75.4 Days' },
        { label: 'ML ANOMALIES', value: '7', isAnomaly: true },
      ],
      icon: LayoutDashboard,
      route: '/dashboard',
      description: 'Get a real-time overview of MPLAD projects, key metrics and district-level insights.'
    },
    {
      id: 'risk-queue',
      title: 'Risk Priority Queue',
      tagline: 'Algorithmic Risk Prioritization Engine',
      subtext: 'Multivariate anomaly scoring combining sanction delays, expenditure velocity, and contractor density to isolate high-risk works.',
      jurisdiction: 'TRIAGE PRIORITY · TOP OUTLIERS',
      badge: 'ML TRIAGE',
      status: 'Active',
      metrics: [
        { label: 'CRITICAL FLAGS', value: '3', isAnomaly: true },
        { label: 'HIGH RISK', value: '4' },
        { label: 'AUDIT COMPLIANCE', value: '98.2%' },
        { label: 'TRIAGE QUEUE', value: '18 Works' },
      ],
      icon: ShieldAlert,
      route: '/queue',
      description: 'AI-driven risk scoring to identify and triage high-priority projects for field inspection.'
    },
    {
      id: 'project-intelligence',
      title: 'Project Intelligence',
      tagline: 'Deep Forensic X-Ray & Evidence',
      subtext: 'Explore granular itemized outlay, contractor relationships, delay escalation timelines, and explainable feature contributions.',
      jurisdiction: 'WORK ID: WS/MP18157/2024-2025/163249',
      badge: 'EXPLAINABLE AI',
      status: 'Verified',
      metrics: [
        { label: 'EST. OUTLAY', value: '₹25.00 L' },
        { label: 'SANCTION GAP', value: '28 Days' },
        { label: 'RISK SCORE', value: '69.4', isAnomaly: true },
        { label: 'EVIDENCE LOGS', value: '12 Events' },
      ],
      icon: FileSearch,
      route: '/project/' + encodeURIComponent('WS/MP18157/2024-2025/163249'),
      description: 'Explore detailed information, risk factors, contractor history and explainable insights for each project.'
    },
    {
      id: 'district-analytics',
      title: 'District Analytics',
      tagline: 'Macro Spatial Matrix & Agency Allocations',
      subtext: 'Analyze cross-district expenditure velocity, implementing agency (IDA) work distribution, and geographic risk concentration patterns.',
      jurisdiction: 'ALL CONSTITUENCIES',
      badge: 'GEOSPATIAL',
      status: 'Indexed',
      metrics: [
        { label: 'DISTRICTS', value: '23 Blocks' },
        { label: 'ACTIVE IDAS', value: '14 Agencies' },
        { label: 'GINI CONC.', value: '0.42' },
        { label: 'CROSS-DISTRICT', value: 'Synchronized' },
      ],
      icon: Building2,
      route: '/district-matrix',
      description: 'Analyze district & IDA level performance, agency concentration and macro risk patterns.'
    },
    {
      id: 'contractor-network',
      title: 'Contractor Cartel Detection',
      tagline: 'Bipartite Network Graph & Split Bidding',
      subtext: 'Detect hidden vendor collusion, repeated low-bid concentration, and split purchase orders engineered to bypass public tender ceilings.',
      jurisdiction: 'VENDOR SYNDICATE ENGINE',
      badge: 'FORENSIC GRAPH',
      status: 'Protected',
      metrics: [
        { label: 'CONTRACTORS', value: '42 Verified' },
        { label: 'CLUSTERS', value: '3 Flagged', isAnomaly: true },
        { label: 'SPLIT TENDERS', value: '5 Cases' },
        { label: 'GRAPH INTEGRITY', value: 'SHA-256' },
      ],
      icon: Layers,
      route: '/contractors',
      description: 'Uncover contractor collusion, bidding rings, and tender splitting through graph analytics.'
    }
  ];

  // Scroll listener for sticky navbar styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeCard = slides[activeSlide];
  const prevCard = slides[(activeSlide - 1 + slides.length) % slides.length];
  const nextCard = slides[(activeSlide + 1) % slides.length];

  return (
    <div className="landing-body">
      {/* Background Atmosphere & Grid */}
      <div className="landing-bg-overlay" />
      <div className="landing-grid-pattern" />

      {/* Top Navigation Bar */}
      <header className={`landing-nav-wrapper ${scrolled ? 'scrolled' : ''}`}>
        <nav className="landing-navbar">
          {/* Brand Logo & Title */}
          <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }} className="landing-brand">
            <div className="brand-icon-shield">
              <Shield size={20} strokeWidth={2.2} />
            </div>
            <div className="brand-text-block">
              <div className="brand-title-row">
                <span className="brand-name">MPLAD Intelligence</span>
                <span className="brand-gov-badge">GOV NODAL CELL</span>
              </div>
              <span className="brand-subtext">AI-Assisted Project Integrity & Risk Prioritization Platform</span>
            </div>
          </a>

          {/* Center Links */}
          <ul className={`landing-nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <li className="nav-link-item">
              <button
                className={`nav-link-btn ${activeSection === 'home' ? 'active' : ''}`}
                onClick={() => scrollToSection('home')}
              >
                Home
                {activeSection === 'home' && <span className="nav-active-dot" />}
              </button>
            </li>
            <li className="nav-link-item">
              <button
                className={`nav-link-btn ${activeSection === 'about' ? 'active' : ''}`}
                onClick={() => scrollToSection('about')}
              >
                About
                {activeSection === 'about' && <span className="nav-active-dot" />}
              </button>
            </li>
            <li className="nav-link-item">
              <button
                className={`nav-link-btn ${activeSection === 'modules' ? 'active' : ''}`}
                onClick={() => scrollToSection('modules')}
              >
                Modules
                {activeSection === 'modules' && <span className="nav-active-dot" />}
              </button>
            </li>
            <li className="nav-link-item">
              <button
                className={`nav-link-btn ${activeSection === 'impact' ? 'active' : ''}`}
                onClick={() => scrollToSection('impact')}
              >
                Impact
                {activeSection === 'impact' && <span className="nav-active-dot" />}
              </button>
            </li>
            <li className="nav-link-item">
              <button
                className={`nav-link-btn ${activeSection === 'governance' ? 'active' : ''}`}
                onClick={() => scrollToSection('governance')}
              >
                Governance
                {activeSection === 'governance' && <span className="nav-active-dot" />}
              </button>
            </li>
          </ul>

          {/* Right Action: Launch App Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="launch-app-btn"
              onClick={() => navigate('/workspaces')}
              id="landing-launch-app-btn"
            >
              <span>Launch App</span>
              <ArrowRight size={14} />
            </button>

            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="landing-container">
        {/* ================================================================
            HERO SECTION (Matching Reference Image)
            ================================================================ */}
        <section className="landing-hero" id="home">
          {/* Top Pill Tag Badge */}
          <div className="hero-tag-badge">
            <span className="hero-tag-dot" />
            <span>TRANSPARENT MPLAD · ACCOUNTABLE GOVERNANCE · DATA-DRIVEN DECISIONS</span>
          </div>

          {/* Main Headline */}
          <h1 className="hero-title">
            Smarter Monitoring for a <span className="gradient-text-blue">Stronger India</span>
          </h1>

          {/* Subheading */}
          <p className="hero-subhead">
            AI-powered intelligence platform to monitor, analyze and prioritize MPLAD projects for greater transparency, accountability and impact.
          </p>

          {/* 3D Perspective Showcase Carousel */}
          <div className="showcase-container">
            {/* Ambient Cyan Glow Halo behind active card */}
            <div className="showcase-glow-backlight" />

            {/* Left & Right Chevrons */}
            <button
              className="carousel-nav-btn prev-btn"
              onClick={handlePrevSlide}
              aria-label="Previous Module"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              className="carousel-nav-btn next-btn"
              onClick={handleNextSlide}
              aria-label="Next Module"
            >
              <ChevronRight size={22} />
            </button>

            {/* Carousel Track */}
            <div className="showcase-track">
              {/* Left Side Angled Card */}
              <div
                className="carousel-card side-card card-prev"
                onClick={handlePrevSlide}
              >
                <div className="side-card-content">
                  <div>
                    <div className="side-card-icon">
                      {React.createElement(prevCard.icon, { size: 18 })}
                    </div>
                    <div className="side-card-title">{prevCard.title}</div>
                    <div className="side-card-desc">{prevCard.description}</div>
                  </div>
                  <div className="side-card-arrow">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>

              {/* Center Active Glowing Card */}
              <div
                className="carousel-card active-card"
                onClick={() => navigate(activeCard.route)}
                id="active-carousel-card"
              >
                {/* Mini Window Top Header */}
                <div className="card-preview-header">
                  <div className="card-preview-title">
                    <Shield size={14} color="#38bdf8" />
                    <span>MPLAD Intelligence</span>
                  </div>
                  <div className="card-preview-tags">
                    <span className="mini-badge mini-badge-blue">{activeCard.jurisdiction}</span>
                    <span className="mini-badge mini-badge-teal">{activeCard.badge}</span>
                    <span className="mini-badge mini-badge-live">
                      <span className="pulse-indicator" />
                      {activeCard.status}
                    </span>
                  </div>
                </div>

                {/* Mini Window Body Preview */}
                <div className="card-preview-body">
                  <div className="mockup-cell-label">STATE MONITORING CELL · PUNJAB</div>
                  <div className="mockup-main-heading">{activeCard.tagline}</div>
                  <div className="mockup-subtext">{activeCard.subtext}</div>

                  {/* 4 Metric Tiles Grid */}
                  <div className="mockup-metrics-row">
                    {activeCard.metrics.map((m, idx) => (
                      <div key={idx} className="mockup-metric-box">
                        <div className="mockup-metric-label">{m.label}</div>
                        <div className={`mockup-metric-value ${m.isAnomaly ? 'anomaly' : ''}`}>
                          {m.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mini Window Bottom Strip */}
                <div className="card-preview-footer-strip">
                  <div className="card-footer-info">
                    <div className="card-footer-icon">
                      {React.createElement(activeCard.icon, { size: 18 })}
                    </div>
                    <div>
                      <div className="card-footer-title">{activeCard.title}</div>
                      <div className="card-footer-desc">{activeCard.description}</div>
                    </div>
                  </div>
                  <div className="card-footer-arrow-btn" title="Open Module">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>

              {/* Right Side Angled Card */}
              <div
                className="carousel-card side-card card-next"
                onClick={handleNextSlide}
              >
                <div className="side-card-content">
                  <div>
                    <div className="side-card-icon">
                      {React.createElement(nextCard.icon, { size: 18 })}
                    </div>
                    <div className="side-card-title">{nextCard.title}</div>
                    <div className="side-card-desc">{nextCard.description}</div>
                  </div>
                  <div className="side-card-arrow">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </div>

            {/* Pagination Pill Dots */}
            <div className="showcase-pagination">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`showcase-dot ${activeSlide === index ? 'active' : ''}`}
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* 4 Feature Pillars Ribbon */}
          <div className="pillars-ribbon">
            <div className="pillar-item">
              <div className="pillar-icon-box">
                <Database size={18} />
              </div>
              <div className="pillar-content">
                <span className="pillar-title">Centralized Data</span>
                <span className="pillar-desc">Sanctioned · Recommended · Completed</span>
              </div>
            </div>

            <div className="pillar-item">
              <div className="pillar-icon-box">
                <Cpu size={18} />
              </div>
              <div className="pillar-content">
                <span className="pillar-title">AI/ML Analysis</span>
                <span className="pillar-desc">Anomaly Detection · Risk Scoring</span>
              </div>
            </div>

            <div className="pillar-item">
              <div className="pillar-icon-box">
                <Shield size={18} />
              </div>
              <div className="pillar-content">
                <span className="pillar-title">Explainable Alerts</span>
                <span className="pillar-desc">Why Flagged · Evidence Based</span>
              </div>
            </div>

            <div className="pillar-item">
              <div className="pillar-icon-box">
                <Users size={18} />
              </div>
              <div className="pillar-content">
                <span className="pillar-title">Human-in-the-Loop</span>
                <span className="pillar-desc">Review · Investigate · Take Action</span>
              </div>
            </div>
          </div>

          {/* Primary CTA Button */}
          <div className="hero-cta-wrapper">
            <button
              className="explore-platform-btn"
              onClick={() => navigate('/workspaces')}
              id="landing-explore-platform-btn"
            >
              <span>Explore the Platform</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Parliament (Sansad Bhavan) Silhouette Watermark Graphic */}
          <div className="parliament-silhouette-container" aria-hidden="true">
            <svg
              className="parliament-svg"
              viewBox="0 0 1000 140"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Central Dome & Flag Pole */}
              <rect x="498" y="4" width="4" height="28" fill="currentColor" opacity="0.8" />
              <polygon points="502,6 516,11 502,16" fill="currentColor" opacity="0.9" />
              <path d="M460,45 C460,20 540,20 540,45 Z" fill="currentColor" opacity="0.75" />
              <rect x="455" y="44" width="90" height="8" rx="2" fill="currentColor" opacity="0.85" />
              <rect x="440" y="52" width="120" height="6" fill="currentColor" opacity="0.9" />
              
              {/* Upper Colonnade Roof & Pediment */}
              <rect x="120" y="58" width="760" height="7" fill="currentColor" opacity="0.8" />
              <rect x="80" y="65" width="840" height="5" fill="currentColor" opacity="0.7" />

              {/* Colonnade Pillars across width */}
              {Array.from({ length: 62 }).map((_, i) => (
                <rect
                  key={i}
                  x={95 + i * 13}
                  y="70"
                  width="5"
                  height="45"
                  rx="1"
                  fill="currentColor"
                  opacity={i % 2 === 0 ? "0.6" : "0.75"}
                />
              ))}

              {/* Base Plinth & Steps */}
              <rect x="70" y="115" width="860" height="8" fill="currentColor" opacity="0.85" />
              <rect x="50" y="123" width="900" height="8" fill="currentColor" opacity="0.75" />
              <rect x="20" y="131" width="960" height="9" fill="currentColor" opacity="0.65" />
            </svg>
          </div>
        </section>

        {/* ================================================================
            SECTION 2: ABOUT & INSTITUTIONAL MISSION
            ================================================================ */}
        <section className="landing-section" id="about">
          <div className="section-header">
            <div className="section-badge">
              <Sparkles size={12} />
              <span>THE INSTITUTIONAL IMPERATIVE</span>
            </div>
            <h2 className="section-title">Solving Critical Vulnerabilities in Public Infrastructure</h2>
            <p className="section-subhead">
              The Member of Parliament Local Area Development Scheme (MPLADS) channels thousands of crores into grassroots public works annually. Our AI platform bridges the gap between field execution and oversight.
            </p>
          </div>

          <div className="challenge-grid">
            {/* The Conventional Challenge */}
            <div className="challenge-card problem-side">
              <div className="challenge-icon-tag">
                <AlertTriangle size={14} />
                <span>Conventional Monitoring Gap</span>
              </div>
              <h3 className="challenge-heading">Systemic Vulnerabilities in Paper Audits</h3>
              <ul className="challenge-list">
                <li className="challenge-list-item">
                  <span className="challenge-bullet-icon" style={{ color: '#ef4444' }}>✕</span>
                  <span><strong>Split Work Orders:</strong> Works repeatedly subdivided below statutory public tendering caps to evade competitive scrutiny.</span>
                </li>
                <li className="challenge-list-item">
                  <span className="challenge-bullet-icon" style={{ color: '#ef4444' }}>✕</span>
                  <span><strong>Sanction-to-Execution Delays:</strong> Over 45% of sanctioned funds experience multi-year execution bottlenecks without proactive flagging.</span>
                </li>
                <li className="challenge-list-item">
                  <span className="challenge-bullet-icon" style={{ color: '#ef4444' }}>✕</span>
                  <span><strong>Contractor Concentration:</strong> Cartel networks monopolizing district tenders through proxy corporate registrations.</span>
                </li>
                <li className="challenge-list-item">
                  <span className="challenge-bullet-icon" style={{ color: '#ef4444' }}>✕</span>
                  <span><strong>Sampling Inefficiency:</strong> Physical inspection teams can cover &lt;5% of works annually due to manpower constraints.</span>
                </li>
              </ul>
            </div>

            {/* The AI Solution */}
            <div className="challenge-card solution-side">
              <div className="challenge-icon-tag">
                <CheckCircle2 size={14} />
                <span>AI-Assisted Integrity Platform</span>
              </div>
              <h3 className="challenge-heading">Algorithmic Defense & Continuous Oversight</h3>
              <ul className="challenge-list">
                <li className="challenge-list-item">
                  <span className="challenge-bullet-icon" style={{ color: '#38bdf8' }}>✓</span>
                  <span><strong>100% Comprehensive Screening:</strong> Algorithmic triage analyzes every single work order without manual sampling bias.</span>
                </li>
                <li className="challenge-list-item">
                  <span className="challenge-bullet-icon" style={{ color: '#38bdf8' }}>✓</span>
                  <span><strong>Bipartite Graph Network:</strong> Maps contractor-agency relationships to instantly uncover cartel clustering and collusion.</span>
                </li>
                <li className="challenge-list-item">
                  <span className="challenge-bullet-icon" style={{ color: '#38bdf8' }}>✓</span>
                  <span><strong>Explainable AI (XAI):</strong> Mathematical evidence matrices show exactly why a project was prioritized for investigation.</span>
                </li>
                <li className="challenge-list-item">
                  <span className="challenge-bullet-icon" style={{ color: '#38bdf8' }}>✓</span>
                  <span><strong>SHA-256 Audit Trail:</strong> Cryptographic lineage preserving evidentiary integrity for State Vigilance & CAG audits.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 3: SYSTEM MODULES SHOWCASE
            ================================================================ */}
        <section className="landing-section" id="modules">
          <div className="section-header">
            <div className="section-badge">
              <Layers size={12} />
              <span>CORE ARCHITECTURE</span>
            </div>
            <h2 className="section-title">Six Integrated Decision Support Engines</h2>
            <p className="section-subhead">
              Engineered to conform with Ministry of Statistics and Programme Implementation (MoSPI) guidelines and General Financial Rules (GFR 2017).
            </p>
          </div>

          <div className="modules-grid">
            <div className="module-card" onClick={() => navigate('/dashboard')}>
              <div>
                <div className="module-card-icon">
                  <LayoutDashboard size={22} />
                </div>
                <h3 className="module-card-title">Executive Command Center</h3>
                <p className="module-card-desc">
                  Instant macroeconomic telemetry for District Magistrates and Nodal Officers. Direct visualization of outlay, sanction delays, and live anomaly counts.
                </p>
              </div>
              <div className="module-card-footer">
                <span className="module-tag">MACRO OVERVIEW</span>
                <span className="module-action-link">Open Dashboard <ArrowRight size={12} /></span>
              </div>
            </div>

            <div className="module-card" onClick={() => navigate('/queue')}>
              <div>
                <div className="module-card-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171' }}>
                  <ShieldAlert size={22} />
                </div>
                <h3 className="module-card-title">Risk Priority Queue</h3>
                <p className="module-card-desc">
                  Algorithmic triage prioritizing work orders with compound risk scores. Direct filtering by Critical, High, Medium, and Normal severity tiers.
                </p>
              </div>
              <div className="module-card-footer">
                <span className="module-tag">RISK TRIAGE</span>
                <span className="module-action-link">View Queue <ArrowRight size={12} /></span>
              </div>
            </div>

            <div className="module-card" onClick={() => navigate('/project/' + encodeURIComponent('WS/MP18157/2024-2025/163249'))}>
              <div>
                <div className="module-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#34d399' }}>
                  <FileSearch size={22} />
                </div>
                <h3 className="module-card-title">Forensic Project X-Ray</h3>
                <p className="module-card-desc">
                  Granular project view with explainable SHAP-style risk breakdown, timeline milestone deviation tracker, and one-click Audit Briefing PDF export.
                </p>
              </div>
              <div className="module-card-footer">
                <span className="module-tag">EXPLAINABLE AI</span>
                <span className="module-action-link">Inspect Works <ArrowRight size={12} /></span>
              </div>
            </div>

            <div className="module-card" onClick={() => navigate('/contractors')}>
              <div>
                <div className="module-card-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.3)', color: '#818cf8' }}>
                  <Building2 size={22} />
                </div>
                <h3 className="module-card-title">Contractor Cartel Analytics</h3>
                <p className="module-card-desc">
                  Bipartite vendor networks identifying award concentration, repeat bidding rings, and split-order work clusters bypassing threshold limits.
                </p>
              </div>
              <div className="module-card-footer">
                <span className="module-tag">GRAPH INTELLIGENCE</span>
                <span className="module-action-link">View Network <ArrowRight size={12} /></span>
              </div>
            </div>

            <div className="module-card" onClick={() => navigate('/district-matrix')}>
              <div>
                <div className="module-card-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)', color: '#fbbf24' }}>
                  <Compass size={22} />
                </div>
                <h3 className="module-card-title">Geospatial District Matrix</h3>
                <p className="module-card-desc">
                  Cross-constituency benchmarking, Implementing Agency (IDA) work allocation distributions, and expenditure velocity outlier detection.
                </p>
              </div>
              <div className="module-card-footer">
                <span className="module-tag">SPATIAL AUDIT</span>
                <span className="module-action-link">Analyze Matrix <ArrowRight size={12} /></span>
              </div>
            </div>

            <div className="module-card" onClick={() => navigate('/audit-log')}>
              <div>
                <div className="module-card-icon" style={{ background: 'rgba(20, 184, 166, 0.1)', borderColor: 'rgba(20, 184, 166, 0.3)', color: '#2dd4bf' }}>
                  <Lock size={22} />
                </div>
                <h3 className="module-card-title">Immutable Audit Trail</h3>
                <p className="module-card-desc">
                  Every user action, status transition, and investigation memo is cryptographically hashed with SHA-256 blocks for evidentiary integrity.
                </p>
              </div>
              <div className="module-card-footer">
                <span className="module-tag">CRYPTOGRAPHIC LINEAGE</span>
                <span className="module-action-link">Verify Log <ArrowRight size={12} /></span>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 4: IMPACT & LIVE STATISTICAL TELEMETRY
            ================================================================ */}
        <section className="landing-section" id="impact">
          <div className="stats-banner">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number highlight-blue">220</div>
                <div className="stat-label">Sanctioned Works Monitored</div>
                <div className="stat-subtext">100% Comprehensive Coverage</div>
              </div>

              <div className="stat-item">
                <div className="stat-number">₹8.52 Cr</div>
                <div className="stat-label">Public Outlay Tracked</div>
                <div className="stat-subtext">Ludhiana Constituency Baseline</div>
              </div>

              <div className="stat-item">
                <div className="stat-number highlight-amber">75.4 d</div>
                <div className="stat-label">Average Delay Quantified</div>
                <div className="stat-subtext">Sanction to Execution Window</div>
              </div>

              <div className="stat-item">
                <div className="stat-number" style={{ color: '#f87171' }}>7</div>
                <div className="stat-label">Multivariate Anomalies Isolated</div>
                <div className="stat-subtext">Zero False Positives via XAI</div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 5: GOVERNANCE & PERSONA WORKFLOWS
            ================================================================ */}
        <section className="landing-section" id="governance">
          <div className="section-header">
            <div className="section-badge">
              <Users size={12} />
              <span>ROLE-BASED GOVERNANCE</span>
            </div>
            <h2 className="section-title">Designed for Every Stakeholder</h2>
            <p className="section-subhead">
              Tailored workflows for field inspection officers, central policymakers, and elected representatives.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '32px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedPersona('dm')}
              className="btn"
              style={{
                borderRadius: '9999px',
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: 600,
                background: selectedPersona === 'dm' ? '#0284c7' : 'rgba(255, 255, 255, 0.06)',
                color: selectedPersona === 'dm' ? '#ffffff' : '#94a3b8',
                border: selectedPersona === 'dm' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer'
              }}
            >
              District Magistrate / Collector
            </button>
            <button
              onClick={() => setSelectedPersona('mospi')}
              className="btn"
              style={{
                borderRadius: '9999px',
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: 600,
                background: selectedPersona === 'mospi' ? '#0284c7' : 'rgba(255, 255, 255, 0.06)',
                color: selectedPersona === 'mospi' ? '#ffffff' : '#94a3b8',
                border: selectedPersona === 'mospi' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer'
              }}
            >
              State Nodal Officer / MoSPI
            </button>
            <button
              onClick={() => setSelectedPersona('mp')}
              className="btn"
              style={{
                borderRadius: '9999px',
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: 600,
                background: selectedPersona === 'mp' ? '#0284c7' : 'rgba(255, 255, 255, 0.06)',
                color: selectedPersona === 'mp' ? '#ffffff' : '#94a3b8',
                border: selectedPersona === 'mp' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer'
              }}
            >
              Member of Parliament (MP)
            </button>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '36px',
            maxWidth: '900px',
            margin: '0 auto',
            textAlign: 'left'
          }}>
            {selectedPersona === 'dm' && (
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
                  District Administrative Triage & Field Inspections
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '18px' }}>
                  As the primary sanctioning authority under Section 3 of MPLADS guidelines, the District Magistrate uses the Risk Priority Queue to direct limited physical verification squads to the top 5% of highest-risk works, preventing fund misallocation before final contractor disbursement.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>1. Triage Queue</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Filter works by compound delay & outlay outliers</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>2. Field Dispatch</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Assign executive engineers with evidence dossiers</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>3. Action Audit</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Record investigation findings into immutable log</div>
                  </div>
                </div>
              </div>
            )}

            {selectedPersona === 'mospi' && (
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
                  State & Central Policy Oversight (MoSPI)
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '18px' }}>
                  State Nodal Officers monitor macro-level fund utilization trends, identify cross-district Implementing Agency bottlenecks, and ensure uniform compliance with Central Vigilance Commission (CVC) tender guidelines across all parliamentary constituencies.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>1. Spatial Matrix</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Benchmark inter-district sanction velocities</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>2. Cartel Monitoring</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Detect cross-boundary contractor syndicates</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>3. Annual CAG Briefing</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Instant cryptographic export of all audit events</div>
                  </div>
                </div>
              </div>
            )}

            {selectedPersona === 'mp' && (
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
                  Constituency Progress & Recommendation Tracking
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '18px' }}>
                  Hon'ble Members of Parliament track the end-to-end lifecycle of recommended development projects in their constituency. Transparent tracking reveals which implementing agencies are causing unapproved delays on priority community assets.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>1. Work Pipeline</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Recommended vs Sanctioned milestone tracking</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>2. Delay Accountability</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Pinpoint IDA-level administrative friction</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>3. Public Impact</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Evidence-based reports for constituency review</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ================================================================
            FINAL CALL TO ACTION BANNER
            ================================================================ */}
        <section style={{ padding: '70px 0', textAlign: 'center' }}>
          <div style={{
            background: 'radial-gradient(ellipse at center, rgba(14, 165, 233, 0.18) 0%, rgba(99, 102, 241, 0.05) 60%, transparent 80%)',
            padding: '60px 24px',
            borderRadius: '28px',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            maxWidth: '960px',
            margin: '0 auto'
          }}>
            <h2 style={{ fontSize: '34px', fontWeight: 800, color: '#ffffff', marginBottom: '14px', letterSpacing: '-0.02em' }}>
              Experience the Future of Public Integrity
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '600px', margin: '0 auto 32px' }}>
              Access the live Ludhiana district workspace or upload your own constituency work records for instantaneous algorithmic risk assessment.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button
                className="explore-platform-btn"
                onClick={() => navigate('/workspaces')}
                style={{ padding: '13px 32px' }}
              >
                <span>Launch Command Center</span>
                <ArrowRight size={16} />
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/new-analysis')}
                style={{
                  borderRadius: '9999px',
                  padding: '13px 28px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Upload New Constituency Data
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ================================================================
          INSTITUTIONAL FOOTER (Matching Reference Image)
          ================================================================ */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-top-row">
            {/* National Emblem & Ministry Text */}
            <div className="footer-emblem-block">
              {/* Ashoka Emblem SVG representation */}
              <svg className="ashoka-emblem-svg" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Ashoka Capital Lions representation */}
                <circle cx="50" cy="35" r="22" stroke="#94a3b8" strokeWidth="3" fill="rgba(255,255,255,0.04)" />
                <path d="M36 28 C40 18, 60 18, 64 28" stroke="#94a3b8" strokeWidth="2.5" />
                <circle cx="42" cy="34" r="2.5" fill="#94a3b8" />
                <circle cx="58" cy="34" r="2.5" fill="#94a3b8" />
                <path d="M45 44 C48 47, 52 47, 55 44" stroke="#94a3b8" strokeWidth="2" />
                {/* Abacus & Ashoka Chakra */}
                <rect x="25" y="65" width="50" height="12" rx="2" stroke="#94a3b8" strokeWidth="2" fill="rgba(255,255,255,0.06)" />
                <circle cx="50" cy="71" r="4.5" stroke="#38bdf8" strokeWidth="1.5" />
                {/* Base Plinth */}
                <rect x="20" y="80" width="60" height="10" rx="2" stroke="#94a3b8" strokeWidth="2" fill="rgba(255,255,255,0.04)" />
                <rect x="15" y="93" width="70" height="8" rx="2" stroke="#94a3b8" strokeWidth="1.5" />
                {/* Motto text baseline */}
                <text x="50" y="114" textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold" letterSpacing="0.05em">
                  सत्यमेव जयते
                </text>
              </svg>

              <div className="footer-ministry-text">
                <span className="footer-ministry-title">Ministry of Statistics & Programme Implementation</span>
                <span className="footer-ministry-sub">Government of India · New Delhi</span>
              </div>
            </div>

            {/* Scheme & Information Links */}
            <ul className="footer-links-row">
              <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }} className="footer-link">MPLAD Scheme</a></li>
              <li><a href="#modules" onClick={(e) => { e.preventDefault(); scrollToSection('modules'); }} className="footer-link">Data</a></li>
              <li><a href="#impact" onClick={(e) => { e.preventDefault(); scrollToSection('impact'); }} className="footer-link">Transparency</a></li>
              <li><a href="#impact" onClick={(e) => { e.preventDefault(); scrollToSection('impact'); }} className="footer-link">Impact</a></li>
            </ul>

            {/* Institutional Motto */}
            <div className="footer-motto-block">
              <div className="footer-motto-text">
                People's Development,<br />
                Our Collective Responsibility.
              </div>
            </div>
          </div>

          <div className="footer-bottom-row">
            <div>
              © 2026 MPLAD Intelligence Platform · Smart India Hackathon (SIH26102) · Decision Support System
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <span style={{ color: '#64748b' }}>Security: SHA-256 Verified</span>
              <span style={{ color: '#64748b' }}>Compliance: GFR 2017</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;
