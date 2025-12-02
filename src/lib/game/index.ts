export {
  initialGameState,
  gameReducer,
  isValidAssignment,
  getRemainingAssignments,
  getUnassignedPeople,
} from "./engine";

export {
  filterPeople,
  shuffle,
  selectThreePeople,
  hasEnoughPeople,
} from "./selection";

export type { SelectionOptions } from "./selection";
