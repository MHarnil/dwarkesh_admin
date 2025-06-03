// App.jsx
import React, {useEffect} from 'react';
import {Routes, Route, useLocation} from 'react-router-dom';
import Header from './components/global/header.jsx';
import ContactUs from './components/contact/contactUs.jsx';
import {Toaster} from "react-hot-toast";
import PropertyTypePage from "./components/PropertyType/propertyTypePage.jsx";
import PropertyForm from "./components/Property/propertyForm.jsx";

function ScrollToTop() {
    const {pathname} = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
}

function App() {
    return (
        <>
            <Toaster position="top-center" />
            <ScrollToTop/>
            <Header/>
            <Routes>
                <Route path="/contact" element={<ContactUs/>}/>
                <Route path="/property-type" element={<PropertyTypePage/>}/>
                <Route path="/property" element={<PropertyForm/>}/>
            </Routes>
        </>
    );
}

export default App;
