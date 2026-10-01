import { useCallback, useEffect, useState } from "react";

/**
 * =========================================================
 * useUnsavedChangesGuard
 *
 * Dùng được với BrowserRouter thông thường.
 *
 * Bảo vệ:
 * - navigate bằng requestLeave()
 * - F5
 * - Ctrl + R
 * - Cmd + R
 * - đóng tab
 * - đóng cửa sổ
 * - nhập URL khác
 *
 * Lưu ý:
 * beforeunload của trình duyệt sẽ dùng
 * native browser confirmation.
 * =========================================================
 */

export default function useUnsavedChangesGuard({
  hasChanges = false,
  changedCount = 0,
  onSave,
} = {}) {
  const [open, setOpen] = useState(false);

  const [saving, setSaving] = useState(false);

  const [pendingAction, setPendingAction] = useState(null);

  /* =======================================================
     BROWSER UNLOAD
  ======================================================= */

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!hasChanges) {
        return;
      }

      event.preventDefault();

      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasChanges]);

  /* =======================================================
     REQUEST LEAVE
  ======================================================= */

  const requestLeave = useCallback(
    (action) => {
      if (typeof action !== "function") {
        return;
      }

      if (!hasChanges) {
        action();

        return;
      }

      setPendingAction(() => action);

      setOpen(true);
    },
    [hasChanges],
  );

  /* =======================================================
     STAY
  ======================================================= */

  const stay = useCallback(() => {
    if (saving) {
      return;
    }

    setOpen(false);

    setPendingAction(null);
  }, [saving]);

  /* =======================================================
     LEAVE WITHOUT SAVE
  ======================================================= */

  const leave = useCallback(() => {
    if (saving) {
      return;
    }

    const action = pendingAction;

    setOpen(false);

    setPendingAction(null);

    if (typeof action === "function") {
      action();
    }
  }, [pendingAction, saving]);

  /* =======================================================
     SAVE AND LEAVE
  ======================================================= */

  const saveAndLeave = useCallback(async () => {
    if (saving) {
      return;
    }

    if (typeof onSave !== "function") {
      leave();

      return;
    }

    setSaving(true);

    try {
      const result = await onSave();

      /**
       * onSave phải trả:
       *
       * true  = lưu thành công
       * false = lưu thất bại
       */
      if (!result) {
        return;
      }

      const action = pendingAction;

      setOpen(false);

      setPendingAction(null);

      if (typeof action === "function") {
        action();
      }
    } catch (error) {
      return;
    } finally {
      setSaving(false);
    }
  }, [onSave, pendingAction, saving, leave]);

  return {
    open,
    saving,
    changedCount,

    requestLeave,

    stay,

    leave,

    saveAndLeave,
  };
}
