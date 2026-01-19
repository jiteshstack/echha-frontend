export interface Persona {
    _id: string;
    userId: string;
    prompt: string;
    imageUrl?: string;
    videoUrl?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    createdAt: string;
    updatedAt: string;
    
    // --- ADD THESE NEW FIELDS ---
    title?: string;
    price?: number;
    currency?: string;
    domain?: string;
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
    message?: string;
  }

  export interface User {
    id: string;
    name: string;
    email: string;
    username?: string;
    avatar?: string;
    dnaCard?: {
      persona: string;
      palette: string[];
      tribe: string;
    };
  }