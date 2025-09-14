import { useAuth, type UserRole } from '@/contexts/AuthContext';

// صفحات كل قسم
const rolePages = {
  admin: [
    'dashboard', 'profile', 'admin-panel', 'users', 'incidents', 'incidents-management', 
    'new-incident', 'cybercrime', 'cybercrime-reports', 'reports', 'violations', 
    'violations-admin', 'vehicle-lookup', 'tasks', 'patrol', 'patrol-old', 'feed', 
    'chat', 'wanted-persons-tree', 'face-recognition', 'police-news', 'backup',
    'citizen-records', 'about'
  ],
  traffic_police: [
    'dashboard', 'profile', 'violations', 'violations-admin', 'vehicle-lookup', 
    'patrol', 'police-news'
  ],
  cid: [
    'dashboard', 'profile', 'incidents', 'incidents-management', 'new-incident',
    'wanted-persons-tree', 'face-recognition', 'police-news'
  ],
  special_police: [
    'dashboard', 'profile', 'tasks', 'patrol', 'patrol-old', 'feed', 'chat', 'police-news'
  ],
  cybercrime: [
    'dashboard', 'profile', 'cybercrime', 'cybercrime-reports', 'reports', 'police-news'
  ],
  officer: [
    'dashboard', 'profile', 'police-news'
  ],
  user: [
    'dashboard', 'profile', 'police-news'
  ]
};

export const useRoleBasedAccess = () => {
  const { user } = useAuth();

  const hasAccess = (pageName: string): boolean => {
    if (!user?.role) return false;
    
    const allowedPages = rolePages[user.role as UserRole] || [];
    return allowedPages.includes(pageName);
  };

  const getAllowedPages = (): string[] => {
    if (!user?.role) return [];
    return rolePages[user.role as UserRole] || [];
  };

  const getNavigationItems = () => {
    const role = user?.role as UserRole;
    if (!role) return [];

    const baseItems = [
      {
        title: 'الرئيسية',
        path: '/dashboard',
        icon: 'Home'
      },
      {
        title: 'الأخبار',
        path: '/police-news', 
        icon: 'Newspaper'
      }
    ];

    const roleSpecificItems: Record<UserRole, any[]> = {
      admin: [
        {
          title: 'لوحة الإدارة',
          path: '/admin-panel',
          icon: 'Settings'
        },
        {
          title: 'البلاغات',
          path: '/incidents',
          icon: 'AlertTriangle'
        },
        {
          title: 'الجرائم الإلكترونية', 
          path: '/cybercrime',
          icon: 'Shield'
        },
        {
          title: 'المخالفات',
          path: '/violations',
          icon: 'FileText'
        },
        {
          title: 'المهام',
          path: '/tasks', 
          icon: 'CheckSquare'
        },
        {
          title: 'الدوريات',
          path: '/patrol',
          icon: 'Users'
        }
      ],
      traffic_police: [
        {
          title: 'المخالفات',
          path: '/violations',
          icon: 'FileText'
        },
        {
          title: 'إدارة المخالفات',
          path: '/violations-admin',
          icon: 'Settings'
        },
        {
          title: 'البحث عن مركبة',
          path: '/vehicle-lookup',
          icon: 'Car'
        },
        {
          title: 'الدوريات',
          path: '/patrol',
          icon: 'Users'
        }
      ],
      cid: [
        {
          title: 'البلاغات',
          path: '/incidents',
          icon: 'AlertTriangle'
        },
        {
          title: 'إدارة البلاغات',
          path: '/incidents-management',
          icon: 'Settings'
        },
        {
          title: 'بلاغ جديد',
          path: '/new-incident',
          icon: 'Plus'
        },
        {
          title: 'المطلوبون',
          path: '/wanted-persons-tree',
          icon: 'Users'
        },
        {
          title: 'التعرف على الوجوه',
          path: '/face-recognition',
          icon: 'Eye'
        }
      ],
      special_police: [
        {
          title: 'المهام',
          path: '/tasks',
          icon: 'CheckSquare'
        },
        {
          title: 'الدوريات',
          path: '/patrol',
          icon: 'Users'
        },
        {
          title: 'التغذية',
          path: '/feed',
          icon: 'Rss'
        },
        {
          title: 'المحادثات',
          path: '/chat',
          icon: 'MessageCircle'
        }
      ],
      cybercrime: [
        {
          title: 'الجرائم الإلكترونية',
          path: '/cybercrime',
          icon: 'Shield'
        },
        {
          title: 'تقارير الجرائم الإلكترونية',
          path: '/cybercrime-reports',
          icon: 'FileText'
        },
        {
          title: 'التقارير',
          path: '/reports',
          icon: 'BarChart3'
        }
      ],
      officer: [],
      user: []
    };

    return [...baseItems, ...(roleSpecificItems[role] || [])];
  };

  return {
    hasAccess,
    getAllowedPages,
    getNavigationItems,
    userRole: user?.role as UserRole
  };
};