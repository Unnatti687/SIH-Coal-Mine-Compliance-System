// Parse OCR text from scanned paper inspection forms
// Designed for printed (not handwritten) forms with standard layout

export function parseOCRText(text) {
  const result = {
    mineName: '',
    date: '',
    inspectorName: '',
    category: '',
    description: '',
    priority: 'Medium',
  };

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    const lower = line.toLowerCase();

    // Mine name patterns
    if (lower.includes('mine') || lower.includes('area') || lower.includes('coalfield')) {
      if (!result.mineName && line.length < 80) {
        result.mineName = line.replace(/[:=]/g, '').trim();
      }
    }

    // Date patterns (DD/MM/YYYY or DD-MM-YYYY or written dates)
    const dateMatch = line.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (dateMatch && !result.date) {
      const [, d, m, y] = dateMatch;
      result.date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    const writtenDateMatch = line.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2}),?\s+(\d{4})/i);
    if (writtenDateMatch && !result.date) {
      const months = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
      const m = months[writtenDateMatch[1].toLowerCase().substring(0, 3)];
      result.date = `${writtenDateMatch[3]}-${m}-${writtenDateMatch[2].padStart(2, '0')}`;
    }

    // Inspector name
    if (lower.includes('inspector') || lower.includes('inspected by') || lower.includes('officer')) {
      const nameMatch = line.match(/[:=]\s*(.+)/);
      if (nameMatch) result.inspectorName = nameMatch[1].trim();
    }

    // Category / violation type
    const categoryKeywords = {
      'Safety': ['safety', 'ppe', 'helmet', 'guard', 'barricad'],
      'Environment': ['dust', 'water', 'effluent', 'air quality', 'pollution'],
      'Production': ['production', 'dispatch', 'output', 'tonnage'],
      'Labour': ['labour', 'worker', 'attendance', 'contract'],
      'Blasting': ['blast', 'explosive', 'detonat'],
      'Ventilation': ['ventilat', 'gas', 'methane'],
      'Emergency': ['emergency', 'evacuation', 'fire'],
      'Electrical': ['electri', 'machine', 'equipment'],
      'Haulage': ['haul', 'transport', 'vehicle', 'truck'],
      'Roof': ['roof', 'strata', 'support', 'ground'],
    };

    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (!result.category && keywords.some(kw => lower.includes(kw))) {
        result.category = cat;
        break;
      }
    }

    // Violation / description
    if (lower.includes('violation') || lower.includes('finding') || lower.includes('observation') || lower.includes('remarks')) {
      const descMatch = line.match(/[:=]\s*(.+)/);
      if (descMatch) result.description = descMatch[1].trim();
    }

    // Priority
    if (lower.includes('high priority') || lower.includes('critical') || lower.includes('urgent')) {
      result.priority = 'High';
    } else if (lower.includes('low priority') || lower.includes('minor')) {
      result.priority = 'Low';
    }
  }

  // If we couldn't parse much, use the full text as description
  if (!result.description && text.length > 0) {
    result.description = text.substring(0, 200);
  }

  return result;
}
