/**
 * Lightweight zustand-free store using React's useSyncExternalStore — keeps
 * hover + selection state out of React Flow's internal node data so the nodes
 * themselves never re-render on hover (only their CSS class flips). This is
 * what keeps 60 FPS on schemas with 50+ tables.
 */
import { useSyncExternalStore } from "react";

interface State {
  pulsingEdges: Set<string>;
  hoveredTable: string | null;
  selectedTable: string | null;
}

const state: State = {
  hoveredTable: null,
  selectedTable: null,
  pulsingEdges: new Set(),
};
const listeners = new Set<() => void>();

function emit() { listeners.forEach(l => l()); }

export const schemaEngineStore = {
  getState: (): State => state,
  subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); },

  setHover(table: string | null, edgeIds: string[] = []) {
    state.hoveredTable = table;
    state.pulsingEdges = new Set(edgeIds);
    emit();
  },
  setSelected(table: string | null) {
    state.selectedTable = table;
    emit();
  },
};

export function useSchemaEngineState<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    schemaEngineStore.subscribe,
    () => selector(schemaEngineStore.getState()),
    () => selector(schemaEngineStore.getState()),
  );
}
