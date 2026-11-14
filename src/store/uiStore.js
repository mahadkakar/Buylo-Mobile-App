import { create } from "zustand";

let toastTimer;

export const useUiStore = create((set) => ({
  toast: null,
  busy: null,
  dialog: null,
  showToast: (message, action) => {
    clearTimeout(toastTimer);
    set({ toast: { id: Date.now(), message, action } });
    toastTimer = setTimeout(() => set({ toast: null }), action ? 5000 : 2200);
  },
  hideToast: () => {
    clearTimeout(toastTimer);
    set({ toast: null });
  },
  setBusy: (busy) => set({ busy }),
  openDialog: (dialog) => set({ dialog }),
  closeDialog: () => set({ dialog: null }),
}));

export const showToast = (message, action) => useUiStore.getState().showToast(message, action);
export const setBusy = (message) => useUiStore.getState().setBusy(message);

export const confirmDialog = ({ title, message, confirmLabel = "OK", cancelLabel = "Cancel", tone = "default", icon, onConfirm, onCancel }) =>
  useUiStore.getState().openDialog({ title, message, confirmLabel, cancelLabel, tone, icon, onConfirm, onCancel });

export const showNotice = (title, message, { tone = "default", icon, buttonLabel = "OK" } = {}) =>
  useUiStore.getState().openDialog({ title, message, confirmLabel: buttonLabel, cancelLabel: null, tone, icon });
