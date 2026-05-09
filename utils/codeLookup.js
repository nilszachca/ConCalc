const BUILDING_CODES = {
  CA: {
    electrical: {
      adopted_code: "2022 California Electrical Code",
      afci_protection: "Required in most habitable rooms for 120V branch circuits",
      gfci_locations: "Bathrooms, kitchens, laundry, garages, exterior outlets"
    },
    egress: {
      sleeping_room_window_min_opening_sqft: "5.7",
      min_opening_height_in: "24",
      min_opening_width_in: "20"
    },
    deck: {
      guard_required_height_in: "30",
      guard_min_height_in: "42",
      ledger_fastening: "Per IRC Table R507.9.1.3(1) and local amendments"
    }
  },
  TX: {
    electrical: {
      adopted_code: "Usually NEC with municipal amendments",
      note: "Verify city-level adoption and effective date"
    },
    egress: {
      note: "Most jurisdictions follow IRC egress minimums with amendments"
    }
  }
};

export function searchBuildingCode(state, topic) {
  const stateKey = String(state || "").trim().toUpperCase();
  const topicKey = String(topic || "").trim().toLowerCase();
  const stateCodes = BUILDING_CODES[stateKey];

  if (!stateCodes) {
    return { error: `No local code data for state '${stateKey}'.` };
  }

  const details = stateCodes[topicKey];
  if (!details) {
    return { error: `No topic '${topicKey}' found for state '${stateKey}'.` };
  }

  return { state: stateKey, topic: topicKey, details };
}

export function getCodeTopics(state) {
  const stateKey = String(state || "").trim().toUpperCase();
  return Object.keys(BUILDING_CODES[stateKey] || {});
}
