export const mockProjectAsset = {
  // Header info
  projectName: "DEEPWATER ATLAS - Q4 2024 RAPTOR Review",
  assetName: "Deepwater Atlas",
  assetType: "Drillship",
  projectStatus: "In Progress",
  projectStartDate: "2024-09-15",
  projectEndDate: "2024-12-20",
  
  // Four main progress indicators (Row 1)
  overallReadiness: 72,
  raptorChecklistCompletion: 68,
  sitCompletion: 45,
  docVerificationCompletion: 81,
  
  // Checklist status counts (Row 2, Chart 1)
  checklistStatus: {
    remaining: 127,
    closed: 284,
    nonConforming: 18,
    notApplicable: 42,
    deferred: 12,
    total: 483,
  },
  
  // Action item status (Row 2, Chart 2)
  actionItemStatus: {
    highOpen: 5,
    highClosed: 12,
    mediumOpen: 23,
    mediumClosed: 41,
    lowOpen: 8,
    lowClosed: 67,
  },
  
  // Action item by milestone (Row 2, Chart 3)
  actionItemsByMilestone: [
    { milestone: "Pre-Arrival", open: 2, closed: 18 },
    { milestone: "Phase 1", open: 8, closed: 34 },
    { milestone: "Phase 2", open: 12, closed: 28 },
    { milestone: "Phase 3", open: 14, closed: 40 },
  ],
  
  // System progress (Row 3)
  systemProgress: {
    docVerification: [
      { system: "SSH&E", progress: 95 },
      { system: "Management Systems", progress: 88 },
      { system: "Lifting / Handling", progress: 72 },
      { system: "Drilling Equipment", progress: 65 },
      { system: "Drilling Fluid Systems", progress: 78 },
      { system: "Solids & Gas Treatment", progress: 82 },
      { system: "Marine Systems", progress: 91 },
      { system: "Well Control Equipment", progress: 55 },
      { system: "MPD System", progress: 40 },
      { system: "Flare Boom", progress: 100 },
      { system: "Power Equipment", progress: 88 },
      { system: "Safety Equipment", progress: 92 },
      { system: "Service Partner", progress: 75 },
      { system: "Life-Saving", progress: 98 },
      { system: "Quarters & Helideck", progress: 85 },
    ],
    checklist: [
      { system: "SSH&E", progress: 92 },
      { system: "Management Systems", progress: 78 },
      { system: "Lifting / Handling", progress: 68 },
      { system: "Drilling Equipment", progress: 62 },
      { system: "Drilling Fluid Systems", progress: 71 },
      { system: "Solids & Gas Treatment", progress: 75 },
      { system: "Marine Systems", progress: 85 },
      { system: "Well Control Equipment", progress: 52 },
      { system: "MPD System", progress: 38 },
      { system: "Flare Boom", progress: 95 },
      { system: "Power Equipment", progress: 82 },
      { system: "Safety Equipment", progress: 88 },
      { system: "Service Partner", progress: 70 },
      { system: "Life-Saving", progress: 94 },
      { system: "Quarters & Helideck", progress: 80 },
    ],
    sit: [
      { system: "Positioning", progress: 45 },
      { system: "Power Management", progress: 52 },
      { system: "Drill Floor", progress: 38 },
      { system: "Circulation System", progress: 41 },
      { system: "Bulk & Fluid Handling", progress: 55 },
      { system: "Well Control Equipment", progress: 32 },
      { system: "Running / Retrieving BOP", progress: 28 },
      { system: "Emergency Response", progress: 60 },
    ],
  },
};

