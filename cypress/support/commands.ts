/// <reference types="cypress" />

// Custom command for login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('[data-testid=email-input]').type(email);
  cy.get('[data-testid=password-input]').type(password);
  cy.get('[data-testid=login-button]').click();
  cy.url().should('include', '/dashboard');
});

// Custom command for creating a project
Cypress.Commands.add('createProject', (projectData: any) => {
  cy.visit('/projects/new');
  cy.get('[data-testid=project-title]').type(projectData.title);
  cy.get('[data-testid=project-description]').type(projectData.description);
  cy.get('[data-testid=project-tech-stack]').type(projectData.techStack);
  cy.get('[data-testid=project-deadline]').type(projectData.deadline);
  cy.get('[data-testid=create-project-button]').click();
  cy.url().should('include', '/projects');
});

// Custom command for creating a job application
Cypress.Commands.add('createJobApplication', (applicationData: any) => {
  cy.visit('/applications/new');
  cy.get('[data-testid=company-name]').type(applicationData.companyName);
  cy.get('[data-testid=job-title]').type(applicationData.jobTitle);
  cy.get('[data-testid=job-url]').type(applicationData.jobUrl);
  cy.get('[data-testid=create-application-button]').click();
  cy.url().should('include', '/applications');
});

// Custom command for waiting for API responses
Cypress.Commands.add('waitForApi', (method: string, url: string) => {
  cy.intercept(method, url).as('apiCall');
  cy.wait('@apiCall');
});

// Custom command for checking toast notifications
Cypress.Commands.add('checkToast', (message: string, type: 'success' | 'error' = 'success') => {
  cy.get(`[data-testid=toast-${type}]`).should('contain', message);
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      createProject(projectData: any): Chainable<void>;
      createJobApplication(applicationData: any): Chainable<void>;
      waitForApi(method: string, url: string): Chainable<void>;
      checkToast(message: string, type?: 'success' | 'error'): Chainable<void>;
    }
  }
} 