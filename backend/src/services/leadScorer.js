var SCORE_WEIGHTS = {
  hasEmail: 15,
  hasPhone: 20,
  isBooking: 30,
  hasName: 5,
  hasCompany: 10,
  hasCrmRecord: 10,
  recency: 10,
};

function scoreLead(lead) {
  var score = 0;
  if (lead.email) score += SCORE_WEIGHTS.hasEmail;
  if (lead.phone) score += SCORE_WEIGHTS.hasPhone;
  if (lead.prospectName && lead.prospectName !== "Unknown Prospect") score += SCORE_WEIGHTS.hasName;
  if (lead.leadSource && /booking|booked|scheduled|meeting|demo/i.test(lead.leadSource)) score += SCORE_WEIGHTS.isBooking;
  if (lead.companyName) score += SCORE_WEIGHTS.hasCompany;
  if (lead.crmRecordUrl) score += SCORE_WEIGHTS.hasCrmRecord;
  var ageHours = lead.createdAt ? (Date.now() - new Date(lead.createdAt).getTime()) / 3600000 : 999;
  if (ageHours < 1) score += SCORE_WEIGHTS.recency;
  else if (ageHours < 4) score += Math.round(SCORE_WEIGHTS.recency * 0.5);
  else if (ageHours < 24) score += Math.round(SCORE_WEIGHTS.recency * 0.25);
  return score;
}

function prioritizeLeads(leads) {
  return leads.map(function(l) { return { lead: l, score: scoreLead(l) }; }).sort(function(a, b) { return b.score - a.score; });
}

var PRIORITY_LABELS = [
  { minScore: 60, label: "Hot", color: "#ef4444" },
  { minScore: 35, label: "Warm", color: "#f59e0b" },
  { minScore: 0, label: "Cool", color: "#64748b" },
];

function getPriorityLabel(score) {
  for (var i = 0; i < PRIORITY_LABELS.length; i++) {
    if (score >= PRIORITY_LABELS[i].minScore) return PRIORITY_LABELS[i];
  }
  return PRIORITY_LABELS[PRIORITY_LABELS.length - 1];
}

module.exports = { scoreLead, prioritizeLeads, getPriorityLabel, SCORE_WEIGHTS };
