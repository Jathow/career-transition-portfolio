import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export const getUserPreferences = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    let preferences = await prisma.userPreferences.findUnique({
      where: { userId }
    });

    // If no preferences exist, create default ones
    if (!preferences) {
      preferences = await prisma.userPreferences.create({
        data: {
          userId,
          darkMode: true,
          compactMode: false,
          autoSave: true,
          showTutorials: true,
          emailNotifications: true,
          pushNotifications: true,
          reminderNotifications: true,
          updateNotifications: false,
        }
      });
    }

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    logger.error('Error getting user preferences:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get user preferences',
      },
    });
  }
};

export const updateUserPreferences = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const {
      darkMode,
      compactMode,
      autoSave,
      showTutorials,
      emailNotifications,
      pushNotifications,
      reminderNotifications,
      updateNotifications,
    } = req.body;

    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: {
        darkMode,
        compactMode,
        autoSave,
        showTutorials,
        emailNotifications,
        pushNotifications,
        reminderNotifications,
        updateNotifications,
      },
      create: {
        userId,
        darkMode: darkMode ?? true,
        compactMode: compactMode ?? false,
        autoSave: autoSave ?? true,
        showTutorials: showTutorials ?? true,
        emailNotifications: emailNotifications ?? true,
        pushNotifications: pushNotifications ?? true,
        reminderNotifications: reminderNotifications ?? true,
        updateNotifications: updateNotifications ?? false,
      }
    });

    logger.info('User preferences updated', { userId, preferences });

    res.json({
      success: true,
      data: preferences,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    logger.error('Error updating user preferences:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update user preferences',
      },
    });
  }
}; 