import { useCallback } from "react";

import {
  getChurches,
  createChurch,
  updateChurch,
  getChurchById,
  deleteChurch,
  toggleChurchActive,

  // =========================
  // DIOCESE / DEANERY
  // =========================
  getArchdioceses,
  getDiocesesByParent,
  getDeaneriesByDiocese,
} from "../api/churchApi";

export const useChurch = () => {
  // =====================================================
  // GET ALL CHURCHES
  // =====================================================

  const fetchChurches = useCallback(async (params) => {
    return await getChurches(params);
  }, []);

  // =====================================================
  // GET CHURCH BY ID
  // =====================================================

  const getChurchId = useCallback(async (id) => {
    return await getChurchById(id);
  }, []);

  // =====================================================
  // CREATE CHURCH
  // =====================================================

  const addChurch = useCallback(async (data) => {
    return await createChurch(data);
  }, []);

  // =====================================================
  // UPDATE CHURCH
  // =====================================================

  const editChurch = useCallback(async (id, data) => {
    return await updateChurch(id, data);
  }, []);

  // =====================================================
  // DELETE CHURCH
  // =====================================================

  const removeChurch = useCallback(async (id) => {
    return await deleteChurch(id);
  }, []);

  // =====================================================
  // TOGGLE ACTIVE
  // =====================================================

  const toggleActive = useCallback(async (id) => {
    return await toggleChurchActive(id);
  }, []);

  // =====================================================
  // GET TỔNG GIÁO PHẬN
  // =====================================================

  const fetchArchdioceses = useCallback(async () => {
    return await getArchdioceses();
  }, []);

  // =====================================================
  // GET GIÁO PHẬN THEO TỔNG GIÁO PHẬN
  // =====================================================

  const fetchDiocesesByParent = useCallback(async (parentDioceseId) => {
    return await getDiocesesByParent(parentDioceseId);
  }, []);

  // =====================================================
  // GET GIÁO HẠT THEO GIÁO PHẬN
  // =====================================================

  const fetchDeaneriesByDiocese = useCallback(async (dioceseId) => {
    return await getDeaneriesByDiocese(dioceseId);
  }, []);

  // =====================================================
  // RETURN
  // =====================================================

  return {
    // Church
    fetchChurches,
    addChurch,
    editChurch,
    getChurchId,
    removeChurch,
    toggleActive,

    // Diocese / Deanery
    fetchArchdioceses,
    fetchDiocesesByParent,
    fetchDeaneriesByDiocese,
  };
};
