import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmationModal from '../components/common/ConfirmationModal';

const ConfirmationContext = createContext();

const ConfirmationProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [resolver, setResolver] = useState(null);

    const confirm = useCallback((msg) => {
        setMessage(msg);
        setIsOpen(true);

        return new Promise((resolve) => {
            setResolver(() => resolve);
        });
    }, []);

    const handleConfirm = useCallback(() => {
        setIsOpen(false);
        resolver?.(true);
    }, [resolver]);

    const handleCancel = useCallback(() => {
        setIsOpen(false);
        resolver?.(false);
    }, [resolver]);

    return (
        <ConfirmationContext.Provider value={{ confirm, isConfirmOpen: isOpen }}>
            {children}

            <ConfirmationModal
                isOpen={isOpen}
                message={message}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </ConfirmationContext.Provider>
    );
};

const useConfirm = () => {
    const context = useContext(ConfirmationContext);

    if (!context) {
        throw new Error('useConfirm must be used within ConfirmationProvider');
    }

    return context.confirm;
};

const useConfirmContext = () => {
    const context = useContext(ConfirmationContext);

    if (!context) {
        throw new Error('useConfirmContext must be used within ConfirmationProvider');
    }

    return context;
};


export { ConfirmationProvider, useConfirm, useConfirmContext };