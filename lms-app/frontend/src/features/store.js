import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import courseReducer from './slices/courseSlice';
import quizReducer from './slices/quizSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer,
    quizzes: quizReducer,
  },
});

export default store; 