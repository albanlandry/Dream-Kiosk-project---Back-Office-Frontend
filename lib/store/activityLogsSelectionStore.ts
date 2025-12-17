import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ActivityLogsSelectionState {
  // Selected log IDs (DB IDs)
  selectedIds: Set<string>;
  
  // Last clicked index for range selection
  lastClickedIndex: number | null;
  
  // Actions
  toggleSelection: (id: string) => void;
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  selectRange: (startIndex: number, endIndex: number, ids: string[]) => void;
  selectAll: (ids: string[]) => void;
  deselectAll: () => void;
  isSelected: (id: string) => boolean;
  getSelectedCount: () => number;
  clearSelection: () => void;
}

export const useActivityLogsSelectionStore = create<ActivityLogsSelectionState>()(
  persist(
    (set, get) => ({
      selectedIds: new Set<string>(),
      lastClickedIndex: null,
      
      toggleSelection: (id) => {
        set((state) => {
          const newSelectedIds = new Set(state.selectedIds);
          if (newSelectedIds.has(id)) {
            newSelectedIds.delete(id);
          } else {
            newSelectedIds.add(id);
          }
          return {
            selectedIds: newSelectedIds,
          };
        });
      },
      
      selectItem: (id) => {
        set((state) => {
          const newSelectedIds = new Set(state.selectedIds);
          newSelectedIds.add(id);
          return {
            selectedIds: newSelectedIds,
          };
        });
      },
      
      deselectItem: (id) => {
        set((state) => {
          const newSelectedIds = new Set(state.selectedIds);
          newSelectedIds.delete(id);
          return {
            selectedIds: newSelectedIds,
          };
        });
      },
      
      selectRange: (startIndex, endIndex, ids) => {
        set((state) => {
          const newSelectedIds = new Set(state.selectedIds);
          const start = Math.min(startIndex, endIndex);
          const end = Math.max(startIndex, endIndex);
          
          for (let i = start; i <= end; i++) {
            if (ids[i]) {
              newSelectedIds.add(ids[i]);
            }
          }
          
          return {
            selectedIds: newSelectedIds,
            lastClickedIndex: endIndex,
          };
        });
      },
      
      selectAll: (ids) => {
        set({
          selectedIds: new Set(ids),
        });
      },
      
      deselectAll: () => {
        set({
          selectedIds: new Set<string>(),
          lastClickedIndex: null,
        });
      },
      
      isSelected: (id) => {
        return get().selectedIds.has(id);
      },
      
      getSelectedCount: () => {
        return get().selectedIds.size;
      },
      
      clearSelection: () => {
        set({
          selectedIds: new Set<string>(),
          lastClickedIndex: null,
        });
      },
    }),
    {
      name: 'activity-logs-selection-storage',
      partialize: (state) => ({
        // Convert Set to Array for serialization
        selectedIds: Array.from(state.selectedIds),
      }),
      // Convert Array back to Set on rehydration
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.selectedIds)) {
          state.selectedIds = new Set(state.selectedIds);
        } else if (state) {
          state.selectedIds = new Set<string>();
        }
      },
    }
  )
);

