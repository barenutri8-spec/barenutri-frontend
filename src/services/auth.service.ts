import { fetcher } from "@/lib/api";
import type { User, ApiResponse } from "@/types";

export const authService = {
  login: (email: string, password: string) =>
    fetcher<ApiResponse<{ user: User; token: string }>>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    fetcher<ApiResponse<{ user: User; token: string }>>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  me: () => fetcher<ApiResponse<User>>("/auth/me"),
};
