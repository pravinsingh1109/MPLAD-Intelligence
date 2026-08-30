# Design Specification & UI/UX Architecture (DESIGN.md)
*UI/UX Pro Max Design Intelligence Specification · SIH26102 · Government Intelligence Command Platform*

---

## 1. UI/UX Pro Max Design Audit & Selection

### 1.1 Selected Design Direction: `data-dense-dashboard` + `institutional-dark-mode`
Based on the UI/UX Pro Max design intelligence framework, the application is engineered as a **Tier-1 Government Cyber-Forensic & Decision Support Command Platform**.

#### Why this style was selected:
- **Institutional Trust & Authority:** Replaces generic CRUD admin aesthetics with an authoritative operational platform suited for State Nodal Officers, District Magistrates, and Comptroller Auditors.
- **Maximum Information Density without Clutter:** High-density metric cards, structured tables, and direct-labeled charts provide instant decision clarity without forcing users to hunt for numbers inside hover tooltips.
- **Accessibility & Contrast:** Conforms to WCAG 2.1 AA/AAA contrast guidelines (minimum 4.5:1 text contrast on dark slate canvas `#090b0e` and cards `#151822`).
- **Data Integrity & Traceability:** Mathematical formulas, feature evidence matrices, and immutable audit logs are presented with crisp typographic hierarchy.

---

## 2. Institutional Design Tokens

### 2.1 CSS Custom Properties
```css
:root {
  /* Canvas & Viewport */
  --color-canvas:           #090b0e;   /* Deepest outer canvas */
  --color-frame-bg:         #0f1219;   /* Master floating frame */
  --color-sidebar-bg:       #131620;   /* Sidebar column */
  --color-surface-card:     #171a24;   /* Cards & data containers */
  --color-surface-elevated: #1e2230;   /* Nested metric tiles & active controls */
  --color-surface-hover:    #242938;   /* Table row hover, button hover */

  /* Borders & Dividers */
  --color-border-subtle:    rgba(255, 255, 255, 0.07);
  --color-border-strong:    rgba(255, 255, 255, 0.14);
  --color-border-accent:    rgba(20, 184, 166, 0.40);

  /* Accents */
  --color-accent-teal:      #14b8a6;   /* Primary cyber teal */
  --color-accent-teal-glow: rgba(20, 184, 166, 0.22);
  --color-accent-indigo:    #6366f1;   /* Electric indigo */
  --color-accent-cyan:      #06b6d4;   /* Electric cyan */
  --color-accent-blue:      #3b82f6;   /* Operational blue */

  /* Text Hierarchy */
  --color-text-primary:     #f8fafc;   /* White high-contrast headers */
  --color-text-secondary:   #94a3b8;   /* Silver sub-labels and field values */
  --color-text-muted:       #64748b;   /* Muted captions & metadata */
  --color-text-disabled:    #475569;

  /* Severity Status Tokens */
  --color-critical:         #ef4444;   /* Critical Risk — Crimson */
  --color-critical-bg:      rgba(239, 68, 68, 0.12);
  --color-critical-border:  rgba(239, 68, 68, 0.35);
  --color-critical-text:    #f87171;

  --color-high:             #f59e0b;   /* High Risk — Amber Gold */
  --color-high-bg:          rgba(245, 158, 11, 0.12);
  --color-high-border:      rgba(245, 158, 11, 0.35);
  --color-high-text:        #fbbf24;

  --color-medium:           #eab308;   /* Medium Risk — Yellow */
  --color-medium-bg:        rgba(234, 179, 8, 0.12);
  --color-medium-border:    rgba(234, 179, 8, 0.35);
  --color-medium-text:      #fde047;

  --color-normal:           #10b981;   /* Normal Risk / Connected — Emerald */
  --color-normal-bg:        rgba(16, 185, 129, 0.12);
  --color-normal-border:    rgba(16, 185, 129, 0.35);
  --color-normal-text:      #34d399;

  --color-info:             #06b6d4;   /* Demo / Informational — Cyan */
  --color-info-bg:          rgba(6, 182, 212, 0.12);
  --color-info-border:      rgba(6, 182, 212, 0.30);
  --color-info-text:        #38bdf8;

  /* Typography & Geometry */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'ui-monospace', 'SFMono-Regular', Consolas, monospace;
  --radius-frame: 24px;
  --radius-card:  16px;
  --radius-md:    10px;
  --radius-sm:    6px;
  --radius-pill:  9999px;
  --shadow-card:  0 4px 20px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  --shadow-frame: 0 20px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
```

---

## 3. Core Information Architecture & 10 Decision Anchors

The entire UI is built to answer 10 operational questions instantly:
1. **Active Context:** Which workspace/constituency dataset is being audited? *(TopBar Capsule)*
2. **Scheme Health:** What is the macro disbursement and recommendation match rate? *(Notice Banner & Secondary Strip)*
3. **Total Scope:** How many work orders and how much outlay are monitored? *(KPI Card 1 & 2)*
4. **Outlier Count:** How many works violate multivariate anomaly baselines? *(KPI Card 3: ML Anomalies)*
5. **High Priority Triage:** How many cases require field audit? *(KPI Card 4: High Risk Priority)*
6. **Risk Distribution:** What proportion of works fall into Critical, High, Medium, Normal? *(Donut with direct non-hover percentages)*
7. **Agency Allocation:** Which Implementing Agency (IDA) holds work concentration? *(Bar chart with direct counts and percentages)*
8. **Action Queue:** What are the top 10 ranked projects requiring immediate inspection? *(Preview Queue Table)*
9. **Explainability & Attribution:** Why was a specific project flagged? *(Formula Card $S_{\text{risk}} = 0.60 \times S_{\text{ml}} + 0.40 \times S_{\text{rule}}$ + Feature Evidence Matrix)*
10. **Governance & Actions:** What is the investigation status and audit history? *(Investigation Workspace & Audit Trail)*

---

## 4. Visual Component Specifications

### 4.1 Application Shell & Navigation
- **Master Frame:** Rounded floating container with subtle border outline.
- **Sidebar:** Grouped sections (`WORKSPACE & DATA`, `INTELLIGENCE CORE`, `GOVERNANCE & AUDIT`), active gradient capsule navigation, and dynamic badge counters.
- **Top Header:** Active workspace context pill with `Switch` trigger, live API heartbeat dot, and official persona indicator.

### 4.2 Chart Design Rules (UI/UX Pro Max Standard)
- **Primary Information Always Visible:** Direct on-slice percentage labels for pie slices $\ge 7\%$ and an aligned legend grid displaying `Count (Percentage%)`.
- **Horizontal Bar Charts:** `<LabelList dataKey="count" position="right" />` rendering `${count} (${percentage}%)` with X-axis domain headroom preventing label truncation.
- **Tooltips:** Kept as secondary detail containers (outlay values, full names, precise dates).

### 4.3 Mathematical Formula Presentation
- **Zero Raw LaTeX / Zero Raw SVG:** Display clean mathematical typography:
  `S_risk = 0.60 × S_ml + 0.40 × S_rule`
- Structured 2-column component breakdown displaying $S_{\text{ml}}$ and $S_{\text{rule}}$, their weights (60% / 40%), contribution points, and violation status.

---

## 5. UI/UX Pro Max Do's and Don'ts

| Category | Do | Don't |
| :--- | :--- | :--- |
| **Typography** | Use `Inter` for UI and `JetBrains Mono` for IDs and formulas | Use random fonts or raw LaTeX formatting |
| **Colors** | Use semantic severity colors (Red, Amber, Emerald, Cyan) | Use decorative rainbow gradients or neon overload |
| **Charts** | Show counts & percentages directly on the chart and legend | Hide primary operational metrics inside hover-only tooltips |
| **Buttons** | Capsule buttons with clear icon pairings and active states | Oversized square generic buttons |
| **Data Tables** | High-density rows with monospace IDs and clickable routing | Low-contrast table text or truncated unreadable cells |
