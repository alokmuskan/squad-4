import { useEffect, useState } from "react";
import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  CAREER_GOAL_KEY,
  type AuthUser,
} from "../types/auth";
import { updateCareerGoal } from "@/services/api";
import { useAuthStore } from "../store/auth-store";

export function useAuth() {
  const { user, login, logout, refreshUser, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        await refreshUser();
      }
      setIsLoading(false);
    };
    init();
  }, [refreshUser]);

  const syncCareerGoal = async () => {
    const savedGoal = localStorage.getItem(CAREER_GOAL_KEY);
    if (savedGoal && localStorage.getItem(AUTH_TOKEN_KEY)) {
      try {
        await updateCareerGoal(savedGoal);
      } catch {
        // non-blocking
      }
    }
  };

  const enhancedLogin = async (token: string, nextUser: AuthUser) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
    await login(token, nextUser);
    await syncCareerGoal();
    await refreshUser();
  };

  return {
    user,
    isAuthenticated: !!user && !!localStorage.getItem(AUTH_TOKEN_KEY),
    isLoading,
    login: enhancedLogin,
    logout,
    refreshUser,
    setUser,
  };
}
