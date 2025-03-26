import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import store from './features/store';

// Layout components
import Layout from './components/layout/Layout';
import PrivateRoute from './components/auth/PrivateRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import Quiz from './pages/Quiz';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import TeacherDashboard from './pages/teacher/Dashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="courses" element={<CourseList />} />
              <Route path="courses/:id" element={<CourseDetail />} />
            </Route>

            {/* Protected routes */}
            <Route path="/dashboard" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="quiz/:id" element={<Quiz />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<PrivateRoute role="admin"><Layout /></PrivateRoute>}>
              <Route index element={<AdminDashboard />} />
            </Route>

            {/* Teacher routes */}
            <Route path="/teacher" element={<PrivateRoute role="teacher"><Layout /></PrivateRoute>}>
              <Route index element={<TeacherDashboard />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
