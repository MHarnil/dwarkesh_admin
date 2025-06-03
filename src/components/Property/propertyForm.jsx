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

const PropertyForm = ({ onSubmit }) => {
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchPropertyTypes();
    }, []);

    if (loading) return <CircularProgress sx={{ mt: 10 }} />;

    return (
        <Container sx={{ mt: 20, mb: 5 }}>
            <Typography variant="h5" gutterBottom>
                Add / Edit Property
            </Typography>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
            >
                {({ values, handleChange, setFieldValue, errors, touched }) => (
                    <Form>
                        <Grid container spacing={2}>
                            <Grid item size={{xs:12, sm:6}}>
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

                            <Grid item size={{xs:12, sm:6}}>
                                <TextField
                                    fullWidth
                                    label="Subtitle"
                                    name="subtitle"
                                    value={values.subtitle}
                                    onChange={handleChange}
                                />
                            </Grid>

                            <Grid item size={{xs:12, sm:6}}>
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
                                    {propertyTypes.map((type) => (
                                        <MenuItem key={type._id} value={type._id}>
                                            {type.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item size={{xs:12, sm:6}}>
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

                            <Grid item size={{xs:12, sm:6}}>
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

                            {/* Property Detail */}
                            <Grid item size={{xs:12}}>
                                <Typography variant="h6">Property Detail</Typography>
                            </Grid>
                            <Grid item size={{xs:4}}>
                                <TextField
                                    fullWidth
                                    label="BHK"
                                    name="propertyDetail.bhk"
                                    value={values.propertyDetail.bhk}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item size={{xs:4}}>
                                <TextField
                                    fullWidth
                                    label="Sqft"
                                    name="propertyDetail.sqft"
                                    value={values.propertyDetail.sqft}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item size={{xs:4}}>
                                <TextField
                                    fullWidth
                                    label="Status Type"
                                    name="propertyDetail.stutestype"
                                    value={values.propertyDetail.stutestype}
                                    onChange={handleChange}
                                />
                            </Grid>

                            {/* Floor Plan */}
                            <Grid item size={{xs:12}}>
                                <Typography variant="h6">Floor Plans</Typography>
                            </Grid>
                            <FieldArray name="floorPlan">
                                {({ push, remove }) => (
                                    <>
                                        {values.floorPlan.map((plan, index) => (
                                            <Grid container spacing={2} key={index}>
                                                <Grid item size={{xs:12}}>
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
                                                                <Grid item size={{xs:10}} key={imgIdx}>
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
                                                <Grid item size={{xs:2}}>
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

                            {/* Project Gallery */}
                            <Grid item size={{xs:12}}>
                                <Typography variant="h6">Project Gallery</Typography>
                            </Grid>
                            <FieldArray name="projectGallery">
                                {({ push, remove }) => (
                                    <>
                                        {values.projectGallery.map((img, index) => (
                                            <Grid container spacing={1} key={index}>
                                                <Grid item size={{xs:10}}>
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
                                                <Grid item size={{xs:2}}>
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

                            {/* Submit */}
                            <Grid item size={{xs:12}}>
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
