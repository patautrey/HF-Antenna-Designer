export function validateNEC(deck) {
  const errors = [];

  if (!deck.includes("CE")) errors.push("Missing CE (comment end)");
  if (!deck.includes("EN")) errors.push("Missing EN (end of deck)");
  if (!deck.match(/GW\s+\d+/)) errors.push("No wires (GW cards) found");
  if (!deck.match(/EX\s+/)) errors.push("No excitation (EX card) found");
  if (!deck.match(/FR\s+/)) errors.push("No frequency (FR card) found");
  if (!deck.match(/RP\s+/)) errors.push("No radiation pattern (RP card) found");

  return errors;
}
