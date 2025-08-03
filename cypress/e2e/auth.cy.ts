describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should allow user to register', () => {
    cy.visit('/register');
    
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@example.com`,
      password: 'TestPassword123!',
      targetJobTitle: 'Full Stack Developer',
      jobSearchDeadline: '2024-06-01'
    };

    cy.get('[data-testid=first-name-input]').type(testUser.firstName);
    cy.get('[data-testid=last-name-input]').type(testUser.lastName);
    cy.get('[data-testid=email-input]').type(testUser.email);
    cy.get('[data-testid=password-input]').type(testUser.password);
    cy.get('[data-testid=target-job-title-input]').type(testUser.targetJobTitle);
    cy.get('[data-testid=job-search-deadline-input]').type(testUser.jobSearchDeadline);
    
    cy.get('[data-testid=register-button]').click();
    
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid=welcome-message]').should('contain', testUser.firstName);
  });

  it('should allow user to login', () => {
    // First register a user
    cy.visit('/register');
    
    const testUser = {
      firstName: 'Login',
      lastName: 'Test',
      email: `logintest${Date.now()}@example.com`,
      password: 'TestPassword123!',
      targetJobTitle: 'Backend Developer',
      jobSearchDeadline: '2024-06-01'
    };

    cy.get('[data-testid=first-name-input]').type(testUser.firstName);
    cy.get('[data-testid=last-name-input]').type(testUser.lastName);
    cy.get('[data-testid=email-input]').type(testUser.email);
    cy.get('[data-testid=password-input]').type(testUser.password);
    cy.get('[data-testid=target-job-title-input]').type(testUser.targetJobTitle);
    cy.get('[data-testid=job-search-deadline-input]').type(testUser.jobSearchDeadline);
    
    cy.get('[data-testid=register-button]').click();
    
    // Then logout
    cy.get('[data-testid=logout-button]').click();
    
    // Then login
    cy.visit('/login');
    cy.get('[data-testid=email-input]').type(testUser.email);
    cy.get('[data-testid=password-input]').type(testUser.password);
    cy.get('[data-testid=login-button]').click();
    
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid=welcome-message]').should('contain', testUser.firstName);
  });

  it('should show error for invalid login credentials', () => {
    cy.visit('/login');
    cy.get('[data-testid=email-input]').type('invalid@example.com');
    cy.get('[data-testid=password-input]').type('wrongpassword');
    cy.get('[data-testid=login-button]').click();
    
    cy.get('[data-testid=error-message]').should('be.visible');
    cy.get('[data-testid=error-message]').should('contain', 'Invalid credentials');
  });

  it('should allow user to logout', () => {
    // First login
    cy.login('test@example.com', 'TestPassword123!');
    
    // Then logout
    cy.get('[data-testid=logout-button]').click();
    
    cy.url().should('include', '/login');
    cy.get('[data-testid=login-form]').should('be.visible');
  });

  it('should redirect to dashboard if already logged in', () => {
    cy.login('test@example.com', 'TestPassword123!');
    
    cy.visit('/login');
    cy.url().should('include', '/dashboard');
  });
}); 