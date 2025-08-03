import { PrismaClient, Resume } from '@prisma/client';
import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

export interface ResumeContent {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
  };
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    description: string[];
    technologies: string[];
  }>;
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
    repositoryUrl?: string;
    liveUrl?: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
  };
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
    gpa?: string;
  }>;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'professional' | 'creative' | 'minimal' | 'technical' | 'executive';
  preview: string;
}

export class ResumeService {
  // Enhanced resume templates with more professional options
  private static readonly TEMPLATES: ResumeTemplate[] = [
    {
      id: 'professional-standard',
      name: 'Professional Standard',
      description: 'Clean, traditional resume format suitable for most industries',
      category: 'professional',
      preview: 'Traditional layout with clear sections and professional typography'
    },
    {
      id: 'technical-developer',
      name: 'Technical Developer',
      description: 'Developer-focused template highlighting technical skills and projects',
      category: 'technical',
      preview: 'Emphasizes technical skills, projects, and code repositories'
    },
    {
      id: 'minimal-clean',
      name: 'Minimal Clean',
      description: 'Simple, elegant design with focus on content',
      category: 'minimal',
      preview: 'Clean lines, plenty of white space, modern typography'
    },
    {
      id: 'creative-modern',
      name: 'Creative Modern',
      description: 'Contemporary design with visual appeal',
      category: 'creative',
      preview: 'Modern layout with subtle design elements and color accents'
    },
    {
      id: 'executive-leadership',
      name: 'Executive Leadership',
      description: 'Senior-level template emphasizing leadership and achievements',
      category: 'executive',
      preview: 'Professional layout highlighting leadership experience and strategic impact'
    },
    {
      id: 'startup-entrepreneur',
      name: 'Startup Entrepreneur',
      description: 'Perfect for founders and startup professionals',
      category: 'creative',
      preview: 'Dynamic layout showcasing innovation, growth, and business impact'
    },
    {
      id: 'academic-research',
      name: 'Academic Research',
      description: 'Ideal for research positions and academic roles',
      category: 'professional',
      preview: 'Structured format emphasizing publications, research, and academic achievements'
    },
    {
      id: 'freelance-consultant',
      name: 'Freelance Consultant',
      description: 'Designed for independent contractors and consultants',
      category: 'minimal',
      preview: 'Clean design highlighting client work, projects, and expertise'
    }
  ];

  /**
   * Get all available resume templates
   */
  static async getTemplates(): Promise<ResumeTemplate[]> {
    return this.TEMPLATES;
  }

  /**
   * Get template by ID
   */
  static async getTemplateById(templateId: string): Promise<ResumeTemplate | null> {
    return this.TEMPLATES.find(template => template.id === templateId) || null;
  }

  /**
   * Get templates by category
   */
  static async getTemplatesByCategory(category: string): Promise<ResumeTemplate[]> {
    return this.TEMPLATES.filter(template => template.category === category);
  }

  /**
   * Create a new resume
   */
  static async createResume(
    userId: string,
    versionName: string,
    templateId: string,
    content: ResumeContent,
    isDefault?: boolean
  ): Promise<Resume> {
    try {
      // Validate template exists
      const template = await this.getTemplateById(templateId);
      if (!template) {
        throw new Error('Invalid template ID');
      }

      // If this is the first resume or marked as default, set isDefault to true
      const existingResumes = await prisma.resume.findMany({
        where: { userId }
      });

      const shouldBeDefault = existingResumes.length === 0 || isDefault;

      // If setting as default, unset other defaults
      if (shouldBeDefault) {
        await prisma.resume.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false }
        });
      }

      const resume = await prisma.resume.create({
        data: {
          userId,
          versionName,
          templateId,
          content: JSON.stringify(content),
          isDefault: shouldBeDefault
        }
      });

      logger.info(`Created resume ${resume.id} for user ${userId}`);
      return resume;
    } catch (error) {
      logger.error('Error creating resume:', error);
      throw error;
    }
  }

  /**
   * Get all resumes for a user
   */
  static async getUserResumes(userId: string): Promise<Resume[]> {
    try {
      const resumes = await prisma.resume.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' }
      });

      return resumes;
    } catch (error) {
      logger.error('Error fetching user resumes:', error);
      throw error;
    }
  }

  /**
   * Get a specific resume by ID
   */
  static async getResumeById(resumeId: string, userId: string): Promise<Resume | null> {
    try {
      const resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId }
      });

      return resume;
    } catch (error) {
      logger.error('Error fetching resume:', error);
      throw error;
    }
  }

  /**
   * Update an existing resume
   */
  static async updateResume(
    resumeId: string,
    userId: string,
    updates: {
      versionName?: string;
      templateId?: string;
      content?: ResumeContent;
      isDefault?: boolean;
    }
  ): Promise<Resume> {
    try {
      // Check if resume exists and belongs to user
      const existingResume = await this.getResumeById(resumeId, userId);
      if (!existingResume) {
        throw new Error('Resume not found');
      }

      // If setting as default, unset other defaults
      if (updates.isDefault) {
        await prisma.resume.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false }
        });
      }

      const updateData: any = {};
      if (updates.versionName) updateData.versionName = updates.versionName;
      if (updates.templateId) updateData.templateId = updates.templateId;
      if (updates.content) updateData.content = JSON.stringify(updates.content);
      if (updates.isDefault !== undefined) updateData.isDefault = updates.isDefault;

      const resume = await prisma.resume.update({
        where: { id: resumeId },
        data: updateData
      });

      logger.info(`Updated resume ${resumeId} for user ${userId}`);
      return resume;
    } catch (error) {
      logger.error('Error updating resume:', error);
      throw error;
    }
  }

  /**
   * Delete a resume
   */
  static async deleteResume(resumeId: string, userId: string): Promise<void> {
    try {
      const resume = await this.getResumeById(resumeId, userId);
      if (!resume) {
        throw new Error('Resume not found');
      }

      await prisma.resume.delete({
        where: { id: resumeId }
      });

      logger.info(`Deleted resume ${resumeId} for user ${userId}`);
    } catch (error) {
      logger.error('Error deleting resume:', error);
      throw error;
    }
  }

  /**
   * Set a resume as default
   */
  static async setDefaultResume(resumeId: string, userId: string): Promise<Resume> {
    try {
      const resume = await this.getResumeById(resumeId, userId);
      if (!resume) {
        throw new Error('Resume not found');
      }

      // Unset all other defaults
      await prisma.resume.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });

      // Set this resume as default
      const updatedResume = await prisma.resume.update({
        where: { id: resumeId },
        data: { isDefault: true }
      });

      logger.info(`Set resume ${resumeId} as default for user ${userId}`);
      return updatedResume;
    } catch (error) {
      logger.error('Error setting default resume:', error);
      throw error;
    }
  }

  /**
   * Get default resume for user
   */
  static async getDefaultResume(userId: string): Promise<Resume | null> {
    try {
      const resume = await prisma.resume.findFirst({
        where: { userId, isDefault: true }
      });

      return resume;
    } catch (error) {
      logger.error('Error fetching default resume:', error);
      throw error;
    }
  }

  /**
   * Generate resume content from user data and projects
   */
  static async generateResumeContent(userId: string): Promise<ResumeContent> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const projects = await prisma.project.findMany({
        where: { userId, status: 'COMPLETED' },
        orderBy: { actualEndDate: 'desc' }
      });

      // Convert projects to resume format
      const resumeProjects = projects.map(project => ({
        title: project.title,
        description: project.description,
        technologies: project.techStack.split(',').map(tech => tech.trim()),
        repositoryUrl: project.repositoryUrl || undefined,
        liveUrl: project.liveUrl || undefined
      }));

      // Basic resume content structure
      const content: ResumeContent = {
        personalInfo: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: '',
          location: '',
          linkedin: '',
          github: ''
        },
        summary: `Experienced developer transitioning to ${user.targetJobTitle || 'software development'} with a focus on building practical, user-centered applications.`,
        experience: [],
        projects: resumeProjects,
        skills: {
          technical: [],
          soft: []
        },
        education: []
      };

      return content;
    } catch (error) {
      logger.error('Error generating resume content:', error);
      throw error;
    }
  }

  /**
   * Export resume to different formats
   */
  static async exportResume(resumeId: string, userId: string, format: 'pdf' | 'docx' | 'txt'): Promise<Buffer> {
    try {
      const resume = await this.getResumeById(resumeId, userId);
      if (!resume) {
        throw new Error('Resume not found');
      }

      const content = JSON.parse(resume.content) as ResumeContent;
      const template = await this.getTemplateById(resume.templateId);

      if (!template) {
        throw new Error('Template not found');
      }

      let exportContent: Buffer;

      switch (format) {
        case 'txt':
          const textContent = this.generateTextResume(content);
          exportContent = Buffer.from(textContent, 'utf-8');
          break;
        case 'docx':
          exportContent = await this.generateDocxResume(content, template);
          break;
        case 'pdf':
          exportContent = await this.generatePdfResume(content, template);
          break;
        default:
          throw new Error('Unsupported export format');
      }

      logger.info(`Exported resume ${resumeId} in ${format} format for user ${userId}`);
      return exportContent;
    } catch (error) {
      logger.error('Error exporting resume:', error);
      throw error;
    }
  }

  /**
   * Generate Word document (.docx) format
   */
  private static async generateDocxResume(content: ResumeContent, template: ResumeTemplate): Promise<Buffer> {
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } = await import('docx');

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Header with name and contact info
            new Paragraph({
              children: [
                new TextRun({
                  text: `${content.personalInfo.firstName} ${content.personalInfo.lastName}`,
                  bold: true,
                  size: 32,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: content.personalInfo.email,
                  size: 20,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            ...(content.personalInfo.phone ? [new Paragraph({
              children: [new TextRun({ text: content.personalInfo.phone, size: 20 })],
              alignment: AlignmentType.CENTER,
            })] : []),
            ...(content.personalInfo.location ? [new Paragraph({
              children: [new TextRun({ text: content.personalInfo.location, size: 20 })],
              alignment: AlignmentType.CENTER,
            })] : []),
            ...(content.personalInfo.linkedin ? [new Paragraph({
              children: [new TextRun({ text: `LinkedIn: ${content.personalInfo.linkedin}`, size: 20 })],
              alignment: AlignmentType.CENTER,
            })] : []),
            ...(content.personalInfo.github ? [new Paragraph({
              children: [new TextRun({ text: `GitHub: ${content.personalInfo.github}`, size: 20 })],
              alignment: AlignmentType.CENTER,
            })] : []),
            
            // Summary section
            new Paragraph({ text: '', spacing: { before: 400 } }),
            new Paragraph({
              children: [new TextRun({ text: 'PROFESSIONAL SUMMARY', bold: true, size: 24 })],
            }),
            new Paragraph({
              children: [new TextRun({ text: content.summary, size: 20 })],
            }),

            // Experience section
            ...(content.experience.length > 0 ? [
              new Paragraph({ text: '', spacing: { before: 400 } }),
              new Paragraph({
                children: [new TextRun({ text: 'EXPERIENCE', bold: true, size: 24 })],
              }),
              ...content.experience.flatMap(exp => [
                new Paragraph({
                  children: [
                    new TextRun({ text: exp.position, bold: true, size: 22 }),
                    new TextRun({ text: ` at ${exp.company}`, size: 22 }),
                  ],
                }),
                new Paragraph({
                  children: [new TextRun({ text: `${exp.startDate} - ${exp.endDate || 'Present'}`, size: 18 })],
                }),
                ...exp.description.map(desc => 
                  new Paragraph({
                    children: [new TextRun({ text: `• ${desc}`, size: 20 })],
                    spacing: { before: 100 },
                  })
                ),
                new Paragraph({
                  children: [new TextRun({ text: `Technologies: ${exp.technologies.join(', ')}`, size: 18 })],
                }),
              ])
            ] : []),

            // Projects section
            ...(content.projects.length > 0 ? [
              new Paragraph({ text: '', spacing: { before: 400 } }),
              new Paragraph({
                children: [new TextRun({ text: 'PROJECTS', bold: true, size: 24 })],
              }),
              ...content.projects.flatMap(project => [
                new Paragraph({
                  children: [new TextRun({ text: project.title, bold: true, size: 22 })],
                }),
                new Paragraph({
                  children: [new TextRun({ text: project.description, size: 20 })],
                }),
                new Paragraph({
                  children: [new TextRun({ text: `Technologies: ${project.technologies.join(', ')}`, size: 18 })],
                }),
                ...(project.repositoryUrl ? [new Paragraph({
                  children: [new TextRun({ text: `Repository: ${project.repositoryUrl}`, size: 18 })],
                })] : []),
                ...(project.liveUrl ? [new Paragraph({
                  children: [new TextRun({ text: `Live Demo: ${project.liveUrl}`, size: 18 })],
                })] : []),
              ])
            ] : []),

            // Skills section
            ...((content.skills.technical.length > 0 || content.skills.soft.length > 0) ? [
              new Paragraph({ text: '', spacing: { before: 400 } }),
              new Paragraph({
                children: [new TextRun({ text: 'SKILLS', bold: true, size: 24 })],
              }),
              ...(content.skills.technical.length > 0 ? [
                new Paragraph({
                  children: [new TextRun({ text: `Technical: ${content.skills.technical.join(', ')}`, size: 20 })],
                }),
              ] : []),
              ...(content.skills.soft.length > 0 ? [
                new Paragraph({
                  children: [new TextRun({ text: `Soft Skills: ${content.skills.soft.join(', ')}`, size: 20 })],
                }),
              ] : []),
            ] : []),

            // Education section
            ...(content.education.length > 0 ? [
              new Paragraph({ text: '', spacing: { before: 400 } }),
              new Paragraph({
                children: [new TextRun({ text: 'EDUCATION', bold: true, size: 24 })],
              }),
              ...content.education.flatMap(edu => [
                new Paragraph({
                  children: [new TextRun({ text: `${edu.degree} in ${edu.field}`, bold: true, size: 22 })],
                }),
                new Paragraph({
                  children: [new TextRun({ text: edu.institution, size: 20 })],
                }),
                new Paragraph({
                  children: [new TextRun({ text: `Graduated: ${edu.graduationDate}`, size: 18 })],
                }),
                ...(edu.gpa ? [new Paragraph({
                  children: [new TextRun({ text: `GPA: ${edu.gpa}`, size: 18 })],
                })] : []),
              ])
            ] : []),
          ],
        }],
      });

      return await Packer.toBuffer(doc);
    } catch (error) {
      logger.error('Error generating DOCX resume:', error);
      throw new Error('Failed to generate Word document');
    }
  }

  /**
   * Generate PDF format (using HTML template)
   */
  private static async generatePdfResume(content: ResumeContent, template: ResumeTemplate): Promise<Buffer> {
    try {
      const htmlContent = this.generateHtmlResume(content, template);
      const buffer = Buffer.from(htmlContent, 'utf-8');
      
      // For now, return the HTML content as a buffer
      // In production, you would use a library like puppeteer to convert HTML to PDF
      // This is a simplified implementation
      return buffer;
    } catch (error) {
      logger.error('Error generating PDF resume:', error);
      throw new Error('Failed to generate PDF document');
    }
  }

  /**
   * Generate HTML content for PDF conversion
   */
  private static generateHtmlResume(content: ResumeContent, template: ResumeTemplate): string {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${content.personalInfo.firstName} ${content.personalInfo.lastName} - Resume</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; }
          .name { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .contact { font-size: 14px; color: #666; }
          .section { margin-top: 25px; }
          .section-title { font-size: 18px; font-weight: bold; border-bottom: 2px solid #333; margin-bottom: 15px; }
          .job-title { font-weight: bold; font-size: 16px; }
          .company { font-weight: bold; color: #333; }
          .date { color: #666; font-size: 14px; }
          .description { margin-left: 20px; }
          .skills { margin-top: 10px; }
          .project-title { font-weight: bold; font-size: 16px; }
          .education-degree { font-weight: bold; font-size: 16px; }
          .education-school { color: #333; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="name">${content.personalInfo.firstName} ${content.personalInfo.lastName}</div>
          <div class="contact">
            ${content.personalInfo.email}<br>
            ${content.personalInfo.phone ? content.personalInfo.phone + '<br>' : ''}
            ${content.personalInfo.location ? content.personalInfo.location + '<br>' : ''}
            ${content.personalInfo.linkedin ? 'LinkedIn: ' + content.personalInfo.linkedin + '<br>' : ''}
            ${content.personalInfo.github ? 'GitHub: ' + content.personalInfo.github : ''}
          </div>
        </div>

        <div class="section">
          <div class="section-title">PROFESSIONAL SUMMARY</div>
          <div>${content.summary}</div>
        </div>

        ${content.experience.length > 0 ? `
        <div class="section">
          <div class="section-title">EXPERIENCE</div>
          ${content.experience.map(exp => `
            <div style="margin-bottom: 15px;">
              <div class="job-title">${exp.position}</div>
              <div class="company">${exp.company}</div>
              <div class="date">${exp.startDate} - ${exp.endDate || 'Present'}</div>
              <div class="description">
                ${exp.description.map(desc => `• ${desc}`).join('<br>')}
              </div>
              <div class="skills">Technologies: ${exp.technologies.join(', ')}</div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${content.projects.length > 0 ? `
        <div class="section">
          <div class="section-title">PROJECTS</div>
          ${content.projects.map(project => `
            <div style="margin-bottom: 15px;">
              <div class="project-title">${project.title}</div>
              <div>${project.description}</div>
              <div class="skills">Technologies: ${project.technologies.join(', ')}</div>
              ${project.repositoryUrl ? `<div>Repository: ${project.repositoryUrl}</div>` : ''}
              ${project.liveUrl ? `<div>Live Demo: ${project.liveUrl}</div>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${(content.skills.technical.length > 0 || content.skills.soft.length > 0) ? `
        <div class="section">
          <div class="section-title">SKILLS</div>
          ${content.skills.technical.length > 0 ? `<div><strong>Technical:</strong> ${content.skills.technical.join(', ')}</div>` : ''}
          ${content.skills.soft.length > 0 ? `<div><strong>Soft Skills:</strong> ${content.skills.soft.join(', ')}</div>` : ''}
        </div>
        ` : ''}

        ${content.education.length > 0 ? `
        <div class="section">
          <div class="section-title">EDUCATION</div>
          ${content.education.map(edu => `
            <div style="margin-bottom: 15px;">
              <div class="education-degree">${edu.degree} in ${edu.field}</div>
              <div class="education-school">${edu.institution}</div>
              <div class="date">Graduated: ${edu.graduationDate}</div>
              ${edu.gpa ? `<div>GPA: ${edu.gpa}</div>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}
      </body>
      </html>
    `;
    
    return html;
  }

  /**
   * Generate plain text version of resume
   */
  private static generateTextResume(content: ResumeContent): string {
    let text = '';

    // Header
    text += `${content.personalInfo.firstName} ${content.personalInfo.lastName}\n`;
    text += `${content.personalInfo.email}\n`;
    if (content.personalInfo.phone) text += `${content.personalInfo.phone}\n`;
    if (content.personalInfo.location) text += `${content.personalInfo.location}\n`;
    if (content.personalInfo.linkedin) text += `LinkedIn: ${content.personalInfo.linkedin}\n`;
    if (content.personalInfo.github) text += `GitHub: ${content.personalInfo.github}\n`;
    text += '\n';

    // Summary
    text += 'SUMMARY\n';
    text += `${content.summary}\n\n`;

    // Experience
    if (content.experience.length > 0) {
      text += 'EXPERIENCE\n';
      content.experience.forEach(exp => {
        text += `${exp.position} at ${exp.company}\n`;
        text += `${exp.startDate} - ${exp.endDate || 'Present'}\n`;
        exp.description.forEach(desc => {
          text += `• ${desc}\n`;
        });
        text += `Technologies: ${exp.technologies.join(', ')}\n\n`;
      });
    }

    // Projects
    if (content.projects.length > 0) {
      text += 'PROJECTS\n';
      content.projects.forEach(project => {
        text += `${project.title}\n`;
        text += `${project.description}\n`;
        text += `Technologies: ${project.technologies.join(', ')}\n`;
        if (project.repositoryUrl) text += `Repository: ${project.repositoryUrl}\n`;
        if (project.liveUrl) text += `Live Demo: ${project.liveUrl}\n`;
        text += '\n';
      });
    }

    // Skills
    if (content.skills.technical.length > 0 || content.skills.soft.length > 0) {
      text += 'SKILLS\n';
      if (content.skills.technical.length > 0) {
        text += `Technical: ${content.skills.technical.join(', ')}\n`;
      }
      if (content.skills.soft.length > 0) {
        text += `Soft Skills: ${content.skills.soft.join(', ')}\n`;
      }
      text += '\n';
    }

    // Education
    if (content.education.length > 0) {
      text += 'EDUCATION\n';
      content.education.forEach(edu => {
        text += `${edu.degree} in ${edu.field}\n`;
        text += `${edu.institution}\n`;
        text += `Graduated: ${edu.graduationDate}\n`;
        if (edu.gpa) text += `GPA: ${edu.gpa}\n`;
        text += '\n';
      });
    }

    return text;
  }
} 