
import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

// Mock Interfaces
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'reader';
}

export interface PostgrestError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export interface PostgrestResponse<T> {
  data: T | null;
  error: PostgrestError | null;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author_id: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at?: string;
  image_url?: string;
  category: string;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
}

export interface EPaperPage {
  id: string;
  edition_date: string;
  page_number: number;
  image_url: string;
}

export interface EPaperClip {
  id: string;
  page_id: string;
  headline: string;
  article_id?: string;
  image_url: string; 
  coords: { x: number, y: number, width: number, height: number };
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  // Mock State
  private _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();

  constructor() {
    // Check local storage for session
    const storedUser = localStorage.getItem('mock_supabase_user');
    if (storedUser) {
      this._user.set(JSON.parse(storedUser));
    }
  }

  // Auth Mocks
  async signIn(email: string): Promise<{ user: User | null, error: PostgrestError | null }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (email.includes('error')) {
      return { user: null, error: { message: 'Invalid credentials' } };
    }

    // 1. Check if user exists in our "mock database" (localStorage)
    const storedUsers = JSON.parse(localStorage.getItem('mock_db_users') || '[]');
    const existingUser = storedUsers.find((u: User) => u.email === email);

    let user: User;

    if (existingUser) {
      user = existingUser;
    } else {
      // 2. Fallback for demo: Generate based on email content if not explicitly registered
      user = {
        id: 'user-' + Math.floor(Math.random() * 10000),
        email,
        role: email.includes('admin') ? 'admin' : (email.includes('editor') ? 'editor' : 'reader')
      };
    }

    this._user.set(user);
    localStorage.setItem('mock_supabase_user', JSON.stringify(user));
    return { user, error: null };
  }

  async signUp(email: string, password: string, role: 'admin' | 'editor' | 'reader'): Promise<{ user: User | null, error: PostgrestError | null }> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple check if already exists
    const storedUsers = JSON.parse(localStorage.getItem('mock_db_users') || '[]');
    if (storedUsers.find((u: User) => u.email === email)) {
        return { user: null, error: { message: 'User already exists' } };
    }

    const newUser: User = {
        id: 'user-' + Math.floor(Math.random() * 100000),
        email,
        role
    };

    // Save to mock DB
    storedUsers.push(newUser);
    localStorage.setItem('mock_db_users', JSON.stringify(storedUsers));

    // Auto login
    this._user.set(newUser);
    localStorage.setItem('mock_supabase_user', JSON.stringify(newUser));

    return { user: newUser, error: null };
  }

  async resetPasswordForEmail(email: string): Promise<{ error: PostgrestError | null }> {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Always succeed for mock
      return { error: null };
  }

  async signOut(): Promise<void> {
    this._user.set(null);
    localStorage.removeItem('mock_supabase_user');
  }

  // Storage Mock
  storage = {
    from: (bucket: string) => ({
      upload: async (path: string, file: File | Blob): Promise<{ data: { path: string } | null, error: PostgrestError | null }> => {
        // RLS Check for Storage
        const user = this._user();
        if (!user || user.role === 'reader') {
           return { data: null, error: { message: 'Permission denied' } };
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        return { data: { path }, error: null };
      },
      getPublicUrl: (path: string) => {
        if (path.startsWith('blob:')) return { data: { publicUrl: path } };
        return { data: { publicUrl: `https://mock-storage.com/${bucket}/${path}` } };
      }
    })
  };

  // Database Mocks
  from(table: string) {
    return {
      select: <T = any>(query: string) => this.mockSelect<T>(table, query),
      insert: (data: unknown) => this.mockInsert(table, data),
      update: (data: unknown) => this.mockUpdate(table, data),
      delete: () => this.mockDelete(table),
      eq: (col: string, val: unknown) => this, // Chainable mock
      single: () => this // Chainable mock
    };
  }

  private async mockSelect<T>(table: string, query: string): Promise<{ data: T[], error: PostgrestError | null }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const stored = localStorage.getItem(`mock_db_${table}`);
    let data: any[] = stored ? JSON.parse(stored) : [];
    
    // Seed initial data if empty
    if (data.length === 0 && table === 'articles') {
      data = this.seedArticles();
      localStorage.setItem(`mock_db_${table}`, JSON.stringify(data));
    }

    // RLS: Read Policy
    const user = this._user();
    if (table === 'articles') {
      if (!user || user.role === 'reader') {
        data = data.filter((d: any) => d.status === 'published');
      }
    }

    return { data: data as T[], error: null };
  }

  private async mockInsert(table: string, row: any): Promise<{ data: any[], error: PostgrestError | null }> {
    if (!this.checkWritePermission(table)) {
      return { data: [], error: { message: 'Permission denied: Insufficient privileges' } };
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    const stored = localStorage.getItem(`mock_db_${table}`);
    const data = stored ? JSON.parse(stored) : [];
    const newRow = { 
      ...row, 
      id: Math.random().toString(36).substr(2, 9), 
      created_at: new Date().toISOString(),
      slug: row.slug || (row.title ? row.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined)
    };
    data.unshift(newRow);
    localStorage.setItem(`mock_db_${table}`, JSON.stringify(data));
    return { data: [newRow], error: null };
  }

  private mockUpdate(table: string, data: unknown) {
    return {
      eq: async (col: string, val: unknown) => {
        if (!this.checkWritePermission(table)) {
          return { data: null, error: { message: 'Permission denied: Insufficient privileges' } };
        }

        const stored = localStorage.getItem(`mock_db_${table}`);
        let rows = stored ? JSON.parse(stored) : [];
        rows = rows.map((r: any) => r[col] === val ? { ...r, ...(data as object), updated_at: new Date().toISOString() } : r);
        localStorage.setItem(`mock_db_${table}`, JSON.stringify(rows));
        return { data: rows, error: null };
      }
    };
  }

  private mockDelete(table: string) {
    return {
      eq: async (col: string, val: unknown) => {
        if (!this.checkWritePermission(table)) {
           return { data: null, error: { message: 'Permission denied: Insufficient privileges' } };
        }

        const stored = localStorage.getItem(`mock_db_${table}`);
        let rows = stored ? JSON.parse(stored) : [];
        rows = rows.filter((r: any) => r[col] !== val);
        localStorage.setItem(`mock_db_${table}`, JSON.stringify(rows));
        return { data: null, error: null };
      }
    };
  }

  private checkWritePermission(table: string): boolean {
    const user = this._user();
    if (!user) return false;
    
    // Admin has full access
    if (user.role === 'admin') return true;

    // Editor access
    if (user.role === 'editor') {
      if (table === 'articles') return true;
      if (table.startsWith('epaper')) return false; // Only admin manages epaper
    }

    // Readers have no write access
    return false;
  }

  private seedArticles() {
    const now = new Date();
    return [
        { 
          id: '1', 
          title: 'The Future of AI in Publishing', 
          slug: 'future-of-ai-publishing',
          content: '<p>Artificial Intelligence is reshaping how we consume news...</p><p>From automated journalism to personalized feeds, the landscape is changing rapidly.</p>', 
          excerpt: 'Artificial Intelligence is reshaping how we consume news. From automated journalism to personalized feeds, the landscape is changing rapidly.',
          author_id: '101', 
          status: 'published', 
          created_at: new Date(now.getTime() - 86400000 * 1).toISOString(), 
          category: 'Technology', 
          image_url: 'https://picsum.photos/800/400?random=1',
          tags: ['AI', 'Tech', 'Future'],
          meta_description: 'Discover how AI is transforming the publishing industry.'
        },
        { 
          id: '2', 
          title: 'Global Markets Rally Unexpectedly', 
          slug: 'global-markets-rally',
          content: '<p>Stocks hit record highs today as investors...</p>',
          excerpt: 'Stocks hit record highs today as investors react to new economic data, signaling a potential end to the recent volatility.',
          author_id: '102', 
          status: 'published', 
          created_at: new Date(now.getTime() - 86400000 * 0.5).toISOString(), 
          category: 'Finance', 
          image_url: 'https://picsum.photos/800/400?random=2',
          tags: ['Stocks', 'Economy'],
          meta_description: 'Daily market update and financial analysis.'
        },
        {
          id: '3',
          title: 'The Renaissance of Modern Architecture',
          slug: 'modern-architecture-europe',
          content: '<p>New sustainable materials are driving a revolution in European building design...</p>',
          excerpt: 'New sustainable materials are driving a revolution in European building design, merging eco-friendliness with striking aesthetics.',
          author_id: '103',
          status: 'published',
          created_at: new Date(now.getTime() - 86400000 * 2).toISOString(),
          category: 'Culture',
          image_url: 'https://picsum.photos/800/400?random=3',
          tags: ['Design', 'Architecture', 'Europe']
        },
        {
          id: '4',
          title: 'Championship Finals Set for Sunday',
          slug: 'championship-finals-sunday',
          content: '<p>The stage is set for the biggest game of the year...</p>',
          excerpt: 'The stage is set for the biggest game of the year as rivals prepare to clash in the grand stadium this coming weekend.',
          author_id: '104',
          status: 'published',
          created_at: new Date(now.getTime() - 86400000 * 0.2).toISOString(),
          category: 'Sports',
          image_url: 'https://picsum.photos/800/400?random=4',
          tags: ['Sports', 'Football', 'Finals']
        },
        {
          id: '5',
          title: 'New Health Regulations Approved',
          slug: 'health-regulations-approved',
          content: '<p>Parliament has passed the controversial bill...</p>',
          excerpt: 'Parliament has passed the controversial bill regarding public health standards, aiming to improve longevity and care quality.',
          author_id: '105',
          status: 'published',
          created_at: new Date(now.getTime() - 86400000 * 3).toISOString(),
          category: 'Health',
          image_url: 'https://picsum.photos/800/400?random=5',
          tags: ['Health', 'Policy', 'Law']
        },
        {
          id: '6',
          title: 'Draft: Top 10 Gadgets of 2025',
          slug: 'top-gadgets-2025',
          content: '<p>Coming soon...</p>',
          excerpt: 'A preview of the hottest tech coming this year.',
          author_id: '101',
          status: 'draft',
          created_at: now.toISOString(),
          category: 'Technology',
          image_url: 'https://picsum.photos/800/400?random=6',
          tags: ['Gadgets', 'Review']
        }
      ];
  }
}
