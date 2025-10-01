import { useAuth, type UserRole } from '@/contexts/AuthContext';

// صفحات كل قسم ومدرائه
const rolePages = {
  admin: [
    'dashboard', 'profile', 'admin-panel', 'users', 'incidents', 'incidents-management', 
    'new-incident', 'cybercrime', 'cybercrime-reports', 'reports', 'violations', 
    'violations-admin', 'vehicle-lookup', 'tasks', 'patrol', 'patrol-old', 'feed', 
    'chat', 'wanted-persons-tree', 'face-recognition', 'police-news', 'backup',
    'citizen-records', 'about', 'cybercrime-advanced', 'smart-civil-registry', 'overview'
  ],
  // مدراء الأقسام - صلاحيات إدارية لقسمهم
  traffic_manager: [
    'dashboard', 'profile', 'violations', 'violations-admin', 'vehicle-lookup', 
    'patrol', 'police-news', 'admin-panel', 'feed', 'overview'
  ],
  cid_manager: [
    'dashboard', 'profile', 'incidents', 'incidents-management', 'new-incident',
    'wanted-persons-tree', 'face-recognition', 'police-news', 'admin-panel', 'feed', 'smart-civil-registry', 'overview'
  ],
  special_manager: [
    'dashboard', 'profile', 'tasks', 'patrol', 'patrol-old', 'feed', 'chat', 'police-news', 'admin-panel', 'overview'
  ],
  cybercrime_manager: [
    'dashboard', 'profile', 'cybercrime', 'cybercrime-reports', 'reports', 'police-news', 'cybercrime-advanced', 'admin-panel', 'feed', 'smart-civil-registry', 'overview'
  ],
  // موظفو الأقسام - صلاحيات محدودة
  traffic_police: [
    'dashboard', 'profile', 'violations', 'vehicle-lookup', 'patrol', 'police-news', 'feed'
  ],
  cid: [
    'dashboard', 'profile', 'incidents', 'incidents-management', 'new-incident',
    'wanted-persons-tree', 'face-recognition', 'police-news', 'feed', 'smart-civil-registry'
  ],
  special_police: [
    'dashboard', 'profile', 'tasks', 'patrol', 'patrol-old', 'feed', 'chat', 'police-news'
  ],
  cybercrime: [
    'dashboard', 'profile', 'cybercrime', 'cybercrime-reports', 'reports', 'police-news', 'feed', 'smart-civil-registry'
  ],
  officer: [
    'dashboard', 'profile', 'police-news', 'feed'
  ],
  user: [
    'dashboard', 'profile', 'police-news', 'feed'
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
      },
      {
        title: 'التقارير والإحصائيات',
        path: '/reports-management',
        icon: 'BarChart3'
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
          title: 'الجرائم الإلكترونية المتقدمة', 
          path: '/cybercrime-advanced',
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
      // مدراء الأقسام
      traffic_manager: [
        {
          title: 'إدارة المخالفات',
          path: '/violations-admin',
          icon: 'Settings'
        },
        {
          title: 'المخالفات',
          path: '/violations',
          icon: 'FileText'
        },
        {
          title: 'البحث عن مركبة',
          path: '/vehicle-lookup',
          icon: 'Car'
        },
        {
          title: 'التغذية',
          path: '/feed',
          icon: 'Rss'
        },
        {
          title: 'إدارة القسم',
          path: '/admin-panel',
          icon: 'Settings'
        }
      ],
      cid_manager: [
        {
          title: 'إدارة البلاغات',
          path: '/incidents-management',
          icon: 'Settings'
        },
        {
          title: 'البلاغات',
          path: '/incidents',
          icon: 'AlertTriangle'
        },
        {
          title: 'المطلوبون',
          path: '/wanted-persons-tree',
          icon: 'Users'
        },
        {
          title: 'التغذية',
          path: '/feed',
          icon: 'Rss'
        },
        {
          title: 'إدارة القسم',
          path: '/admin-panel',
          icon: 'Settings'
        }
      ],
      special_manager: [
        {
          title: 'إدارة المهام',
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
        },
        {
          title: 'إدارة القسم',
          path: '/admin-panel',
          icon: 'Settings'
        }
      ],
      cybercrime_manager: [
        {
          title: 'لوحة التحكم المتقدمة',
          path: '/cybercrime-advanced',
          icon: 'Shield'
        },
        {
          title: 'الجرائم الإلكترونية',
          path: '/cybercrime',
          icon: 'Computer'
        },
        {
          title: 'التقارير والإحصائيات',
          path: '/reports',
          icon: 'BarChart3'
        },
        {
          title: 'التغذية',
          path: '/feed',
          icon: 'Rss'
        },
        {
          title: 'إدارة القسم',
          path: '/admin-panel',
          icon: 'Settings'
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
        },
        {
          title: 'التغذية',
          path: '/feed',
          icon: 'Rss'
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
        },
        {
          title: 'التغذية',
          path: '/feed',
          icon: 'Rss'
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
        },
        {
          title: 'التغذية',
          path: '/feed',
          icon: 'Rss'
        }
      ],
      officer: [
        {
          title: 'التغذية',
          path: '/feed',
          icon: 'Rss'
        }
      ],
      user: [
        {
          title: 'التغذية',
          path: '/feed',
          icon: 'Rss'
        }
      ]
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