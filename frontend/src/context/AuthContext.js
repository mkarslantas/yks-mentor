import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext();

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        loading: false,
        error: null
      };
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        loading: false,
        error: action.payload
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
        loading: false
      };
    
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: action.payload
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    
    case 'REFRESH_TOKEN_SUCCESS':
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken
      };
    
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (accessToken && refreshToken) {
          // Verify token and get user profile
          const userProfile = await authService.getProfile();
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: userProfile.data?.user || userProfile.user || userProfile,
              accessToken,
              refreshToken
            }
          });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        // Clear invalid tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadUser();
  }, []);

  const login = async (credentials) => {
    try {
      console.log('🔐 AuthContext: Starting login with', credentials.email);
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authService.login(credentials);
      console.log('✅ AuthContext: Login response received', response);
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', response.data?.accessToken || response.accessToken);
      localStorage.setItem('refreshToken', response.data?.refreshToken || response.refreshToken);
      console.log('💾 AuthContext: Tokens stored in localStorage');
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.data?.user || response.user,
          accessToken: response.data?.accessToken || response.accessToken,
          refreshToken: response.data?.refreshToken || response.refreshToken
        }
      });
      
      return response;
    } catch (error) {
      console.error('❌ AuthContext: Login error', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error message:', error.message);
      
      const errorMessage = error.response?.data?.error?.message || error.message || 'Giriş başarısız';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authService.register(userData);
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response
      });
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Kayıt başarısız';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage and state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      
      dispatch({
        type: 'UPDATE_PROFILE',
        payload: response.data?.user || response.user || response
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authService.refreshToken(refreshToken);
      
      // Update tokens in localStorage
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      dispatch({
        type: 'REFRESH_TOKEN_SUCCESS',
        payload: response
      });
      
      return response.accessToken;
    } catch (error) {
      // If refresh fails, logout user
      logout();
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const setAuthData = ({ user, token, refreshToken }) => {
    // Store tokens in localStorage
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: {
        user,
        accessToken: token,
        refreshToken
      }
    });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    refreshAccessToken,
    clearError,
    setAuthData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};