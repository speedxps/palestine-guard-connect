import React from 'react';
import { cn } from '@/lib/utils';

interface BidiTextProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * LtrText - Wraps English/LTR text within RTL context
 * Use this for English words, technical terms, URLs, emails, etc.
 */
export const LtrText: React.FC<BidiTextProps> = ({ children, className }) => {
  return (
    <bdi className={cn('ltr-text', className)} dir="ltr">
      {children}
    </bdi>
  );
};

/**
 * TechTerm - For technical terms like React, API, etc.
 */
export const TechTerm: React.FC<BidiTextProps> = ({ children, className }) => {
  return (
    <span className={cn('tech-term', className)} dir="ltr">
      {children}
    </span>
  );
};

/**
 * RtlContainer - Ensures proper RTL context for mixed content
 */
export const RtlContainer: React.FC<BidiTextProps> = ({ children, className }) => {
  return (
    <div className={cn('rtl-container', className)} dir="rtl">
      {children}
    </div>
  );
};

/**
 * BidiIsolate - Isolates text to prevent BiDi interference
 */
export const BidiIsolate: React.FC<BidiTextProps> = ({ children, className }) => {
  return (
    <bdi className={cn('bidi-isolate', className)}>
      {children}
    </bdi>
  );
};

/**
 * MixedText - Smart component that auto-wraps English text in Arabic context
 * Automatically detects and wraps sequences of Latin characters
 */
export const MixedText: React.FC<BidiTextProps> = ({ children, className }) => {
  if (typeof children !== 'string') {
    return <span className={className}>{children}</span>;
  }

  // Regex to match Latin text sequences (including common technical terms)
  const latinPattern = /([A-Za-z0-9]+(?:[\s\-_.@/]+[A-Za-z0-9]+)*)/g;
  
  const parts = children.split(latinPattern);
  
  return (
    <span className={cn('bidi-isolate', className)} dir="rtl">
      {parts.map((part, index) => {
        // Check if this part is Latin text
        if (latinPattern.test(part)) {
          latinPattern.lastIndex = 0; // Reset regex state
          return (
            <bdi key={index} dir="ltr" className="ltr-text">
              {part}
            </bdi>
          );
        }
        return part;
      })}
    </span>
  );
};

export default {
  LtrText,
  TechTerm,
  RtlContainer,
  BidiIsolate,
  MixedText,
};
