import { create } from 'zustand';
import { CatRecord } from '@/database/schema';
import { CatRepository } from '@/database/cat-repository';
import { CatTemperament, CatContext } from '@/types/domain';

interface CatStoreState {
  cats: CatRecord[];
  isLoading: boolean;
  selectedTemperament: CatTemperament | 'all';
  selectedContext: CatContext | 'all';
  loadCats: () => Promise<void>;
  setTemperamentFilter: (temperament: CatTemperament | 'all') => void;
  setContextFilter: (context: CatContext | 'all') => void;
  deleteCat: (id: string) => Promise<void>;
}

export const useCatStore = create<CatStoreState>((set, get) => ({
  cats: [],
  isLoading: false,
  selectedTemperament: 'all',
  selectedContext: 'all',

  loadCats: async () => {
    set({ isLoading: true });
    try {
      const allCats = await CatRepository.getAll();
      set({ cats: allCats });
    } finally {
      set({ isLoading: false });
    }
  },

  setTemperamentFilter: (temperament) => {
    set({ selectedTemperament: temperament });
  },

  setContextFilter: (context) => {
    set({ selectedContext: context });
  },

  deleteCat: async (id: string) => {
    await CatRepository.delete(id);
    const updated = get().cats.filter((c) => c.id !== id);
    set({ cats: updated });
  },
}));
