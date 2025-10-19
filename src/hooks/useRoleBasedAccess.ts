import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';

export type UserRole = 'admin' | 'traffic_police' | 'cid' | 'special_police' | 'cybercrime' | 'judicial_police' | 'officer' | 'user' | 'operations_system' | 'borders' | 'tourism_police' | 'joint_operations';

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
    id: 'operations_system',
    title: 'العمليات وإدارة الجهاز',
    roles: ['admin', 'operations_system'],
    path: '/department/operations-system'
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
  },
  {
    id: 'judicial_police',
    title: 'الشرطة القضائية',
    roles: ['admin', 'judicial_police'],
    path: '/department/judicial-police'
  },
  {
    id: 'borders',
    title: 'المعابر والحدود',
    roles: ['admin', 'borders'],
    path: '/department/borders'
  },
  {
    id: 'tourism_police',
    title: 'الشرطة السياحية',
    roles: ['admin', 'tourism_police'],
    path: '/department/tourism'
  },
  {
    id: 'joint_operations',
    title: 'العمليات المشتركة',
    roles: ['admin', 'joint_operations'],
    path: '/department/joint-operations'
  }
];

export const useRoleBasedAccess = () => {
  const { user } = useAuth();
  const { roles, hasRole: hasUserRole, hasAnyRole } = useUserRoles();
  
  // Use the first role as the primary role for backward compatibility
  const userRole = (roles.length > 0 ? roles[0] : user?.role) as UserRole;

  const hasAccess = (allowedRoles: UserRole[]): boolean => {
    return hasAnyRole(allowedRoles);
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
