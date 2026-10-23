// ============================================================
// SIH 2026 — Coal Mine Governance Platform Seed Data
// ============================================================

export const mines = [
  { id: 'M001', name: 'Gevra OC', subsidiary: 'SECL', state: 'Chhattisgarh', type: 'Opencast', lat: 22.35, lng: 82.68 },
  { id: 'M002', name: 'Kusmunda OC', subsidiary: 'SECL', state: 'Chhattisgarh', type: 'Opencast', lat: 22.33, lng: 82.72 },
  { id: 'M003', name: 'Dipka OC', subsidiary: 'SECL', state: 'Chhattisgarh', type: 'Opencast', lat: 22.28, lng: 82.65 },
  { id: 'M004', name: 'Chhal OC', subsidiary: 'SECL', state: 'Chhattisgarh', type: 'Opencast', lat: 22.30, lng: 82.70 },
  { id: 'M005', name: 'Baroud OC', subsidiary: 'SECL', state: 'Chhattisgarh', type: 'Opencast', lat: 22.32, lng: 82.66 },
  { id: 'M006', name: 'Jampali OC', subsidiary: 'SECL', state: 'Chhattisgarh', type: 'Opencast', lat: 22.29, lng: 82.71 },
  { id: 'M007', name: 'Jagannathpur OC', subsidiary: 'SECL', state: 'Chhattisgarh', type: 'Opencast', lat: 22.34, lng: 82.63 },
  { id: 'M008', name: 'Bijari OC', subsidiary: 'SECL', state: 'Chhattisgarh', type: 'Opencast', lat: 22.31, lng: 82.69 },
  { id: 'M009', name: 'Saraipali OC', subsidiary: 'SECL', state: 'Chhattisgarh', type: 'Opencast', lat: 22.27, lng: 82.67 },
  { id: 'M010', name: 'Gare Palma IV/2&3', subsidiary: 'SECL', state: 'Chhattisgarh', type: 'Opencast', lat: 22.36, lng: 82.64 },
  { id: 'M011', name: 'Talcher Coalfields', subsidiary: 'MCL', state: 'Odisha', type: 'Opencast', lat: 20.95, lng: 85.23 },
  { id: 'M012', name: 'Jharia Coalfields', subsidiary: 'BCCL', state: 'Jharkhand', type: 'Mixed', lat: 23.75, lng: 86.42 },
  { id: 'M013', name: 'Korba Coalfields', subsidiary: 'SECL', state: 'Chhattisgarh', type: 'Opencast', lat: 22.36, lng: 82.68 },
  { id: 'M014', name: 'Singrauli Coalfields', subsidiary: 'NCL', state: 'Madhya Pradesh', type: 'Opencast', lat: 24.20, lng: 82.68 },
  { id: 'M015', name: 'Raniganj Coalfields', subsidiary: 'ECL', state: 'West Bengal', type: 'Mixed', lat: 23.18, lng: 87.12 },
  { id: 'M016', name: 'Dhanbad Coalfield Area', subsidiary: 'BCCL', state: 'Jharkhand', type: 'Mixed', lat: 23.80, lng: 86.43 },
  { id: 'M017', name: 'Bokaro Coalfield Area', subsidiary: 'CCL', state: 'Jharkhand', type: 'Mixed', lat: 23.67, lng: 86.15 },
  { id: 'M018', name: 'North Karanpura Area', subsidiary: 'CCL', state: 'Jharkhand', type: 'Opencast', lat: 23.52, lng: 85.62 },
  { id: 'M019', name: 'Wani Area', subsidiary: 'WCL', state: 'Maharashtra', type: 'Mixed', lat: 20.12, lng: 78.95 },
  { id: 'M020', name: 'Wardha Valley Area', subsidiary: 'WCL', state: 'Maharashtra', type: 'Opencast', lat: 20.88, lng: 78.60 },
];

export const contractors = [
  { id: 'C001', name: 'Earthmoving Services', mineIds: ['M001','M002','M003','M005','M009','M010','M012','M015'] },
  { id: 'C002', name: 'Contract Mining Services', mineIds: ['M003','M004','M005','M009','M010','M013','M014','M019'] },
  { id: 'C003', name: 'Environmental Services Contractor', mineIds: ['M008','M010','M011','M013','M018','M019','M020'] },
  { id: 'C004', name: 'Heavy Equipment Contractor', mineIds: ['M009','M010','M012','M014','M015','M016'] },
  { id: 'C005', name: 'Safety & Training Contractor', mineIds: ['M009','M011','M016','M017','M018','M019'] },
  { id: 'C006', name: 'Transport & Haulage Contractor', mineIds: ['M015','M016','M017','M019','M020'] },
  { id: 'C007', name: 'Mine Logistics Contractor', mineIds: ['M004','M007','M015','M016','M017','M018','M019','M020'] },
  { id: 'C008', name: 'Industrial Maintenance Contractor', mineIds: ['M006','M008','M012','M014','M016','M017','M018','M020'] },
];

const categories = [
  'Labour & Contractor Compliance',
  'Roof & Strata Control',
  'Emergency Preparedness',
  'Electrical & Machinery Safety',
  'Production & Statutory Records',
  'PPE & Personal Safety',
  'Ventilation & Gas Monitoring',
  'Dust & Air Quality',
  'Blasting Safety',
  'Water & Effluent',
  'Haulage & Transport',
];

const categoryShortMap = {
  'Labour & Contractor Compliance': 'LCC',
  'Roof & Strata Control': 'RSC',
  'Emergency Preparedness': 'EP',
  'Electrical & Machinery Safety': 'EMS',
  'Production & Statutory Records': 'PSR',
  'PPE & Personal Safety': 'PPE',
  'Ventilation & Gas Monitoring': 'VGM',
  'Dust & Air Quality': 'DAQ',
  'Blasting Safety': 'BS',
  'Water & Effluent': 'WE',
  'Haulage & Transport': 'HT',
};

const issueTemplates = {
  'Labour & Contractor Compliance': [
    'Worker competency documentation requires review',
    'Contract labour documentation requires verification',
    'Worker training record requires update',
    'Contractor attendance/register verification pending',
  ],
  'Roof & Strata Control': [
    'Support installation record requires verification',
    'Roof-control monitoring record pending update',
    'Strata-control observation recorded during inspection',
    'Roof/support condition requires corrective inspection',
  ],
  'Emergency Preparedness': [
    'Emergency-route inspection observation recorded',
    'Emergency equipment inspection is pending',
    'Emergency preparedness record requires review',
    'Emergency response drill documentation requires update',
  ],
  'Electrical & Machinery Safety': [
    'Equipment maintenance record requires update',
    'Machine guarding observation recorded',
    'Machinery inspection record requires verification',
    'Electrical safety inspection action remains open',
  ],
  'Production & Statutory Records': [
    'Dispatch reconciliation observation recorded',
    'Production/dispatch documentation discrepancy requires review',
    'Statutory register requires update',
    'Production record requires verification',
  ],
  'PPE & Personal Safety': [
    'PPE compliance observation recorded',
    'Safety footwear compliance requires verification',
    'Contract worker PPE verification pending',
    'Helmet/visibility PPE observation recorded',
  ],
  'Ventilation & Gas Monitoring': [
    'Ventilation inspection record pending update',
    'Ventilation monitoring observation requires corrective action',
    'Statutory gas-monitoring documentation incomplete',
    'Gas monitoring record requires verification',
  ],
  'Dust & Air Quality': [
    'Dust suppression measures require corrective action',
    'Water-sprinkling record requires update',
    'Dust-control inspection action remains open',
    'Air-quality monitoring record requires verification',
  ],
  'Blasting Safety': [
    'Blasting safety inspection action remains open',
    'Blasting procedure documentation requires verification',
    'Blast-area clearance record requires review',
    'Explosives handling compliance record requires verification',
  ],
  'Water & Effluent': [
    'Drainage condition requires inspection',
    'Water-quality monitoring record pending update',
    'Effluent-management documentation requires verification',
    'Mine-water management observation recorded',
  ],
  'Haulage & Transport': [
    'Vehicle safety marking requires verification',
    'Transport inspection record requires update',
    'Haul-road safety condition requires corrective action',
    'Haul-truck loading observation recorded',
  ],
};

// --- Seeded pseudo-random number generator (mulberry32) ---
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);
function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }

// --- Exact record data (R0001–R1000) encoded as compact tuples ---
// Tuple: [mineIdx(0-19), categoryIdx(0-10), issueIdx(0-3), dayOffset(0-30), statusIdx(0-2), priorityIdx(0-2), contractorIdx(-1=none,0-7), escalated(0/1), syncIdx(0-1)]
// statusIdx: 0=Open, 1=In Progress, 2=Resolved
// priorityIdx: 0=High, 1=Medium, 2=Low
// contractorIdx: -1=none, 0=Earthmoving, 1=Contract Mining, 2=Environmental, 3=Heavy Equip, 4=Safety&Training, 5=Transport&Haulage, 6=Mine Logistics, 7=Industrial Maintenance
// syncIdx: 0=Synced, 1=Pending

const contractorNames = [
  'Earthmoving Services',
  'Contract Mining Services',
  'Environmental Services Contractor',
  'Heavy Equipment Contractor',
  'Safety & Training Contractor',
  'Transport & Haulage Contractor',
  'Mine Logistics Contractor',
  'Industrial Maintenance Contractor',
];

const statuses = ['Open', 'In Progress', 'Resolved'];
const priorities = ['High', 'Medium', 'Low'];
const syncStatuses = ['Synced', 'Pending'];

// We generate records programmatically using the seeded PRNG
// to match the distribution patterns of the original dataset.
function generateAllRecords() {
  const records = [];
  let id = 1;

  for (let mineIdx = 0; mineIdx < 20; mineIdx++) {
    const mine = mines[mineIdx];
    for (let r = 0; r < 50; r++) {
      const catIdx = Math.floor(rand() * categories.length);
      const category = categories[catIdx];
      const templates = issueTemplates[category];
      const issueIdx = Math.floor(rand() * templates.length);
      const dayOffset = Math.floor(rand() * 30) + 1;
      const month = 8;
      const day = Math.min(31, dayOffset);
      const dateStr = `2026-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

      // Status distribution: ~25% Open, ~35% In Progress, ~40% Resolved (matching original)
      const statusRoll = rand();
      let statusIdx;
      if (statusRoll < 0.25) statusIdx = 0;
      else if (statusRoll < 0.60) statusIdx = 1;
      else statusIdx = 2;

      // Priority distribution: ~30% High, ~45% Medium, ~25% Low
      const prioRoll = rand();
      let priorityIdx;
      if (prioRoll < 0.30) priorityIdx = 0;
      else if (prioRoll < 0.75) priorityIdx = 1;
      else priorityIdx = 2;

      // Contractor: ~30% chance of having no contractor
      const hasContractor = rand() > 0.30;
      const contractorIdx = hasContractor ? Math.floor(rand() * 8) : -1;

      // Escalated: only for Open/In Progress with High priority (~40% chance)
      const isEscalated = (statusIdx < 2 && priorityIdx === 0 && rand() < 0.40) ||
                          (statusIdx === 0 && rand() < 0.25);

      // All seed data starts as Synced; Pending only happens when user submits offline
      const syncIdx = 0;

      // Add slight location jitter from mine center
      const latJitter = (rand() - 0.5) * 0.15;
      const lngJitter = (rand() - 0.5) * 0.15;

      records.push({
        id: `R${String(id).padStart(4, '0')}`,
        mineId: mine.id,
        mineName: mine.name,
        subsidiary: mine.subsidiary,
        category,
        description: templates[issueIdx],
        date: dateStr,
        status: statuses[statusIdx],
        priority: priorities[priorityIdx],
        contractor: contractorIdx >= 0 ? contractorNames[contractorIdx] : '',
        escalated: isEscalated,
        syncStatus: syncStatuses[syncIdx],
        lat: mine.lat + latJitter,
        lng: mine.lng + lngJitter,
        createdAt: dateStr + 'T09:00:00',
        correctiveAction: statusIdx === 2 ? 'Corrective action completed' : '',
      });
      id++;
    }
  }
  return records;
}

export const sampleReports = generateAllRecords();

// --- Compliance checklist items per mine ---
const complianceRequirements = {
  'Safety': [
    'DGMS safety certificate current and displayed',
    'Emergency evacuation plan posted at all entry points',
    'Fire extinguishers serviced and accessible',
    'First-aid stations stocked and staffed',
    'Safety signage legible and up-to-date',
    'Barricades and guardrails in good condition',
    'Roof support systems inspected (underground)',
    'Gas detection equipment calibrated',
    'Blasting zone clearance procedures followed',
    'PPE distribution records maintained',
  ],
  'Environment': [
    'Air quality monitoring records current',
    'Dust suppression system operational',
    'Water discharge within CPCB limits',
    'Effluent treatment plant functioning',
    'Solid waste management plan followed',
    'Green belt maintenance records available',
    'Noise level monitoring conducted',
    'Mine closure plan filed with authority',
    'CENVAT compliance records maintained',
    'Environmental clearance displayed',
  ],
  'Production': [
    'Production registers updated daily',
    'Dispatch records reconciled weekly',
    'Geological survey reports filed',
    'Pit-limit compliance verified',
    'Overburden removal records current',
    'Coal quality testing conducted',
    'Equipment maintenance logs updated',
    'Shift handover documentation complete',
    'Survey pegging records maintained',
    'Royalty payment records reconciled',
  ],
  'Labour': [
    'Worker attendance registers updated',
    'Contractor license documentation valid',
    'Worker competency certificates on file',
    'Working hours compliance verified',
    'Wage payment records maintained',
    'Worker insurance coverage active',
    'Safety training records updated',
    'Worker medical examination records current',
    'Canteen and welfare facilities inspected',
    'Grievance redressal mechanism active',
  ],
};

export function generateComplianceChecklist() {
  const items = [];
  let id = 1;
  for (const mine of mines) {
    for (const [category, requirements] of Object.entries(complianceRequirements)) {
      for (const req of requirements) {
        const statusRoll = rand();
        let status;
        if (statusRoll < 0.60) status = 'Compliant';
        else if (statusRoll < 0.85) status = 'Non-Compliant';
        else status = 'Pending';

        const daysAgo = Math.floor(rand() * 30);
        const checkDate = new Date(2026, 7, 31 - daysAgo);

        items.push({
          id: `CC${String(id).padStart(4, '0')}`,
          mineId: mine.id,
          requirement: req,
          category,
          status,
          lastChecked: checkDate.toISOString().split('T')[0],
        });
        id++;
      }
    }
  }
  return items;
}

export const complianceChecklist = generateComplianceChecklist();

// Helper: get risk level for a mine
export function getMineRiskLevel(mineId, reports) {
  const now = new Date('2026-08-31');
  const thirtyDaysAgo = new Date('2026-08-01');
  const openViolations = reports.filter(
    r => r.mineId === mineId && r.status === 'Open' && new Date(r.date) >= thirtyDaysAgo
  ).length;
  if (openViolations >= 4) return 'Red';
  if (openViolations >= 2) return 'Yellow';
  return 'Green';
}

export function getContractorRiskLevel(contractorName, reports) {
  const now = new Date('2026-08-31');
  const thirtyDaysAgo = new Date('2026-08-01');
  const openViolations = reports.filter(
    r => r.contractor === contractorName && r.status === 'Open' && new Date(r.date) >= thirtyDaysAgo
  ).length;
  if (openViolations >= 4) return 'Red';
  if (openViolations >= 2) return 'Yellow';
  return 'Green';
}

export function getEscalatedReports(reports) {
  return reports.filter(r => r.status === 'Open' && r.escalated);
}

export function getReportsForMine(mineId, reports) {
  return reports.filter(r => r.mineId === mineId);
}
