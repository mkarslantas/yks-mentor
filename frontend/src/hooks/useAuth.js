import { useContext } from 'react';
import { useAuth as useAuthFromContext } from '../context/AuthContext';

export const useAuth = useAuthFromContext;