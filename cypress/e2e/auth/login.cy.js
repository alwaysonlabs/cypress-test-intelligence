describe('Login Page', { tags: ["@smoke", "@regression"] }, () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it.skip('should display the login form', { tags: ["@test-01"] }, () => {
    cy.get('[data-cy="login-form"]').should('be.visible');
    cy.get('[data-cy="email-input"]').should('be.visible');
    cy.get('[data-cy="password-input"]').should('be.visible');
    cy.get('[data-cy="submit-btn"]').should('be.visible');
  });

  it('should log in with valid credentials', { tags: ["@test-02", "@critical"] }, () => {
    cy.get('[data-cy="email-input"]').type('user@example.com');
    cy.get('[data-cy="password-input"]').type('password123');
    cy.get('[data-cy="submit-btn"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should show error for invalid credentials', { tags: ["@wip"] }, () => {
    cy.get('[data-cy="email-input"]').type('wrong@example.com');
    cy.get('[data-cy="password-input"]').type('wrongpassword');
    cy.get('[data-cy="submit-btn"]').click();
    cy.get('[data-cy="error-message"]').should('contain', 'Invalid credentials');
  });

  it('should redirect authenticated users away from login', { tags: ["@ignore"] }, () => {
    cy.setCookie('auth_token', 'fake-token');
    cy.visit('/login');
    cy.url().should('include', '/dashboard');
  });
});
