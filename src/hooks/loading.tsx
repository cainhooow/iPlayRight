import { create } from "zustand";

interface Loading {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useLoadingStore = create<Loading>()((set) => ({
  loading: false,
  setLoading: (loading: boolean) => set(() => ({ loading })),
}));

export const useLoading = () => {
  const loading = useLoadingStore((state) => state.loading);
  const setLoading = useLoadingStore((state) => state.setLoading);
  return {
    loading,
    setLoading,
  };
};
