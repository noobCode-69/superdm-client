import { useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const useNavigateTo = (key: string, defaultValue: string | null = null) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const currentValue = searchParams.get(key) ?? defaultValue;

    const navigateTo = useCallback((value: string | null) => {
        const currentSearchParams = new URLSearchParams(location.search);

        if (value === null) {
            currentSearchParams.delete(key);
        } else {
            currentSearchParams.set(key, value);
        }

        navigate(`?${currentSearchParams.toString()}`);
    }, [location.search, navigate, key]);

    return { navigateTo, currentValue };
};

export default useNavigateTo;
