import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/",
});
const token = localStorage.getItem("accessToken");
export const login = async (credentials) => {
  const response = await API.post("auth/login/", credentials);
  return response.data;
};

export const getreports = async () => {
  if (!token) throw new Error("No access token found");
  const response = await API.get("student/reports/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getcurrentuser = async () => {
  if (!token) throw new Error("No access token found");
  const response = await API.get("auth/get-user/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateUserProfile = async (userData) => {
  const formData = new FormData();

  // Append all user data to FormData
  Object.keys(userData).forEach((key) => {
    if (userData[key] !== null && userData[key] !== undefined) {
      formData.append(key, userData[key]);
    }
  });

  const response = await API.put("/auth/profile/update/", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const analyzeCv = async (cvFile) => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("No access token found");
  
  const formData = new FormData();
  formData.append('cv_file', cvFile);
  
  const response = await API.post('student/cv/analyze/', formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const changePassword = async (passwordData) => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("No access token found");
  const response = await API.post("/auth/password/change/", passwordData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const createInternship = async (internshipData) => {
  const formData = new FormData();

  Object.keys(internshipData).forEach((key) => {
    if (internshipData[key] !== null && internshipData[key] !== undefined) {
      formData.append(key, internshipData[key]);
    }
  });

  const response = await API.post("/internship/create/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getMyInternships = async () => {
  const response = await API.get("/internship/my-internships/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getInternshipDetail = async (id) => {
  const response = await API.get(`/internship/${id}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getTeachersList = async () => {
  const response = await API.get("/internship/teachers/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const sendTeacherInvitation = async (invitationData) => {
  const response = await API.post("/internship/invite/", invitationData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getMyInvitations = async () => {
  const response = await API.get("/internship/invitations/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const respondToInvitation = async (invitationId, status) => {
  const response = await API.patch(
    `/internship/invitation/${invitationId}/respond/`,
    { status },
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const getPendingInternships = async () => {
  const response = await API.get("/internship/admin/pending/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const approveInternship = async (internshipId) => {
  const response = await API.patch(
    `/internship/admin/${internshipId}/approve/`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const rejectInternship = async (internshipId, reason = "") => {
  const response = await API.patch(
    `/internship/admin/${internshipId}/reject/`,
    { reason },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const getTeacherInvitations = async () => {
  const response = await API.get("/internship/teacher/invitations/", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const getUserDetail = async (userId) => {
  const response = await API.get(`/administrator/users/${userId}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const createUser = async (userData) => {
  const formData = new FormData();

  Object.keys(userData).forEach((key) => {
    if (
      userData[key] !== null &&
      userData[key] !== undefined &&
      userData[key] !== ""
    ) {
      formData.append(key, userData[key]);
    }
  });

  const response = await API.post("/administrator/users/create/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const formData = new FormData();

  Object.keys(userData).forEach((key) => {
    if (
      userData[key] !== null &&
      userData[key] !== undefined &&
      userData[key] !== ""
    ) {
      if (key === "profile_picture" && userData[key] instanceof File) {
        formData.append(key, userData[key]);
      } else if (key !== "profile_picture") {
        formData.append(key, userData[key]);
      }
    }
  });

  const response = await API.patch(
    `/administrator/users/${userId}/update/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await API.delete(`/administrator/users/${userId}/delete/`,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
  return response.data;
};

export const resetUserPassword = async (userId, passwordData) => {
  const response = await API.post(
    `/administrator/users/${userId}/reset-password/`,
    passwordData,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const getAllRoles = async () => {
  const response = await API.get("/administrator/roles/",
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  return response.data;
};

export const getUserStats = async () => {
  const response = await API.get("/administrator/stats/",
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  return response.data;
};

export const getAllUsers = async (params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.role) queryParams.append("role", params.role);
  if (params.search) queryParams.append("search", params.search);
  if (params.is_active !== undefined)
    queryParams.append("is_active", params.is_active);

  const queryString = queryParams.toString();
  const url = `/administrator/users/${queryString ? `?${queryString}` : ""}`;

  const response = await API.get(url,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  return response.data;
};


// Report Management APIs
export const createReport = async (reportData) => {
  const isForm = reportData instanceof FormData;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": isForm ? "multipart/form-data" : "application/json",
  };

  const response = await API.post("/report/reports/create/", reportData, {
    headers,
  });
  return response.data;
};

export const getMyReports = async () => {
  const token = localStorage.getItem("accessToken");
  const response = await API.get("/report/reports/my-reports/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getReportDetail = async (reportId) => {
  const response = await API.get(`/report/reports/${reportId}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const deleteReport = async (reportId) => {
  const token = localStorage.getItem("accessToken");
  const response = await API.delete(`/report/reports/${reportId}/delete/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const uploadReportVersion = async (reportId, file) => {

  const formData = new FormData();
  formData.append("file", file);

  const response = await API.post(
    `/report/reports/${reportId}/upload-version/`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const submitVersionForReview = async (versionId) => {
  const response = await API.post(
    "/report/reports/versions/submit/",
    { version_id: versionId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Teacher Review APIs
export const getPendingVersions = async () => {
  const response = await API.get("/report/reports/versions/pending/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const reviewVersion = async (versionId, action, isFinal = false, comment = "") => {

  const response = await API.post(
    `/report/reports/versions/${versionId}/review/`,
    {
      action,
      is_final: isFinal,
      comment,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const addComment = async (versionId, commentData) => {
  const isForm = commentData instanceof FormData;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": isForm ? "multipart/form-data" : "application/json",
  };

  const response = await API.post(
    `/report/reports/versions/${versionId}/comment/`,
    commentData,
    {
      headers,
    }
  );
  return response.data;
};

export const resolveComment = async (commentId) => {
  const response = await API.post(
    `/report/reports/comments/${commentId}/resolve/`,
    {},

    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const assignFinalGrade = async (reportId, finalGrade) => {
  const response = await API.post(
    `/report/reports/${reportId}/assign-grade/`,
    {
      final_grade: finalGrade,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};
export const activationAccount = async (token) => {
  const response = await API.get(`/auth/activate/${token}/`);
  return response.data;
};

export const getSoutenances = async () => {
  const response = await API.get("/internship/soutenances/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getSoutenanceCandidates = async () => {
  const response = await API.get("/internship/soutenances/candidates/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Notification APIs
export const getNotifications = async () => {
  const response = await API.get("/internship/notifications/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const markNotificationRead = async (id) => {
  const response = await API.patch(`/internship/notifications/${id}/read/`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await API.post("/internship/notifications/read-all/", {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createSoutenance = async (data) => {
  const response = await API.post("/internship/soutenances/", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateSoutenance = async (id, data) => {
  const response = await API.put(`/internship/soutenances/${id}/`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteSoutenance = async (id) => {
  const response = await API.delete(`/internship/soutenances/${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ==================== ROOM MANAGEMENT ====================

export const getAvailableRooms = async () => {
  const response = await API.get("/administrator/rooms/available/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getRooms = async () => {
  const response = await API.get("/administrator/rooms/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createRoom = async (data) => {
  const response = await API.post("/administrator/rooms/create/", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateRoom = async (id, data) => {
  const response = await API.put(`/administrator/rooms/${id}/update/`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteRoom = async (id) => {
  const response = await API.delete(`/administrator/rooms/${id}/delete/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ==================== ADMIN STATISTICS ====================

export const getAdminStatistics = async () => {
  const response = await API.get("/administrator/statistics/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ==================== COMPANY INTERNSHIP OFFERS ====================

// Company: Get all my offers
export const getCompanyOffers = async () => {
  const token = localStorage.getItem("accessToken");
  const response = await API.get("/internship/offers/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Company: Create new offer
export const createInternshipOffer = async (offerData) => {
  const token = localStorage.getItem("accessToken");
  const formData = new FormData();
  Object.keys(offerData).forEach((key) => {
    if (offerData[key] !== null && offerData[key] !== undefined) {
      formData.append(key, offerData[key]);
    }
  });
  const response = await API.post("/internship/offers/", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Company: Update offer
export const updateInternshipOffer = async (offerId, offerData) => {
  const token = localStorage.getItem("accessToken");
  const response = await API.put(`/internship/offers/${offerId}/`, offerData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

// Company: Delete offer
export const deleteInternshipOffer = async (offerId) => {
  const token = localStorage.getItem("accessToken");
  const response = await API.delete(`/internship/offers/${offerId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Company: Get applications for an offer
export const getOfferApplications = async (offerId) => {
  const token = localStorage.getItem("accessToken");
  const url = offerId 
    ? `/internship/offers/${offerId}/applications/` 
    : "/internship/offers/all-applications/";
  const response = await API.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Company: Review application (approve/reject)
export const reviewApplication = async (applicationId, status, feedback = "") => {
  const token = localStorage.getItem("accessToken");
  const response = await API.post(
    `/internship/applications/${applicationId}/review/`,
    { status, feedback },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Company: Make final decision after interview (accept/reject)
export const interviewDecision = async (applicationId, status, interviewNotes = "", feedback = "") => {
  const token = localStorage.getItem("accessToken");
  const response = await API.post(
    `/internship/applications/${applicationId}/decision/`,
    { status, interview_notes: interviewNotes, feedback },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// ==================== INTERVIEW SLOTS ====================

// Company: Get interview slots for an offer
export const getInterviewSlots = async (offerId) => {
  const token = localStorage.getItem("accessToken");
  const response = await API.get(`/internship/offers/${offerId}/slots/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Company: Create interview slot
export const createInterviewSlot = async (offerId, slotData) => {
  const token = localStorage.getItem("accessToken");
  const response = await API.post(
    `/internship/offers/${offerId}/slots/`,
    slotData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Company: Delete interview slot
export const deleteInterviewSlot = async (slotId) => {
  const token = localStorage.getItem("accessToken");
  const response = await API.delete(`/internship/slots/${slotId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Student: Select interview time slot
export const selectInterviewSlot = async (applicationId, slotId) => {
  const token = localStorage.getItem("accessToken");
  const response = await API.post(
    `/internship/applications/${applicationId}/select-slot/`,
    { slot_id: slotId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// ==================== STUDENT BROWSE & APPLY ====================

// Student: Browse available offers
export const browseInternshipOffers = async (filters = {}) => {
  const token = localStorage.getItem("accessToken");
  const params = new URLSearchParams(filters).toString();
  const url = params ? `/internship/browse/?${params}` : "/internship/browse/";
  const response = await API.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Student: Apply to an offer
export const applyToOffer = async (applicationData) => {
  const token = localStorage.getItem("accessToken");
  const formData = new FormData();
  Object.keys(applicationData).forEach((key) => {
    if (applicationData[key] !== null && applicationData[key] !== undefined) {
      formData.append(key, applicationData[key]);
    }
  });
  const response = await API.post("/internship/apply/", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Student: Get my applications
export const getMyApplications = async () => {
  const token = localStorage.getItem("accessToken");
  const response = await API.get("/internship/my-applications/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ==================== ADMIN OFFER MANAGEMENT ====================

// Admin: Get pending offers
export const getAdminPendingOffers = async (status = 0) => {
  const token = localStorage.getItem("accessToken");
  const response = await API.get(`/internship/admin/offers/?status=${status}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Admin: Review offer (approve/reject)
export const adminReviewOffer = async (offerId, status, feedback = "") => {
  const token = localStorage.getItem("accessToken");
  const response = await API.post(
    `/internship/admin/offers/${offerId}/review/`,
    { status, feedback },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};