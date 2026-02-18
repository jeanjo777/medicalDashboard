/**
 * Auth Utilities Tests
 *
 * Tests for authentication utility functions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isAuthenticated,
  getUser,
  getAuthToken,
  logout,
  setAuthData,
  shouldRefreshToken,
  getUserIdFromToken,
  User,
} from '../auth';

// Mock the logger to avoid side effects
vi.mock('../logger', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Helper to create a valid JWT token
const createToken = (exp: number): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ exp, sub: 'user-123', email: 'test@example.com' }));
  return `${header}.${payload}.signature`;
};

// Create a valid token (expires in 1 hour)
const createValidToken = () => createToken(Math.floor(Date.now() / 1000) + 3600);

// Create an expired token (expired 1 hour ago)
const createExpiredToken = () => createToken(Math.floor(Date.now() / 1000) - 3600);

// Create a token expiring soon (in 2 minutes)
const createExpiringSoonToken = () => createToken(Math.floor(Date.now() / 1000) + 120);

describe('Auth Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  describe('isAuthenticated', () => {
    it('should return false when no token exists', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('should return true when valid token exists', () => {
      localStorage.setItem('auth_token', createValidToken());
      expect(isAuthenticated()).toBe(true);
    });

    it('should return false when token is expired', () => {
      localStorage.setItem('auth_token', createExpiredToken());
      expect(isAuthenticated()).toBe(false);
    });

    it('should clear auth data when token is expired', () => {
      localStorage.setItem('auth_token', createExpiredToken());
      localStorage.setItem('user', '{"id": "123"}');

      isAuthenticated();

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('getAuthToken', () => {
    it('should return null when no token exists', () => {
      expect(getAuthToken()).toBeNull();
    });

    it('should return the token when valid token exists', () => {
      const validToken = createValidToken();
      localStorage.setItem('auth_token', validToken);
      expect(getAuthToken()).toBe(validToken);
    });

    it('should return null and clear data when token is expired', () => {
      localStorage.setItem('auth_token', createExpiredToken());
      expect(getAuthToken()).toBeNull();
      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });

  describe('getUser', () => {
    it('should return null when no user data exists', () => {
      expect(getUser()).toBeNull();
    });

    it('should return parsed user data when valid', () => {
      const testUser: User = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
        role: 'doctor',
      };
      localStorage.setItem('user', JSON.stringify(testUser));

      const user = getUser();
      expect(user).toEqual(testUser);
    });

    it('should return null for invalid JSON', () => {
      localStorage.setItem('user', 'invalid-json');
      expect(getUser()).toBeNull();
    });

    it('should return null for user without required fields', () => {
      // Missing id and email
      localStorage.setItem('user', JSON.stringify({ name: 'Test' }));
      expect(getUser()).toBeNull();
    });
  });

  describe('setAuthData', () => {
    it('should store token and user data', () => {
      const testToken = createValidToken();
      const testUser: User = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
        role: 'doctor',
      };

      setAuthData(testToken, testUser);

      expect(localStorage.getItem('auth_token')).toBe(testToken);
      expect(JSON.parse(localStorage.getItem('user') || '{}')).toEqual(testUser);
    });
  });

  describe('logout', () => {
    it('should clear all auth data from localStorage', () => {
      // Mock window.location using Object.defineProperty
      const replaceMock = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { replace: replaceMock },
        writable: true,
      });

      localStorage.setItem('auth_token', createValidToken());
      localStorage.setItem('user', '{"id": "123", "email": "test@test.com"}');

      logout();

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(replaceMock).toHaveBeenCalledWith('/login');
    });
  });

  describe('shouldRefreshToken', () => {
    it('should return false when no token exists', () => {
      expect(shouldRefreshToken()).toBe(false);
    });

    it('should return false when token is not expiring soon', () => {
      localStorage.setItem('auth_token', createValidToken());
      expect(shouldRefreshToken()).toBe(false);
    });

    it('should return true when token is expiring soon', () => {
      localStorage.setItem('auth_token', createExpiringSoonToken());
      expect(shouldRefreshToken()).toBe(true);
    });
  });

  describe('getUserIdFromToken', () => {
    it('should return null when no token exists', () => {
      expect(getUserIdFromToken()).toBeNull();
    });

    it('should return user id from valid token', () => {
      localStorage.setItem('auth_token', createValidToken());
      expect(getUserIdFromToken()).toBe('user-123');
    });

    it('should return null for invalid token', () => {
      localStorage.setItem('auth_token', 'invalid-token');
      expect(getUserIdFromToken()).toBeNull();
    });
  });
});
