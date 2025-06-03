import {useEffect, useState} from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Box,
    useMediaQuery,
    useTheme,
    Container,
    Switch, Link
} from '@mui/material';
import logo from '../../assets/images/IMG_9066 3.png';
import {useNavigate} from "react-router-dom";

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    const navItems = ['Property','PropertyType','Contact'];

    const navRoutes = {
        Contact: '/contact',
        PropertyType: '/property-type',
        Property: '/property'
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <Box sx={{flexGrow: 1}}>
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    borderRadius: '0 0 40px 40px',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease, border 0.3s ease',
                }}
            >

            <Container maxWidth="xl">
                    <Toolbar
                        sx={{
                            justifyContent: 'space-between',
                            padding: {xs: '0rem 1rem', md: '0.5rem 2rem'},
                        }}
                    >
                        <Box onClick={() => navigate('/')} sx={{width: '100px', height: '100px', cursor: 'pointer'}}>
                            <Box component="img" src={logo} sx={{width: '100%', height: '100%'}}/>
                        </Box>
                        {!isMobile && (
                            <Box sx={{display: 'flex', alignItems: 'center', gap: {md: 2, lg: 6}}}>
                                {navItems?.map((item) => (
                                    <Typography
                                        onClick={() => navigate(navRoutes[item])}
                                        key={item}
                                        sx={{
                                            cursor: 'pointer',
                                            textTransform: 'none',
                                            fontSize: '20px',
                                            fontWeight: 400,
                                            color: '#000'
                                        }}
                                    >
                                        {item}
                                    </Typography>
                                ))}
                            </Box>
                        )}
                    </Toolbar>
                </Container>
            </AppBar>
        </Box>
    );
}
