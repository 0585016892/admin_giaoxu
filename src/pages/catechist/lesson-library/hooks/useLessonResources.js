import { useCallback, useRef, useState } from "react";

import {
  getLessonResources,
  getQuestionsByLesson,
  uploadLessonResource,
  deleteLessonResource,
} from "../../../../api/lessonApi";

import { getArrayData, getDefaultUploadData } from "../utils/lessonHelpers";

import { isHttpUrl, normalizeUrl } from "../utils/resourceHelpers";

const useLessonResources = (notify) => {
  const [resources, setResources] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [resourceLoading, setResourceLoading] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const notifyRef = useRef(notify);
  notifyRef.current = notify;

  // =====================================================
  // LOAD RESOURCES + QUESTIONS
  // =====================================================
  const loadResources = useCallback(async (lessonId) => {
    if (!lessonId) {
      setResources([]);
      setQuestions([]);
      return;
    }

    try {
      setResourceLoading(true);
      setQuestionLoading(true);

      const [resourceResponse, questionResponse] = await Promise.all([
        getLessonResources(lessonId),
        getQuestionsByLesson(lessonId),
      ]);

      const resourceData = getArrayData(resourceResponse?.data?.data, [
        "resources",
      ]);

      const questionData = getArrayData(questionResponse?.data, ["questions"]);

      setResources(resourceData);
      setQuestions(questionData);
    } catch (error) {
      console.error("[LessonResources] Load error:", error);

      setResources([]);
      setQuestions([]);

      notifyRef.current.error(
        error?.response?.data?.message || "Không thể tải dữ liệu bài học",
      );
    } finally {
      setResourceLoading(false);
      setQuestionLoading(false);
    }
  }, []);

  // =====================================================
  // UPLOAD RESOURCE
  // =====================================================
  const handleUpload = useCallback(
    async ({
      selectedLesson,
      uploadData,
      selectedFile,
      setUploadOpen,
      setSelectedFile,
      setUploadData,
    }) => {
      if (!selectedLesson) return false;

      const title = String(uploadData?.title || "").trim();
      const description = String(uploadData?.description || "").trim();
      const externalUrl = normalizeUrl(uploadData?.external_url);

      if (!title) {
        notifyRef.current.warning("Vui lòng nhập tên tài liệu");
        return false;
      }

      if (!selectedFile && !externalUrl) {
        notifyRef.current.warning("Vui lòng chọn file hoặc nhập đường link");
        return false;
      }

      if (selectedFile && externalUrl) {
        notifyRef.current.warning(
          "Vui lòng chỉ chọn file hoặc nhập đường link",
        );
        return false;
      }

      if (externalUrl && !isHttpUrl(externalUrl)) {
        notifyRef.current.error(
          "Đường link không hợp lệ. Vui lòng sử dụng http:// hoặc https://",
        );
        return false;
      }

      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);

      formData.append(
        "resource_category",
        uploadData?.resource_category || "teacher_material",
      );

      formData.append(
        "sort_order",
        String(Number(uploadData?.sort_order || 0)),
      );

      formData.append("visibility", uploadData?.visibility || "public");

      formData.append(
        "is_downloadable",
        externalUrl ? "0" : uploadData?.is_downloadable ? "1" : "0",
      );

      if (externalUrl) {
        formData.append("resource_type", "link");
        formData.append("external_url", externalUrl);
      }

      if (selectedFile) {
        formData.append("resource_type", "file");
        formData.append("file", selectedFile);
      }

      try {
        setUploading(true);

        await uploadLessonResource(selectedLesson.id, formData);

        notifyRef.current.success(
          externalUrl
            ? "Đã thêm đường link thành công"
            : "Tải tài liệu thành công",
        );

        setUploadOpen(false);
        setSelectedFile(null);
        setUploadData(getDefaultUploadData());

        await loadResources(selectedLesson.id);

        return true;
      } catch (error) {
        console.error("[LessonResources] Upload error:", error);

        notifyRef.current.error(
          error?.response?.data?.message || "Không thể thêm tài liệu",
        );

        return false;
      } finally {
        setUploading(false);
      }
    },
    [loadResources],
  );

  // =====================================================
  // DELETE RESOURCE
  // =====================================================
  const handleDelete = useCallback(
    async (resource, selectedLesson) => {
      if (!resource?.id || !selectedLesson?.id) {
        notifyRef.current.warning("Không xác định được tài liệu cần xóa");

        return false;
      }

      try {
        await deleteLessonResource(resource.id);

        notifyRef.current.success("Đã xóa tài liệu");

        await loadResources(selectedLesson.id);

        return true;
      } catch (error) {
        console.error("[LessonResources] Delete error:", error);

        notifyRef.current.error(
          error?.response?.data?.message || "Không thể xóa tài liệu",
        );

        return false;
      }
    },
    [loadResources],
  );

  // =====================================================
  // RESET DATA
  // =====================================================
  const resetResources = useCallback(() => {
    setResources([]);
    setQuestions([]);
  }, []);

  return {
    resources,
    setResources,

    questions,
    setQuestions,

    resourceLoading,
    questionLoading,
    uploading,

    loadResources,
    handleUpload,
    handleDelete,
    resetResources,
  };
};

export default useLessonResources;
