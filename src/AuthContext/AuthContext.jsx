import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import BaseUrl from '../Api/BaseUrl';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  // Load user data from localStorage on app start
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const role = localStorage.getItem('role');
        const companyId = localStorage.getItem('CompanyId');
        const userId = localStorage.getItem('userId');

        if (token && role && companyId) {
          setUser({
            token,
            role,
            companyId,
            userId
          });

          // Agar user SUPERADMIN nahi hai, toh permissions fetch karo
          if (role !== 'SUPERADMIN') {
            await fetchUserPermissions(companyId, userId);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Function to fetch user permissions
  const fetchUserPermissions = async (companyId, userId) => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Pehle user ki role get karo
      const userResponse = await axios.get(`${BaseUrl}users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userRole = userResponse.data.data.role_id;
      
      // Phir us role ki permissions get karo
      const response = await axios.get(
        `${BaseUrl}user-roles?company_id=${companyId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        const roles = response.data.data;
        const userRoleData = roles.find(role => role.id === userRole);
        
        if (userRoleData && userRoleData.permissions) {
          const permissionsMap = {};
          userRoleData.permissions.forEach(permission => {
            permissionsMap[permission.module_name.toLowerCase()] = {
              canView: permission.can_view,
              canCreate: permission.can_create,
              canUpdate: permission.can_update,
              canDelete: permission.can_delete,
              fullAccess: permission.full_access
            };
          });
          setPermissions(permissionsMap);
          localStorage.setItem('userPermissions', JSON.stringify(permissionsMap));
        }
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  // Login function
  const login = async (userData) => {
    const { token, user: userInfo } = userData;
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('CompanyId', userInfo.id.toString());
    localStorage.setItem('role', userInfo.role);
    localStorage.setItem('userId', userInfo.user_id || userInfo.id); // API response ke according adjust karo

    setUser({
      token,
      role: userInfo.role,
      companyId: userInfo.id.toString(),
      userId: userInfo.user_id || userInfo.id
    });

    // Agar user SUPERADMIN nahi hai, toh permissions fetch karo
    if (userInfo.role !== 'SUPERADMIN') {
      await fetchUserPermissions(userInfo.id.toString(), userInfo.user_id || userInfo.id);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('CompanyId');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('userPermissions');
    setUser(null);
    setPermissions({});
  };

  // Check permission function
  const hasPermission = (module, action = 'view') => {
    if (user?.role === 'SUPERADMIN') {
      return true; // SUPERADMIN ko sab permissions hain
    }

    const modulePermissions = permissions[module.toLowerCase()];
    
    if (!modulePermissions) return false;

    switch (action) {
      case 'view':
        return modulePermissions.canView || modulePermissions.fullAccess;
      case 'create':
        return modulePermissions.canCreate || modulePermissions.fullAccess;
      case 'update':
        return modulePermissions.canUpdate || modulePermissions.fullAccess;
      case 'delete':
        return modulePermissions.canDelete || modulePermissions.fullAccess;
      default:
        return modulePermissions.fullAccess;
    }
  };

  const value = {
    user,
    permissions,
    loading,
    login,
    logout,
    hasPermission,
    fetchUserPermissions
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};