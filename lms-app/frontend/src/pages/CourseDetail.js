import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Rating,
} from '@mui/material';
import {
  AccessTime,
  School,
  Person,
  Category,
  CheckCircle,
} from '@mui/icons-material';
import { fetchCourseById, enrollInCourse } from '../features/slices/courseSlice';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentCourse, loading } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);

  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    dispatch(fetchCourseById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (currentCourse && user) {
      setIsEnrolled(currentCourse.enrolledStudents.includes(user._id));
    }
  }, [currentCourse, user]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    await dispatch(enrollInCourse(id));
    setIsEnrolled(true);
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!currentCourse) {
    return (
      <Container>
        <Typography>Course not found</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardMedia
                component="img"
                height="400"
                image={currentCourse.thumbnail || 'https://via.placeholder.com/800x400'}
                alt={currentCourse.title}
              />
              <CardContent>
                <Typography variant="h4" component="h1" gutterBottom>
                  {currentCourse.title}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Rating value={currentCourse.rating || 0} readOnly />
                  <Typography variant="body2" color="text.secondary">
                    ({currentCourse.reviews?.length || 0} reviews)
                  </Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  {currentCourse.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    icon={<School />}
                    label={currentCourse.level}
                    color={
                      currentCourse.level === 'beginner'
                        ? 'success'
                        : currentCourse.level === 'intermediate'
                        ? 'warning'
                        : 'error'
                    }
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    icon={<Category />}
                    label={currentCourse.category}
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    icon={<AccessTime />}
                    label={`${currentCourse.duration} minutes`}
                  />
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  What you'll learn
                </Typography>
                <List>
                  {currentCourse.learningObjectives?.map((objective, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText primary={objective} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Course Details
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText
                      primary="Instructor"
                      secondary={currentCourse.instructor?.name}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <School />
                    </ListItemIcon>
                    <ListItemText
                      primary="Level"
                      secondary={currentCourse.level}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AccessTime />
                    </ListItemIcon>
                    <ListItemText
                      primary="Duration"
                      secondary={`${currentCourse.duration} minutes`}
                    />
                  </ListItem>
                </List>
                <Box sx={{ mt: 2 }}>
                  {currentCourse.price > 0 ? (
                    <Typography variant="h4" color="primary" gutterBottom>
                      ${currentCourse.price}
                    </Typography>
                  ) : (
                    <Typography variant="h4" color="success.main" gutterBottom>
                      Free
                    </Typography>
                  )}
                  {!isEnrolled && (
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handleEnroll}
                    >
                      {currentCourse.price > 0 ? 'Enroll Now' : 'Start Learning'}
                    </Button>
                  )}
                  {isEnrolled && (
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      onClick={() => navigate(`/courses/${id}/learn`)}
                    >
                      Continue Learning
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default CourseDetail; 