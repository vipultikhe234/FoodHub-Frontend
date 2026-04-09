import React, { createContext, useContext, useState, useEffect } from 'react';

const MerchantContext = createContext();

export const MerchantProvider = ({ children }) => {
    const [selectedMerchantId, setSelectedMerchantId] = useState('');

    const [merchants, setMerchants] = useState([]);



    return (
        <MerchantContext.Provider value={{ 
            selectedMerchantId, 
            setSelectedMerchantId,
            merchants,
            setMerchants
        }}>
            {children}
        </MerchantContext.Provider>
    );
};

export const useMerchant = () => {
    const context = useContext(MerchantContext);
    if (!context) {
        throw new Error('useMerchant must be used within a MerchantProvider');
    }
    return context;
};
