describe('Project Management', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'TestPassword123!');
  });

  it('should create a new project', () => {
    cy.visit('/projects/new');
    
    const projectData = {
      title: 'Test Portfolio Project',
      description: 'A comprehensive test project for portfolio showcase',
      techStack: 'React, Node.js, TypeScript, PostgreSQL',
      deadline: '2024-01-15'
    };

    cy.get('[data-testid=project-title-input]').type(projectData.title);
    cy.get('[data-testid=project-description-input]').type(projectData.description);
    cy.get('[data-testid=project-tech-stack-input]').type(projectData.techStack);
    cy.get('[data-testid=project-deadline-input]').type(projectData.deadline);
    
    cy.get('[data-testid=create-project-button]').click();
    
    cy.url().should('include', '/projects');
    cy.get('[data-testid=project-list]').should('contain', projectData.title);
    cy.checkToast('Project created successfully');
  });

  it('should display project progress tracking', () => {
    cy.visit('/projects');
    
    // Create a project first
    cy.get('[data-testid=new-project-button]').click();
    
    const projectData = {
      title: 'Progress Test Project',
      description: 'Testing progress tracking',
      techStack: 'React, TypeScript',
      deadline: '2024-01-20'
    };

    cy.get('[data-testid=project-title-input]').type(projectData.title);
    cy.get('[data-testid=project-description-input]').type(projectData.description);
    cy.get('[data-testid=project-tech-stack-input]').type(projectData.techStack);
    cy.get('[data-testid=project-deadline-input]').type(projectData.deadline);
    
    cy.get('[data-testid=create-project-button]').click();
    
    // Check that progress tracking elements are visible
    cy.get('[data-testid=project-progress]').should('be.visible');
    cy.get('[data-testid=time-remaining]').should('be.visible');
    cy.get('[data-testid=project-status]').should('contain', 'planning');
  });

  it('should update project status', () => {
    cy.visit('/projects');
    
    // Create a project
    cy.get('[data-testid=new-project-button]').click();
    
    const projectData = {
      title: 'Status Update Project',
      description: 'Testing status updates',
      techStack: 'React, Node.js',
      deadline: '2024-01-25'
    };

    cy.get('[data-testid=project-title-input]').type(projectData.title);
    cy.get('[data-testid=project-description-input]').type(projectData.description);
    cy.get('[data-testid=project-tech-stack-input]').type(projectData.techStack);
    cy.get('[data-testid=project-deadline-input]').type(projectData.deadline);
    
    cy.get('[data-testid=create-project-button]').click();
    
    // Update status to in-progress
    cy.get('[data-testid=project-card]').first().click();
    cy.get('[data-testid=status-selector]').select('in-progress');
    cy.get('[data-testid=update-status-button]').click();
    
    cy.checkToast('Project status updated');
    cy.get('[data-testid=project-status]').should('contain', 'in-progress');
  });

  it('should show deadline notifications', () => {
    cy.visit('/projects');
    
    // Create a project with a deadline in the past
    cy.get('[data-testid=new-project-button]').click();
    
    const projectData = {
      title: 'Overdue Project',
      description: 'Testing deadline notifications',
      techStack: 'React',
      deadline: '2024-01-01' // Past date
    };

    cy.get('[data-testid=project-title-input]').type(projectData.title);
    cy.get('[data-testid=project-description-input]').type(projectData.description);
    cy.get('[data-testid=project-tech-stack-input]').type(projectData.techStack);
    cy.get('[data-testid=project-deadline-input]').type(projectData.deadline);
    
    cy.get('[data-testid=create-project-button]').click();
    
    // Check for deadline warning
    cy.get('[data-testid=deadline-warning]').should('be.visible');
    cy.get('[data-testid=deadline-warning]').should('contain', 'Overdue');
  });

  it('should complete a project', () => {
    cy.visit('/projects');
    
    // Create a project
    cy.get('[data-testid=new-project-button]').click();
    
    const projectData = {
      title: 'Complete Test Project',
      description: 'Testing project completion',
      techStack: 'React, TypeScript',
      deadline: '2024-01-30'
    };

    cy.get('[data-testid=project-title-input]').type(projectData.title);
    cy.get('[data-testid=project-description-input]').type(projectData.description);
    cy.get('[data-testid=project-tech-stack-input]').type(projectData.techStack);
    cy.get('[data-testid=project-deadline-input]').type(projectData.deadline);
    
    cy.get('[data-testid=create-project-button]').click();
    
    // Complete the project
    cy.get('[data-testid=project-card]').first().click();
    cy.get('[data-testid=complete-project-button]').click();
    cy.get('[data-testid=confirm-complete-button]').click();
    
    cy.checkToast('Project completed successfully');
    cy.get('[data-testid=project-status]').should('contain', 'completed');
  });

  it('should filter projects by status', () => {
    cy.visit('/projects');
    
    // Test status filter
    cy.get('[data-testid=status-filter]').select('planning');
    cy.get('[data-testid=project-list]').should('contain', 'planning');
    
    cy.get('[data-testid=status-filter]').select('in-progress');
    cy.get('[data-testid=project-list]').should('contain', 'in-progress');
    
    cy.get('[data-testid=status-filter]').select('completed');
    cy.get('[data-testid=project-list]').should('contain', 'completed');
  });
}); 