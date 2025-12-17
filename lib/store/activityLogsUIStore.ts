import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ActivityLogFilters } from '@/lib/api/activity-logs';

export interface ActivityLogsUIState {
  // Filters
  filters: ActivityLogFilters;
  
  // UI State
  sortOrder: 'asc' | 'desc';
  isFiltersExpanded: boolean;
  
  // Date range (as Date objects for UI, stored as ISO strings)
  startDate?: string;
  endDate?: string;
  
  // Actions
  setFilters: (filters: ActivityLogFilters) => void;
  updateFilter: <K extends keyof ActivityLogFilters>(key: K, value: ActivityLogFilters[K]) => void;
  resetFilters: () => void;
  
  setSortOrder: (order: 'asc' | 'desc') => void;
  setFiltersExpanded: (expanded: boolean) => void;
  
  setDateRange: (startDate?: Date, endDate?: Date) => void;
  clearDateRange: () => void;
  
  // Reset all state
  reset: () => void;
}

const defaultFilters: ActivityLogFilters = {
  page: 1,
  limit: 50,
};

const defaultState: Omit<ActivityLogsUIState, 'setFilters' | 'updateFilter' | 'resetFilters' | 'setSortOrder' | 'setFiltersExpanded' | 'setDateRange' | 'clearDateRange' | 'reset'> = {
  filters: defaultFilters,
  sortOrder: 'desc',
  isFiltersExpanded: true,
  startDate: undefined,
  endDate: undefined,
};

export const useActivityLogsUIStore = create<ActivityLogsUIState>()(
  persist(
    (set, get) => ({
      ...defaultState,
      
      setFilters: (filters) => {
        set({ filters });
      },
      
      updateFilter: (key, value) => {
        set((state) => ({
          filters: {
            ...state.filters,
            [key]: value,
          },
        }));
      },
      
      resetFilters: () => {
        set({
          filters: defaultFilters,
          startDate: undefined,
          endDate: undefined,
        });
      },
      
      setSortOrder: (order) => {
        set({ sortOrder: order });
      },
      
      setFiltersExpanded: (expanded) => {
        set({ isFiltersExpanded: expanded });
      },
      
      setDateRange: (startDate, endDate) => {
        set({
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          filters: {
            ...get().filters,
            startDate: startDate?.toISOString(),
            endDate: endDate?.toISOString(),
            page: 1, // Reset to first page when date range changes
          },
        });
      },
      
      clearDateRange: () => {
        set({
          startDate: undefined,
          endDate: undefined,
          filters: {
            ...get().filters,
            startDate: undefined,
            endDate: undefined,
            page: 1,
          },
        });
      },
      
      reset: () => {
        set(defaultState);
      },
    }),
    {
      name: 'activity-logs-ui-storage',
      partialize: (state) => ({
        filters: state.filters,
        sortOrder: state.sortOrder,
        isFiltersExpanded: state.isFiltersExpanded,
        startDate: state.startDate,
        endDate: state.endDate,
      }),
    }
  )
);

