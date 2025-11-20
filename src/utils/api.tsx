import { projectId, publicAnonKey } from './supabase/info';
import { createClient } from './supabase/client';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-af101b5e`;

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

async function request(endpoint: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken || publicAnonKey}`,
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error(`API request error for ${endpoint}:`, error);
    throw error;
  }
}

// ==================== AUTH API ====================

export const authAPI = {
  async signup(data: {
    email: string;
    password: string;
    name: string;
    role: string;
    phone: string;
    location: string;
    lmp?: string;
  }) {
    // First, create the user via backend (which uses admin.createUser)
    const result = await request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Now sign in to get a session
    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      console.error('Sign in after signup error:', authError);
      throw new Error(authError.message);
    }

    if (!authData.session) {
      throw new Error('Failed to create session');
    }

    // Store the access token
    setAuthToken(authData.session.access_token);

    return { user: result.user, session: authData.session };
  },

  async login(email: string, password: string) {
    const supabase = createClient();
    
    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase auth login error:', error);
      throw new Error(error.message);
    }

    if (!data.session) {
      throw new Error('Failed to create session');
    }

    // Store the access token
    setAuthToken(data.session.access_token);

    // Get user profile from backend
    const result = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    return { user: result.user, session: data.session };
  },

  async logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setAuthToken(null);
  },

  async getSession() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      setAuthToken(session.access_token);
      
      try {
        const result = await request('/auth/session');
        return { user: result.user, session };
      } catch (error) {
        console.error('Failed to get user session from backend:', error);
        // If backend fails, sign out
        await supabase.auth.signOut();
        return { user: null, session: null };
      }
    }
    
    return { user: null, session: null };
  },
};

// ==================== PROFILE API ====================

export const profileAPI = {
  async update(data: any) {
    return await request('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ==================== PREGNANCY API ====================

export const pregnancyAPI = {
  async get(motherId: string) {
    return await request(`/pregnancy/${motherId}`);
  },

  async addMeasurement(motherId: string, measurement: any) {
    return await request(`/pregnancy/${motherId}/measurement`, {
      method: 'POST',
      body: JSON.stringify(measurement),
    });
  },
};

// ==================== APPOINTMENTS API ====================

export const appointmentsAPI = {
  async getAll() {
    return await request('/appointments');
  },

  async create(appointment: {
    clinicId: string;
    date: string;
    time: string;
    reason: string;
    type: string;
  }) {
    return await request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointment),
    });
  },

  async update(id: string, data: any) {
    return await request(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return await request(`/appointments/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== EDUCATION API ====================

export const educationAPI = {
  async getAll(category?: string) {
    const query = category ? `?category=${category}` : '';
    return await request(`/education${query}`);
  },

  async create(content: any) {
    return await request('/education', {
      method: 'POST',
      body: JSON.stringify(content),
    });
  },

  async update(id: string, content: any) {
    return await request(`/education/${id}`, {
      method: 'PUT',
      body: JSON.stringify(content),
    });
  },

  async delete(id: string) {
    return await request(`/education/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== MESSAGES API ====================

export const messagesAPI = {
  async getConversations() {
    return await request('/conversations');
  },

  async getMessages(otherUserId: string) {
    return await request(`/messages/${otherUserId}`);
  },

  async send(recipientId: string, content: string, type = 'text') {
    return await request('/messages', {
      method: 'POST',
      body: JSON.stringify({ recipientId, content, type }),
    });
  },
};

// ==================== NOTIFICATIONS API ====================

export const notificationsAPI = {
  async getAll() {
    return await request('/notifications');
  },

  async markAsRead(id: string) {
    return await request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },
};

// ==================== ADMIN API ====================

export const adminAPI = {
  async getAllUsers() {
    return await request('/admin/users');
  },

  async getPendingClinics() {
    return await request('/admin/pending-clinics');
  },

  async approveClinic(clinicId: string) {
    return await request(`/admin/clinics/${clinicId}/approve`, {
      method: 'POST',
    });
  },

  async deleteUser(userId: string) {
    return await request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  async createUser(data: {
    email: string;
    password: string;
    name: string;
    role: string;
    phone: string;
    location: string;
    lmp?: string;
  }) {
    return await request('/admin/users/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async makeAdmin(email: string) {
    return await request('/admin/make-admin', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};

// ==================== CLINIC API ====================

export const clinicAPI = {
  async getPatients() {
    return await request('/clinic/patients');
  },

  async getAll() {
    return await request('/clinics');
  },
};