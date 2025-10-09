/**
 * API utility functions for making authenticated requests
 */

export class ApiClient {
    private static getAuthToken(): string | null {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem('auth-token');
    }
  
    private static getBaseHeaders(): HeadersInit {
      const token = this.getAuthToken();
      return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };
    }
  
    static async get(url: string): Promise<Response> {
      return fetch(url, {
        method: 'GET',
        headers: this.getBaseHeaders(),
      });
    }
  
    static async post(url: string, data: any): Promise<Response> {
      return fetch(url, {
        method: 'POST',
        headers: this.getBaseHeaders(),
        body: JSON.stringify(data),
      });
    }
  
    static async put(url: string, data: any): Promise<Response> {
      return fetch(url, {
        method: 'PUT',
        headers: this.getBaseHeaders(),
        body: JSON.stringify(data),
      });
    }
  
    static async delete(url: string): Promise<Response> {
      return fetch(url, {
        method: 'DELETE',
        headers: this.getBaseHeaders(),
      });
    }
  }
  
  // API endpoints
  export const API_ENDPOINTS = {
    AUTH_LOGIN: 'https://gep1.app.n8n.cloud/webhook/MA-login',
    AUTH_CHANGE_PASSWORD: 'https://gep1.app.n8n.cloud/webhook/MA-change-password',
    AUTH_LOGOUT: 'https://gep1.app.n8n.cloud/webhook/MA-logout',
    AUTH_VALIDATE: 'https://gep1.app.n8n.cloud/webhook/MA-validate-token',
  } as const;
  
  // Authentication API functions
  export async function loginUser(email: string, password: string) {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH_LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      });
      
      // Parse the response body first to get error details if available
      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        responseData = null;
      }
      
      if (!response.ok) {
        // Create a detailed error with the status and any server message
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        if (responseData) {
          // If server returned an error message, use it
          if (responseData.error) {
            errorMessage += ` - ${responseData.error}`;
          } else if (responseData.message) {
            errorMessage += ` - ${responseData.message}`;
          }
        }
        
        // Add status-specific messages
        if (response.status === 401) {
          errorMessage = responseData?.error || responseData?.message || 'Invalid email or password. Please check your credentials.';
        } else if (response.status === 403) {
          errorMessage = responseData?.error || responseData?.message || 'Access denied. Please contact administrator.';
        } else if (response.status === 429) {
          errorMessage = responseData?.error || responseData?.message || 'Too many login attempts. Please try again later.';
        } else if (response.status >= 500) {
          errorMessage = responseData?.error || responseData?.message || 'Server error. Please try again later.';
        }
        
        const error = new Error(errorMessage) as Error & { status: number };
        error.status = response.status;
        throw error;
      }
      
      return responseData;
    } catch (error) {
      console.error('Error logging in:', error);
      
      // If it's a network error or fetch failed
      if (error instanceof Error && error.name === 'TypeError' && error.message.includes('fetch')) {
        const networkError = new Error('Network error. Please check your connection and try again.') as Error & { isNetworkError: boolean };
        networkError.isNetworkError = true;
        throw networkError;
      }
      
      // Re-throw the error to be handled by the auth context
      throw error;
    }
  }
  
  export async function logoutUser(token: string) {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH_LOGOUT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          token
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }
  
  export async function changeUserPassword(email: string, currentPassword: string, newPassword: string) {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
      
      const response = await fetch(API_ENDPOINTS.AUTH_CHANGE_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          email,
          currentPassword,
          newPassword
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
  
  // Token validation function
  export async function validateToken(token: string) {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH_VALIDATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ token })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error validating token:', error);
      throw error;
    }
  }
  
  // Specific API functions
  // TODO: Add POST_LABEL endpoint when available
  // export async function submitFeedback(convId: string, tag: string, notes?: string) {
  //   try {
  //     const response = await ApiClient.post(API_ENDPOINTS.POST_LABEL, {
  //       convId,
  //       tag,
  //       notes: notes || ''
  //     });
      
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
      
  //     return await response.json();
  //   } catch (error) {
  //     console.error('Error submitting feedback:', error);
  //     throw error;
  //   }
  // }
