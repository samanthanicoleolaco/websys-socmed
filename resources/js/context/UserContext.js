import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            console.log("UserProvider: Fetching user...");
            const response = await window.axios.get('/api/user');
            console.log("UserProvider: User fetched successfully", response.data);
            setUser(response.data);
            window.authUser = response.data;
        } catch (error) {
            console.error("UserProvider: Error fetching user:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const refreshUser = () => fetchUser();

    return (
        <UserContext.Provider value={{ user, setUser, loading, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
