import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { createError } from './errorHandler';

// Validation result handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(createError(errorMessages.join(', '), 400, 'VALIDATION_ERROR'));
  }
  next();
};

// Authentication validation
export const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('targetJobTitle')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Target job title must be between 1 and 100 characters'),
  body('jobSearchDeadline')
    .isISO8601()
    .withMessage('Job search deadline must be a valid date'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Project validation
export const validateProject = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Project title must be between 1 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Project description must be between 10 and 2000 characters'),
  body('techStack')
    .isArray({ min: 1 })
    .withMessage('Tech stack must be an array with at least one technology'),
  body('techStack.*')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each technology must be between 1 and 50 characters'),
  body('targetEndDate')
    .isISO8601()
    .withMessage('Target end date must be a valid date'),
  body('repositoryUrl')
    .optional()
    .isURL()
    .withMessage('Repository URL must be a valid URL'),
  body('liveUrl')
    .optional()
    .isURL()
    .withMessage('Live URL must be a valid URL'),
  body('revenueTracking')
    .optional()
    .isBoolean()
    .withMessage('Revenue tracking must be a boolean value'),
  handleValidationErrors
];

export const validateProjectUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Project title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Project description must be between 10 and 2000 characters'),
  body('techStack')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Tech stack must be an array with at least one technology'),
  body('techStack.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each technology must be between 1 and 50 characters'),
  body('targetEndDate')
    .optional()
    .isISO8601()
    .withMessage('Target end date must be a valid date'),
  body('repositoryUrl')
    .optional()
    .isURL()
    .withMessage('Repository URL must be a valid URL'),
  body('liveUrl')
    .optional()
    .isURL()
    .withMessage('Live URL must be a valid URL'),
  handleValidationErrors
];

export const validateProjectId = [
  param('id')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Project ID is required'),
  handleValidationErrors
];

// Resume validation
export const validateResume = [
  body('versionName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Version name must be between 1 and 100 characters'),
  body('templateId')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Template ID must be between 1 and 50 characters'),
  body('content')
    .isObject()
    .withMessage('Content must be an object'),
  body('content.personalInfo')
    .isObject()
    .withMessage('Personal info must be an object'),
  body('content.personalInfo.firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('content.personalInfo.lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('content.personalInfo.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('content.summary')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Summary must be between 10 and 500 characters'),
  body('content.experience')
    .isArray()
    .withMessage('Experience must be an array'),
  body('content.skills')
    .isArray({ min: 1 })
    .withMessage('Skills must be an array with at least one skill'),
  handleValidationErrors
];

export const validateResumeId = [
  param('id')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Resume ID is required'),
  handleValidationErrors
];

// Job application validation
export const validateJobApplication = [
  body('companyName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Company name must be between 1 and 100 characters'),
  body('jobTitle')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Job title must be between 1 and 100 characters'),
  body('jobUrl')
    .isURL()
    .withMessage('Job URL must be a valid URL'),
  body('applicationDate')
    .isISO8601()
    .withMessage('Application date must be a valid date'),
  body('resumeVersionId')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Resume version ID is required'),
  body('coverLetter')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Cover letter must be less than 5000 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
  handleValidationErrors
];

export const validateApplicationStatus = [
  body('status')
    .isIn(['applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn'])
    .withMessage('Status must be one of: applied, screening, interview, offer, rejected, withdrawn'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
  handleValidationErrors
];

export const validateApplicationId = [
  param('id')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Application ID is required'),
  handleValidationErrors
];

// Interview validation
export const validateInterview = [
  body('applicationId')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Application ID is required'),
  body('interviewType')
    .isIn(['phone', 'video', 'onsite', 'technical'])
    .withMessage('Interview type must be one of: phone, video, onsite, technical'),
  body('scheduledDate')
    .isISO8601()
    .withMessage('Scheduled date must be a valid date'),
  body('duration')
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  body('interviewerName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Interviewer name must be less than 100 characters'),
  body('preparationNotes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Preparation notes must be less than 2000 characters'),
  handleValidationErrors
];

export const validateInterviewFeedback = [
  body('outcome')
    .isIn(['pending', 'passed', 'failed', 'cancelled'])
    .withMessage('Outcome must be one of: pending, passed, failed, cancelled'),
  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Feedback must be less than 2000 characters'),
  body('questionsAsked')
    .optional()
    .isArray()
    .withMessage('Questions asked must be an array'),
  body('strengths')
    .optional()
    .isArray()
    .withMessage('Strengths must be an array'),
  body('areasForImprovement')
    .optional()
    .isArray()
    .withMessage('Areas for improvement must be an array'),
  handleValidationErrors
];

export const validateInterviewId = [
  param('id')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Interview ID is required'),
  handleValidationErrors
];

// Portfolio validation
export const validatePortfolio = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Portfolio title must be between 1 and 200 characters'),
  body('subtitle')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Subtitle must be less than 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('theme')
    .optional()
    .isIn(['default', 'dark', 'minimal', 'professional'])
    .withMessage('Theme must be one of: default, dark, minimal, professional'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('Is public must be a boolean value'),
  body('customDomain')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Custom domain must be less than 100 characters'),
  handleValidationErrors
];

// Motivation validation
export const validateActivity = [
  body('type')
    .isIn(['coding', 'learning', 'applications', 'networking', 'interview_prep'])
    .withMessage('Activity type must be one of: coding, learning, applications, networking, interview_prep'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
  body('duration')
    .isInt({ min: 1, max: 1440 })
    .withMessage('Duration must be between 1 and 1440 minutes'),
  body('projectId')
    .optional()
    .isString()
    .isLength({ min: 1 })
    .withMessage('Project ID must be a valid string'),
  handleValidationErrors
];

export const validateGoal = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Goal title must be between 1 and 200 characters'),
  body('target')
    .isInt({ min: 1 })
    .withMessage('Target must be a positive integer'),
  body('deadline')
    .isISO8601()
    .withMessage('Deadline must be a valid date'),
  body('type')
    .isIn(['project_completion', 'application_submission', 'learning', 'interview_performance'])
    .withMessage('Goal type must be one of: project_completion, application_submission, learning, interview_performance'),
  handleValidationErrors
];

// Market analysis validation
export const validateMarketResearch = [
  body('projectTitle')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Project title must be between 1 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('targetMarket')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Target market must be between 1 and 200 characters'),
  body('keyFeatures')
    .isArray({ min: 1 })
    .withMessage('Key features must be an array with at least one feature'),
  body('keyFeatures.*')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Each key feature must be between 1 and 100 characters'),
  handleValidationErrors
];

// Revenue tracking validation
export const validateRevenueMetric = [
  body('projectId')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Project ID is required'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('source')
    .isIn(['subscription', 'one_time', 'advertising', 'affiliate', 'other'])
    .withMessage('Source must be one of: subscription, one_time, advertising, affiliate, other'),
  body('date')
    .isISO8601()
    .withMessage('Date must be a valid date'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
  handleValidationErrors
];

// Query parameter validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

export const validateStatusFilter = [
  query('status')
    .optional()
    .isIn(['planning', 'in-progress', 'completed', 'paused'])
    .withMessage('Status must be one of: planning, in-progress, completed, paused'),
  handleValidationErrors
];

export const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  handleValidationErrors
]; 