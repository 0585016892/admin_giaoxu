// =========================================================
// STUDENT DRAFT STORAGE
// Lưu bản nháp chỉnh sửa học sinh vào localStorage
// =========================================================

const STORAGE_PREFIX = "faithedu_student_bulk_edit_draft";

/**
 * Tạo storage key theo classId
 */
const getStorageKey = (classId) => {
  return `${STORAGE_PREFIX}_${classId}`;
};

/**
 * =========================================================
 * LẤY DRAFT
 * =========================================================
 */
export const getStudentDraft = (classId) => {
  if (!classId) {
    return null;
  }

  try {
    const key = getStorageKey(classId);

    const raw = localStorage.getItem(key);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return parsed;
  } catch (error) {
    return null;
  }
};

/**
 * =========================================================
 * LƯU DRAFT
 * =========================================================
 */
export const saveStudentDraft = ({ classId, students, changedIds }) => {
  if (!classId) {
    return false;
  }

  try {
    const ids = Array.from(changedIds || []);

    /**
     * Không còn thay đổi
     * => xóa draft
     */
    if (ids.length === 0) {
      removeStudentDraft(classId);

      return true;
    }

    /**
     * Chỉ lưu những học sinh đã thay đổi
     */
    const changedStudents = (students || [])
      .filter((student) => ids.includes(student.id))
      .map((student) => ({
        ...student,
      }));

    const payload = {
      version: 1,

      classId: String(classId),

      updatedAt: new Date().toISOString(),

      changedIds: ids,

      students: changedStudents,
    };

    const key = getStorageKey(classId);

    localStorage.setItem(key, JSON.stringify(payload));

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * =========================================================
 * XÓA DRAFT
 * =========================================================
 */
export const removeStudentDraft = (classId) => {
  if (!classId) {
    return;
  }

  try {
    const key = getStorageKey(classId);

    localStorage.removeItem(key);
  } catch (error) {}
};

/**
 * =========================================================
 * KIỂM TRA DRAFT
 * =========================================================
 */
export const hasStudentDraft = (classId) => {
  const draft = getStudentDraft(classId);

  return Boolean(
    draft && Array.isArray(draft.students) && draft.students.length > 0,
  );
};

/**
 * =========================================================
 * KHÔI PHỤC DRAFT
 *
 * Chỉ khôi phục những học sinh
 * vẫn còn tồn tại trên server.
 * =========================================================
 */
export const restoreStudentDraft = ({ serverStudents, draft }) => {
  if (
    !Array.isArray(serverStudents) ||
    !draft ||
    !Array.isArray(draft.students)
  ) {
    return {
      students: serverStudents || [],

      changedIds: new Set(),
    };
  }

  /**
   * Map draft theo student.id
   */
  const draftMap = new Map(
    draft.students.map((student) => [String(student.id), student]),
  );

  /**
   * Merge:
   *
   * Server data
   * +
   * Draft data
   */
  const restoredStudents = serverStudents.map((serverStudent) => {
    const draftStudent = draftMap.get(String(serverStudent.id));

    if (!draftStudent) {
      return serverStudent;
    }

    return {
      ...serverStudent,
      ...draftStudent,

      /**
       * Không cho draft
       * ghi đè field hệ thống
       */
      id: serverStudent.id,

      code: serverStudent.code,
    };
  });

  /**
   * Chỉ giữ changedIds
   * của những học sinh thực sự
   * còn tồn tại trên server.
   */
  const serverIdSet = new Set(
    serverStudents.map((student) => String(student.id)),
  );

  const validChangedIds = new Set(
    (draft.changedIds || [])
      .filter((id) => serverIdSet.has(String(id)))
      .map((id) => id),
  );

  return {
    students: restoredStudents,

    changedIds: validChangedIds,
  };
};
