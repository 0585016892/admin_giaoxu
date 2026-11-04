import { useCallback, useEffect, useRef, useState } from "react";

import { getLessonPrograms } from "../../../api/lessonApi";
import { getArrayData } from "../utils/lessonHelpers";

const useLessonPrograms = (notify) => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);

  // Giữ notify mới nhất, tránh effect gọi API lặp.
  const notifyRef = useRef(notify);
  notifyRef.current = notify;

  const loadPrograms = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getLessonPrograms();

      const data = getArrayData(response.data, ["programs"]);

      setPrograms(data);
    } catch (error) {
      notifyRef.current.error(
        error?.response?.data?.message ||
          "Không thể tải danh sách chương trình giáo lý",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  return {
    programs,
    setPrograms,
    loading,
    loadPrograms,
  };
};

export default useLessonPrograms;
