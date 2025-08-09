import { Request, Response } from 'express';

export const getFlags = (req: Request, res: Response) => {
  const flags = {
    analytics: process.env.ANALYTICS_ENABLED === 'true',
    feedbackWidget: process.env.FEEDBACK_WIDGET_ENABLED !== 'false',
    onboardingChecklist: process.env.ONBOARDING_CHECKLIST_ENABLED !== 'false',
    interviewPrep: process.env.INTERVIEW_PREP_ENABLED !== 'false',
    // monetization-related
    proEntitlements: process.env.PRO_ENTITLEMENTS_ENABLED === 'true',
  };

  res.json({ success: true, data: flags });
};


