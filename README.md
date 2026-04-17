# InsurX — AI-Powered Parametric Insurance for India's Gig Delivery Workers

> _"Your earnings, protected. Rain or shine."_

**InsurX** is an AI-enabled parametric insurance platform built exclusively for food delivery partners (Zomato / Swiggy). It protects their weekly income against uncontrollable external disruptions — heavy rain, extreme heat, severe pollution, floods, and curfews. When a disruption is detected, the payout is triggered automatically. No claims. No paperwork. Money in their UPI within the week.

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Why Food Delivery Workers](#2-why-food-delivery-workers)
3. [Our Solution](#3-our-solution)
4. [User Journey & Onboarding](#4-user-journey--onboarding)
5. [Dynamic Premium Model](#5-dynamic-premium-model)
6. [Parametric Triggers](#6-parametric-triggers)
7. [Automated Claim Settlement](#7-automated-claim-settlement)
8. [Mobile App & Dashboards](#8-mobile-app--dashboards)
9. [System Architecture & Tech Stack](#9-system-architecture--tech-stack)
10. [Adversarial Defense & Anti-Spoofing Strategy](#10-adversarial-defense--anti-spoofing-strategy)
11. [Insurance Exclusions & Coverage Boundaries](#11-insurance-exclusions--coverage-boundaries)
12. [How to Run InsurX Locally](#12-how-to-run-insurx-locally)

---

## 1. Problem Statement

India's 15 million+ delivery partners lose **20–30% of monthly income** to events they cannot control — monsoon rain, heatwaves, AQI emergencies, curfews. No protection exists.

| Disruption | Frequency | Avg. Income Lost |
|---|---|---|
| Heavy monsoon rain (Mumbai, Jun–Sep) | 3–5 events/week | ₹200–400/event |
| Extreme heat (Delhi, Apr–Jun) | 15–20 days/month | ₹300–500/day |
| Severe AQI >400 (Delhi-NCR, Nov–Jan) | 20–30 days/year | ₹250–450/day |
| Curfews / Bandhs | Unpredictable | Full day's earnings |

### The Gap

Nothing on the market covers this:

| Existing Product | What It Covers | Why It Fails |
|---|---|---|
| ACKO / Zomato accident cover | Injury on active trip | Worker isn't injured — just has no orders. Pays ₹0. |
| Bajaj / ICICI group health | Hospitalisation | Rain doesn't hospitalise you. |
| Government schemes (PMSBY) | Death / disability | 4-hour rain events don't qualify. |
| Digit / PhonePe sachets | Hospital cash | Wrong risk category entirely. |
| Parametric crop insurance | Rainfall deficit for farmers | Right mechanism, wrong persona. |

**The gap is structural.** Insurance was built for salaried employees with payslips and annual commitments. Gig workers have none of these. InsurX fills this gap — insuring the income a delivery worker loses when the world outside makes it impossible to work.

### Real-World Impact on Workers

<p align="center">
  <img src="assets/customer-pain-points.jpeg" width="700"/>
</p>

**Facing the Growing Challenges of Climate Change:**

Climate change-related risks are on the rise, presenting new challenges that impact livelihoods across various customer segments. Sudden or extreme climate events, such as high temperatures, excessive rainfall, and cold waves, can reduce productivity, lower income, and increase living costs.

Integrating climate insurance into a person's risk protection strategy is essential for building more resilient and sustainable environments. This parametric insurance is designed to provide financial security and peace of mind to individuals who rely on daily earnings and are particularly vulnerable to climate risks.

This will be one of its kind index insurance product for the common man where customer can buy climate risk insurance with complete ease.

---

## 2. Why Food Delivery Workers

1. **Strongest weather-income correlation** — food delivery drops 40–60% during heavy rain. This measurable link is the core requirement for parametric insurance to work.
2. **Highest income volatility** — no fixed salary, no benefits, no sick days. Every disrupted hour is directly lost income.
3. **Largest pool** — ~5M active food delivery partners in India.

**Typical worker:** Ravi, 28, earns ₹3,500–5,500/week, works 50–65 hrs, budget Android with Google Pay UPI. Has never bought insurance. _"When it rains I earn nothing. No one helps."_

---

## 3. Our Solution

Worker pays a small weekly premium (₹29–99). InsurX monitors real-time weather, AQI, and disruption feeds for their zone. If a threshold is breached (e.g., rainfall >30mm/hr for 2+ hours), the system automatically:

1. Validates disruption against weather API data
2. Checks the worker's policy covers this trigger type
3. Runs multi-layer fraud detection
4. Calculates payout: `disrupted_hours × hourly_rate × coverage%`
5. Queues payout for the weekly Monday batch

The worker does nothing. No form, no upload, no call. On Monday, all approved payouts are batched and sent to UPI.

**Coverage:** Income loss only. No health, life, accident, or vehicle.

### Key Features

<p align="center">
  <img src="assets/features-overview.jpeg" width="700"/>
</p>

### Key Benefits

<p align="center">
  <img src="assets/benefits-overview.jpeg" width="700"/>
</p>

---

## 4. User Journey & Onboarding

The full onboarding flow completes in under 2 minutes. No paperwork. No branch visit. Designed for a delivery partner between orders on a budget Android device.

### 8-Step Onboarding Flow

| Step | Screen | What Happens |
|---|---|---|
| 1 | Phone Entry | Worker enters mobile number — OTP sent via Firebase Auth |
| 2 | OTP Verify | 6-digit OTP confirms identity — Firebase custom token issued |
| 3 | Platform Selection | Worker selects delivery platform (Zomato / Swiggy / Zepto / Other) |
| 4 | Zone & Earnings | City, pincode, and weekly earnings entered — risk zone assigned |
| 5 | KYC — Aadhaar | Aadhaar number + selfie captured — identity verified |
| 6 | KYC — UPI ID | UPI ID collected — this is where payouts land, no bank form needed |
| 7 | Plan Selection | Three tiers shown with personalised premium quote (risk-adjusted per zone) |
| 8 | Payment | Razorpay checkout — ₹29/59/99 weekly — policy activates immediately on success |

<p align="center">
  <img src="assets/self-onboarding.jpeg" width="700"/>
</p>

#### Step 1–2: Phone + OTP

<p align="center">
  <img src="https://github.com/user-attachments/assets/573d3382-5ff3-4ff6-b74c-8b4ebd36b12f" width="300"/>
</p>



#### Step 3–4: Platform & Zone
<p align="center">
  <img src="https://github.com/user-attachments/assets/fbb6df56-57e6-4bc2-9227-baa57c9741f0" width="300"/>
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/12cc25ca-439a-4018-a712-aaf7219775de" width="300"/>
</p>



#### Step 5–6: KYC

KYC captures Aadhaar + selfie for identity, and UPI ID for instant payouts. No bank account form. No branch visit. The UPI ID is stored as a Razorpay Fund Account — payout goes directly to the worker's phone wallet.

<p align="center">
  <img src="https://github.com/user-attachments/assets/4b504691-36f0-42da-b8e5-0d53c003787b" width="300"/>
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/707cef5d-6e85-409d-895c-c9f519510eee" width="300"/>
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/288976d5-2fb3-4fac-9176-7488baea7609" width="300"/>
</p>

#### Step 7–8: Plan Selection & Payment

<p align="center">
  <img src="https://github.com/user-attachments/assets/85635b6b-9be3-4b37-9f08-6bb39dba9150" width="300"/>
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/2dcbea69-e05b-4bc0-9a36-39f839f1ce6f" width="300"/>
</p>

---

## 5. Dynamic Premium Model

This dynamic pricing premium model is designed for parametric insurance targeting gig workers (Swiggy, Zomato, Zepto, etc.). It focuses on climate, environmental, and infrastructure-based triggers using AI-based risk assessment to calculate weekly premiums and automate payouts.

<p align="center">
  <img src="assets/user_journey_flow.png" width="500"/>
</p>

### "What Would InsurX Have Paid You?" — Personal Backtesting

Before signing up, any worker can run a backtest: replay the last N weeks of real trigger events in their pincode against any plan to see their simulated ROI.

<img width="1083" height="1007" alt="image" src="https://github.com/user-attachments/assets/9a5131bc-858e-4d08-858c-7f79873c1996" />


No other insurer can offer this. Parametric insurance has objective, timestamped trigger data — so the past is computable. Traditional insurance is opinion; InsurX is arithmetic.

**Parametric Insurance**

Parametric insurance provides payouts based on predefined triggers such as temperature, rainfall, or environmental conditions instead of actual loss verification. When a condition is met, payouts are automatically processed.

**Geospatial Mapping (H3 Micro-Zones)**

Historical weather and environmental data are mapped into micro-zones using H3 hexagons. Each zone contains:
- IMD weather data (rainfall, temperature)
- Historical flood/waterlogging data
- Delivery activity patterns
- Past trigger events

This enables precise, location-based pricing instead of city-level averages.

**Infrastructure Fragility Index (IFI)**

A factor called IFI is introduced to capture real ground conditions:
- Drainage quality
- Road conditions
- Flood history
- Waterlogging frequency

IFI Score ranges from 0 (strong infrastructure) to 1 (highly fragile).

Example: Two areas with the same rainfall:
- Zone A: Good drainage → Medium risk
- Zone B: Poor drainage → High risk

Thus, pricing depends on actual impact, not just weather.

**Weekly Pricing Model**

The premium is calculated weekly:

```
Weekly Premium = 50 + (Risk Score × 20)

Updated Risk Score:
Risk Score = (Temp Risk × 0.3) + (Rain Risk × 0.3) + (Activity Risk × 0.2) + (IFI × 0.2)
```

Example:

```
If Rain Risk = 0.7, Temp Risk = 0.5, Activity Risk = 0.6, IFI = 0.8

Risk Score = (0.5×0.3) + (0.7×0.3) + (0.6×0.2) + (0.8×0.2)
           = 0.15 + 0.21 + 0.12 + 0.16
           = 0.64

Weekly Premium = 50 + (0.64 × 20) = ₹62.8 ≈ ₹63
```

This ensures pricing increases before high-risk weeks.

**Trigger and Payout System**

Payouts are triggered automatically when:
- Temperature > threshold
- Rainfall > threshold

Multiple payouts are summed and capped weekly.

Example:

```
Heatwave  = ₹500
Rain      = ₹300
Pollution = ₹400
Total     = ₹1,200
Cap       = ₹1,000
Final     = ₹1,000
```

**Shift Density Multiplier**

Same rain at different times causes different income loss. A Shift Density Multiplier is introduced based on demand timing.

| Demand Period | Multiplier |
|---|---|
| Low demand | 0.5 – 0.8 |
| Normal | 1.0 |
| Peak | 1.5 – 2.0 |

```
Final Payout = Base Payout × Shift Multiplier
```

Example:

```
Rain = ₹300 (base payout)

Case 1: Afternoon (low demand)
Multiplier = 0.6
Final payout = 300 × 0.6 = ₹180

Case 2: Dinner time (peak demand)
Multiplier = 1.8
Final payout = 300 × 1.8 = ₹540

If multiple triggers occur:
Heatwave            = ₹500
Rain (peak-adjusted) = ₹540
Pollution            = ₹400
Total                = ₹1,440
Cap                  = ₹1,000
Final payout         = ₹1,000
```

**Key Insight:**

The model evaluates both environmental conditions and infrastructure failure, while also adjusting payouts based on real earning impact using time-based demand.

<p align="center">
  <img src="assets/dynamic_quoting_timeline.png" width="500"/>
</p>

<p align="center">
  <img src="assets/active_coverage_dashboard.png" width="500"/>
</p>

<p align="center">
  <img src="assets/automated_climate_claim.png" width="500"/>
</p>

<p align="center">
  <img src="assets/instant_financial_relief.png" width="500"/>
</p>

---

## 6. Parametric Triggers

This system uses a parametric model to automatically determine weekly payout eligibility based on external conditions affecting rider earning opportunity.

### Claim Parameters

- **Weather:** Rainfall / severe weather exceeds threshold in assigned zone
- **Demand Drop:** Order allocation falls below baseline (e.g., < 60%)
- **Ops Downtime:** Dark store / dispatch unavailable beyond threshold

### Infrastructure Fragility Index (IFI)

A hyperlocal risk score (via spatial grids) capturing waterlogging and infrastructure weakness. Used for better pricing and trigger severity adjustment.

### Thresholds (Demo)

- Rainfall > 45 mm/day or heavy rain in peak hours
- Orders < 60% of 4-week average
- Outage > 2 hours

### Data Sources

Weather APIs, demand data, store status, rider activity, spatial data.

### Monitoring

Continuous evaluation → score aggregation → weekly auto payout.

### Hysteresis

Triggers require sustained conditions; short spikes are ignored. The cron job tracks a per-zone pending counter — the trigger only fires after `min_duration_hrs` consecutive hourly observations above threshold.


### Validation

Zone match, active participation, no anomaly.

---

## 7. Automated Claim Settlement

### How It Works — Zero Touch for the Worker

When a parametric trigger fires, InsurX automatically initiates the full settlement pipeline. The worker never files a claim.

```
Trigger detected (weather threshold breached)
        │
        ▼
Find all active policies in the affected zone
        │
        ▼
For each policy → run fraud checks (Layer 1 rules)
        │
        ├── PASS → calculate payout → queue for Monday batch
        └── FAIL → flag for review → hold claim
        │
        ▼
Monday 6AM cron: aggregate all approved claims per worker
        │
        ▼
Single UPI transfer per worker via Razorpay Payout API (test mode)
        │
        ▼
Push notification: "Your InsurX payout of ₹X is on its way"
```

### Payout Formula

```
payout = disrupted_hours × (weekly_earnings / working_hours_per_week) × coverage%
```

| Plan | Coverage % | Max Weekly Payout |
|---|---|---|
| Basic (₹29/week) | 50% | ₹400 |
| Shield (₹59/week) | 70% | ₹800 |
| Shield+ (₹99/week) | 90% | ₹1,500 |

### Razorpay Payout Integration (Test Mode)

Uses Razorpay Payouts API with test credentials — no real money moves, but the full API flow is live.

| Step | Detail |
|---|---|
| Auth | Razorpay test API key + secret via `Authorization: Basic` header |
| Create Contact | `POST /v1/contacts` — register worker's UPI ID as a Razorpay contact |
| Create Fund Account | `POST /v1/fund_accounts` — link UPI ID to the contact |
| Initiate Payout | `POST /v1/payouts` — `{ fund_account_id, amount, currency: "INR", mode: "UPI", purpose: "payout" }` |
| Track Status | `GET /v1/payouts/:id` — returns `processing / processed / failed` |

Real Razorpay transaction IDs are stored in Firestore against each claim. Failed payouts are automatically retried in the next Monday batch.

### Weekly Batch Schedule

- **node-cron** fires every Monday at 6:00 AM
- Aggregates all `status: approved` claims from the past 7 days per worker
- One consolidated transfer per worker (not per event)
- Matches Zomato/Swiggy's own weekly payout cycle — worker receives everything together

### Anti-Gaming Rule

Policy creation is blocked if a known disruption is already active in the requested zone. Prevents the "register during rain" exploit.


### Duplicate Claim Guard

One claim per worker per trigger event. A second attempt returns a 409 with the existing claim ID.

### User Activity Validation

Before a claim is created, the system checks GPS waypoints from the past 2 hours. Workers who were offline during the disruption are not eligible (README §11, step 2).


### War / Pandemic Exclusion Enforcement

Admin can declare a national or zone-scoped exclusion. All claims immediately return 403 until the exclusion is lifted.

### Weekly Payout Batch

Monday 6AM cron aggregates all approved claims per worker and initiates a single UPI transfer.


---

## 8. Mobile App & Dashboards

### Worker App (React Native — Expo)

Built for a budget Android phone with a slow data connection. Designed to be usable in 3 taps.

| Screen | What It Shows |
|---|---|
| Onboarding | Phone OTP → zone selection → plan choice → Razorpay payment. Under 2 minutes. |
| Home / Dashboard | Active policy status, current zone weather, live disruption alerts |
| Earnings Protected | Running total of all payouts received from InsurX — the primary retention metric |
| Claims History | Auto-generated list of all triggered claims: event type, amount, status, payout date |
| Policy Management | Current tier, renewal date, option to upgrade/downgrade/cancel |

### App Screens


#### Worker Home & Earnings

<p align="center">
  <img src="https://github.com/user-attachments/assets/d7d73051-d267-4b9a-9fc1-0b698601861c" width="300"/>
</p>


**Key UX principle:** Worker never initiates anything. App is a read-only window into what InsurX is doing for them. The only actions are onboarding and plan changes.

**"Earnings Protected" Counter** — turns insurance from a cost into a visible, growing number. Retention for low-income users depends on making value tangible, not abstract.

#### Claims
<p align="center">
  <img src="https://github.com/user-attachments/assets/24b7bbf2-e2f9-4160-8079-23b9264b7101" width="300"/>
</p>



| Panel | Metric |
|---|---|
| Zone Risk Heatmap | Chart showing active triggers and claim counts by pincode (react-native-chart-kit bar/map view) |
| Loss Ratio Monitor | Claims paid / premiums collected per zone, per week |
| Fraud Queue | Flagged claims awaiting manual review with confidence scores |
| Policy Overview | Active policies by city, tier, and enrollment trend |
| Predictive Risk Panel | Next 5 days weather forecast → estimated claim volume and payout liability |
| Revenue vs. Payout | Weekly trend line of premium income vs. total payouts |

**Predictive Risk Panel logic:** Pulls OWM 5-day forecast for each active zone → checks against trigger thresholds → estimates how many active policies will be affected → projects payout liability for the week ahead. Gives ops team time to manage reserve ratios before a storm hits.

---

## 9. System Architecture & Tech Stack

### Architecture Diagram

### How It Works

A step-by-step flow of how the system processes user input, calculates risk, and handles automated payouts.

### Workflow

| Step | Description |
|---|---|
| 1. User Input | User enters location, duration, and desired payout amount. |
| 2. Geocoding | Location is converted into latitude and longitude using Geocoding API. |
| 3. Weather Data Fetch | Weather Forecast API retrieves data for the selected duration. |
| 4. Data Fusion | Enterprise Pricing Engine combines ERA5 (macro-level) and IMD (hyper-local) data. |
| 5. Geospatial Mapping | H3 mapping assigns the user to a precise micro-zone. |
| 6. Risk Prediction | ML model (e.g., XGBoost) predicts probability of trigger for the selected period. |
| 7. Risk Scoring | A risk probability score is generated for the location and duration. |
| 8. Premium Calculation | Premium is dynamically calculated based on predicted risk level. |
| 9. Policy Creation | Insurance policy is generated and stored in the database. |
| 10. Monitoring | System continuously monitors weather data (automated process). |
| 11. Trigger Detection | Conditions like temperature ≥ 42°C or heavy rainfall are evaluated. |
| 12. Payout Calculation | If trigger conditions are met, payout is calculated automatically. |
| 13. Payment Processing | Payment is processed via API (mock or real integration). |
| 14. Dashboard Update | Dashboard updates earnings, trigger events, and premium details. |

<p align="center">
  <img src="assets/architecture-diagram.png" width="600"/>
</p>

### Key Insight

This architecture enables a fully automated parametric insurance system, where pricing, monitoring, and payouts are handled without manual intervention, ensuring speed, transparency, and scalability.

### Tech Stack

| Layer | Technology |
|---|---|
| Mobile App | React Native (Expo), react-native-chart-kit |
| Backend | Node.js, Express.js |
| Location API | Google Maps Geocoding API |
| Weather API | OpenWeatherMap API |
| Database & Auth | Firebase Authentication, Firebase Firestore |
| Background Jobs | node-cron |
| Payment | Razorpay Payouts API (test mode) |
| ML Engine | Python FastAPI |
| Datasets | ERA5 (ECMWF), IMD historical weather |

<p align="center">
  <img src="assets/tech-stack.jpeg" width="600"/>
</p>

<p align="center">
  <img src="assets/api-integration.jpeg" width="600"/>
</p>

---

## 10. Adversarial Defense & Anti-Spoofing Strategy

### Proposed Architecture

**Multi-Model Architecture**

A multi-model approach is used because no single model can capture all types of fraud behavior.

- Sequence models detect movement anomalies
- Tabular models analyze structured patterns
- Graph models identify coordinated group attacks

Together, they provide higher accuracy and robustness against sophisticated spoofing strategies.

### 1. LSTM Sequence Model (Movement Behaviour Analysis)

**Purpose:** Detect abnormal movement patterns using time-series GPS data.

### Workflow

| Step | Description |
|---|---|
| Step 1: Data Collection | Collect latitude, longitude, timestamp using Google Maps Geocoding API. Store last N points (e.g., 10 records). |
| Step 2: Sequence Formation | Arrange data as a time-ordered sequence (T1 → T2 → … → T10) representing movement over time. |
| Step 3: Feature Extraction | Convert raw data into features: distance, speed, acceleration, direction change, time difference. |
| Step 4: LSTM Processing | Feed sequence into LSTM model to learn movement behavior patterns. |
| Step 5: Fraud Prediction | Output probability (0–1) to classify users as genuine or spoofed. |

### Detection Logic

| Behavior Type | Interpretation |
|---|---|
| Smooth movement | Likely genuine user |
| Sudden jumps | Suspicious activity |
| Static location anomalies | Possible spoofing |

### Key Insight

The LSTM model focuses on temporal movement consistency, making it effective at detecting unrealistic GPS behavior that cannot be identified through static rules.

<p align="center">
  <img src="assets/lstm-sequence-model.png" width="600"/>
</p>

### 2. Tabular Fraud Detection ML Model (XGBoost / LightGBM)

**Purpose:** Detect fraud using structured behavioral and location-based features.

### Workflow

| Step | Description |
|---|---|
| Step 1: Data Collection | Collect processed location data from Google Maps Geocoding API along with historical and current user activity. |
| Step 2: Feature Engineering | Generate structured features such as speed, distance, location stability, cluster density (nearby users), and time-based patterns. |
| Step 3: Feature Vector Creation | Combine all engineered features into a single tabular row, where each row represents one user/session. |
| Step 4: Model Processing | Input feature vectors into ML models like XGBoost or LightGBM to learn patterns of normal and fraudulent behavior. |
| Step 5: Fraud Prediction | Output a probability score (0–1) to classify users as genuine or suspicious. |

### Detection Logic

| Feature Pattern | Interpretation |
|---|---|
| Stable movement + consistent patterns | Likely genuine user |
| Irregular speed or sudden spikes | Suspicious activity |
| High cluster density anomalies | Possible coordinated fraud |
| Unusual time patterns | Potential spoofing behavior |

### Key Insight

Tabular models excel at analyzing structured behavioral patterns, making them highly effective for detecting subtle anomalies that are not visible through sequential movement analysis alone.

<p align="center">
  <img src="assets/Fraud-prediction.png" width="500"/>
</p>

### 3. Graph-Based Fraud Detection Model (GNN)

**Purpose:** Detect coordinated fraud attacks by analyzing relationships between multiple users.

### Workflow

| Step | Description |
|---|---|
| Step 1: Data Collection | Collect user location and activity data from Google Maps Geocoding API, including multiple users simultaneously. |
| Step 2: Graph Construction | Represent system as a graph where nodes are users and edges represent connections (same location, same time, similar behavior). |
| Step 3: Relationship Feature Extraction | Analyze connections such as shared coordinates, synchronized activity, and repeated patterns across users. |
| Step 4: Graph Model Processing | Input graph into a Graph Neural Network (GNN) to learn group behavior, fraud clusters, and coordinated attacks. |
| Step 5: Fraud Detection Output | Identify suspicious clusters and classify users as genuine or part of coordinated spoofing groups. |

### Detection Logic

| Pattern | Interpretation |
|---|---|
| Independent user behavior | Likely genuine users |
| Multiple users at same location/time | Suspicious clustering |
| Repeated synchronized patterns | Coordinated spoofing |
| Dense interconnected clusters | Fraud ring detected |

### Key Insight

Graph models are uniquely powerful for detecting coordinated fraud, as they analyze relationships between users rather than evaluating each user independently.

<p align="center">
  <img src="assets/Fraud-detection.png" width="600"/>
</p>

### Risk Assessment Score

**Final Score Calculation:**

<p align="center">
  <b>Final Score = (0.4 × Sequence Model) + (0.4 × Tabular Model) + (0.2 × Graph Model)</b>
</p>

### Interpretation

| Score Range | Risk Level |
|---|---|
| 0.0 – 0.3 | Low Risk (Genuine User) |
| 0.3 – 0.7 | Medium Risk (Suspicious) |
| 0.7 – 1.0 | High Risk (Fraud Likely) |

**Admin fraud queue — high-risk claim flagged for review:**


### Key Insight

This weighted scoring system combines multiple model perspectives to produce a robust and balanced fraud risk assessment, reducing false positives while effectively detecting sophisticated spoofing attacks.

### Disruption Dividend

Workers who keep working through a disruption (GPS-verified movement, no claim filed) automatically receive a 10% premium credit when the trigger resolves.

---

### 4. Adversarial Attack Vectors & Countermeasures

The fraud detection pipeline is only as strong as its resistance to deliberate evasion. InsurX anticipates the following attack strategies and defends against each at the system level.

---

#### Attack 1 — GPS Spoofing (Fake Location Apps)

**What the attacker does:** Uses a mock location app to place themselves inside a disrupted zone while physically located elsewhere.

**Why naive detection fails:** A single GPS coordinate looks legitimate. Standard geofencing cannot distinguish a real device in the zone from a spoofed one.

**InsurX countermeasures:**

| Defense Layer | Mechanism |
|---|---|
| Movement sequence analysis | LSTM detects teleportation — position jumps that exceed physically possible speed (e.g., 0 km/h for 20 min → then instantly in a new neighbourhood) |
| Acceleration consistency | Real movement produces gradual speed changes. Fake GPS produces step-function transitions that LSTM flags as sequence anomalies |
| Zone entry pattern | Genuine workers in a disruption zone show erratic, low-speed movement. Fake GPS often produces stationary or perfectly linear paths |
| Historical baseline | Each worker's movement baseline (typical routes, delivery zones, shift hours) is stored. Deviations beyond 3σ from baseline trigger additional review |

---

#### Attack 2 — Trigger Timing Games (Pre-Storm Policy Purchase)

**What the attacker does:** Monitors weather forecasts, waits until a trigger event is highly probable, then buys a policy minutes before it fires.

**Why this is dangerous:** Premium is paid once. Payout fires within hours.

**InsurX countermeasures:**

| Defense Layer | Mechanism |
|---|---|
| Policy creation blocked during active disruption | If `zone.activeDisruption === true`, the `/api/policies` endpoint returns 403. Cannot purchase during or after trigger fires |
| Minimum policy age | Policies must be at least 24 hours old before they are eligible for a first claim payout (configurable per zone) |
| Risk score at policy creation | Premium is calculated at enrollment using live weather data. If a zone already shows elevated conditions, the premium spikes — making opportunistic enrollment expensive |

---

#### Attack 3 — Collusion Rings (Coordinated Group Claims)

**What the attacker does:** A group of workers (sometimes organized, sometimes incentivized) all file claims simultaneously for the same trigger event, cross-referencing each other's GPS to appear consistent.

**Why this is dangerous:** Individual claim scores look normal. The pattern only appears at the network level.

**InsurX countermeasures:**

| Defense Layer | Mechanism |
|---|---|
| GNN edge analysis | Workers who share GPS coordinates, claim at the same time, or have billing/device fingerprint overlap are connected as graph edges. Dense subgraphs above a density threshold are flagged |
| Cluster density feature | XGBoost includes a `cluster_density` feature: number of claims filed from the same pincode within a 2-hour window. Sudden spikes in zone-level claim velocity trigger automatic queue escalation |
| Temporal clustering | Ring attacks tend to cluster within minutes. Claims from the same zone within a short window are de-prioritized for auto-approval and routed to the fraud queue |

---

#### Attack 4 — Feature Adversarial Attack (Gaming the Model)

**What the attacker does:** A sophisticated attacker learns (through trial and error or by reverse-engineering the scoring logic) which input patterns produce low fraud scores, and deliberately crafts their GPS history and claim data to fall below the threshold.

**Why this is dangerous:** Static ML models with fixed decision boundaries are vulnerable to iterative probing.

**InsurX countermeasures:**

| Defense Layer | Mechanism |
|---|---|
| Ensemble disagreement escalation | If LSTM and GNN disagree significantly (e.g., LSTM: 0.1, GNN: 0.8), the claim is auto-escalated regardless of the weighted final score |
| Monthly adversarial retraining | All rejected claims (human-reviewed and confirmed fraud) are added to the training set. Models are retrained monthly with the latest fraud patterns |
| Feature obfuscation | The exact feature weights and decision thresholds are not exposed via any API. The `/predict/fraud` endpoint returns a score and recommendation — not the feature contribution breakdown |
| Score drift monitoring | If a worker's fraud scores systematically drop over successive claims (suggesting iterative optimization), this trend itself is a feature in the next evaluation |

---

#### Attack 5 — Duplicate Claims Across Policies

**What the attacker does:** Registers under multiple phone numbers or identities to hold multiple active policies, then claims on all of them for the same trigger event.

**InsurX countermeasures:**

| Defense Layer | Mechanism |
|---|---|
| Phone number binding | Each policy is bound to a verified Firebase Auth UID → phone number pair. One phone number, one active policy |
| Duplicate claim guard | Before creating any claim, the system queries for existing claims with the same `workerId` + `triggerId` combination. Returns 409 Conflict if found |
| Device fingerprint (future) | Planned: device ID binding at registration to prevent same device registering multiple UIDs |

---

### Summary: Defense-in-Depth

InsurX does not rely on any single fraud signal. The defense architecture is layered:

```
Layer 1 — Rules (instant, deterministic)
  ├─ No policy during active disruption
  ├─ No duplicate claims per trigger
  └─ Minimum policy age before first claim

Layer 2 — ML (probabilistic, adaptive)
  ├─ LSTM: movement sequence anomaly
  ├─ XGBoost: 14-feature tabular scoring
  └─ GNN: collusion ring detection

Layer 3 — Human review (edge cases)
  └─ Claims above 70% fraud score → admin queue

Layer 4 — System learning (compounding)
  └─ Rejected claims retrain models monthly
```

An attacker who beats one layer faces three more. An attacker who learns to beat all four is generating training data that makes the next version harder to beat.

---

## 11. Insurance Exclusions & Coverage Boundaries

InsurX operates on a fully automated, trigger-based system. Payouts are issued only when predefined external triggers are met and all eligibility conditions are satisfied. Because decisions are driven entirely by data and predefined rules, exclusions must be clearly defined to eliminate ambiguity and prevent misuse.

---

### Core Principle

InsurX covers income loss caused strictly by verified external disruptions. Any loss resulting from personal choice, behavioral factors, system abuse, or non-qualifying conditions is excluded.

---

### Exclusion Categories

#### 1. User Activity & Participation

Payouts are only issued to workers who are actively engaged in delivery operations during the disruption window.

| Condition | Payout Eligible? |
|---|---|
| Logged in and active during disruption | Yes |
| Offline during disruption period | No |
| Intentionally rejecting or ignoring orders | No |
| Not logged into the delivery platform | No |

---

#### 2. Location Manipulation & GPS Spoofing

InsurX uses multi-layer fraud detection (LSTM, XGBoost, GNN) to identify abnormal location behavior.

| Detected Behavior | Payout Eligible? |
|---|---|
| Normal, consistent movement patterns | Yes |
| GPS spoofing detected | No |
| Unrealistic movement patterns | No |
| Sudden or abnormal zone switching | No |

---

#### 3. Late Enrollment / Opportunistic Purchase

Policies must be purchased before a disruption begins.

| Enrollment Timing | Payout Eligible? |
|---|---|
| Policy active before event starts | Yes |
| Policy activated after event started | No |
| Enrolled during an ongoing disruption | No |

---

#### 4. Parametric Threshold Not Met

Payouts follow strictly predefined parametric thresholds. Partial or near-threshold conditions do not qualify.

| Parameter | Threshold | Recorded Value | Payout Eligible? |
|---|---|---|---|
| Rainfall | 30mm | 31mm | Yes |
| Rainfall | 30mm | 29mm | No |
| AQI | 200 | 210 | Yes |
| AQI | 200 | 195 | No |

All trigger conditions must be fully met — there are no partial payouts.

---

#### 5. Demand Drop Without External Cause

InsurX covers only disruptions caused by external, measurable conditions. Internal or market-driven earning drops are not covered.

| Cause of Reduced Earnings | Payout Eligible? |
|---|---|
| Verified weather or environmental disruption | Yes |
| Low customer demand | No |
| Market competition | No |
| Seasonal or normal business fluctuations | No |

---

#### 6. Pandemic & War / Civil Unrest

InsurX does not cover income loss resulting from pandemics, wars, armed conflict, or government-declared states of emergency including curfews and lockdowns.

This is a firm exclusion, not a conditional one. The reason is structural: parametric insurance is built on precise, measurable triggers — a rainfall threshold, an AQI reading, a temperature breach. Pandemics and conflicts do not produce clean trigger points. There is no single data signal that reliably marks their start, their severity, or their end. Determining coverage would require manual judgment, which contradicts the automated nature of the system.

There is also a systemic risk problem. Unlike isolated weather events, pandemics and wars affect entire regions simultaneously. Every worker in an affected area would file a claim at the same time, which no parametric fund structured for localized disruptions can absorb without collapse.

For these reasons, the following are excluded without exception:

| Event Type | Payout Eligible? |
|---|---|
| Government-declared pandemic or health emergency | No |
| National or city-wide lockdown | No |
| Curfew or Section 144 order | No |
| War, armed conflict, or civil unrest | No |
| Platform suspension due to any of the above | No |

This exclusion is standard practice across insurance products globally and is not unique to InsurX. Workers operating during periods of large-scale disruption are advised to refer to government relief programs or platform-level support schemes that may be active during such events.

---

#### 7. Platform & Technical Failures

Losses caused by delivery platform or infrastructure outages are outside the scope of InsurX coverage.

| Failure Type | Payout Eligible? |
|---|---|
| Delivery platform downtime (Zomato, Swiggy) | No |
| Payment gateway failures | No |
| Server or API outages | No |

---

#### 8. Policy Violations & Identity Issues

System integrity requires strict identity and usage enforcement.

| Violation Type | Payout Eligible? |
|---|---|
| Verified single identity, no violations | Yes |
| Fake or unverifiable identity | No |
| Multiple accounts detected | No |
| Referral or system abuse detected | No |

---

#### 9. Policy Status & Validity

Coverage is only valid for active, fully paid policies.

| Policy Status | Payout Eligible? |
|---|---|
| Active and payment confirmed | Yes |
| Expired policy | No |
| Payment not completed | No |
| Policy marked inactive | No |

---

#### 10. Duplicate or Overlapping Claims

Each disruption event can only be claimed once, and overlapping claims are rejected.

| Claim Scenario | Payout Eligible? |
|---|---|
| Single claim per qualifying event | Yes |
| Same event claimed more than once | No |
| Overlapping claims exceeding payout limits | No |

---

### Claim Validation Pipeline

Every claim goes through the following validation steps before a payout is approved:

| Step | Check |
|---|---|
| 1 | Policy is active and payment confirmed |
| 2 | User was logged in and active during disruption |
| 3 | Parametric trigger thresholds are fully met |
| 4 | Location data passes fraud detection |
| 5 | No duplicate or overlapping claims exist |
| 6 | Identity and account are verified |
| 7 | Event falls within supported coverage scope |

All steps must pass. A failure at any step results in claim rejection.

### Transparency & Trust

InsurX uses a fully transparent parametric model. All triggers are predefined and data-driven, all exclusions are documented in advance, and no manual claim filing or approval is involved. This eliminates ambiguity, prevents disputes, and ensures payouts are fast and predictable.

Exclusions are not limitations — they are the structural safeguards that make automated, reliable payouts possible at scale.

---

---

## 12. How to Run InsurX Locally

### Prerequisites

- Node.js 18+
- Python 3.10+
- Expo CLI (`npm install -g expo-cli`)
- Firebase project (Firestore + Auth enabled)
- Android device or emulator (for mobile)

### 1. Backend (Node.js + Express)

```bash
cd backend
cp .env.example .env          # fill in Firebase credentials, API keys
npm install
node server.js
# ✓ InsurX backend running on port 3001
# ✓ Firestore connected
```

**Required `.env` keys:**
```
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
OPENWEATHERMAP_API_KEY=
WAQI_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
JWT_SECRET=
PORT=3001
```

### 2. ML Service (Python FastAPI)

```bash
cd models
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
# ✓ Application startup complete
# ✓ XGBoost · LSTM · GNN models loaded
```

### 3. Mobile App (React Native + Expo)

```bash
cd mobile
cp .env.example .env            # set EXPO_PUBLIC_API_URL=http://localhost:3001
npm install
npx expo start --clear
```

Scan the QR code with **Expo Go** on Android, or press `a` for Android emulator.

### 4. Verify Everything Works

```bash
# Backend health
curl http://localhost:3001/health
# → { "status": "ok", "firebase": "connected" }

# ML service health  
curl http://localhost:8000/health
# → { "status": "ok", "models": ["xgboost", "lstm", "gnn"] }

# Fire a demo trigger (get token from app after login)
curl -X POST http://localhost:3001/api/triggers/demo/fire \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{ "type": "heavy_rainfall" }'
```

---

**Team InsurX** | Guidewire DEVTrails 2026

_Protecting the income of those who keep India moving._
