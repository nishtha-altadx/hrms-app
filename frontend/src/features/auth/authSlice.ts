import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import type { LoginFormValues, SignupFormValues } from "@/lib/validation/auth";

export interface AuthUser {
  id: string;
  email: string;
  role: "admin" | "supervisor" | "employee";
  isActive: boolean;
}

interface AuthState {
  user: AuthUser | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
};

function extractErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    if (Array.isArray(data?.message)) return data.message[0];
    if (typeof data?.message === "string") return data.message;
  }
  return fallback;
}

export const signup = createAsyncThunk(
  "auth/signup",
  async (data: SignupFormValues, { rejectWithValue }) => {
    try {
      const res = await api.post<AuthUser>("/auth/signup", data);
      return res.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Signup failed"));
    }
  },
);

export const login = createAsyncThunk(
  "auth/login",
  async (data: LoginFormValues, { rejectWithValue }) => {
    try {
      const res = await api.post<{ user: AuthUser }>("/auth/login", data);
      return res.data.user;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Invalid email or password"));
    }
  },
);

export const fetchMe = createAsyncThunk("auth/fetchMe", async (_: void, { rejectWithValue }) => {
  try {
    const res = await api.get<{ user: AuthUser }>("/auth/me");
    return res.data.user;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, "Not authenticated"));
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  await api.post("/auth/logout");
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "unauthenticated";
        state.user = null;
        state.error = action.payload as string;
      })
      .addCase(fetchMe.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.user = action.payload;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.status = "unauthenticated";
        state.user = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = "unauthenticated";
        state.user = null;
      })
      .addCase(signup.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signup.fulfilled, (state) => {
        state.status = "unauthenticated";
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = "unauthenticated";
        state.error = action.payload as string;
      });
  },
});

export default authSlice.reducer;
