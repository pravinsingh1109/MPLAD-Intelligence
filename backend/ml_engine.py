import math
import random
from datetime import datetime

# ----------------------------------------------------
# PURE PYTHON ISOLATION FOREST ML ANOMALY ENGINE
# ----------------------------------------------------

def c_factor(n):
    if n <= 1:
        return 1.0
    if n == 2:
        return 1.0
    # Euler-Mascheroni constant gamma = 0.5772156649
    return 2.0 * (math.log(n - 1) + 0.5772156649) - (2.0 * (n - 1) / n)

class IsolationTreeNode:
    def __init__(self, size):
        self.size = size
        self.split_feat = None
        self.split_val = None
        self.left = None
        self.right = None
        self.is_leaf = True

def build_itree(data, current_height, height_limit):
    n = len(data)
    node = IsolationTreeNode(n)
    if current_height >= height_limit or n <= 1:
        return node
    
    n_feats = len(data[0])
    valid_feats = []
    for f in range(n_feats):
        vals = [d[f] for d in data]
        if max(vals) > min(vals):
            valid_feats.append(f)
            
    if not valid_feats:
        return node
        
    feat_idx = random.choice(valid_feats)
    vals = [d[feat_idx] for d in data]
    min_val = min(vals)
    max_val = max(vals)
    
    split_val = random.uniform(min_val, max_val)
    
    left_data = [d for d in data if d[feat_idx] < split_val]
    right_data = [d for d in data if d[feat_idx] >= split_val]
    
    node.is_leaf = False
    node.split_feat = feat_idx
    node.split_val = split_val
    node.left = build_itree(left_data, current_height + 1, height_limit)
    node.right = build_itree(right_data, current_height + 1, height_limit)
    return node

def path_length(x, node, current_height):
    if node.is_leaf or node.size <= 1:
        return current_height + c_factor(node.size)
    if x[node.split_feat] < node.split_val:
        return path_length(x, node.left, current_height + 1)
    else:
        return path_length(x, node.right, current_height + 1)

class IsolationForestModel:
    def __init__(self, n_estimators=100, max_samples=256, random_state=42):
        self.n_estimators = n_estimators
        self.max_samples = max_samples
        self.random_state = random_state
        self.trees = []
        
    def fit(self, X):
        random.seed(self.random_state)
        n_samples = len(X)
        sample_size = min(self.max_samples, n_samples)
        height_limit = math.ceil(math.log2(max(2, sample_size)))
        
        self.trees = []
        for _ in range(self.n_estimators):
            sample = random.sample(X, sample_size)
            tree = build_itree(sample, 0, height_limit)
            self.trees.append(tree)
            
    def compute_anomaly_scores(self, X):
        n_samples = len(X)
        if n_samples <= 1:
            return [0.5] * n_samples
        c_n = c_factor(n_samples)
        scores = []
        for x in X:
            paths = [path_length(x, tree, 0) for tree in self.trees]
            avg_path = sum(paths) / len(paths)
            score = 2.0 ** (- (avg_path / c_n))
            scores.append(score)
        return scores

def parse_date_helper(d_str):
    if not d_str or str(d_str).upper() == 'NA':
        return None
    for fmt in ('%Y-%m-%d', '%d-%b-%Y', '%d-%b-%y', '%d/%m/%Y', '%Y/%m/%d'):
        try:
            return datetime.strptime(str(d_str).strip(), fmt)
        except ValueError:
            pass
    return None

def run_ml_pipeline(sanct_list, rec_map, comp_map):
    """
    Executes Feature Extraction, Isolation Forest ML Anomaly Detection, 
    Deterministic Rule Engine, and Composite Risk Priority Scoring.
    """
    if not sanct_list:
        return []

    # 1. Enrich Sanctioned records with Recommended and Completed data
    sanct_records = []
    for s in sanct_list:
        code = s.work_id
        s_amt = s.sanctioned_amount
        s_date = parse_date_helper(s.sanct_date)

        r_item = rec_map.get(code)
        r_date = parse_date_helper(r_item.rec_date) if r_item else None
        is_rec_date_observed = r_date is not None
        r_amt = r_item.recommended_amount if r_item else s_amt

        if s_date and r_date:
            delay_days = max(0, (s_date - r_date).days)
            is_imputed = False
        else:
            delay_days = 75.35  # Empirical mean baseline
            is_imputed = True

        c_item = comp_map.get(code)
        is_completed = c_item is not None
        disbursed_amt = c_item.disbursed_amount if is_completed else 0.0

        sanct_records.append({
            'obj': s,
            'sr_no': s.sr_no,
            'work_id': code,
            'title': s.title,
            'category': s.category or 'Normal/Others',
            'ida': s.ida or 'DISTRICT_IDA',
            'district': s.district or 'Ludhiana',
            'mp_name': s.mp_name or 'N/A',
            'constituency': s.constituency or 'N/A',
            'state': s.state or 'N/A',
            'sanct_amount': s_amt,
            'sanct_amount_lakhs': s.sanctioned_amount_lakhs,
            'rec_amount': r_amt,
            'rec_amount_lakhs': round(r_amt / 1e5, 2),
            'delay_days': round(float(delay_days), 1),
            'is_delay_imputed': is_imputed,
            'status': s.status or 'Sanction Issued',
            'is_completed': is_completed,
            'disbursed_amount': disbursed_amt,
            'disbursed_amount_lakhs': round(disbursed_amt / 1e5, 2)
        })

    # 2. Compute statistics for Z-score and Agency Concentration
    category_amounts = {}
    ida_counts = {}
    desc_counts = {}

    for rec in sanct_records:
        cat = rec['category']
        category_amounts.setdefault(cat, []).append(rec['sanct_amount'])
        ida_counts[rec['ida']] = ida_counts.get(rec['ida'], 0) + 1
        desc = rec['title'].lower()
        desc_counts[desc] = desc_counts.get(desc, 0) + 1

    category_stats = {}
    for cat, amts in category_amounts.items():
        mean_val = sum(amts) / len(amts)
        variance = sum((x - mean_val) ** 2 for x in amts) / len(amts)
        std_val = math.sqrt(variance)
        category_stats[cat] = {'mean': mean_val, 'std': std_val if std_val > 0 else 1.0}

    # 3. Construct 6-Feature Vectors
    X = []
    for rec in sanct_records:
        cat = rec['category']
        stats = category_stats.get(cat, {'mean': 0.0, 'std': 1.0})
        zscore = (rec['sanct_amount'] - stats['mean']) / stats['std'] if stats['std'] > 0 else 0.0
        ida_pct = (ida_counts.get(rec['ida'], 1) / len(sanct_records)) * 100.0
        log_amt = math.log(1.0 + max(0.0, rec['sanct_amount']))

        variance_pct = 0.0
        if rec['is_completed'] and rec['sanct_amount'] > 0:
            variance_pct = abs(1.0 - (rec['disbursed_amount'] / rec['sanct_amount'])) * 100.0

        row_feat = [
            float(rec['delay_days']),
            float(log_amt),
            float(zscore),
            float(ida_pct),
            1.0 if rec['is_completed'] else 0.0,
            float(variance_pct)
        ]
        rec['features'] = {
            'sanction_delay_days': rec['delay_days'],
            'is_recommendation_date_imputed': rec['is_delay_imputed'],
            'log_sanction_amount': round(log_amt, 4),
            'category_cost_zscore': round(zscore, 4),
            'ida_concentration_pct': round(ida_pct, 2),
            'is_completed_flag': 1 if rec['is_completed'] else 0,
            'disbursed_variance_pct': round(variance_pct, 2)
        }
        X.append(row_feat)

    # 4. Train Isolation Forest Model & Compute Scores
    iso_model = IsolationForestModel(n_estimators=100, max_samples=256, random_state=42)
    iso_model.fit(X)
    raw_if_scores = iso_model.compute_anomaly_scores(X)

    # Min-Max Normalization to [0, 100]
    min_if = min(raw_if_scores)
    max_if = max(raw_if_scores)

    s_ml_scores = []
    for score in raw_if_scores:
        if max_if != min_if:
            s_ml = ((score - min_if) / (max_if - min_if)) * 100.0
        else:
            s_ml = 50.0
        s_ml_scores.append(round(s_ml, 1))

    # 5. Deterministic Rule Engine & Hybrid Risk Priority Scoring
    scored_results = []
    for idx, rec in enumerate(sanct_records):
        s_ml = s_ml_scores[idx]
        is_ml_anomaly = (s_ml >= 70.0)

        rule_pts = 0
        rule_signals = []

        # Rule 1: Administrative Delay
        if rec['delay_days'] > 180:
            rule_pts += 40
            tag = f"Administrative Delay: {rec['delay_days']} Days (>180d threshold)"
            if rec['is_delay_imputed']:
                tag += " [Imputed Mean Fallback]"
            rule_signals.append(tag)
        elif rec['delay_days'] > 120:
            rule_pts += 25
            tag = f"Administrative Delay: {rec['delay_days']} Days (>120d threshold)"
            if rec['is_delay_imputed']:
                tag += " [Imputed Mean Fallback]"
            rule_signals.append(tag)
        elif rec['delay_days'] > 90:
            rule_pts += 10
            tag = f"Administrative Delay: {rec['delay_days']} Days (>90d threshold)"
            if rec['is_delay_imputed']:
                tag += " [Imputed Mean Fallback]"
            rule_signals.append(tag)

        # Rule 2: Category Cost Outlier
        z_val = rec['features']['category_cost_zscore']
        if z_val > 2.5:
            rule_pts += 35
            rule_signals.append(f"Category Cost Outlier: Z-Score +{z_val:.2f} in '{rec['category']}'")
        elif z_val > 1.5:
            rule_pts += 20
            rule_signals.append(f"Category Cost Deviation: Z-Score +{z_val:.2f} in '{rec['category']}'")

        # Rule 3: High Value Allocation
        if rec['sanct_amount'] >= 15000000:
            rule_pts += 25
            rule_signals.append(f"High-Value Project Allocation: ₹{rec['sanct_amount']/1e5:.1f} Lakhs")
        elif rec['sanct_amount'] >= 5000000:
            rule_pts += 15
            rule_signals.append(f"Significant Project Allocation: ₹{rec['sanct_amount']/1e5:.1f} Lakhs")

        # Rule 4: Title Cluster Duplicate Match
        desc_key = rec['title'].lower()
        if desc_counts.get(desc_key, 0) > 1:
            rule_pts += 15
            rule_signals.append(f"Duplicate Work Title Cluster ({desc_counts[desc_key]} matching records)")

        # Rule 5: Disbursed Variance
        var_val = rec['features']['disbursed_variance_pct']
        if var_val > 20.0:
            rule_pts += 20
            rule_signals.append(f"Disbursed Amount Variance: {var_val:.1f}% deviation from sanction")

        s_rule = min(100.0, float(rule_pts))

        # Hybrid Risk Priority Score S_risk = 0.60 * S_ml + 0.40 * S_rule
        s_risk = (0.60 * s_ml) + (0.40 * s_rule)
        s_risk = round(min(100.0, max(0.0, s_risk)), 1)

        if s_risk >= 75.0:
            band = "CRITICAL RISK PRIORITY"
        elif s_risk >= 60.0:
            band = "HIGH RISK PRIORITY"
        elif s_risk >= 40.0:
            band = "MEDIUM RISK PRIORITY"
        else:
            band = "NORMAL RISK"

        explanation = {
            'ml_anomaly_evidence': {
                'is_ml_anomaly': is_ml_anomaly,
                'ml_anomaly_score': s_ml,
                'isolation_forest_raw_score': round(float(raw_if_scores[idx]), 4),
                'anomaly_threshold_rule': "S_ml >= 70.0 (Top 30% Anomaly Intensity Range)"
            },
            'deterministic_rule_evidence': {
                'rule_score': s_rule,
                'triggered_rule_count': len(rule_signals),
                'rule_signals': rule_signals if rule_signals else ["Standard Compliance Line"]
            },
            'composite_risk': {
                'risk_priority_score': s_risk,
                'severity_band': band,
                'weights_applied': {'w_ml': 0.60, 'w_rule': 0.40}
            }
        }

        district_clean = rec['ida'].split('(')[0].capitalize() if '(' in rec['ida'] else rec['district']

        item_scored = {
            'work_id': rec['work_id'],
            'sr_no': rec['sr_no'],
            'title': rec['title'],
            'category': rec['category'],
            'ida': rec['ida'],
            'district': district_clean,
            'mp_name': rec['mp_name'],
            'constituency': rec['constituency'],
            'state': rec['state'],
            'sanctioned_amount_lakhs': rec['sanct_amount_lakhs'],
            'recommended_amount_lakhs': rec['rec_amount_lakhs'],
            'sanction_delay_days': int(rec['delay_days']),
            'is_recommendation_date_imputed': rec['is_delay_imputed'],
            'status': rec['status'],
            'is_completed': rec['is_completed'],
            'disbursed_amount_lakhs': rec['disbursed_amount_lakhs'],
            'features': rec['features'],
            'ml_anomaly_score': s_ml,
            'rule_score': s_rule,
            'risk_priority_score': s_risk,
            'severity_band': band,
            'is_ml_anomaly': is_ml_anomaly,
            'rule_signals': rule_signals if rule_signals else ["Standard Compliance Line"],
            'explanation': explanation
        }
        scored_results.append(item_scored)

    return scored_results
