import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
  
  firstName: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.min': 'First name is required',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required'
    }),
  
  lastName: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.min': 'Last name is required',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required'
    }),
  
  targetJobTitle: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Target job title cannot exceed 100 characters'
    }),
  
  jobSearchDeadline: Joi.date()
    .min('now')
    .optional()
    .messages({
      'date.min': 'Job search deadline must be in the future'
    })
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

export const updateProfileSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.min': 'First name cannot be empty',
      'string.max': 'First name cannot exceed 50 characters'
    }),
  
  lastName: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Last name cannot be empty',
      'string.max': 'Last name cannot exceed 50 characters'
    }),
  
  targetJobTitle: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Target job title cannot exceed 100 characters'
    }),
  
  jobSearchDeadline: Joi.date()
    .optional()
    .allow(null)
    .messages({
      'date.base': 'Please provide a valid date'
    })
});

// Project validation schemas
export const createProjectSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'Project title is required',
      'string.max': 'Project title cannot exceed 100 characters',
      'any.required': 'Project title is required'
    }),
  
  description: Joi.string()
    .trim()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'string.min': 'Project description is required',
      'string.max': 'Project description cannot exceed 1000 characters',
      'any.required': 'Project description is required'
    }),
  
  techStack: Joi.array()
    .items(Joi.string().trim().min(1))
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one technology is required',
      'any.required': 'Tech stack is required'
    }),
  
  startDate: Joi.date()
    .optional()
    .default(() => new Date())
    .messages({
      'date.base': 'Please provide a valid start date'
    }),
  
  targetEndDate: Joi.date()
    .required()
    .custom((value, helpers) => {
      const startDate = helpers.state.ancestors[0].startDate || new Date();
      const maxEndDate = new Date(startDate);
      maxEndDate.setDate(maxEndDate.getDate() + 7);
      
      if (value > maxEndDate) {
        return helpers.error('date.max');
      }
      
      if (value <= startDate) {
        return helpers.error('date.min');
      }
      
      return value;
    })
    .messages({
      'date.base': 'Please provide a valid target end date',
      'date.max': 'Target end date cannot exceed 1 week from start date',
      'date.min': 'Target end date must be after start date',
      'any.required': 'Target end date is required'
    }),
  
  status: Joi.string()
    .valid('PLANNING', 'IN_PROGRESS', 'COMPLETED', 'PAUSED')
    .optional()
    .default('PLANNING')
    .messages({
      'any.only': 'Invalid project status'
    }),
  
  repositoryUrl: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please provide a valid repository URL'
    }),
  
  liveUrl: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please provide a valid live URL'
    }),
  
  revenueTracking: Joi.boolean()
    .optional()
    .default(false),
  
  marketResearch: Joi.string()
    .trim()
    .max(2000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Market research cannot exceed 2000 characters'
    })
});

export const updateProjectSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Project title cannot be empty',
      'string.max': 'Project title cannot exceed 100 characters'
    }),
  
  description: Joi.string()
    .trim()
    .min(1)
    .max(1000)
    .optional()
    .messages({
      'string.min': 'Project description cannot be empty',
      'string.max': 'Project description cannot exceed 1000 characters'
    }),
  
  techStack: Joi.array()
    .items(Joi.string().trim().min(1))
    .min(1)
    .optional()
    .messages({
      'array.min': 'At least one technology is required'
    }),
  
  startDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'Please provide a valid start date'
    }),
  
  targetEndDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'Please provide a valid target end date'
    }),
  
  status: Joi.string()
    .valid('PLANNING', 'IN_PROGRESS', 'COMPLETED', 'PAUSED')
    .optional()
    .messages({
      'any.only': 'Invalid project status'
    }),
  
  repositoryUrl: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please provide a valid repository URL'
    }),
  
  liveUrl: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please provide a valid live URL'
    }),
  
  revenueTracking: Joi.boolean()
    .optional(),
  
  marketResearch: Joi.string()
    .trim()
    .max(2000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Market research cannot exceed 2000 characters'
    })
});

// Validation helper functions
export function validateCreateProject(data: any) {
  const { error, value } = createProjectSchema.validate(data, { abortEarly: false });
  
  if (error) {
    return {
      success: false,
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    };
  }
  
  return {
    success: true,
    data: value
  };
}

export function validateUpdateProject(data: any) {
  const { error, value } = updateProjectSchema.validate(data, { abortEarly: false });
  
  if (error) {
    return {
      success: false,
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    };
  }
  
  return {
    success: true,
    data: value
  };
}