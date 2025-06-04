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
    CircularProgress
} from '@mui/material';
import { FieldArray, Formik, Form } from 'formik';
import * as Yup from 'yup';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
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
            image: Yup.array().of(Yup.string().required('Image URL required'))
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
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formInitialValues, setFormInitialValues] = useState(initialValues);
    const [loadingForm, setLoadingForm] = useState(true);
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
                propertyType: property.propertyType._id || '',
                address: property.address || '',
                contactNumber: property.contactNumber || '',
                propertyDetail: {
                    bhk: property.propertyDetail?.bhk || '',
                    sqft: property.propertyDetail?.sqft || '',
                    stutestype: property.propertyDetail?.stutestype || ''
                },
                floorPlan: property.floorPlan.length > 0 ? property.floorPlan : [{ title: '', images: [''] }],
                projectGallery: property.projectGallery.length > 0 ? property.projectGallery : ['']
            });
        } catch (error) {
            console.error('Error fetching property data', error);
        } finally {
            setLoadingForm(false);
        }
    };

    const handleSubmit = async (values, { resetForm }) => {
        try {
            const payload = {
                ...values,
                propertyType: values.propertyType, // send just the ID
            };

            if (isEditMode) {
                await axiosInstance.put(`/api/properties/${id}`, payload);
                alert('Property updated successfully');
            } else {
                await axiosInstance.post('/api/properties', payload);
                alert('Property added successfully');
            }

            resetForm();
            navigate('/property-list'); // redirect to property list

        } catch (err) {
            console.error('Error saving property:', err);
            alert('Something went wrong');
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

    if (loading || loadingForm) return <CircularProgress sx={{ mt: 10 }} />;

    return (
        <Container sx={{ mt: 20, mb: 5 }}>
            <Typography variant="h5" gutterBottom>
                {isEditMode ? 'Edit Property' : 'Add Property'}
            </Typography>

            <Formik
                initialValues={formInitialValues}
                enableReinitialize
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, handleChange, setFieldValue, errors, touched }) => (
                    <Form>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Title"
                                    name="title"
                                    value={values.title}
                                    onChange={handleChange}
                                    error={touched.title && !!errors.title}
                                    helperText={touched.title && errors.title}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Subtitle"
                                    name="subtitle"
                                    value={values.subtitle}
                                    onChange={handleChange}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Property Type"
                                    name="propertyType"
                                    value={values.propertyType}
                                    onChange={handleChange}
                                    error={touched.propertyType && !!errors.propertyType}
                                    helperText={touched.propertyType && errors.propertyType}
                                >
                                    {propertyTypes?.map((type) => (
                                        <MenuItem key={type._id} value={type._id}>
                                            {type.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Address"
                                    name="address"
                                    value={values.address}
                                    onChange={handleChange}
                                    error={touched.address && !!errors.address}
                                    helperText={touched.address && errors.address}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Contact Number"
                                    name="contactNumber"
                                    value={values.contactNumber}
                                    onChange={handleChange}
                                    error={touched.contactNumber && !!errors.contactNumber}
                                    helperText={touched.contactNumber && errors.contactNumber}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="h6">Property Detail</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="BHK"
                                    name="propertyDetail.bhk"
                                    value={values.propertyDetail.bhk}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Sqft"
                                    name="propertyDetail.sqft"
                                    value={values.propertyDetail.sqft}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Status Type"
                                    name="propertyDetail.stutestype"
                                    value={values.propertyDetail.stutestype}
                                    onChange={handleChange}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="h6">Floor Plans</Typography>
                            </Grid>
                            <FieldArray name="floorPlan">
                                {({ push, remove }) => (
                                    <>
                                        {values.floorPlan.map((plan, index) => (
                                            <Grid container spacing={2} key={index}>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        fullWidth
                                                        label="Floor Title"
                                                        name={`floorPlan[${index}].title`}
                                                        value={plan.title}
                                                        onChange={handleChange}
                                                    />
                                                </Grid>

                                                <FieldArray name={`floorPlan[${index}].images`}>
                                                    {({ push: pushImage, remove: removeImage }) => (
                                                        <>
                                                            {plan.images.map((img, imgIdx) => (
                                                                <Grid item xs={10} key={imgIdx}>
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={async (e) => {
                                                                            const file = e.target.files[0];
                                                                            if (file) {
                                                                                const url = await uploadImage(file);
                                                                                const updatedImages = [...plan.images];
                                                                                updatedImages[imgIdx] = url;
                                                                                setFieldValue(`floorPlan[${index}].images`, updatedImages);
                                                                            }
                                                                        }}
                                                                    />
                                                                    {img && <img src={img} alt="floor" width={100} style={{ marginTop: 8 }} />}
                                                                </Grid>
                                                            ))}
                                                        </>
                                                    )}
                                                </FieldArray>
                                                <Grid item xs={2}>
                                                    <IconButton onClick={() => remove(index)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        ))}
                                        <Button onClick={() => push({ title: '', images: [''] })} startIcon={<AddIcon />}>
                                            Add Floor Plan
                                        </Button>
                                    </>
                                )}
                            </FieldArray>

                            <Grid item xs={12}>
                                <Typography variant="h6">Project Gallery</Typography>
                            </Grid>
                            <FieldArray name="projectGallery">
                                {({ push, remove }) => (
                                    <>
                                        {values.projectGallery.map((img, index) => (
                                            <Grid container spacing={1} key={index}>
                                                <Grid item xs={10}>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
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
                                                    {img && <img src={img} alt="gallery" width={100} style={{ marginTop: 8 }} />}
                                                </Grid>
                                                <Grid item xs={2}>
                                                    <IconButton onClick={() => remove(index)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        ))}
                                        <Button onClick={() => push('')} startIcon={<AddIcon />}>
                                            Add Gallery Image
                                        </Button>
                                    </>
                                )}
                            </FieldArray>

                            <Grid item xs={12}>
                                <Button variant="contained" type="submit" color="primary">
                                    Submit Property
                                </Button>
                            </Grid>
                        </Grid>
                    </Form>
                )}
            </Formik>
        </Container>
    );
};

export default PropertyForm;
