# PhysicsOps — 3-Minute Cooling System Investigation Demo

## 1. Purpose

Build a small, polished public demo that communicates the core idea of **PhysicsOps** to data-centre engineers in about three minutes.

PhysicsOps is intended to become an AI engineering copilot/platform for physics-based decision support. The initial focus is thermal and flow problems, with data-centre cooling as an early vertical.

This demo is **not** intended to prove that PhysicsOps can diagnose real chillers autonomously. It demonstrates the workflow and product concept using synthetic data:

> **From “something is abnormal” to “what might be causing it, what evidence supports that explanation, and what should an engineer check next?”**

The demo should be credible to an experienced data-centre or chiller engineer and simple enough for a non-specialist to understand.

---

## 2. Why This Demo Exists

Conventional predictive-maintenance systems can identify abnormal behaviour or predict sensor values. The next engineering question is often harder:

> **Why is the equipment behaving differently, and what should the engineer investigate?**

The demo explores a complementary role for PhysicsOps: an engineering investigation layer that uses operational telemetry and transparent engineering analysis to evaluate competing explanations.

The story is deliberately cautious:

- detect a developing abnormal pattern;
- identify several plausible explanations;
- test those explanations against the available evidence;
- communicate uncertainty;
- recommend what should be verified next;
- explore a simple “what-if” deterioration scenario.

The system should **not** claim certainty, automatic intervention, or guaranteed failure prediction.

---

## 3. Target Audience

Primary audience:

- Data-centre facility engineers
- Critical facilities engineers
- Reliability engineers
- Chiller / HVAC engineers
- Data-centre operations teams
- Engineering managers responsible for cooling assets

Secondary audience:

- Industrial AI teams
- Digital-twin providers
- BMS / historian / OT platform providers
- Chiller OEM and service organisations

Assume the visitor is technically competent but does not need an explanation of LLMs or agent technology before seeing the demo.

---

## 4. The Simple User Story

Imagine an engineer receives an alert:

> **Chiller 02 is behaving differently from its normal operating pattern.**

The engineer wants to know:

1. What changed?
2. What could explain the change?
3. Which explanation best fits the evidence?
4. What should I verify?
5. What could happen if the degradation continues?

The demo lets the visitor experience those questions in sequence.

---

## 5. The Three-Minute Demo Journey

### 0:00–0:30 — Something Changed

Landing message:

> **Can PhysicsOps explain why this chiller is behaving differently?**

Scenario:

- Chiller 02
- 7 days of synthetic operating telemetry
- A developing cooling-system degradation is hidden in the data

The visitor clicks:

> **Start Investigation**

The application then presents a small number of clear telemetry charts and shows the important operating changes.

Example observations:

- Condenser approach temperature is increasing.
- Compressor power is increasing.
- Cooling performance is deteriorating.
- Condenser-water flow remains comparatively stable.

The app should communicate:

> **An abnormal operating pattern has been detected.**

---

### 0:30–1:15 — What Could Explain It?

PhysicsOps proposes competing hypotheses rather than jumping immediately to one answer.

Example hypotheses:

1. Condenser heat-transfer degradation
2. Reduced condenser-water flow
3. Sensor / instrumentation problem

The visitor sees that these are **hypotheses**, not confirmed faults.

The UI can show a short investigation sequence such as:

- Reviewing operating conditions…
- Establishing historical baseline…
- Checking temperature relationships…
- Checking flow behaviour…
- Comparing compressor power…
- Testing possible explanations…

---

### 1:15–2:00 — Test the Evidence

For each hypothesis, show transparent evidence from the telemetry.

Example:

**Condenser heat-transfer degradation**

- Condenser approach increasing — supports hypothesis
- Compressor power increasing — supports hypothesis
- Flow relatively stable — supports hypothesis
- Pattern persists over time — supports hypothesis

**Reduced condenser-water flow**

- No sustained corresponding flow reduction — weakens hypothesis

**Sensor / instrumentation problem**

- Multiple independent measurements change together — weakens a simple sensor-fault explanation

Use language such as:

- “consistent with”
- “less consistent with”
- “evidence supports”
- “evidence is insufficient”
- “requires verification”

Do not present a numerical confidence score unless it has a defensible basis.

---

### 2:00–2:30 — Engineering Finding

Produce a concise engineering-style summary.

Example:

> **Observed:** Cooling performance has gradually deteriorated while compressor power has increased.
>
> **Leading hypothesis:** Reduced condenser heat-transfer efficiency.
>
> **Why:** The combination of increasing condenser approach, increased compressor power, and comparatively stable water flow is more consistent with heat-transfer degradation than with a simple flow reduction.
>
> **Confidence:** Medium / requires verification.
>
> **Recommended verification:** Inspect condenser-side heat-transfer performance and verify condenser-water operating conditions.
>
> **Additional measurement:** Compare condenser performance against historical conditions at equivalent load and ambient temperature.

Do not recommend replacing equipment or taking automatic operational action.

---

### 2:30–3:00 — What If?

This is the key differentiating interaction.

Show a prominent action:

> **Run What-If Investigation**

Question:

> **What if the suspected degradation becomes 10% worse?**

The app runs a simulated scenario and displays a small set of projected indicators, for example:

- Compressor power: +X%
- Condenser approach: +X °C
- Cooling efficiency: -X%
- Operating margin: reduced

Clearly label the result as a **simulated scenario**, not a prediction of a specific real chiller.

The conceptual transition is:

> **What is happening? → What might be causing it? → What should we verify? → What if it gets worse?**

This starts to demonstrate the broader PhysicsOps idea of engineering decision support, rather than only anomaly detection.

---

## 6. Synthetic Chiller Scenario

Use synthetic data so the complete demo can run without confidential customer information, external APIs, or a database.

### Suggested telemetry

- Chilled-water supply temperature
- Chilled-water return temperature
- Condenser-water supply temperature
- Condenser-water return temperature
- Condenser-water flow
- Compressor power
- Suction pressure
- Discharge pressure
- Ambient temperature
- Cooling load

Use a realistic operating baseline with:

- normal noise;
- load variation;
- ambient variation;
- correlations between variables;
- gradual rather than abrupt degradation.

### Fault scenario

Inject a **developing condenser heat-transfer degradation** starting part-way through the dataset.

The degradation should produce a plausible combination of effects that can be discovered from the telemetry.

Do **not** expose the injected fault label to the visitor before diagnosis.

Do **not** hard-code the conclusion as a direct mapping from the hidden fault label. The analysis should derive measurable features and evidence from the generated telemetry.

---

## 7. Core Product Principle

The demo must **not** be a generic “AI-generated explanation” application.

The numerical evidence should come from reproducible, inspectable code.

Use deterministic or transparent engineering calculations for the core evidence. AI/LLM components may later be added to:

- orchestrate investigations;
- select the next analysis;
- explain findings in natural language;
- connect multiple engineering tools;
- reason over engineering knowledge.

For the first public version, the core demo should work without an API key.

---

## 8. Relationship to Devin Fusion

The public visitor sees **PhysicsOps**, not Devin.

Devin Fusion is the development mechanism used to build the prototype.

### Astra — Lead

Astra acts as the engineering/product lead:

- maintain the product objective;
- decide what the demo must prove;
- review architecture and engineering assumptions;
- challenge weak or unsupported conclusions;
- decide what should be improved next;
- review the sidekick's output before accepting it.

### SWE-2 High — Sidekick

SWE-2 High handles execution-heavy work:

- create files;
- implement Python modules;
- build Streamlit UI;
- implement charts;
- write tests;
- run tests;
- debug and repair failures;
- refactor;
- prepare deployment files;
- update documentation.

The value of the Fusion workflow is the repeated:

> **Plan → Execute → Test → Review → Fix → Verify**

loop.

This project is also intended to test whether the current Devin promotion actually makes **SWE-2 High free as the Fusion sidekick**. Billing/usage should be checked after the experiment rather than relying only on the UI label.

---

## 9. Recommended Technology for V1

Keep the application simple and free to host.

Suggested stack:

- Python
- Streamlit
- pandas
- numpy
- scipy where useful
- Plotly
- pytest

Avoid unnecessary infrastructure in V1:

- no database;
- no Kubernetes;
- no GPU requirement;
- no paid API requirement;
- no user API keys.

Prepare the repo for free deployment, such as Streamlit Community Cloud.

---

## 10. Suggested Repository Structure

```text
physicsops-kdc-chiller-demo/
├── app.py
├── synthetic_data.py
├── physics_analysis.py
├── hypothesis_engine.py
├── scenario_engine.py
├── report_generator.py
├── requirements.txt
├── README.md
├── architecture.md
├── engineering_demo_report.md
└── tests/
    ├── test_healthy.py
    ├── test_condenser_degradation.py
    ├── test_flow_degradation.py
    └── test_sensor_drift.py
```

---

## 11. UI / Design Direction

The application should look like an **engineering investigation tool**, not a generic analytics dashboard.

Avoid showing too many sensors at once.

Prioritize a clear narrative:

```text
Something changed
       ↓
What could explain it?
       ↓
Test the evidence
       ↓
Engineering finding
       ↓
What if it gets worse?
```

The first screen should require no registration and no prompt writing.

A visitor should be able to click **Start Investigation** and reach the main conclusion within approximately three minutes.

Include a secondary “How it works” section for technically interested visitors.

---

## 12. What the Demo Must Not Claim

The demo must clearly distinguish between demonstration and real-world capability.

Do not claim:

- guaranteed fault diagnosis;
- guaranteed failure prediction;
- autonomous chiller control;
- proven cost savings;
- real KDC equipment performance;
- validated results on customer data.

The demo should state that:

> **This demonstration uses synthetic telemetry. Real equipment diagnosis requires validation against actual operating data and engineering expertise.**

---

## 13. Why This Matters for the KDC / Data-Centre Conversation

The intended customer conversation is not:

> “Would you buy my AI predictive-maintenance software?”

It is:

> **“When your monitoring system says something is abnormal, can an engineering copilot help investigate why and determine what should be checked next?”**

The public demo should therefore be a conversation starter.

The desired reaction from a data-centre engineer is:

> **“Could you try this on one of our actual cooling problems?”**

That creates a path from a free public demo to an engineering assessment or pilot.

---

## 14. Future Evolution

V1 is intentionally small.

The longer-term PhysicsOps architecture can evolve toward:

```text
BMS / Historian / IoT Data
            ↓
       PhysicsOps Agent
            ↓
     Hypothesis Generation
            ↓
   Analysis / Simulation
            ↓
     Evidence & Explanation
            ↓
 Engineering Recommendation
```

A future agentic version can use:

```text
Engineer
   ↓
PhysicsOps Agent
   ↓
Astra — reasoning / investigation planning
   ↓
SWE-2 — execution / tooling / analysis
   ↓
Python / Physics Models / CFD / Other Tools
   ↓
Evidence
   ↓
Engineering decision support
```

OpenFOAM/CFD should be introduced only when it adds meaningful engineering evidence; it is not required for the first demo.

---

## 15. Success Criteria

The demo is successful when:

1. A non-technical viewer understands the story in under 30 seconds.
2. An engineer can inspect the evidence behind the finding.
3. The diagnosis is derived from telemetry rather than a hidden label.
4. Competing hypotheses are considered explicitly.
5. Uncertainty is communicated honestly.
6. The What-If scenario is clearly identified as simulated.
7. The end-to-end journey takes approximately three minutes.
8. The UI is polished enough to share on LinkedIn.
9. The application runs without external API keys.
10. All tests pass.
11. The app can be deployed from a clean environment.
12. The demo creates a natural opening for a discussion about trying the approach on anonymised real cooling data.

---

## 16. Final Product Message

The simplest way to explain the demo is:

> **PhysicsOps is like a virtual junior engineering investigator. When a cooling system starts behaving differently, it examines the data, considers possible causes, checks the evidence, and suggests what an engineer should verify next.**

The differentiation is not merely:

> **“AI detects an anomaly.”**

It is:

> **“AI helps investigate why the anomaly might be happening and what to do next.”**
