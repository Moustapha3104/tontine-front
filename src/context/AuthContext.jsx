import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.getMe()
                .then(res => {
                    if (res.success) setUser(res.user);
                    else logout();
                })
                .catch(() => logout())
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const data = await api.login(email, password);
        localStorage.setItem('token', data.token);
        // Fetch full user profile (including role) to avoid nav flickering
        try {
            const me = await api.getMe();
            if (me.success) setUser(me.user);
            else setUser(data.user);
        } catch {
            setUser(data.user);
        }
        return data;
    };

    const register = async (name, email, password) => {
        const data = await api.register(name, email, password);
        localStorage.setItem('token', data.token);
        // Fetch full user profile (including role) to avoid nav flickering
        try {
            const me = await api.getMe();
            if (me.success) setUser(me.user);
            else setUser(data.user);
        } catch {
            setUser(data.user);
        }
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('selectedTontineId');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
