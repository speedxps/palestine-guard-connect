import { useState, useEffect, createContext, useContext } from 'react';

export type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.feed': 'التحديثات',
    'nav.incidents': 'البلاغات',
    'nav.new_incident': 'بلاغ جديد',
    'nav.patrol': 'الدوريات',
    'nav.tasks': 'المهام',
    'nav.chat': 'المحادثات',
    'nav.violations': 'المخالفات',
    'nav.cybercrime': 'الجرائم الإلكترونية',
    'nav.wanted_persons': 'المطلوبين',
    'nav.citizen_records': 'سجلات المواطنين',
    'nav.profile': 'الملف الشخصي',
    'nav.backup': 'النسخ الاحتياطية',
    'nav.about': 'حول التطبيق',
    
    // General
    'general.loading': 'جاري التحميل...',
    'general.error': 'حدث خطأ',
    'general.success': 'تم بنجاح',
    'general.save': 'حفظ',
    'general.cancel': 'إلغاء',
    'general.edit': 'تعديل',
    'general.delete': 'حذف',
    'general.view': 'عرض',
    'general.search': 'بحث',
    'general.filter': 'فلترة',
    'general.add': 'إضافة',
    'general.close': 'إغلاق',
    'general.submit': 'إرسال',
    'general.back': 'العودة',
    'general.next': 'التالي',
    'general.previous': 'السابق',
    'general.name': 'الاسم',
    'general.status': 'الحالة',
    'general.date': 'التاريخ',
    'general.time': 'الوقت',
    'general.description': 'الوصف',
    'general.details': 'التفاصيل',
    'general.location': 'الموقع',
    'general.phone': 'الهاتف',
    'general.email': 'البريد الإلكتروني',
    'general.address': 'العنوان',
    'general.national_id': 'الهوية الوطنية',
    
    // Citizen Records Page
    'citizen_records.title': 'سجلات المواطنين',
    'citizen_records.subtitle': 'سجلات المواطنين الذين لديهم قضايا أو مخالفات',
    'citizen_records.no_records': 'لا توجد سجلات',
    'citizen_records.total_records': 'إجمالي السجلات',
    'citizen_records.traffic_violations': 'مخالفات مرورية',
    'citizen_records.cybercrime_reports': 'بلاغات جرائم إلكترونية',
    'citizen_records.incidents': 'حوادث',
    'citizen_records.wanted': 'مطلوب',
    'citizen_records.citizen_info': 'معلومات المواطن',
    'citizen_records.violations_history': 'تاريخ المخالفات',
    'citizen_records.cases_history': 'تاريخ القضايا',
    'citizen_records.view_details': 'عرض التفاصيل',
    
    // Login
    'login.title': 'تسجيل الدخول',
    'login.email': 'البريد الإلكتروني',
    'login.password': 'كلمة المرور',
    'login.remember_me': 'تذكرني',
    'login.forgot_password': 'نسيت كلمة المرور؟',
    'login.login_button': 'تسجيل الدخول',
    'login.biometric_login': 'تسجيل الدخول بالبصمة',
    
    // Dashboard
    'dashboard.welcome': 'مرحباً بك',
    'dashboard.recent_incidents': 'البلاغات الحديثة',
    'dashboard.active_patrols': 'الدوريات النشطة',
    'dashboard.pending_tasks': 'المهام المعلقة',
    'dashboard.statistics': 'الإحصائيات',
    
    // Language Settings
    'language.title': 'اللغة',
    'language.arabic': 'العربية',
    'language.english': 'English',
    'language.note': 'ملاحظة: سيتم إعادة تحميل التطبيق لتطبيق اللغة الجديدة.',
    'language.apply': 'تطبيق اللغة',
    'language.applying': 'جاري التطبيق...',
    'language.changed': 'تم تغيير اللغة',
    'language.changed_success': 'تم تطبيق اللغة العربية بنجاح',
    
    // About Page
    'about.title': 'حول نظام الشرطة الفلسطينية',
    'about.subtitle': 'نظام إدارة شامل ومتطور للشرطة الفلسطينية',
    'about.version': 'الإصدار',
    'about.developed_by': 'تم تطويره بواسطة',
    'about.development_start': 'بدء التطوير',
    'about.last_update': 'آخر تحديث',
    'about.overview_title': 'نظرة عامة',
    'about.overview_desc': 'نظام إدارة شامل مصمم خصيصاً للشرطة الفلسطينية يتضمن كافة الوظائف الأساسية لإدارة العمليات الشرطية بكفاءة وأمان عالي.',
    'about.tech_stack_title': 'التقنيات المستخدمة',
    'about.features_title': 'الميزات الرئيسية',
    'about.security_title': 'الأمان والحماية',
    'about.architecture_title': 'هيكل النظام',
    'about.future_title': 'التطويرات المستقبلية',
    'about.contact_title': 'التواصل والدعم',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.feed': 'Feed',
    'nav.incidents': 'Incidents',
    'nav.new_incident': 'New Incident',
    'nav.patrol': 'Patrol',
    'nav.tasks': 'Tasks',
    'nav.chat': 'Chat',
    'nav.violations': 'Violations',
    'nav.cybercrime': 'Cybercrime',
    'nav.wanted_persons': 'Wanted Persons',
    'nav.citizen_records': 'Citizen Records',
    'nav.profile': 'Profile',
    'nav.backup': 'Backup',
    'nav.about': 'About',
    
    // General
    'general.loading': 'Loading...',
    'general.error': 'Error occurred',
    'general.success': 'Success',
    'general.save': 'Save',
    'general.cancel': 'Cancel',
    'general.edit': 'Edit',
    'general.delete': 'Delete',
    'general.view': 'View',
    'general.search': 'Search',
    'general.filter': 'Filter',
    'general.add': 'Add',
    'general.close': 'Close',
    'general.submit': 'Submit',
    'general.back': 'Back',
    'general.next': 'Next',
    'general.previous': 'Previous',
    'general.name': 'Name',
    'general.status': 'Status',
    'general.date': 'Date',
    'general.time': 'Time',
    'general.description': 'Description',
    'general.details': 'Details',
    'general.location': 'Location',
    'general.phone': 'Phone',
    'general.email': 'Email',
    'general.address': 'Address',
    'general.national_id': 'National ID',
    
    // Citizen Records Page
    'citizen_records.title': 'Citizen Records',
    'citizen_records.subtitle': 'Citizens with cases or violations',
    'citizen_records.no_records': 'No records found',
    'citizen_records.total_records': 'Total Records',
    'citizen_records.traffic_violations': 'Traffic Violations',
    'citizen_records.cybercrime_reports': 'Cybercrime Reports',
    'citizen_records.incidents': 'Incidents',
    'citizen_records.wanted': 'Wanted',
    'citizen_records.citizen_info': 'Citizen Information',
    'citizen_records.violations_history': 'Violations History',
    'citizen_records.cases_history': 'Cases History',
    'citizen_records.view_details': 'View Details',
    
    // Login
    'login.title': 'Login',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.remember_me': 'Remember me',
    'login.forgot_password': 'Forgot password?',
    'login.login_button': 'Login',
    'login.biometric_login': 'Login with Biometrics',
    
    // Dashboard
    'dashboard.welcome': 'Welcome',
    'dashboard.recent_incidents': 'Recent Incidents',
    'dashboard.active_patrols': 'Active Patrols',
    'dashboard.pending_tasks': 'Pending Tasks',
    'dashboard.statistics': 'Statistics',
    
    // Language Settings
    'language.title': 'Language',
    'language.arabic': 'العربية',
    'language.english': 'English',
    'language.note': 'Note: The app will reload to apply the new language.',
    'language.apply': 'Apply Language',
    'language.applying': 'Applying...',
    'language.changed': 'Language Changed',
    'language.changed_success': 'English language applied successfully',
    
    // About Page
    'about.title': 'About Palestinian Police System',
    'about.subtitle': 'Comprehensive and Advanced Management System for Palestinian Police',
    'about.version': 'Version',
    'about.developed_by': 'Developed by',
    'about.development_start': 'Development Started',
    'about.last_update': 'Last Updated',
    'about.overview_title': 'Overview',
    'about.overview_desc': 'A comprehensive management system specifically designed for the Palestinian Police, including all essential functions for efficient and secure police operations management.',
    'about.tech_stack_title': 'Technology Stack',
    'about.features_title': 'Key Features',
    'about.security_title': 'Security & Protection',
    'about.architecture_title': 'System Architecture',
    'about.future_title': 'Future Developments',
    'about.contact_title': 'Contact & Support',
  }
};

// This hook is now deprecated - use useTranslation instead
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};