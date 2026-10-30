import jsPDF from 'jspdf';

/**
 * Builds a branded PDF report client-side from a completed analysis object
 * and triggers a download. Kept intentionally simple (text + tables) —
 * see architecture doc §13 for a future server-side rendering upgrade path.
 */
export async function buildAndDownloadReport(analysis) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const marginX = 48;
  let y = 64;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('ScoreMyResume — Analysis Report', marginX, y);

  y += 28;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(new Date(analysis.createdAt || Date.now()).toLocaleDateString(), marginX, y);

  y += 36;
  doc.setTextColor(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`ATS Score: ${analysis.atsScore ?? '—'} / 100`, marginX, y);

  y += 24;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const breakdown = analysis.scoreBreakdown || {};
  Object.entries(breakdown).forEach(([key, value]) => {
    doc.text(`${key.replace(/([A-Z])/g, ' $1')}: ${value}/100`, marginX, y);
    y += 16;
  });

  y += 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Missing Keywords', marginX, y);
  y += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const missing = analysis.missingKeywords || {};
  Object.entries(missing).forEach(([category, words]) => {
    if (!words?.length) return;
    doc.text(`${category}: ${words.join(', ')}`, marginX, y, { maxWidth: 500 });
    y += 16 + Math.floor(words.join(', ').length / 90) * 12;
  });

  y += 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Suggestions', marginX, y);
  y += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  (analysis.suggestions || []).forEach((s) => {
    if (y > 760) {
      doc.addPage();
      y = 56;
    }
    doc.text(`• [${s.priority || 'Medium'}] ${s.title}`, marginX, y, { maxWidth: 500 });
    y += 16;
    if (s.description) {
      doc.setTextColor(90);
      doc.text(s.description, marginX + 12, y, { maxWidth: 480 });
      doc.setTextColor(20);
      y += 16 + Math.floor(s.description.length / 90) * 12;
    }
  });

  doc.save(`resume-analysis-${analysis._id || analysis.id || 'report'}.pdf`);
}
