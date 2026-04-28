import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        // Don't fetch user on login/register pages to prevent 401 loop
        const publicPaths = ['/login', '/register', '/password/reset', '/email/verify'];
        const isPublicPath = publicPaths.some(path => window.location.pathname.includes(path));
        
        if (isPublicPath) {
            setLoading(false);
            return;
        }

        try {
            console.log("UserProvider: Fetching user...");
            const response = await window.axios.get('/api/user');
            console.log("UserProvider: User fetched successfully", response.data);
            setUser(response.data);
            window.authUser = response.data;
            window.userSettings = response.data?.user_settings || {};
        } catch (error) {
            console.error("UserProvider: Error fetching user:", error);
            setUser(null);
            // Clear token on 401 and redirect to login
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }
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
