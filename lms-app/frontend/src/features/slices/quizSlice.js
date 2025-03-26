import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with auth header
const axiosAuth = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
axiosAuth.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchQuizById = createAsyncThunk(
  'quizzes/fetchQuizById',
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await axiosAuth.get(`/quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createQuiz = createAsyncThunk(
  'quizzes/createQuiz',
  async (quizData, { rejectWithValue }) => {
    try {
      const response = await axiosAuth.post('/quizzes', quizData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const submitQuiz = createAsyncThunk(
  'quizzes/submitQuiz',
  async ({ quizId, answers }, { rejectWithValue }) => {
    try {
      const response = await axiosAuth.post(`/quizzes/${quizId}/submit`, { answers });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchQuizResults = createAsyncThunk(
  'quizzes/fetchResults',
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await axiosAuth.get(`/quizzes/${quizId}/results`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  currentQuiz: null,
  quizResults: [],
  loading: false,
  error: null
};

const quizSlice = createSlice({
  name: 'quizzes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentQuiz: (state) => {
      state.currentQuiz = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Quiz by ID
      .addCase(fetchQuizById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuiz = action.payload;
      })
      .addCase(fetchQuizById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Create Quiz
      .addCase(createQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuiz = action.payload;
      })
      .addCase(createQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Submit Quiz
      .addCase(submitQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitQuiz.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentQuiz) {
          state.currentQuiz.attempts.push({
            student: action.payload.userId,
            score: action.payload.score,
            answers: action.payload.answers,
            completedAt: new Date()
          });
        }
      })
      .addCase(submitQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Fetch Quiz Results
      .addCase(fetchQuizResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizResults.fulfilled, (state, action) => {
        state.loading = false;
        state.quizResults = action.payload;
      })
      .addCase(fetchQuizResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });
  }
});

export const { clearError, clearCurrentQuiz } = quizSlice.actions;
export default quizSlice.reducer; 