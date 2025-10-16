import React from 'react';
import { NewsManagement } from '@/components/NewsManagement';
import { BackButton } from '@/components/BackButton';
import { Newspaper } from 'lucide-react';

const NewsManagementPage = () => {
  // Notifications are now automatically created by database trigger
  // when a news article is published

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
