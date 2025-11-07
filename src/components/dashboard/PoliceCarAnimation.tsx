import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PoliceCarAnimationProps {
  notificationText?: string;
}

export const PoliceCarAnimation = ({ notificationText }: PoliceCarAnimationProps) => {
  const [latestNotification, setLatestNotification] = useState<string>("إشعار: تحديثات النظام");

  useEffect(() => {
    const fetchLatestNotification = async () => {
      try {
        // جلب آخر إشعار مهم (تسجيل دخول، محاولات مشبوهة، إلخ)
        const { data, error } = await supabase
          .from('notifications')
          .select('title, message')
          .or('title.ilike.%تسجيل دخول%,title.ilike.%محاولة%,title.ilike.%مشبوه%,title.ilike.%عاجل%,priority.eq.high')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (!error && data) {
          setLatestNotification(data.title || data.message || "إشعار: تحديثات النظام");
        }
      } catch (error) {
        console.error('Error fetching notification:', error);
      }
    };
    
    fetchLatestNotification();
    
    // الاشتراك في التحديثات الفورية
    const channel = supabase
      .channel('police-car-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: 'priority=eq.high'
        },
        (payload: any) => {
          const newNotification = payload.new;
          if (newNotification?.title) {
            setLatestNotification(newNotification.title);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const displayText = notificationText || latestNotification;
  return (
    <div className="relative w-full h-12 overflow-hidden mb-2 px-4">
      {/* Police Car */}
      <motion.div
        className="absolute top-2 flex items-center gap-2"
        initial={{ x: "-80px" }}
        animate={{
          x: ["-80px", "calc(100vw - 200px)", "calc(100vw - 200px)", "-80px"]
        }}
        transition={{
          duration: 16,
          times: [0, 0.35, 0.65, 1],
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {/* Realistic Police Car */}
        <div className="relative">
          <svg width="50" height="28" viewBox="0 0 100 56" className="drop-shadow-md">
            {/* Car Shadow */}
            <ellipse cx="50" cy="54" rx="35" ry="3" fill="#000000" opacity="0.15" />
            
            {/* Bottom Body */}
            <rect x="15" y="32" width="70" height="18" rx="4" fill="#1E3A8A" />
            
            {/* Top Cabin */}
            <path d="M 30 32 L 35 20 L 65 20 L 70 32 Z" fill="#1E40AF" />
            
            {/* Windshield */}
            <path d="M 36 21 L 40 30 L 60 30 L 64 21 Z" fill="#93C5FD" opacity="0.6" />
            
            {/* Side Windows */}
            <rect x="22" y="34" width="12" height="8" rx="1" fill="#60A5FA" opacity="0.5" />
            <rect x="66" y="34" width="12" height="8" rx="1" fill="#60A5FA" opacity="0.5" />
            
            {/* Headlights */}
            <circle cx="83" cy="38" r="2.5" fill="#FEF08A" opacity="0.9" />
            <circle cx="83" cy="44" r="2.5" fill="#FCA5A5" />
            
            {/* Side Mirrors */}
            <rect x="11" y="36" width="4" height="3" rx="1" fill="#1E3A8A" />
            <rect x="85" y="36" width="4" height="3" rx="1" fill="#1E3A8A" />
            
            {/* Wheels */}
            <g>
              {/* Front Wheel */}
              <circle cx="72" cy="50" r="6" fill="#1F2937" />
              <circle cx="72" cy="50" r="4" fill="#374151" />
              <circle cx="72" cy="50" r="2" fill="#6B7280" />
              
              {/* Rear Wheel */}
              <circle cx="28" cy="50" r="6" fill="#1F2937" />
              <circle cx="28" cy="50" r="4" fill="#374151" />
              <circle cx="28" cy="50" r="2" fill="#6B7280" />
            </g>
            
            {/* Police Star Badge */}
            <circle cx="50" cy="38" r="5" fill="#FFFFFF" opacity="0.9" />
            <text x="50" y="41" fontSize="8" fill="#1E40AF" textAnchor="middle" fontWeight="bold">★</text>
            
            {/* Door Line */}
            <line x1="50" y1="34" x2="50" y2="48" stroke="#1E3A8A" strokeWidth="1" opacity="0.3" />
          </svg>
          
          {/* Flashing Police Lights on Roof */}
          <div className="absolute -top-0.5 left-4 flex gap-1.5">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-red-600"
              style={{ boxShadow: "0 0 8px rgba(220, 38, 38, 0.8)" }}
              animate={{
                opacity: [1, 0.2, 1],
                scale: [1, 0.7, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-blue-600"
              style={{ boxShadow: "0 0 8px rgba(37, 99, 235, 0.8)" }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </div>
        
        {/* Notification Bubble */}
        <motion.div
          className="bg-white/95 backdrop-blur-sm border border-blue-300 rounded-md px-2 py-1 shadow-md max-w-[140px]"
          initial={{ opacity: 0, x: -10 }}
          animate={{ 
            opacity: [0, 1, 1, 1, 0],
            x: [-10, 0, 0, 0, -10]
          }}
          transition={{ 
            duration: 16,
            times: [0, 0.05, 0.35, 0.6, 0.65],
            repeat: Infinity
          }}
        >
          <p className="text-[10px] text-gray-700 truncate leading-tight">{displayText}</p>
        </motion.div>
      </motion.div>
    </div>
  );
};
