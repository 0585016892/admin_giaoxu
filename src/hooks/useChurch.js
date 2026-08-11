import { useState } from "react";
import {
  getChurches,
  createChurch,
  updateChurch,
  deleteChurch,
  toggleChurchActive,
} from "../api/churchApi";

export const useChurch = () => {
  const [loading, setLoading] = useState(false);

  const fetchChurches = async (params) => {
    setLoading(true);
    try {
      return await getChurches(params);
    } finally {
      setLoading(false);
    }
  };

  const addChurch = async (data) => {
    return await createChurch(data);
  };

  const editChurch = async (id, data) => {
    return await updateChurch(id, data);
  };

  const removeChurch = async (id) => {
    return await deleteChurch(id);
  };

  const toggleActive = async (id) => {
    return await toggleChurchActive(id);
  };

  return {
    loading,
    fetchChurches,
    addChurch,
    editChurch,
    removeChurch,
    toggleActive,
  };
};
