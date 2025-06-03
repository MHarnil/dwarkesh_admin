import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Container,
    Typography,
    Alert,
    Grid,
    Paper,
    CircularProgress,
} from '@mui/material';
import axiosInstance from '../../../axiosInstance.js';
import toast from 'react-hot-toast';

const ContactUs = () => {
    const [contacts, setContacts] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null); // Track which contact is deleting

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/api/contact');
            setContacts(res.data.data);
        } catch (err) {
            setErrorMsg('Failed to fetch contacts.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        toast(
            (t) => (
                <span>
          <Typography sx={{ textAlign: 'center' }}>Are you sure?</Typography>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
            <Button
                onClick={async () => {
                    toast.dismiss(t.id);
                    await handleDeleteConfirmed(id);
                }}
                color="error"
                size="small"
            >
              Yes
            </Button>
            <Button
                onClick={() => {
                    toast.dismiss(t.id);
                }}
                color="primary"
                size="small"
            >
              No
            </Button>
          </Box>
        </span>
            ),
            { duration: 5000 }
        );
    };

    const handleDeleteConfirmed = async (id) => {
        setDeletingId(id);
        toast.promise(
            axiosInstance.delete(`/api/contact/${id}`).then(() => {
                setContacts((prev) => prev.filter((contact) => contact._id !== id));
                setDeletingId(null);
            }).catch(() => {
                setDeletingId(null);
            }),
            {
                loading: 'Deleting...',
                success: 'Deleted successfully!',
                error: 'Failed to delete.',
            }
        );
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    useEffect(() => {
        if (successMsg || errorMsg) {
            const timer = setTimeout(() => {
                setSuccessMsg('');
                setErrorMsg('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMsg, errorMsg]);

    return (
        <Container sx={{ mt: 20, mb: 5 }}>
            <Box sx={{ p: 4, bgcolor: '#fff' }}>
                <Typography variant="h4" gutterBottom textAlign="center" sx={{ mb: 5 }}>
                    Contact Submissions
                </Typography>

                {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
                {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress />
                    </Box>
                ) : contacts.length === 0 ? (
                    <Typography textAlign="center" color="text.secondary">
                        No contacts available.
                    </Typography>
                ) : (
                    <Grid container spacing={3}>
                        {contacts.map((contact) => (
                            <Grid item size={{xs:12, md:6}} key={contact._id}>
                                <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                                    <Box sx={{ mb: 1 }}>
                                        <Typography variant="subtitle1">
                                            <strong>Project:</strong> {contact.project}
                                        </Typography>
                                        <Typography variant="subtitle1">
                                            <strong>Name:</strong> {contact.firstName} {contact.lastName}
                                        </Typography>
                                        <Typography variant="subtitle1">
                                            <strong>Contact No:</strong> {contact.contactNo}
                                        </Typography>
                                        <Typography variant="subtitle1">
                                            <strong>Email:</strong> {contact.email}
                                        </Typography>
                                        <Typography variant="subtitle1">
                                            <strong>Message:</strong> {contact.message}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => handleDelete(contact._id)}
                                            disabled={deletingId === contact._id}
                                        >
                                            {deletingId === contact._id ? <CircularProgress size={20} /> : 'Delete'}
                                        </Button>
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Container>
    );
};

export default ContactUs;
