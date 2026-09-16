import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const name = localStorage.getItem('name'); // Retrieve name
        if (token && role) {
            setUser({ token, role, name });
        }
    }, []);

    const login = (token, role, name) => {
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        if (name) localStorage.setItem('name', name); // Save name
        setUser({ token, role, name });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('name');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};