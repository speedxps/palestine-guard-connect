import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface GuideRatingProps {
  topicId: string;
  topicTitle: string;
}

export const GuideRating: React.FC<GuideRatingProps> = ({ topicId, topicTitle }) => {
  const [rating, setRating] = useState<'helpful' | 'not-helpful' | null>(null);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    // Load saved rating from localStorage
    const savedRating = localStorage.getItem(`guide-rating-${topicId}`);
    if (savedRating) {
      setRating(savedRating as 'helpful' | 'not-helpful');
      setHasRated(true);
    }
  }, [topicId]);

  const handleRating = (ratingType: 'helpful' | 'not-helpful') => {
    setRating(ratingType);
    setHasRated(true);
    
    // Save to localStorage
    localStorage.setItem(`guide-rating-${topicId}`, ratingType);
    
    // Show success message
    if (ratingType === 'helpful') {
      toast.success('شكراً لتقييمك الإيجابي! 👍');
    } else {
      toast.info('شكراً لملاحظتك، سنعمل على تحسين هذا الموضوع. 💡');
    }
    
    // TODO: In a real app, send this to analytics or database
    console.log(`Rating for "${topicTitle}": ${ratingType}`);
  };

  if (hasRated) {
    return (
      <div className="mt-6 pt-6 border-t-2 border-gray-200">
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-center gap-3">
          <Check className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-medium">
            شكراً لتقييمك! تم حفظ ملاحظتك.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 pt-6 border-t-2 border-gray-200">
      <div className="text-center">
        <p className="text-gray-700 font-semibold mb-4">هل كان هذا الشرح مفيداً؟</p>
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleRating('helpful')}
            className="border-2 border-green-500 text-green-700 hover:bg-green-50 hover:border-green-600 transition-all"
          >
            <ThumbsUp className="h-5 w-5 ml-2" />
            نعم، مفيد
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleRating('not-helpful')}
            className="border-2 border-red-500 text-red-700 hover:bg-red-50 hover:border-red-600 transition-all"
          >
            <ThumbsDown className="h-5 w-5 ml-2" />
            يحتاج تحسين
          </Button>
        </div>
      </div>
    </div>
  );
};
