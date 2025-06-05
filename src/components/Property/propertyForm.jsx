// src/pages/PropertyForm.jsx

import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Grid,
    MenuItem,
    TextField,
    Typography,
    IconButton,
    Container,
    CircularProgress,
    Paper,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Stack,
    Chip,
    Avatar,
    Fade,
    useTheme,
    alpha
} from '@mui/material';
import { FieldArray, Formik, Form } from 'formik';
import * as Yup from 'yup';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeIcon from '@mui/icons-material/Home';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import FloorplanIcon from '@mui/icons-material/Architecture';
import InfoIcon from '@mui/icons-material/Info';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import TitleIcon from '@mui/icons-material/Title';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import axiosInstance from '../../../axiosInstance.js';
import { useParams, useNavigate } from "react-router-dom";

const initialValues = {
    title: '',
    subtitle: '',
    propertyType: '',
    address: '',
    contactNumber: '',
    propertyDetail: {
        bhk: '',
        sqft: '',
        stutestype: ''
    },
    floorPlan: [
        {
            title: '',
            images: ['']
        }
    ],
    projectGallery: ['']
};

const validationSchema = Yup.object().shape({
    title: Yup.string().required('Required'),
    subtitle: Yup.string(),
    propertyType: Yup.string().required('Required'),
    address: Yup.string().required('Required'),
    contactNumber: Yup.string().required('Required'),
    propertyDetail: Yup.object().shape({
        bhk: Yup.number().required('Required'),
        sqft: Yup.number().required('Required'),
        stutestype: Yup.string().required('Required')
    }),
    floorPlan: Yup.array().of(
        Yup.object().shape({
            title: Yup.string().required('Required'),
            images: Yup.array().of(Yup.string().required('Image URL required'))
        })
    ),
    projectGallery: Yup.array().of(Yup.string().required('Image URL required'))
});

const uploadImage = async (file) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const fakeUrl = URL.createObjectURL(file);
            resolve(fakeUrl);
        }, 1000);
    });
};

const PropertyForm = () => {
    const theme = useTheme();
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formInitialValues, setFormInitialValues] = useState(initialValues);
    const [loadingForm, setLoadingForm] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();

    const fetchPropertyTypes = async () => {
        try {
            const res = await axiosInstance.get('/api/property-types');
            setPropertyTypes(res.data.data || []);
        } catch (err) {
            console.error('Failed to load property types', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPropertyById = async (id) => {
        try {
            const res = await axiosInstance.get(`/api/properties/${id}`);
            const property = res.data;

            setFormInitialValues({
                title: property.title || '',
                subtitle: property.subtitle || '',
                propertyType: property.propertyType?._id || '',
                address: property.address || '',
                contactNumber: property.contactNumber || '',
                propertyDetail: {
                    bhk: property.propertyDetail?.bhk || '',
                    sqft: property.propertyDetail?.sqft || '',
                    stutestype: property.propertyDetail?.stutestype || ''
                },
                floorPlan: property.floorPlan?.length > 0 ? property.floorPlan : [{ title: '', images: [''] }],
                projectGallery: property.projectGallery?.length > 0 ? property.projectGallery : ['']
            });
        } catch (error) {
            console.error('Error fetching property data', error);
        } finally {
            setLoadingForm(false);
        }
    };

    const handleSubmit = async (values, { resetForm }) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();

            // Basic fields
            formData.append('title', values.title || '');
            formData.append('subtitle', values.subtitle || '');
            formData.append('propertyType', values.propertyType || '');
            formData.append('address', values.address || '');
            formData.append('contactNumber', values.contactNumber || '');

            // Property details as JSON string
            const propertyDetail = {
                bhk: values.propertyDetail.bhk || 0,
                sqft: values.propertyDetail.sqft || 0,
                stutestype: values.propertyDetail.stutestype || '',
            };
            formData.append('propertyDetail', JSON.stringify(propertyDetail));

            const floorPlanTitles = values.floorPlan.map(plan => ({
                title: plan.title || ''
            }));
            formData.append('floorPlanTitles', JSON.stringify(floorPlanTitles));

            // Floor Plans
            for (let index = 0; index < values.floorPlan.length; index++) {
                const plan = values.floorPlan[index];
                const imgSrc = plan.images?.[0];

                if (imgSrc) {
                    if (typeof imgSrc === 'string' && imgSrc.startsWith('blob:')) {
                        const blob = await fetch(imgSrc).then(res => res.blob());
                        const file = new File([blob], `floorPlan_${index}.jpg`, { type: blob.type });
                        formData.append(`floorPlan_${index}`, file);
                    } else if (imgSrc instanceof File) {
                        formData.append(`floorPlan_${index}`, imgSrc);
                    }
                }
            }

            // Project gallery (multiple images)
            for (let index = 0; index < (values.projectGallery || []).length; index++) {
                const img = values.projectGallery[index];
                if (typeof img === 'string' && img.startsWith('blob:')) {
                    const blob = await fetch(img).then(res => res.blob());
                    const file = new File([blob], `projectGallery_${index}.jpg`, { type: blob.type });
                    formData.append('projectGallery', file);
                } else if (img instanceof File) {
                    formData.append('projectGallery', img);
                }
            }

            console.log('Submitting FormData:', [...formData.entries()]);

            let response;
            if (isEditMode) {
                response = await axiosInstance.put(`/api/properties/${id}`, formData);
                alert('Property updated successfully');
            } else {
                response = await axiosInstance.post('/api/properties', formData);
                alert('Property added successfully');
            }

            resetForm();
            navigate('/property');

        } catch (err) {
            console.error('Error saving property:', err.response?.data || err.message);
            alert('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        fetchPropertyTypes();
        if (isEditMode) {
            fetchPropertyById(id);
        } else {
            setLoadingForm(false);
        }
    }, [id]);

    if (loading || loadingForm) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="50vh"
            >
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Fade in timeout={800}>
                <Box>
                    {/* Header Section */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            mb: 4,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
                            borderRadius: 3,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                            <Avatar
                                sx={{
                                    bgcolor: theme.palette.primary.main,
                                    width: 56,
                                    height: 56
                                }}
                            >
                                <HomeIcon fontSize="large" />
                            </Avatar>
                            <Box>
                                <Typography
                                    variant="h4"
                                    fontWeight="bold"
                                    color="primary.main"
                                    gutterBottom
                                >
                                    {isEditMode ? 'Edit Property' : 'Add New Property'}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {isEditMode
                                        ? 'Update your property information below'
                                        : 'Fill in the details to create a new property listing'
                                    }
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>

                    <Formik
                        initialValues={formInitialValues}
                        enableReinitialize
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ values, handleChange, setFieldValue, errors, touched }) => (
                            <Form>
                                <Grid container spacing={3}>
                                    {/* Basic Information Card */}
                                    <Grid item xs={12}>
                                        <Card elevation={2} sx={{ borderRadius: 3 }}>
                                            <CardHeader
                                                avatar={
                                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                        <InfoIcon />
                                                    </Avatar>
                                                }
                                                title="Basic Information"
                                                subheader="Essential property details"
                                            />
                                            <Divider />
                                            <CardContent sx={{ p: 3 }}>
                                                <Grid container spacing={3}>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField
                                                            fullWidth
                                                            label="Property Title"
                                                            name="title"
                                                            value={values.title}
                                                            onChange={handleChange}
                                                            error={touched.title && !!errors.title}
                                                            helperText={touched.title && errors.title}
                                                            InputProps={{
                                                                startAdornment: <TitleIcon sx={{ mr: 1, color: 'action.active' }} />
                                                            }}
                                                            variant="outlined"
                                                        />
                                                    </Grid>

                                                    <Grid item xs={12} md={6}>
                                                        <TextField
                                                            fullWidth
                                                            label="Subtitle"
                                                            name="subtitle"
                                                            value={values.subtitle}
                                                            onChange={handleChange}
                                                            variant="outlined"
                                                        />
                                                    </Grid>

                                                    <Grid item xs={12} md={6}>
                                                        <TextField
                                                            select
                                                            fullWidth
                                                            label="Property Type"
                                                            name="propertyType"
                                                            value={values.propertyType}
                                                            onChange={handleChange}
                                                            error={touched.propertyType && !!errors.propertyType}
                                                            helperText={touched.propertyType && errors.propertyType}
                                                            variant="outlined"
                                                        >
                                                            {propertyTypes?.map((type) => (
                                                                <MenuItem key={type._id} value={type._id}>
                                                                    {type.name}
                                                                </MenuItem>
                                                            ))}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item xs={12} md={6}>
                                                        <TextField
                                                            fullWidth
                                                            label="Contact Number"
                                                            name="contactNumber"
                                                            value={values.contactNumber}
                                                            onChange={handleChange}
                                                            error={touched.contactNumber && !!errors.contactNumber}
                                                            helperText={touched.contactNumber && errors.contactNumber}
                                                            InputProps={{
                                                                startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />
                                                            }}
                                                            variant="outlined"
                                                        />
                                                    </Grid>

                                                    <Grid item xs={12}>
                                                        <TextField
                                                            fullWidth
                                                            label="Address"
                                                            name="address"
                                                            value={values.address}
                                                            onChange={handleChange}
                                                            error={touched.address && !!errors.address}
                                                            helperText={touched.address && errors.address}
                                                            multiline
                                                            rows={2}
                                                            InputProps={{
                                                                startAdornment: <LocationOnIcon sx={{ mr: 1, color: 'action.active', alignSelf: 'flex-start', mt: 1 }} />
                                                            }}
                                                            variant="outlined"
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {/* Property Details Card */}
                                    <Grid item xs={12}>
                                        <Card elevation={2} sx={{ borderRadius: 3 }}>
                                            <CardHeader
                                                avatar={
                                                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                                        <HomeIcon />
                                                    </Avatar>
                                                }
                                                title="Property Details"
                                                subheader="Specifications and features"
                                            />
                                            <Divider />
                                            <CardContent sx={{ p: 3 }}>
                                                <Grid container spacing={3}>
                                                    <Grid item xs={12} sm={4}>
                                                        <TextField
                                                            fullWidth
                                                            label="BHK"
                                                            name="propertyDetail.bhk"
                                                            value={values.propertyDetail.bhk}
                                                            onChange={handleChange}
                                                            type="number"
                                                            variant="outlined"
                                                            error={touched.propertyDetail?.bhk && !!errors.propertyDetail?.bhk}
                                                            helperText={touched.propertyDetail?.bhk && errors.propertyDetail?.bhk}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={4}>
                                                        <TextField
                                                            fullWidth
                                                            label="Square Feet"
                                                            name="propertyDetail.sqft"
                                                            value={values.propertyDetail.sqft}
                                                            onChange={handleChange}
                                                            type="number"
                                                            variant="outlined"
                                                            error={touched.propertyDetail?.sqft && !!errors.propertyDetail?.sqft}
                                                            helperText={touched.propertyDetail?.sqft && errors.propertyDetail?.sqft}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={4}>
                                                        <TextField
                                                            fullWidth
                                                            label="Status Type"
                                                            name="propertyDetail.stutestype"
                                                            value={values.propertyDetail.stutestype}
                                                            onChange={handleChange}
                                                            variant="outlined"
                                                            error={touched.propertyDetail?.stutestype && !!errors.propertyDetail?.stutestype}
                                                            helperText={touched.propertyDetail?.stutestype && errors.propertyDetail?.stutestype}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {/* Floor Plans Card */}
                                    <Grid item xs={12}>
                                        <Card elevation={2} sx={{ borderRadius: 3 }}>
                                            <CardHeader
                                                avatar={
                                                    <Avatar sx={{ bgcolor: 'info.main' }}>
                                                        <FloorplanIcon />
                                                    </Avatar>
                                                }
                                                title="Floor Plans"
                                                subheader="Upload floor plan images"
                                                action={
                                                    <Chip
                                                        label={`${values.floorPlan.length} Plan${values.floorPlan.length !== 1 ? 's' : ''}`}
                                                        color="info"
                                                        size="small"
                                                    />
                                                }
                                            />
                                            <Divider />
                                            <CardContent sx={{ p: 3 }}>
                                                <FieldArray name="floorPlan">
                                                    {({ push, remove }) => (
                                                        <Stack spacing={3}>
                                                            {values?.floorPlan?.map((plan, index) => (
                                                                <Paper
                                                                    key={index}
                                                                    elevation={1}
                                                                    sx={{
                                                                        p: 3,
                                                                        borderRadius: 2,
                                                                        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                                                                    }}
                                                                >
                                                                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                                                        <Typography variant="h6" color="primary">
                                                                            Floor Plan {index + 1}
                                                                        </Typography>
                                                                        {values.floorPlan.length > 1 && (
                                                                            <IconButton
                                                                                onClick={() => remove(index)}
                                                                                color="error"
                                                                                size="small"
                                                                            >
                                                                                <DeleteIcon />
                                                                            </IconButton>
                                                                        )}
                                                                    </Stack>

                                                                    <Grid container spacing={2}>
                                                                        <Grid item xs={12} md={6}>
                                                                            <TextField
                                                                                fullWidth
                                                                                label="Floor Title"
                                                                                name={`floorPlan[${index}].title`}
                                                                                value={plan.title}
                                                                                onChange={handleChange}
                                                                                variant="outlined"
                                                                            />
                                                                        </Grid>
                                                                        <Grid item xs={12} md={6}>
                                                                            <Box
                                                                                sx={{
                                                                                    border: `2px dashed ${theme.palette.divider}`,
                                                                                    borderRadius: 2,
                                                                                    p: 2,
                                                                                    textAlign: 'center',
                                                                                    cursor: 'pointer',
                                                                                    '&:hover': {
                                                                                        borderColor: theme.palette.primary.main,
                                                                                        bgcolor: alpha(theme.palette.primary.main, 0.04)
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <input
                                                                                    type="file"
                                                                                    accept="image/*"
                                                                                    style={{ display: 'none' }}
                                                                                    id={`floor-plan-${index}`}
                                                                                    onChange={async (e) => {
                                                                                        const file = e.target.files[0];
                                                                                        if (file) {
                                                                                            const url = await uploadImage(file);
                                                                                            const updatedImages = [...plan.images];
                                                                                            updatedImages[0] = url;
                                                                                            setFieldValue(`floorPlan[${index}].images`, updatedImages);
                                                                                        }
                                                                                    }}
                                                                                />
                                                                                <label htmlFor={`floor-plan-${index}`}>
                                                                                    <Stack alignItems="center" spacing={1}>
                                                                                        <CloudUploadIcon color="primary" fontSize="large" />
                                                                                        <Typography variant="body2" color="text.secondary">
                                                                                            Click to upload floor plan
                                                                                        </Typography>
                                                                                    </Stack>
                                                                                </label>
                                                                            </Box>
                                                                            {plan.images[0] && (
                                                                                <Box mt={2}>
                                                                                    <img
                                                                                        src={plan.images[0]}
                                                                                        alt="floor plan"
                                                                                        style={{
                                                                                            width: '100%',
                                                                                            maxWidth: 200,
                                                                                            height: 'auto',
                                                                                            borderRadius: 8
                                                                                        }}
                                                                                    />
                                                                                </Box>
                                                                            )}
                                                                        </Grid>
                                                                    </Grid>
                                                                </Paper>
                                                            ))}

                                                            <Button
                                                                onClick={() => push({ title: '', images: [''] })}
                                                                startIcon={<AddIcon />}
                                                                variant="outlined"
                                                                size="large"
                                                                sx={{ alignSelf: 'flex-start' }}
                                                            >
                                                                Add Floor Plan
                                                            </Button>
                                                        </Stack>
                                                    )}
                                                </FieldArray>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {/* Project Gallery Card */}
                                    <Grid item xs={12}>
                                        <Card elevation={2} sx={{ borderRadius: 3 }}>
                                            <CardHeader
                                                avatar={
                                                    <Avatar sx={{ bgcolor: 'success.main' }}>
                                                        <PhotoLibraryIcon />
                                                    </Avatar>
                                                }
                                                title="Project Gallery"
                                                subheader="Upload property images"
                                                action={
                                                    <Chip
                                                        label={`${values.projectGallery.length} Image${values.projectGallery.length !== 1 ? 's' : ''}`}
                                                        color="success"
                                                        size="small"
                                                    />
                                                }
                                            />
                                            <Divider />
                                            <CardContent sx={{ p: 3 }}>
                                                <FieldArray name="projectGallery">
                                                    {({ push, remove }) => (
                                                        <Stack spacing={2}>
                                                            <Grid container spacing={2}>
                                                                {values.projectGallery?.map((img, index) => (
                                                                    <Grid item xs={12} sm={6} md={4} key={index}>
                                                                        <Paper
                                                                            elevation={1}
                                                                            sx={{
                                                                                p: 2,
                                                                                borderRadius: 2,
                                                                                position: 'relative'
                                                                            }}
                                                                        >
                                                                            <Box
                                                                                sx={{
                                                                                    border: `2px dashed ${theme.palette.divider}`,
                                                                                    borderRadius: 2,
                                                                                    p: 2,
                                                                                    textAlign: 'center',
                                                                                    cursor: 'pointer',
                                                                                    minHeight: 120,
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    '&:hover': {
                                                                                        borderColor: theme.palette.primary.main,
                                                                                        bgcolor: alpha(theme.palette.primary.main, 0.04)
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <input
                                                                                    type="file"
                                                                                    accept="image/*"
                                                                                    style={{ display: 'none' }}
                                                                                    id={`gallery-${index}`}
                                                                                    onChange={async (e) => {
                                                                                        const file = e.target.files[0];
                                                                                        if (file) {
                                                                                            const url = await uploadImage(file);
                                                                                            const updatedGallery = [...values.projectGallery];
                                                                                            updatedGallery[index] = url;
                                                                                            setFieldValue('projectGallery', updatedGallery);
                                                                                        }
                                                                                    }}
                                                                                />
                                                                                <label htmlFor={`gallery-${index}`}>
                                                                                    {img ? (
                                                                                        <img
                                                                                            src={img}
                                                                                            alt="gallery"
                                                                                            style={{
                                                                                                width: '100%',
                                                                                                height: 120,
                                                                                                objectFit: 'cover',
                                                                                                borderRadius: 8
                                                                                            }}
                                                                                        />
                                                                                    ) : (
                                                                                        <Stack alignItems="center" spacing={1}>
                                                                                            <PhotoLibraryIcon color="primary" />
                                                                                            <Typography variant="caption" color="text.secondary">
                                                                                                Upload Image
                                                                                            </Typography>
                                                                                        </Stack>
                                                                                    )}
                                                                                </label>
                                                                            </Box>

                                                                            {values.projectGallery.length > 1 && (
                                                                                <IconButton
                                                                                    onClick={() => remove(index)}
                                                                                    color="error"
                                                                                    size="small"
                                                                                    sx={{
                                                                                        position: 'absolute',
                                                                                        top: 4,
                                                                                        right: 4,
                                                                                        bgcolor: 'background.paper',
                                                                                        boxShadow: 1
                                                                                    }}
                                                                                >
                                                                                    <DeleteIcon fontSize="small" />
                                                                                </IconButton>
                                                                            )}
                                                                        </Paper>
                                                                    </Grid>
                                                                ))}
                                                            </Grid>

                                                            <Button
                                                                onClick={() => push('')}
                                                                startIcon={<AddIcon />}
                                                                variant="outlined"
                                                                size="large"
                                                                sx={{ alignSelf: 'flex-start' }}
                                                            >
                                                                Add Gallery Image
                                                            </Button>
                                                        </Stack>
                                                    )}
                                                </FieldArray>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {/* Submit Button */}
                                    <Grid item xs={12}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                textAlign: 'center',
                                                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                                                borderRadius: 3
                                            }}
                                        >
                                            <Button
                                                variant="contained"
                                                type="submit"
                                                size="large"
                                                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                                disabled={isSubmitting}
                                                sx={{
                                                    px: 6,
                                                    py: 1.5,
                                                    borderRadius: 2,
                                                    textTransform: 'none',
                                                    fontSize: '1.1rem',
                                                    fontWeight: 600
                                                }}
                                            >
                                                {isSubmitting
                                                    ? 'Saving...'
                                                    : isEditMode
                                                        ? 'Update Property'
                                                        : 'Create Property'
                                                }
                                            </Button>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Form>
                        )}
                    </Formik>
                </Box>
            </Fade>
        </Container>
    );
};

export default PropertyForm;