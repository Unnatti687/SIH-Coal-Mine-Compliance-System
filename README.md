# AI-Based Smart Governance & Compliance Intelligence System for Coal Mines

**Team TechNova | Smart India Hackathon (SIH) — Internal Round**

An AI-assisted digital compliance concept designed to modernize coal mine inspections through structured violation reporting, evidence management, risk indicators, and compliance monitoring.

## About the Project

Traditional mine inspection workflows can involve paperwork, delayed reporting, fragmented records, and difficulties monitoring corrective actions—especially in remote locations with unreliable internet connectivity.

Our team proposed a digital system to help mine officials record safety violations, attach supporting evidence, monitor resolution progress, and identify cases requiring urgent attention.

The solution was presented to judges during the **Smart India Hackathon internal round**. Our team participated in the internal round but did not advance to the subsequent stage.

## Problem Statement

The proposed solution addresses the following challenges:

- Paper-based inspection records and manual reporting.
- Delays in tracking violations and corrective actions.
- Limited connectivity at remote mining locations.
- Difficulty identifying high-risk mines and contractors.
- Lack of a consistent, evidence-based violation closure process.
- Time-consuming preparation of compliance reports.

## Proposed Solution

The system provides a centralized, mobile-friendly interface for documenting inspections and monitoring compliance.

A mine official can record a violation with its category, photograph, location, and timestamp. The system is designed to track the violation from reporting through corrective action and evidence-based closure.

### Key Features

- **Digital Violation Reporting:** Record mine inspection findings and categorize violations.
- **GPS-Tagged Evidence:** Associate reports with location information and timestamps.
- **Offline-First Reporting Concept:** Save reports locally when connectivity is unavailable and synchronize them when a connection returns.
- **Risk Indicators:** Display Green, Yellow, and Red risk levels to help prioritize attention.
- **Violation Lifecycle Tracking:** Track open violations, corrective actions, supporting evidence, and closure.
- **Evidence-Based Closure:** Require corrective-action details and proof before a violation is marked as resolved.
- **OCR-Based Digitization:** Use Optical Character Recognition to extract text from paper inspection forms.
- **Interactive Map:** Visualize mine locations and reported violations.
- **Dashboard Analytics:** Present compliance information through charts and visual summaries.
- **PDF Compliance Reports:** Generate reports to support documentation and submission workflows.

*Note: These are the proposed system capabilities. Refer to the implemented code and working prototype to determine which features are currently functional.*

## Technology Stack

| Technology | Intended role |
|---|---|
| React | User interface |
| Leaflet.js | Interactive mapping |
| Chart.js | Dashboard charts and analytics |
| Tesseract.js | OCR and text extraction |
| jsPDF | PDF report generation |
| Browser Geolocation API | Location capture, subject to permission and device support |
| Browser Local Storage | Local persistence in the prototype |

The prototype was designed around browser-based storage, with a cloud database and secure synchronization identified as potential production enhancements.

## System Workflow

1. **Report:** A mine official records a violation and attaches relevant evidence.
2. **Track:** The report is added to the violation workflow with an open status.
3. **Assess:** Risk indicators help prioritize violations requiring attention.
4. **Resolve:** The responsible person documents corrective action.
5. **Verify:** Supporting evidence is submitted before closure.
6. **Report:** Compliance information can be summarized for monitoring and documentation.

**Workflow:** Report → Track → Assess Risk → Corrective Action → Evidence → Closure

## Risk Assessment Concept

The proposed system uses Green, Yellow, and Red indicators to make risk information easier to interpret.

The presentation concept described analyzing recent open violations, including violations from the previous 30 days, to help identify cases requiring attention.

These indicators are intended to support human decision-making rather than replace professional safety inspections or official regulatory judgments.

## Hackathon Experience

**Event:** Smart India Hackathon (SIH)  
**Stage:** Internal round  
**Team:** TechNova  
**Outcome:** Participated in the internal round and presented the proposed solution to judges; not selected for the subsequent stage.

The experience involved identifying an operational challenge, proposing a technology-based solution, outlining the system workflow, and communicating its potential impact.

## Potential Impact

- Reduce reliance on manual inspection paperwork.
- Improve visibility into unresolved violations.
- Support evidence-based compliance monitoring.
- Help prioritize high-risk cases.
- Simplify the preparation of compliance summaries.
- Support reporting workflows in locations with intermittent connectivity.

These are intended benefits; their real-world impact would need to be validated through deployment and field testing.

## Limitations and Future Enhancements

Potential next steps include:

- Integrating a secure cloud database and user authentication.
- Implementing reliable offline synchronization and conflict resolution.
- Adding role-based access for mine officials and administrators.
- Validating risk-scoring logic against real inspection data.
- Improving data privacy, audit trails, and evidence integrity.
- Testing GPS accuracy and usability in actual mining environments.
- Conducting field trials with mine safety professionals.
- Evaluating OCR accuracy on real inspection forms.

## Team

**Team TechNova**

This project was developed and presented as a team submission for the SIH internal round.

Add your teammates' names and individual contributions here.

## Project Evidence

Photographs from the project presentation and the associated public post can be added to the `assets/` directory.

These images document the presentation context and participation; they do not represent selection for the national finale or a competition award.

## Disclaimer

This repository documents a hackathon project and proposed prototype. It is not an official government platform, a certified mine-safety system, or a substitute for statutory inspections and regulatory procedures.

The implementation status of individual features should be verified against the source code.

## Acknowledgements

- Smart India Hackathon organizers and internal-round judges.
- Coal mining and mine-safety stakeholders whose operational challenges informed the proposed concept.
- The open-source communities behind the technologies considered for this project.
