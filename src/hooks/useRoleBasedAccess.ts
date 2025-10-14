import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'admin' | 'traffic_police' | 'cid' | 'special_police' | 'cybercrime' | 'officer' | 'user';

export interface Department {
  id: string;
  title: string;
  roles: UserRole[];
  path: string;
}

export const departments: Department[] = [
  {
    id: 'admin',
    title: 'الإدارة العامة',
    roles: ['admin'],
    path: '/department/admin'
  },
  {
    id: 'traffic_police',
    title: 'شرطة المرور',
    roles: ['admin', 'traffic_police'],
    path: '/department/traffic'
  },
  {
    id: 'cid',
    title: 'المباحث الجنائية',
    roles: ['admin', 'cid'],
    path: '/department/cid'
  },
  {
    id: 'special_police',
    title: 'الشرطة الخاصة',
    roles: ['admin', 'special_police'],
    path: '/department/special'
  },
  {
    id: 'cybercrime',
    title: 'الجرائم الإلكترونية',
    roles: ['admin', 'cybercrime'],
    path: '/department/cybercrime'
  }
];

export const useRoleBasedAccess = () => {
  const { user } = useAuth();
  
  const userRole = user?.role as UserRole;

  const hasAccess = (allowedRoles: UserRole[]): boolean => {
    if (!userRole) return false;
    return allowedRoles.includes(userRole);
  };

  const canAccessDepartment = (departmentId: string): boolean => {
    const dept = departments.find(d => d.id === departmentId);
    if (!dept) return false;
    return hasAccess(dept.roles);
  };

  const getAccessibleDepartments = (): Department[] => {
    return departments.filter(dept => hasAccess(dept.roles));
  };

  return {
    userRole,
    hasAccess,
    canAccessDepartment,
    getAccessibleDepartments,
    departments
  };
};
