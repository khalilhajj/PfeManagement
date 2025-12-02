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
