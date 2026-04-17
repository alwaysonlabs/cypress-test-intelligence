describe('Registration Form', { tags: ["@regression"] }, () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should display all registration fields', { tags: ["@test-06"] }, () => {
    cy.get('[data-cy="first-name-input"]').should('be.visible');
    cy.get('[data-cy="last-name-input"]').should('be.visible');
    cy.get('[data-cy="email-input"]').should('be.visible');
    cy.get('[data-cy="password-input"]').should('be.visible');
  });

  it('should register a new user successfully', { tags: ["@critical"] }, () => {
    cy.get('[data-cy="first-name-input"]').type('Jane');
    cy.get('[data-cy="last-name-input"]').type('Doe');
    cy.get('[data-cy="email-input"]').type('jane.doe@example.com');
    cy.get('[data-cy="password-input"]').type('SecurePass!1');
    cy.get('[data-cy="register-btn"]').click();
    cy.get('[data-cy="success-message"]').should('be.visible');
  });

  it('should show validation errors for empty fields', { tags: ["@test-07"] }, () => {
    cy.get('[data-cy="register-btn"]').click();
    cy.get('[data-cy="validation-error"]').should('have.length.greaterThan', 0);
  });
});

describe.only('Password Validation', { tags: ["@regression"] }, () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should reject weak passwords', { tags: ["@test-08"] }, () => {
    cy.get('[data-cy="password-input"]').type('123');
    cy.get('[data-cy="register-btn"]').click();
    cy.get('[data-cy="password-error"]').should('contain', 'Password is too weak');
  });

  it('should show password strength indicator', { tags: ["@wip"] }, () => {
    cy.get('[data-cy="password-input"]').type('StrongPass!1');
    cy.get('[data-cy="password-strength"]').should('have.class', 'strong');
  });
});
