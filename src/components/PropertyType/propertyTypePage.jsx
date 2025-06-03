import React, { useEffect, useState } from 'react';
import {
    Box, Button, Dialog, DialogTitle, DialogContent, IconButton,
    Stack, Table, TableBody, TableCell, TableHead, TableRow,
    Typography, CircularProgress, Container,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-mui'; // Make sure formik-mui is installed
import * as Yup from 'yup';
import axiosInstance from "../../../axiosInstance.js"; // Axios imported here

// Validation schema
const validationSchema = Yup.object({
    name: Yup.string().trim().required('Property Type Name is required'),
});

function PropertyTypePage() {
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState(null);

    const fetchPropertyTypes = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/api/property-types');
            setPropertyTypes(res.data.data);
        } catch (error) {
            console.error('Failed to fetch property types:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPropertyTypes();
    }, []);

    const openForm = (property = null) => {
        setEditingProperty(property);
        setDialogOpen(true);
    };

    const closeForm = () => {
        setDialogOpen(false);
        setEditingProperty(null);
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            if (editingProperty) {
                await axiosInstance.put(`/api/property-types/${editingProperty._id}`, values);
            } else {
                await axiosInstance.post('/api/property-types', values);
            }
            setSubmitting(false);
            closeForm();
            fetchPropertyTypes();
        } catch (error) {
            console.error(error);
            alert('Failed to save property type');
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this property type?')) return;
        try {
            await axiosInstance.delete(`/api/property-types/${id}`);
            fetchPropertyTypes();
        } catch (error) {
            console.error(error);
            alert('Failed to delete property type');
        }
    };

    return (
        <Container sx={{ mt: 20, mb: 5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Property Types</Typography>
                <Button startIcon={<Add />} variant="contained" onClick={() => openForm()}>
                    Property Type
                </Button>
            </Stack>

            {loading ? (
                <CircularProgress />
            ) : propertyTypes?.length === 0 ? (
                <Typography>No property types found.</Typography>
            ) : (
                <Table sx={{mt:8}}>
                    <TableHead sx={{borderBottom: '2px solid #000'}}>
                        <TableRow>
                            <TableCell sx={{fontSize:'18px'}}>ID</TableCell>
                            <TableCell sx={{fontSize:'18px'}}>Name</TableCell>
                            <TableCell sx={{fontSize:'18px'}} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {propertyTypes?.map((prop, index) => (
                            <TableRow key={prop._id}>
                                <TableCell>{index + 1}</TableCell> {/* Showing index (starting from 1) */}
                                <TableCell>{prop.name}</TableCell>
                                <TableCell align="right">
                                    <IconButton color="primary" onClick={() => openForm(prop)}>
                                        <Edit />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(prop._id)}>
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>

                </Table>
            )}

            {/* Dialog for Form */}
            <Dialog open={dialogOpen} onClose={closeForm} maxWidth="sm" fullWidth>
                <DialogTitle>{editingProperty ? 'Edit Property Type' : 'Add Property Type'}</DialogTitle>
                <DialogContent>
                    <Formik
                        initialValues={{ name: editingProperty?.name || '' }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
                    >
                        {({ submitForm, isSubmitting }) => (
                            <Form>
                                <Box sx={{ mt: 1, mb: 2 }}>
                                    <Field
                                        component={TextField}
                                        name="name"
                                        label="Property Type Name"
                                        fullWidth
                                        variant="outlined"
                                        disabled={isSubmitting}
                                    />
                                </Box>
                                <Stack direction="row" spacing={2} justifyContent="flex-end">
                                    <Button onClick={closeForm} disabled={isSubmitting}>
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={submitForm}
                                        disabled={isSubmitting}
                                    >
                                        {editingProperty ? 'Save Changes' : 'Add Property Type'}
                                    </Button>
                                </Stack>
                            </Form>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>
        </Container>
    );
}

export default PropertyTypePage;
