import React, { useCallback, useEffect, useRef, useState } from "react";

import { message, Spin } from "antd";

import resultApi from "../../../api/resultApi";

import GradingRuleHeader from "./components/GradingRuleHeader";
import GradingRuleOverview from "./components/GradingRuleOverview";
import GradingRuleForm from "./components/GradingRuleForm";
import GradingRuleItems from "./components/GradingRuleItems";
import GradingRuleItemModal from "./components/GradingRuleItemModal";
import GradingRulePreview from "./components/GradingRulePreview";

import {
  normalizeRule,
  normalizeRuleItem,
  normalizeRulePayload,
  validateRuleItems,
  hasDuplicateItemCodes,
} from "../../../utils/gradingRuleUtils";

import "./gradingRulePage.css";

// ============================================================
// Helpers
// ============================================================

const getErrorMessage = (
  error,
  fallback = "Có lỗi xảy ra. Vui lòng thử lại.",
) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

// ============================================================
// Page
// ============================================================

const GradingRulePage = () => {
  const [rule, setRule] = useState(null);
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [itemModalOpen, setItemModalOpen] = useState(false);

  const [editingItem, setEditingItem] = useState(null);

  const [itemSaving, setItemSaving] = useState(false);

  const formRef = useRef(null);

  // ----------------------------------------------------------
  // Load
  // ----------------------------------------------------------

  const loadRule = useCallback(
    async ({ showLoading = true, showMessage = false } = {}) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        const response = await resultApi.getGradingRule();

        const data = response?.data ?? response ?? null;

        if (!data) {
          setRule(null);
          setItems([]);
          return;
        }

        const normalized = normalizeRule(data);

        setRule(normalized);
        setItems(normalized.items || []);

        if (showMessage) {
          message.success("Đã tải lại quy tắc tính điểm.");
        }
      } catch (error) {
        console.error("loadGradingRule:", error);

        message.error(
          getErrorMessage(error, "Không thể tải quy tắc tính điểm."),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadRule();
  }, [loadRule]);

  // ----------------------------------------------------------
  // Refresh
  // ----------------------------------------------------------

  const handleRefresh = async () => {
    setRefreshing(true);

    await loadRule({
      showLoading: false,
      showMessage: true,
    });
  };

  // ----------------------------------------------------------
  // Save
  // ----------------------------------------------------------

  const handleSave = async (values) => {
    const normalizedItems = items.map((item, index) =>
      normalizeRuleItem(item, index),
    );

    const validationErrors = validateRuleItems(normalizedItems);

    if (validationErrors.length) {
      message.error(validationErrors[0]);
      return;
    }

    if (hasDuplicateItemCodes(normalizedItems)) {
      message.error("Mã thành phần điểm không được trùng nhau.");
      return;
    }

    const payload = normalizeRulePayload(values, normalizedItems);

    try {
      setSaving(true);

      if (rule?.id) {
        await resultApi.updateGradingRule(rule.id, payload);

        message.success("Đã cập nhật quy tắc tính điểm.");
      } else {
        await resultApi.createGradingRule(payload);

        message.success("Đã tạo quy tắc tính điểm.");
      }

      await loadRule({
        showLoading: false,
      });
    } catch (error) {
      console.error("saveGradingRule:", error);

      message.error(getErrorMessage(error, "Không thể lưu quy tắc tính điểm."));
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------------------------
  // Delete rule
  // ----------------------------------------------------------

  const handleDelete = async () => {
    if (!rule?.id) {
      return;
    }

    try {
      setSaving(true);

      await resultApi.deleteGradingRule(rule.id);

      message.success("Đã xóa quy tắc tính điểm.");

      setRule(null);
      setItems([]);

      formRef.current?.reset?.();
    } catch (error) {
      console.error("deleteGradingRule:", error);

      message.error(getErrorMessage(error, "Không thể xóa quy tắc tính điểm."));
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------------------------
  // Items
  // ----------------------------------------------------------

  const handleOpenAddItem = () => {
    setEditingItem(null);
    setItemModalOpen(true);
  };

  const handleOpenEditItem = (item) => {
    setEditingItem(normalizeRuleItem(item));

    setItemModalOpen(true);
  };

  const handleCloseItemModal = () => {
    if (itemSaving) {
      return;
    }

    setItemModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmitItem = async (values) => {
    try {
      setItemSaving(true);

      const normalizedItem = normalizeRuleItem(
        values,
        editingItem ? editingItem.sort_order : items.length,
      );

      const nextItems = [...items];

      if (editingItem?.id) {
        const index = nextItems.findIndex((item) => item.id === editingItem.id);

        if (index !== -1) {
          nextItems[index] = normalizeRuleItem(
            {
              ...nextItems[index],
              ...normalizedItem,
              id: editingItem.id,
            },
            index,
          );
        }
      } else {
        nextItems.push(
          normalizeRuleItem(
            {
              ...normalizedItem,
              sort_order: nextItems.length,
            },
            nextItems.length,
          ),
        );
      }

      const duplicateCodes = hasDuplicateItemCodes(nextItems);

      if (duplicateCodes) {
        const validationErrors = validateRuleItems(nextItems);

        if (validationErrors.length) {
          message.error(validationErrors[0]);
          return;
        }
      }

      setItems(
        nextItems.map((item, index) =>
          normalizeRuleItem(
            {
              ...item,
              sort_order: index,
            },
            index,
          ),
        ),
      );

      setItemModalOpen(false);
      setEditingItem(null);

      message.success(
        editingItem
          ? "Đã cập nhật thành phần điểm."
          : "Đã thêm thành phần điểm.",
      );
    } catch (error) {
      console.error("submitRuleItem:", error);

      message.error(getErrorMessage(error, "Không thể xử lý thành phần điểm."));
    } finally {
      setItemSaving(false);
    }
  };

  const handleDeleteItem = (item) => {
    const nextItems = items.filter((current) => {
      if (item.id && current.id) {
        return current.id !== item.id;
      }

      return current.code !== item.code;
    });

    setItems(
      nextItems.map((current, index) =>
        normalizeRuleItem(
          {
            ...current,
            sort_order: index,
          },
          index,
        ),
      ),
    );

    message.success("Đã xóa thành phần điểm.");
  };

  const handleItemsChange = (nextItems) => {
    setItems(
      nextItems.map((item, index) =>
        normalizeRuleItem(
          {
            ...item,
            sort_order: index,
          },
          index,
        ),
      ),
    );
  };

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  if (loading) {
    return (
      <div className="grading-rule-page-loading">
        <Spin size="large" />
        <span>Đang tải quy tắc tính điểm...</span>
      </div>
    );
  }

  return (
    <div className="grading-rule-page">
      <GradingRuleHeader
        rule={rule}
        saving={saving}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onSave={() => formRef.current?.submit?.()}
        onDelete={handleDelete}
      />

      <GradingRuleOverview rule={rule} itemCount={items.length} />

      <GradingRuleForm
        ref={formRef}
        rule={rule}
        saving={saving}
        onSave={handleSave}
      />

      <GradingRuleItems
        items={items}
        disabled={saving}
        onChange={handleItemsChange}
        onAdd={handleOpenAddItem}
        onEdit={handleOpenEditItem}
        onDelete={handleDeleteItem}
      />

      <GradingRulePreview rule={rule} items={items} />

      <GradingRuleItemModal
        open={itemModalOpen}
        loading={itemSaving}
        editingItem={editingItem}
        existingItems={items}
        onCancel={handleCloseItemModal}
        onSubmit={handleSubmitItem}
      />
    </div>
  );
};

export default GradingRulePage;
