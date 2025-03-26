import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Paper,
} from '@mui/material';
import { fetchCourses } from '../features/slices/courseSlice';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courses, loading } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const featuredCourses = courses.slice(0, 3);

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to Learning Management System
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          {user
            ? `Welcome back, ${user.name}!`
            : 'Start your learning journey today'}
        </Typography>
        {!user && (
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ mr: 2 }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </Box>
        )}
      </Box>

      <Typography variant="h4" component="h2" gutterBottom>
        Featured Courses
      </Typography>
      <Grid container spacing={4}>
        {featuredCourses.map((course) => (
          <Grid item key={course._id} xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
              }}
              onClick={() => navigate(`/courses/${course._id}`)}
            >
              <CardMedia
                component="img"
                height="140"
                image={course.thumbnail || 'https://via.placeholder.com/300x140'}
                alt={course.title}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h3">
                  {course.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {course.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Instructor: {course.instructor?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Level: {course.level}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Duration: {course.duration} minutes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Why Choose Our Platform?
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Expert Instructors
              </Typography>
              <Typography>
                Learn from industry experts who are passionate about teaching and
                sharing their knowledge.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Flexible Learning
              </Typography>
              <Typography>
                Study at your own pace, anywhere and anytime. Access course
                materials 24/7.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Certificates
              </Typography>
              <Typography>
                Earn certificates upon successful completion of courses to showcase
                your achievements.
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default Home; 