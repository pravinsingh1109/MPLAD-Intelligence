import io
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Top Header line
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(40, 800, 555, 800)
        self.drawString(40, 805, "MPLAD INTELLIGENCE SYSTEM — OFFICIAL PROJECT FORENSIC DOSSIER")
        self.drawRightString(555, 805, "GOVERNMENT DECISION SUPPORT")

        # Bottom Footer line
        self.line(40, 40, 555, 40)
        self.drawString(40, 28, "CONFIDENTIAL — FOR INTERNAL AUDIT & NODAL OFFICER REVIEW ONLY")
        self.drawRightString(555, 28, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def generate_project_pdf(work_data: dict, explanation: dict, case_data: dict = None, notes: list = None, audit_logs: list = None, workspace_name: str = "Active Workspace") -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=55,
        bottomMargin=55
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    c_primary = colors.HexColor("#0f172a")    # Slate 900
    c_secondary = colors.HexColor("#334155")  # Slate 700
    c_teal = colors.HexColor("#0d9488")       # Teal 600
    c_bg_light = colors.HexColor("#f8fafc")   # Slate 50
    c_border = colors.HexColor("#cbd5e1")     # Slate 300
    
    # Severity Color
    band = work_data.get("severity_band", "NORMAL RISK")
    if "CRITICAL" in band:
        c_badge_bg = colors.HexColor("#fee2e2")
        c_badge_fg = colors.HexColor("#991b1b")
    elif "HIGH" in band:
        c_badge_bg = colors.HexColor("#ffedd5")
        c_badge_fg = colors.HexColor("#9a3412")
    elif "MEDIUM" in band:
        c_badge_bg = colors.HexColor("#fef9c3")
        c_badge_fg = colors.HexColor("#854d0e")
    else:
        c_badge_bg = colors.HexColor("#dcfce7")
        c_badge_fg = colors.HexColor("#166534")

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=c_primary
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=c_secondary
    )

    section_hdr_style = ParagraphStyle(
        'SectionHdr',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=c_primary,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=c_secondary
    )

    body_bold = ParagraphStyle(
        'BodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=c_primary
    )

    mono_style = ParagraphStyle(
        'Mono',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=10,
        textColor=c_primary
    )

    story = []

    # 1. Header Banner & Project Title
    work_id = work_data.get("work_id") or work_data.get("id") or "UNKNOWN_WORK_ID"
    title_text = work_data.get("title") or "MPLADS Project"
    
    hdr_table_data = [
        [
            Paragraph(f"<b>PROJECT FORENSIC DOSSIER</b><br/><font size='8' color='#64748b'>Workspace: {workspace_name} · Generated: {datetime.utcnow().strftime('%d-%b-%Y %H:%M UTC')}</font>", title_style),
            Paragraph(f"<font color='{c_badge_fg.hexval()}'><b>{band}</b></font><br/><font size='7.5' color='#64748b'>S_risk = {work_data.get('risk_priority_score', 0):.1f} / 100</font>", ParagraphStyle('Badge', parent=body_bold, alignment=2))
        ]
    ]
    hdr_table = Table(hdr_table_data, colWidths=[360, 155])
    hdr_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(hdr_table)
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=4, spaceAfter=8))

    # Project Identifier Box
    story.append(Paragraph(f"<b>Work ID:</b> <font color='#0d9488'>{work_id}</font>", ParagraphStyle('WID', parent=body_bold, fontSize=10, leading=13)))
    story.append(Paragraph(f"<b>Description:</b> {title_text}", body_style))
    story.append(Spacer(1, 10))

    # 2. Executive Intelligence Narrative
    story.append(Paragraph("1. Executive Intelligence Narrative", section_hdr_style))
    narrative_text = explanation.get("executive_summary") or f"Project #{work_id} evaluated with composite risk score {work_data.get('risk_priority_score', 0):.1f}/100."
    narrative_table = Table([[Paragraph(narrative_text, body_style)]], colWidths=[515])
    narrative_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_bg_light),
        ('BOX', (0,0), (-1,-1), 0.5, c_border),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(narrative_table)
    story.append(Spacer(1, 12))

    # 3. Core Project Identification & Administration Metadata
    story.append(Paragraph("2. Administrative & Financial Overview", section_hdr_style))
    
    sanct_amt = work_data.get('sanctioned_amount_lakhs', 0.0)
    rec_amt = work_data.get('recommended_amount_lakhs', 0.0)
    disb_amt = work_data.get('disbursed_amount_lakhs', 0.0)
    delay_days = work_data.get('sanction_delay_days', 0)
    imputed_flag = " (Date Imputed)" if work_data.get('is_recommendation_date_imputed') else " (Exact CSV Match)"

    meta_data = [
        [
            Paragraph("<b>Category / Sector:</b>", body_style),
            Paragraph(str(work_data.get('category') or 'Not available in this dataset'), body_style),
            Paragraph("<b>Sanctioned Outlay:</b>", body_style),
            Paragraph(f"₹{sanct_amt:.2f} Lakhs", body_bold),
        ],
        [
            Paragraph("<b>Implementing Agency:</b>", body_style),
            Paragraph(str(work_data.get('ida') or 'Not available in this dataset'), body_style),
            Paragraph("<b>MP Recommended:</b>", body_style),
            Paragraph(f"₹{rec_amt:.2f} Lakhs", body_style),
        ],
        [
            Paragraph("<b>District & State:</b>", body_style),
            Paragraph(f"{work_data.get('district', 'N/A')}, {work_data.get('state', 'N/A')}", body_style),
            Paragraph("<b>Disbursed Amount:</b>", body_style),
            Paragraph(f"₹{disb_amt:.2f} Lakhs" if disb_amt > 0 else "Not available in this dataset", body_style),
        ],
        [
            Paragraph("<b>MP Name & Constituency:</b>", body_style),
            Paragraph(f"{work_data.get('mp_name', 'N/A')} ({work_data.get('constituency', 'N/A')})", body_style),
            Paragraph("<b>Sanction Delay:</b>", body_style),
            Paragraph(f"{delay_days} Days{imputed_flag}", body_style),
        ],
        [
            Paragraph("<b>Sanction Status:</b>", body_style),
            Paragraph(str(work_data.get('status') or 'Sanctioned'), body_style),
            Paragraph("<b>Completion Status:</b>", body_style),
            Paragraph("Completed" if work_data.get('is_completed') else "In Progress / Not Disbursed", body_style),
        ]
    ]
    meta_table = Table(meta_data, colWidths=[120, 140, 115, 140])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_bg_light),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))

    # 4. Explainable Risk Score Breakdown
    story.append(Paragraph("3. Risk Priority & Anomaly Formulation", section_hdr_style))
    story.append(Paragraph(
        "<b>Applied Formula:</b> <font color='#0d9488'>S_risk = 0.60 × S_ml + 0.40 × S_rule</font> (Weights: 60% Isolation Forest Anomaly + 40% Statutory Rule Engine)",
        body_style
    ))
    story.append(Spacer(1, 4))

    score_data = [
        [
            Paragraph("<b>Metric Component</b>", body_bold),
            Paragraph("<b>Observed Score</b>", body_bold),
            Paragraph("<b>Weight</b>", body_bold),
            Paragraph("<b>Points Contributed</b>", body_bold),
            Paragraph("<b>Assessment / Status</b>", body_bold),
        ],
        [
            Paragraph("ML Anomaly Score (S_ml)", body_style),
            Paragraph(f"{work_data.get('ml_anomaly_score', 0):.1f} / 100", body_bold),
            Paragraph("60%", body_style),
            Paragraph(f"+{(work_data.get('ml_anomaly_score', 0) * 0.60):.1f} pts", body_style),
            Paragraph("ANOMALY (S_ml ≥ 70)" if work_data.get('is_ml_anomaly') else "Normal Range", body_style),
        ],
        [
            Paragraph("Statutory Rule Score (S_rule)", body_style),
            Paragraph(f"{work_data.get('rule_score', 0):.1f} / 100", body_bold),
            Paragraph("40%", body_style),
            Paragraph(f"+{(work_data.get('rule_score', 0) * 0.40):.1f} pts", body_style),
            Paragraph(f"{len(work_data.get('rule_signals', []))} Rule Signal(s)" if work_data.get('rule_signals') else "Zero Violations", body_style),
        ],
        [
            Paragraph("<b>COMPOSITE RISK INDEX (S_risk)</b>", body_bold),
            Paragraph(f"<b>{work_data.get('risk_priority_score', 0):.1f} / 100</b>", body_bold),
            Paragraph("<b>100%</b>", body_bold),
            Paragraph(f"<b>{work_data.get('risk_priority_score', 0):.1f} pts</b>", body_bold),
            Paragraph(f"<b>{band}</b>", body_bold),
        ]
    ]
    score_table = Table(score_data, colWidths=[155, 80, 50, 90, 140])
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#e2e8f0")),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BACKGROUND', (0,3), (-1,3), colors.HexColor("#f1f5f9")),
    ]))
    story.append(score_table)
    story.append(Spacer(1, 12))

    # 5. Triggered Statutory Rule Signals
    signals = work_data.get('rule_signals') or []
    story.append(Paragraph(f"4. Statutory Compliance Signals ({len(signals)} Triggered)", section_hdr_style))
    
    if signals:
        sig_rows = []
        for idx, sig in enumerate(signals, 1):
            sig_rows.append([
                Paragraph(f"<b>Signal #{idx}</b>", body_bold),
                Paragraph(str(sig), body_style)
            ])
        sig_table = Table(sig_rows, colWidths=[70, 445])
        sig_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#fffbeb")),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#fde68a")),
            ('PADDING', (0,0), (-1,-1), 5),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        story.append(sig_table)
    else:
        no_sig_table = Table([[Paragraph("Zero statutory compliance thresholds or administrative rules were violated for this work.", body_style)]], colWidths=[515])
        no_sig_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f0fdf4")),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#bbf7d0")),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(no_sig_table)
    
    story.append(Spacer(1, 12))

    # 6. Feature Evidence Matrix
    feat_matrix = explanation.get('feature_evidence_matrix') or []
    if feat_matrix:
        story.append(Paragraph("5. Multivariate Feature Evidence Matrix", section_hdr_style))
        feat_rows = [
            [
                Paragraph("<b>Feature Name</b>", body_bold),
                Paragraph("<b>Observed Value</b>", body_bold),
                Paragraph("<b>Empirical Benchmark</b>", body_bold),
                Paragraph("<b>Severity / Evaluation</b>", body_bold),
            ]
        ]
        for f in feat_matrix:
            feat_rows.append([
                Paragraph(str(f.get("feature_name", "")), body_style),
                Paragraph(str(f.get("observed_value", "")), body_bold),
                Paragraph(str(f.get("dataset_benchmark", "")), body_style),
                Paragraph(str(f.get("evaluation", "")), body_style),
            ])
        feat_table = Table(feat_rows, colWidths=[130, 95, 150, 140])
        feat_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#e2e8f0")),
            ('GRID', (0,0), (-1,-1), 0.5, c_border),
            ('PADDING', (0,0), (-1,-1), 4),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        story.append(feat_table)
        story.append(Spacer(1, 12))

    # 7. Investigation Case Status & Notes
    current_case_status = case_data.get("current_status", "UNDER REVIEW") if case_data else "UNDER REVIEW"
    story.append(Paragraph("6. Case Investigation & Audit Record", section_hdr_style))
    
    inv_summary_data = [
        [
            Paragraph("<b>Current Verification Status:</b>", body_style),
            Paragraph(f"<b>{current_case_status}</b>", body_bold),
            Paragraph("<b>Total Field Notes:</b>", body_style),
            Paragraph(str(len(notes) if notes else 0), body_style),
        ]
    ]
    inv_table = Table(inv_summary_data, colWidths=[140, 140, 100, 135])
    inv_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_bg_light),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(inv_table)
    story.append(Spacer(1, 6))

    if notes and len(notes) > 0:
        notes_rows = [
            [
                Paragraph("<b>Timestamp</b>", body_bold),
                Paragraph("<b>Officer</b>", body_bold),
                Paragraph("<b>Official Observation / Note</b>", body_bold)
            ]
        ]
        for n in notes[:5]:
            ts_str = str(n.get("timestamp", ""))[:19]
            notes_rows.append([
                Paragraph(ts_str, mono_style),
                Paragraph(str(n.get("officer_name", "Nodal Officer")), body_style),
                Paragraph(str(n.get("note_text", "")), body_style)
            ])
        notes_table = Table(notes_rows, colWidths=[100, 110, 305])
        notes_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
            ('GRID', (0,0), (-1,-1), 0.5, c_border),
            ('PADDING', (0,0), (-1,-1), 4),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        story.append(notes_table)
    else:
        story.append(Paragraph("<i>No field observation notes recorded for this work.</i>", body_style))

    # Build Document with NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

def generate_executive_pdf(workspace_name: str, kpis: dict, top_anomalies: list, agency_dist: list, early_warnings: list = None) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=55,
        bottomMargin=55
    )

    styles = getSampleStyleSheet()
    c_primary = colors.HexColor("#0f172a")
    c_secondary = colors.HexColor("#334155")
    c_teal = colors.HexColor("#0d9488")
    c_bg_light = colors.HexColor("#f8fafc")
    c_border = colors.HexColor("#cbd5e1")

    title_style = ParagraphStyle(
        'ExecDocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=c_primary
    )
    subtitle_style = ParagraphStyle(
        'ExecDocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=c_secondary
    )
    section_hdr_style = ParagraphStyle(
        'ExecSectionHdr',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=c_teal,
        spaceBefore=10,
        spaceAfter=5
    )
    body_style = ParagraphStyle(
        'ExecBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=c_primary
    )
    body_bold = ParagraphStyle(
        'ExecBodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=c_primary
    )
    mono_style = ParagraphStyle(
        'ExecMono',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=10,
        textColor=c_primary
    )

    story = []

    # 1. Header
    story.append(Paragraph("MPLAD SCHEME INTELLIGENCE SYSTEM", subtitle_style))
    story.append(Spacer(1, 2))
    story.append(Paragraph(f"Executive Command Summary Report — {workspace_name}", title_style))
    story.append(Spacer(1, 3))
    gen_time = datetime.now().strftime("%d %b %Y, %H:%M IST")
    story.append(Paragraph(f"Generated on: <b>{gen_time}</b> | Authority: <b>State Nodal Monitoring Wing</b>", subtitle_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1, color=c_teal, spaceBefore=0, spaceAfter=8))

    # 2. Executive KPIs Matrix
    story.append(Paragraph("1. Macro Scheme Performance & Anomaly Metrics", section_hdr_style))
    kpi_data = [
        [
            Paragraph("<b>Total Works Monitored:</b>", body_style),
            Paragraph(f"<b>{kpis.get('total_sanctioned_works', 0)} Works</b>", body_bold),
            Paragraph("<b>Total Sanction Outlay:</b>", body_style),
            Paragraph(f"<b>₹{kpis.get('total_sanctioned_amount_cr', 0):.2f} Cr</b>", body_bold),
        ],
        [
            Paragraph("<b>ML Anomaly Candidates:</b>", body_style),
            Paragraph(f"<font color='#9a3412'><b>{kpis.get('ml_anomaly_candidates_count', 0)} Flagged</b></font>", body_bold),
            Paragraph("<b>Critical / High Priority:</b>", body_style),
            Paragraph(f"<font color='#991b1b'><b>{kpis.get('critical_risk_count', 0) + kpis.get('high_risk_count', 0)} Cases</b></font>", body_bold),
        ],
        [
            Paragraph("<b>Completed Works:</b>", body_style),
            Paragraph(f"<b>{kpis.get('total_completed_works', 0)} Verified</b>", body_bold),
            Paragraph("<b>Disbursed Outlay:</b>", body_style),
            Paragraph(f"<b>₹{kpis.get('total_disbursed_amount_cr', 0):.2f} Cr</b>", body_bold),
        ]
    ]
    kpi_table = Table(kpi_data, colWidths=[140, 115, 140, 120])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_bg_light),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(kpi_table)
    story.append(Spacer(1, 8))

    # 3. Early Warning Alerts
    if early_warnings and len(early_warnings) > 0:
        story.append(Paragraph("2. Proactive Early Warning Signals & Bottlenecks", section_hdr_style))
        ew_rows = [[Paragraph("<b>Alert Category</b>", body_bold), Paragraph("<b>Warning Summary & Statutory Impact</b>", body_bold)]]
        for ew in early_warnings[:4]:
            ew_rows.append([
                Paragraph(f"<font color='#9a3412'><b>{ew.get('title', '')}</b></font>", body_bold),
                Paragraph(f"{ew.get('detail', '')} (Affected: {ew.get('count', 0)} works)", body_style)
            ])
        ew_table = Table(ew_rows, colWidths=[150, 365])
        ew_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#ffedd5")),
            ('GRID', (0,0), (-1,-1), 0.5, c_border),
            ('PADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(ew_table)
        story.append(Spacer(1, 8))

    # 4. Top Priority Investigation Queue
    story.append(Paragraph("3. Top High-Risk Anomaly Candidates for Inspection", section_hdr_style))
    anom_rows = [
        [
            Paragraph("<b>#</b>", body_bold),
            Paragraph("<b>Work ID</b>", body_bold),
            Paragraph("<b>Work Description</b>", body_bold),
            Paragraph("<b>Agency (IDA)</b>", body_bold),
            Paragraph("<b>S_risk</b>", body_bold),
            Paragraph("<b>Severity</b>", body_bold),
        ]
    ]
    for idx, a in enumerate(top_anomalies[:10]):
        anom_rows.append([
            Paragraph(str(idx + 1), body_style),
            Paragraph(str(a.get("work_id", a.get("id", ""))), mono_style),
            Paragraph(str(a.get("title", ""))[:45] + ("..." if len(str(a.get("title", ""))) > 45 else ""), body_style),
            Paragraph(str(a.get("ida", ""))[:20], body_style),
            Paragraph(f"<b>{float(a.get('risk_priority_score', 0)):.1f}</b>", body_bold),
            Paragraph(str(a.get("severity_band", "NORMAL")), body_bold),
        ])
    anom_table = Table(anom_rows, colWidths=[20, 140, 165, 95, 45, 50])
    anom_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(anom_table)
    story.append(Spacer(1, 8))

    # 5. Agency Concentration Summary
    if agency_dist and len(agency_dist) > 0:
        story.append(Paragraph("4. Implementing Agency (IDA) Concentration Overview", section_hdr_style))
        agency_rows = [
            [
                Paragraph("<b>Implementing Agency Name</b>", body_bold),
                Paragraph("<b>Works Count</b>", body_bold),
                Paragraph("<b>Total Outlay</b>", body_bold),
                Paragraph("<b>Share (%)</b>", body_bold),
            ]
        ]
        for ag in agency_dist[:5]:
            agency_rows.append([
                Paragraph(str(ag.get("agency", "")), body_style),
                Paragraph(str(ag.get("count", 0)), body_bold),
                Paragraph(f"₹{float(ag.get('outlay_cr', 0)):.2f} Cr", body_style),
                Paragraph(f"{float(ag.get('percentage', 0)):.1f}%", body_bold),
            ])
        agency_table = Table(agency_rows, colWidths=[220, 85, 110, 100])
        agency_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#e2e8f0")),
            ('GRID', (0,0), (-1,-1), 0.5, c_border),
            ('PADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(agency_table)

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

