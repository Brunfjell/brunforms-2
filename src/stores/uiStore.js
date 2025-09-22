import { create } from 'zustand';


export const useUIStore = create((set) => ({
toasts: [],
pushToast: (toast) =>
set((state) => {
const id = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
const newToast = { id, ...toast };
return { toasts: [...state.toasts, newToast] };
}),
removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));


export default useUIStore;