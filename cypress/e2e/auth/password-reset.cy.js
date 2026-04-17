describe('Password Reset Flow', { tags: ["@smoke", "@prod"] }, () => {
  beforeEach(() => {
    cy.visit('/forgot-password');
  });

  it('should display the forgot password form', { tags: ["@test-04"] }, () => {
    cy.get('[data-cy="forgot-password-form"]').should('be.visible');
    cy.get('[data-cy="email-input"]').should('be.visible');
  });

  it('should send a reset email for a valid account', { tags: ["@test-05", "@critical"] }, () => {
    cy.get('[data-cy="email-input"]').type('user@example.com');
    cy.get('[data-cy="send-reset-btn"]').click();
    cy.get('[data-cy="confirmation-message"]').should('contain', 'Email sent');
  });

  it('should show error for unknown email address', { tags: ["@test-05"] }, () => {
    cy.get('[data-cy="email-input"]').type('unknown@example.com');
    cy.get('[data-cy="send-reset-btn"]').click();
    cy.get('[data-cy="error-message"]').should('be.visible');
  });

  it('should show error for unknown email address', () => {
    cy.get('[data-cy="email-input"]').type('unknown@domain.com');
    cy.get('[data-cy="send-reset-btn"]').click();
    cy.get('[data-cy="error-message"]').should('be.visible');
  });

  it('should handle expired reset tokens', { tags: ["@ignore"] }, () => {
    cy.visit('/reset-password?token=expired-token');
    cy.get('[data-cy="token-error"]').should('contain', 'Link has expired');
  });
});
