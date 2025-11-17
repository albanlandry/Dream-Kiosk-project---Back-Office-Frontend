import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Page-specific UI state types
type ResourcePageTab = 'media' | 'kiosk';
type MediaType = 'image' | 'video' | 'animal' | 'all';
type MediaStatus = 'active' | 'inactive' | 'all';
type SortBy = 'name' | 'created_at' | 'updated_at';
type SortOrder = 'asc' | 'desc';

interface ResourcePageState {
  activeTab: ResourcePageTab;
  searchTerm: string;
  mediaType: MediaType;
  mediaStatus: MediaStatus;
  sortBy: SortBy;
  sortOrder: SortOrder;
}

interface UIState {
  // Resource page state
  resourcePage: ResourcePageState;
  
  // Actions
  setResourcePageState: (state: Partial<ResourcePageState>) => void;
  resetResourcePageState: () => void;
  
  // Generic page state management
  setPageState: <T extends string>(page: string, key: string, value: T) => void;
  getPageState: <T extends string>(page: string, key: string, defaultValue: T) => T;
  clearPageState: (page: string) => void;
}

const defaultResourcePageState: ResourcePageState = {
  activeTab: 'media',
  searchTerm: '',
  mediaType: 'all',
  mediaStatus: 'all',
  sortBy: 'created_at',
  sortOrder: 'desc',
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      resourcePage: defaultResourcePageState,
      
      setResourcePageState: (state) =>
        set((current) => ({
          resourcePage: {
            ...current.resourcePage,
            ...state,
          },
        })),
      
      resetResourcePageState: () =>
        set({
          resourcePage: defaultResourcePageState,
        }),
      
      setPageState: (page, key, value) => {
        const pageKey = `${page}State` as keyof UIState;
        const currentState = get()[pageKey] as Record<string, unknown>;
        if (currentState && typeof currentState === 'object') {
          set({
            [pageKey]: {
              ...currentState,
              [key]: value,
            },
          } as Partial<UIState>);
        }
      },
      
      getPageState: (page, key, defaultValue) => {
        const pageKey = `${page}State` as keyof UIState;
        const currentState = get()[pageKey] as Record<string, unknown>;
        if (currentState && typeof currentState === 'object' && key in currentState) {
          return currentState[key] as typeof defaultValue;
        }
        return defaultValue;
      },
      
      clearPageState: (page) => {
        const pageKey = `${page}State` as keyof UIState;
        // Reset to default if it's a known page
        if (page === 'resourcePage') {
          set({
            resourcePage: defaultResourcePageState,
          });
        }
      },
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        resourcePage: state.resourcePage,
      }),
    }
  )
);

// Export types for use in components
export type { ResourcePageTab, MediaType, MediaStatus, SortBy, SortOrder };

