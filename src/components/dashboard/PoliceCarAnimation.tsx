import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const PoliceCarAnimation = () => {
  const [latestNotification, setLatestNotification] = useState("تم استلام إشعار جديد");

  return (
    <div className="relative w-full h-24 overflow-hidden mb-6 px-4">
      {/* Police Car */}
      <motion.div
        className="absolute top-8 flex items-center gap-3"
        initial={{ x: "-100%" }}
        animate={{
          x: ["0%", "calc(100vw - 240px)", "calc(100vw - 240px)", "0%"]
        }}
        transition={{
          duration: 12,
          times: [0, 0.4, 0.6, 1],
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Police Car Body */}
        <div className="relative">
          {/* Car Main Body */}
          <svg width="80" height="40" viewBox="0 0 80 40" className="drop-shadow-lg">
            {/* Car Body */}
            <rect x="10" y="20" width="60" height="15" rx="3" fill="#1E40AF" />
            <rect x="15" y="10" width="30" height="12" rx="2" fill="#3B82F6" />
            
            {/* Windows */}
            <rect x="17" y="12" width="12" height="8" rx="1" fill="#DBEAFE" opacity="0.7" />
            <rect x="31" y="12" width="12" height="8" rx="1" fill="#DBEAFE" opacity="0.7" />
            
            {/* Wheels */}
            <circle cx="25" cy="35" r="5" fill="#1F2937" />
            <circle cx="25" cy="35" r="3" fill="#374151" />
            <circle cx="55" cy="35" r="5" fill="#1F2937" />
            <circle cx="55" cy="35" r="3" fill="#374151" />
            
            {/* Details */}
            <rect x="45" y="22" width="8" height="4" rx="1" fill="#FCD34D" opacity="0.9" />
          </svg>
          
          {/* Flashing Lights */}
          <div className="absolute -top-1 left-6 flex gap-2">
            <motion.div
              className="w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50"
              animate={{
                opacity: [1, 0.3, 1],
                scale: [1, 0.8, 1],
                boxShadow: [
                  "0 0 10px rgba(239, 68, 68, 0.8)",
                  "0 0 5px rgba(239, 68, 68, 0.3)",
                  "0 0 10px rgba(239, 68, 68, 0.8)"
                ]
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1, 0.8],
                boxShadow: [
                  "0 0 5px rgba(59, 130, 246, 0.3)",
                  "0 0 10px rgba(59, 130, 246, 0.8)",
                  "0 0 5px rgba(59, 130, 246, 0.3)"
                ]
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </div>
        
        {/* Notification Bubble - Shows when car is moving forward */}
        <motion.div
          className="bg-white border-2 border-blue-400 rounded-lg px-3 py-1.5 shadow-lg max-w-[150px] whitespace-nowrap"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            scale: [0.8, 1, 1, 0.8]
          }}
          transition={{ 
            duration: 12,
            times: [0, 0.1, 0.5, 0.6],
            repeat: Infinity
          }}
        >
          <p className="text-xs text-gray-700 truncate">{latestNotification}</p>
        </motion.div>
      </motion.div>
    </div>
  );
};
