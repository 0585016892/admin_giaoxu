import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getLessons } from "../../../api/lessonApi";

import { DEFAULT_PAGE_SIZE, getArrayData } from "../utils/lessonHelpers";

const useLessons = (notify) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [sortType, setSortType] = useState("name");
  const [viewMode, setViewMode] = useState("list");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const notifyRef = useRef(notify);
  notifyRef.current = notify;

  // =======================================================
  // LOAD LESSONS BY PROGRAM
  // =======================================================

  const loadLessons = useCallback(async (programId) => {
    if (!programId) {
      setLessons([]);
      return;
    }

    try {
      setLoading(true);

      const response = await getLessons({
        program_id: programId,
      });

      const data = getArrayData(response.data.data, ["lessons"]);

      setLessons(data);
    } catch (error) {
      setLessons([]);

      notifyRef.current.error(
        error?.response?.data?.message || "Không thể tải danh sách bài học",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =======================================================
  // FILTER & SORT
  // =======================================================

  const filteredLessons = useMemo(() => {
    let result = [...lessons];

    const keyword = String(searchText || "")
      .trim()
      .toLowerCase();

    if (keyword) {
      result = result.filter((lesson) => {
        const title = String(lesson.title || "").toLowerCase();
        const id = String(lesson.id || "").toLowerCase();

        return title.includes(keyword) || id.includes(keyword);
      });
    }

    if (sortType === "name") {
      result.sort((a, b) =>
        String(a.title || "").localeCompare(String(b.title || ""), "vi"),
      );
    }

    if (sortType === "newest") {
      result.sort((a, b) => {
        const dateA = new Date(a.created_at || a.updated_at || 0).getTime();

        const dateB = new Date(b.created_at || b.updated_at || 0).getTime();

        if (dateA && dateB && dateA !== dateB) {
          return dateB - dateA;
        }

        return Number(b.id || 0) - Number(a.id || 0);
      });
    }

    if (sortType === "oldest") {
      result.sort((a, b) => {
        const dateA = new Date(a.created_at || a.updated_at || 0).getTime();

        const dateB = new Date(b.created_at || b.updated_at || 0).getTime();

        if (dateA && dateB && dateA !== dateB) {
          return dateA - dateB;
        }

        return Number(a.id || 0) - Number(b.id || 0);
      });
    }

    return result;
  }, [lessons, searchText, sortType]);

  // =======================================================
  // PAGINATION
  // =======================================================

  const paginatedLessons = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;

    return filteredLessons.slice(startIndex, startIndex + pageSize);
  }, [filteredLessons, currentPage, pageSize]);

  // =======================================================
  // RESET PAGE WHEN FILTER CHANGES
  // =======================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, sortType, pageSize]);

  return {
    lessons,
    setLessons,

    loading,
    loadLessons,

    searchText,
    setSearchText,

    sortType,
    setSortType,

    viewMode,
    setViewMode,

    currentPage,
    setCurrentPage,

    pageSize,
    setPageSize,

    filteredLessons,
    paginatedLessons,
  };
};

export default useLessons;
