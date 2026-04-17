describe('Logout Functionality', { tags: ["@smoke"] }, () => {
  beforeEach(() => {
    cy.visit('/dashboard');
  });

  it('should log out and redirect to login page', { tags: ["@critical"] }, () => {
    cy.get('[data-cy="user-menu"]').click();
    cy.get('[data-cy="logout-btn"]').click();
    cy.url().should('include', '/login');
  });

  it('should clear session data on logout', { tags: ["@test-03"] }, () => {
    cy.get('[data-cy="user-menu"]').click();
    cy.get('[data-cy="logout-btn"]').click();
    cy.getCookie('auth_token').should('not.exist');
  });

  it('should show confirmation dialog before logging out', { tags: ["@wip"] }, () => {
    cy.get('[data-cy="user-menu"]').click();
    cy.get('[data-cy="logout-btn"]').click();
    cy.get('[data-cy="confirm-dialog"]').should('be.visible');
    cy.get('[data-cy="confirm-btn"]').click();
    cy.url().should('include', '/login');
  });
});
