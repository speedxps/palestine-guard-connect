// Simple encryption utilities for face data
// In production, use proper encryption libraries like Web Crypto API

export class FaceEncryption {
  private static readonly ENCRYPTION_KEY = 'palestinian-police-face-key-2024';
  
  // Simple XOR encryption for demonstration
  // In production, use AES-256 or similar strong encryption
  static encrypt(data: string): string {
    const key = this.ENCRYPTION_KEY;
    let result = '';
    
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    
    return btoa(result);
  }
  
  static decrypt(encryptedData: string): string {
    const key = this.ENCRYPTION_KEY;
    const data = atob(encryptedData);
    let result = '';
    
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    
    return result;
  }
  
  // Hash function for additional security
  static hash(data: string): string {
    let hash = 0;
    if (data.length === 0) return hash.toString();
    
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }
  
  // Generate secure random salt
  static generateSalt(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

// Privacy protection utilities
export class FacePrivacy {
  // Check if face data should be deleted (privacy compliance)
  static shouldDeleteOldData(createdAt: string): boolean {
    const created = new Date(createdAt);
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);
    
    return created < sixMonthsAgo;
  }
  
  // Anonymize face data for logs
  static anonymizeUserId(userId: string): string {
    return FaceEncryption.hash(userId).substring(0, 8);
  }
  
  // Validate face data integrity
  static validateFaceData(faceData: any): boolean {
    return (
      faceData &&
      typeof faceData.user_id === 'string' &&
      typeof faceData.face_encoding === 'string' &&
      faceData.face_encoding.length > 0 &&
      faceData.is_active === true
    );
  }
}