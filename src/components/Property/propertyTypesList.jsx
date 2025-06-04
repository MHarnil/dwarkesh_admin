import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Collapse,
    Container,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Grid
} from '@mui/material';
import {
    KeyboardArrowDown,
    KeyboardArrowUp,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import PropertyForm from './PropertyForm';
import axiosInstance from '../../../axiosInstance';

const PropertyTypesList = () => {
    const [properties, setProperties] = useState([]);
    const [expandedRow, setExpandedRow] = useState(null);
    const navigate = useNavigate();

    const fetchProperties = async () => {
        try {
            const res = await axiosInstance.get('/api/properties');
            setProperties(res.data || []);
        } catch (err) {
            console.error('Error fetching properties', err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this property?')) {
            try {
                await axiosInstance.delete(`/api/properties/${id}`);
                fetchProperties();
            } catch (err) {
                console.error('Delete failed', err);
            }
        }
    };

    const toggleRow = (id) => {
        setExpandedRow((prev) => (prev === id ? null : id));
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    return (
        <Container sx={{ mt: 20, mb: 5 }}>
            <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="h4">Properties</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/property-form')}>
                    Add Property
                </Button>
            </Box>

            <Table sx={{mt:8}}>
                <TableHead sx={{borderBottom: '2px solid #000'}}>
                        <TableRow>
                            <TableCell sx={{fontSize:'18px'}}>Title</TableCell>
                            <TableCell sx={{fontSize:'18px'}}>Sub Title</TableCell>
                            <TableCell sx={{fontSize:'18px'}}>Type</TableCell>
                            <TableCell sx={{fontSize:'18px'}}>Actions</TableCell>
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {properties.map((prop) => (
                            <React.Fragment key={prop._id}>
                                <TableRow>
                                    <TableCell>{prop.title}</TableCell>
                                    <TableCell>{prop.subtitle}</TableCell>
                                    <TableCell>{prop.propertyType?.name || prop.propertyType}</TableCell>
                                    <TableCell>
                                        <IconButton color="primary" onClick={() => navigate(`/property-form/${prop._id}`)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton color="error" onClick={() => handleDelete(prop._id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                    <TableCell sx={{textAlign:'end'}} >
                                        <IconButton onClick={() => toggleRow(prop._id)}>
                                            {expandedRow === prop._id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                        </IconButton>
                                    </TableCell>
                                </TableRow>

                                <TableRow>
                                    <TableCell colSpan={5} sx={{ paddingBottom: 0, paddingTop: 0 }}>
                                        <Collapse in={expandedRow === prop._id} timeout="auto" unmountOnExit>
                                            <Box sx={{ margin: 2 }}>
                                                {/* Basic Info */}
                                                <Typography variant="h6" sx={{fontSize:'20px',fontWeight:'500'}}>Basic Info</Typography>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={6}>
                                                        <Typography><strong>Title:</strong> {prop.title}</Typography>
                                                        <Typography><strong>Subtitle:</strong> {prop.subtitle}</Typography>
                                                        <Typography><strong>Type:</strong> {prop.propertyType?.name || prop.propertyType}</Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography><strong>Contact:</strong> {prop.contactNumber}</Typography>
                                                        <Typography><strong>Address:</strong> {prop.address}</Typography>
                                                        {prop.googleMap && (
                                                            <Typography>
                                                                <strong>Map:</strong>{' '}
                                                                <a href={prop.googleMap} target="_blank" rel="noopener noreferrer">
                                                                    View Map
                                                                </a>
                                                            </Typography>
                                                        )}
                                                    </Grid>
                                                </Grid>

                                                {/* Property Details */}
                                                <Typography variant="h6" sx={{fontSize:'20px',fontWeight:'500',mt:3}}>Property Detail</Typography>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={4}>
                                                        <Typography><strong>BHK:</strong> {prop.propertyDetail?.bhk}</Typography>
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <Typography><strong>Sqft:</strong> {prop.propertyDetail?.sqft}</Typography>
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <Typography><strong>Status:</strong> {prop.propertyDetail?.stutestype}</Typography>
                                                    </Grid>
                                                </Grid>

                                                {/* Floor Plan */}
                                                <Typography variant="h6" sx={{fontSize:'20px',fontWeight:'500',mt:3}}>Floor Plan</Typography>
                                                <Box display="flex" flexWrap="wrap" gap={1}>
                                                {prop.floorPlan?.map((floor) => (
                                                    <Box key={floor._id} mb={2}>
                                                        <Box display="flex" flexWrap="wrap" gap={1}>
                                                            {floor.images?.map((img, idx) => (
                                                                <img
                                                                    key={idx}
                                                                    src={img}
                                                                    alt="floor"
                                                                    width={120}
                                                                    height={80}
                                                                    style={{ objectFit: 'cover', borderRadius: 4 }}
                                                                />
                                                            ))}
                                                        </Box>
                                                        <Typography><strong>{floor.title}</strong></Typography>
                                                    </Box>
                                                ))}
                                                </Box>

                                                {/* Project Gallery */}
                                                <Typography variant="h6" sx={{fontSize:'20px',fontWeight:'500',mt:3}}>Project Gallery</Typography>
                                                <Box display="flex" flexWrap="wrap" gap={1}>
                                                    {prop.projectGallery?.map((img, idx) => (
                                                        <img
                                                            key={idx}
                                                            src={img}
                                                            alt="gallery"
                                                            width={120}
                                                            height={80}
                                                            style={{ objectFit: 'cover', borderRadius: 4 }}
                                                        />
                                                    ))}
                                                </Box>
                                            </Box>
                                        </Collapse>
                                    </TableCell>
                                </TableRow>
                            </React.Fragment>
                        ))}
                        {properties.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">No properties found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
        </Container>
    );
};

export default PropertyTypesList;
