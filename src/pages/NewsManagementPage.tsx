import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NewsManagement } from '@/components/NewsManagement';
import { BackButton } from '@/components/BackButton';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Newspaper } from 'lucide-react';

const NewsManagementPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useUserRoles();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/access-denied');
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <BackButton />
          <div className="flex items-center gap-3 bg-card px-4 md:px-6 py-3 rounded-full shadow-lg border">
            <Newspaper className="h-6 md:h-8 w-6 md:w-8 text-primary" />
            <h1 className="text-xl md:text-3xl font-bold">إدارة الأخبار</h1>
          </div>
          <div />
        </div>

        <NewsManagement />
      </div>
    </div>
  );
};

export default NewsManagementPage;
