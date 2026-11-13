import { create } from "zustand";

// App wide feedback: a short toast ("Name saved"), a busy overlay ("Logging out") and a confirm / notice dialog. Rendered once by
// components/UiLayer.js in the root layout, so any screen can call them.
let toastTimer;

export const useUiStore = create((set) => ({
  toast: null, // { id, message }
  busy: null, // message string while a blocking action runs
  dialog: null, // { title, message, tone, icon, confirmLabel, cancelLabel, onConfirm, onCancel } (components/AppDialog.js)
  // `action` ({ label, onPress }) adds a button such as Undo; a toast with an action stays a little longer.
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

// Asks the shopper to confirm something. Replaces the system Alert so the dialog matches the app.
//   confirmDialog({ title, message, confirmLabel: "Delete", tone: "danger", icon: Trash2, onConfirm })
// `tone: "danger"` makes the confirm button red (deleting, logging out); `cancelLabel` defaults to "Cancel".
export const confirmDialog = ({ title, message, confirmLabel = "OK", cancelLabel = "Cancel", tone = "default", icon, onConfirm, onCancel }) =>
  useUiStore.getState().openDialog({ title, message, confirmLabel, cancelLabel, tone, icon, onConfirm, onCancel });

// Tells the shopper something (one OK button). `tone: "danger"` for failures.
export const showNotice = (title, message, { tone = "default", icon, buttonLabel = "OK" } = {}) =>
  useUiStore.getState().openDialog({ title, message, confirmLabel: buttonLabel, cancelLabel: null, tone, icon });
