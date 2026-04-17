describe('Notification Preferences', () => {
  beforeEach(() => {
    cy.visit('/settings/notifications');
  });

  it.only('should display all notification toggle options', () => {
    cy.get('[data-cy="notification-toggle"]').should('have.length.greaterThan', 2);
  });

  it('should save notification preferences', { tags: ["@critical"] }, () => {
    cy.get('[data-cy="email-notifications-toggle"]').click();
    cy.get('[data-cy="save-notifications-btn"]').click();
    cy.get('[data-cy="success-toast"]').should('contain', 'Preferences saved');
  });

  it('should reload and reflect saved preferences', () => {
    cy.get('[data-cy="push-notifications-toggle"]').click();
    cy.get('[data-cy="save-notifications-btn"]').click();
    cy.reload();
    cy.get('[data-cy="push-notifications-toggle"]').should('have.attr', 'aria-checked', 'true');
  });
});
