import axios from "axios";
import { getSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let activeSkillId: number | null = null;

export function setApiSkillId(skillId: number | null) {
  activeSkillId = skillId;
}

api.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      const session = await getSession();
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    }
    if (activeSkillId != null) {
      config.params = { skillId: activeSkillId, ...(config.params || {}) };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
