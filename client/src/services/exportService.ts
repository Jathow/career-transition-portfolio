import api from './api';
import { saveAs } from 'file-saver';

export interface ExportOptions {
  format: 'json' | 'csv';
  modules: ('projects' | 'applications' | 'interviews' | 'resumes' | 'motivation' | 'revenue')[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ExportData {
  projects: any[];
  applications: any[];
  interviews: any[];
  resumes: any[];
  motivation: any[];
  revenue: any[];
  metadata: {
    exportDate: string;
    user: string;
    version: string;
  };
}

class ExportService {
  async exportData(options: ExportOptions): Promise<void> {
    try {
      // Fetch data for all requested modules
      const dataPromises = options.modules.map(module => 
        api.get(`/${module}`).then(response => ({ module, data: response.data.data }))
      );

      const results = await Promise.all(dataPromises);
      
      // Build export data object
      const exportData: ExportData = {
        projects: [],
        applications: [],
        interviews: [],
        resumes: [],
        motivation: [],
        revenue: [],
        metadata: {
          exportDate: new Date().toISOString(),
          user: 'current-user', // Will be replaced with actual user info
          version: '1.0.0',
        },
      };

      // Populate export data
      results.forEach(({ module, data }) => {
        if (data) {
          exportData[module as keyof Omit<ExportData, 'metadata'>] = data;
        }
      });

      // Apply date range filter if specified
      if (options.dateRange) {
        this.filterByDateRange(exportData, options.dateRange);
      }

      // Generate file based on format
      if (options.format === 'json') {
        this.exportAsJSON(exportData);
      } else if (options.format === 'csv') {
        this.exportAsCSV(exportData, options.modules);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Failed to export data');
    }
  }

  private filterByDateRange(data: ExportData, dateRange: { start: Date; end: Date }): void {
    const { start, end } = dateRange;

    // Filter projects
    data.projects = data.projects.filter(project => {
      const projectDate = new Date(project.createdAt);
      return projectDate >= start && projectDate <= end;
    });

    // Filter applications
    data.applications = data.applications.filter(app => {
      const appDate = new Date(app.applicationDate);
      return appDate >= start && appDate <= end;
    });

    // Filter interviews
    data.interviews = data.interviews.filter(interview => {
      const interviewDate = new Date(interview.scheduledDate);
      return interviewDate >= start && interviewDate <= end;
    });

    // Filter resumes
    data.resumes = data.resumes.filter(resume => {
      const resumeDate = new Date(resume.createdAt);
      return resumeDate >= start && resumeDate <= end;
    });

    // Filter motivation data
    data.motivation = data.motivation.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= start && entryDate <= end;
    });

    // Filter revenue data
    data.revenue = data.revenue.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= start && entryDate <= end;
    });
  }

  private exportAsJSON(data: ExportData): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const fileName = `career-portfolio-export-${new Date().toISOString().split('T')[0]}.json`;
    saveAs(blob, fileName);
  }

  private exportAsCSV(data: ExportData, modules: string[]): void {
    const csvContent: string[] = [];
    
    // Add metadata
    csvContent.push('Career Portfolio Export');
    csvContent.push(`Export Date: ${data.metadata.exportDate}`);
    csvContent.push('');

    modules.forEach(module => {
      const moduleData = data[module as keyof Omit<ExportData, 'metadata'>] as any[];
      if (moduleData && moduleData.length > 0) {
        csvContent.push(`${module.toUpperCase()} DATA`);
        csvContent.push('');

        // Generate headers
        const headers = Object.keys(moduleData[0]);
        csvContent.push(headers.join(','));

        // Generate rows
        moduleData.forEach(item => {
          const row = headers.map(header => {
            const value = item[header];
            // Handle complex objects and arrays
            if (typeof value === 'object' && value !== null) {
              return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            }
            return `"${String(value || '').replace(/"/g, '""')}"`;
          });
          csvContent.push(row.join(','));
        });

        csvContent.push('');
        csvContent.push('');
      }
    });

    const csvString = csvContent.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' });
    const fileName = `career-portfolio-export-${new Date().toISOString().split('T')[0]}.csv`;
    saveAs(blob, fileName);
  }

  async exportResume(resumeId: string, format: 'pdf' | 'docx' | 'txt'): Promise<void> {
    try {
      const response = await api.get(`/resumes/${resumeId}/export?format=${format}`, {
        responseType: 'blob',
      });

      const fileName = `resume-${resumeId}.${format}`;
      saveAs(response.data, fileName);
    } catch (error) {
      console.error('Resume export failed:', error);
      throw new Error('Failed to export resume');
    }
  }

  async exportPortfolio(userId: string): Promise<void> {
    try {
      const response = await api.get(`/portfolio/${userId}/export`, {
        responseType: 'blob',
      });

      const fileName = `portfolio-${userId}.html`;
      saveAs(response.data, fileName);
    } catch (error) {
      console.error('Portfolio export failed:', error);
      throw new Error('Failed to export portfolio');
    }
  }
}

export default new ExportService(); 