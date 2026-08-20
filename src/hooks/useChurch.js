import { useCallback } from "react";
import {
  getChurches,
  createChurch,
  updateChurch,
  deleteChurch,
  toggleChurchActive,
} from "../api/churchApi";

export const useChurch = () => {
  const fetchChurches = useCallback(async (params) => {
    return await getChurches(params);
  }, []);

  const addChurch = useCallback(async (data) => {
    return await createChurch(data);
  }, []);

  const editChurch = useCallback(async (id, data) => {
    return await updateChurch(id, data);
  }, []);

  const removeChurch = useCallback(async (id) => {
    return await deleteChurch(id);
  }, []);

  const toggleActive = useCallback(async (id) => {
    return await toggleChurchActive(id);
  }, []);

  return {
    fetchChurches,
    addChurch,
    editChurch,
    removeChurch,
    toggleActive,
  };
};
