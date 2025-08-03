import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotificationCenter from '../common/NotificationCenter';

// Mock the API
jest.mock('../../services/api', () => ({
  notificationAPI: {
    getNotifications: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    deleteNotification: jest.fn(),
  },
}));

describe('NotificationCenter', () => {
  const mockNotifications = [
    {
      id: '1',
      title: 'Project Created',
      message: 'Project created successfully',
      type: 'milestone' as const,
      priority: 'medium' as const,
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Error Occurred',
      message: 'Failed to create project',
      type: 'system' as const,
      priority: 'high' as const,
      read: false,
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders notification center button', () => {
    render(<NotificationCenter />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('shows notification count badge when there are unread notifications', async () => {
    const { notificationAPI } = require('../../services/api');
    notificationAPI.getNotifications.mockResolvedValue({
      data: {
        data: {
          notifications: mockNotifications,
          pagination: { unread: 2 }
        }
      }
    });

    render(<NotificationCenter />);
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('opens notification dialog when button is clicked', async () => {
    const { notificationAPI } = require('../../services/api');
    notificationAPI.getNotifications.mockResolvedValue({
      data: {
        data: {
          notifications: mockNotifications,
          pagination: { unread: 2 }
        }
      }
    });

    render(<NotificationCenter />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Notifications (2 unread)')).toBeInTheDocument();
    });
  });

  it('displays notifications in the dialog', async () => {
    const { notificationAPI } = require('../../services/api');
    notificationAPI.getNotifications.mockResolvedValue({
      data: {
        data: {
          notifications: mockNotifications,
          pagination: { unread: 2 }
        }
      }
    });

    render(<NotificationCenter />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Project Created')).toBeInTheDocument();
    });
    expect(screen.getByText('Error Occurred')).toBeInTheDocument();
  });

  it('shows empty state when no notifications', async () => {
    const { notificationAPI } = require('../../services/api');
    notificationAPI.getNotifications.mockResolvedValue({
      data: {
        data: {
          notifications: [],
          pagination: { unread: 0 }
        }
      }
    });

    render(<NotificationCenter />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching notifications', async () => {
    const { notificationAPI } = require('../../services/api');
    notificationAPI.getNotifications.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        data: {
          data: {
            notifications: [],
            pagination: { unread: 0 }
          }
        }
      }), 100))
    );

    render(<NotificationCenter />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText('Loading notifications...')).toBeInTheDocument();
  });
}); 