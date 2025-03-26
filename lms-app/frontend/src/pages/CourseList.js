import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  MenuItem,
  Box,
  Chip,
  Button,
} from '@mui/material';
import { fetchCourses } from '../features/slices/courseSlice';

const CourseList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courses, loading } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState('all');

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const categories = ['all', 'programming', 'design', 'business', 'marketing'];
  const levels = ['all', 'beginner', 'intermediate', 'advanced'];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      category === 'all' || course.category.toLowerCase() === category;
    const matchesLevel = level === 'all' || course.level === level;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Available Courses
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search courses"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((option) => (
                <MenuItem key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              {levels.map((option) => (
                <MenuItem key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        {user?.role === 'teacher' && (
          <Box sx={{ mb: 4 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/teacher/courses/new')}
            >
              Create New Course
            </Button>
          </Box>
        )}

        <Grid container spacing={4}>
          {filteredCourses.map((course) => (
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
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={course.level}
                      color={
                        course.level === 'beginner'
                          ? 'success'
                          : course.level === 'intermediate'
                          ? 'warning'
                          : 'error'
                      }
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={course.category}
                      color="primary"
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Instructor: {course.instructor?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Duration: {course.duration} minutes
                  </Typography>
                  {course.price > 0 && (
                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                      ${course.price}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredCourses.length === 0 && (
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No courses found matching your criteria
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default CourseList; 