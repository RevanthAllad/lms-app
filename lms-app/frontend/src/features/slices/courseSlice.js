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

export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/courses`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchCourseById = createAsyncThunk(
  'courses/fetchCourseById',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/courses/${courseId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createCourse = createAsyncThunk(
  'courses/createCourse',
  async (courseData, { rejectWithValue }) => {
    try {
      const response = await axiosAuth.post('/courses', courseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const enrollInCourse = createAsyncThunk(
  'courses/enrollInCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await axiosAuth.post(`/courses/${courseId}/enroll`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateCourseProgress = createAsyncThunk(
  'courses/updateProgress',
  async ({ courseId, moduleId, completed }, { rejectWithValue }) => {
    try {
      const response = await axiosAuth.post(`/courses/${courseId}/progress`, {
        moduleId,
        completed
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  courses: [],
  currentCourse: null,
  enrolledCourses: [],
  loading: false,
  error: null
};

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Courses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Fetch Course by ID
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Create Course
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses.push(action.payload);
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Enroll in Course
      .addCase(enrollInCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(enrollInCourse.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentCourse) {
          state.currentCourse.enrolledStudents.push({
            student: action.payload.userId
          });
        }
      })
      .addCase(enrollInCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Update Course Progress
      .addCase(updateCourseProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourseProgress.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentCourse) {
          const studentProgress = state.currentCourse.enrolledStudents.find(
            student => student.student === action.payload.userId
          );
          if (studentProgress) {
            studentProgress.progress = action.payload;
          }
        }
      })
      .addCase(updateCourseProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });
  }
});

export const { clearError } = courseSlice.actions;
export default courseSlice.reducer; 