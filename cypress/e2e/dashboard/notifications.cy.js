describe('Notifications Panel', { tags: ["@smoke"] }, () => {
  beforeEach(() => {
    cy.visit('/dashboard');
  });

  it('should display the notification bell icon', { tags: ["@test-11"] }, () => {
    cy.get('[data-cy="notification-bell"]').should('be.visible');
  });

  it.skip('should open the notifications panel on click', { tags: ["@critical"] }, () => {
    cy.get('[data-cy="notification-bell"]').click();
    cy.get('[data-cy="notifications-panel"]').should('be.visible');
  });

  it('should show unread count badge when there are new notifications', { tags: ["@test-12"] }, () => {
    cy.intercept('GET', '/api/notifications', {
      body: [{ id: 1, read: false, message: 'New update available' }]
    }).as('notifications');
    cy.visit('/dashboard');
    cy.wait('@notifications');
    cy.get('[data-cy="unread-badge"]').should('be.visible').and('contain', '1');
  });

  it('should mark all notifications as read', { tags: ["@wip"] }, () => {
    cy.get('[data-cy="notification-bell"]').click();
    cy.get('[data-cy="mark-all-read-btn"]').click();
    cy.get('[data-cy="unread-badge"]').should('not.exist');
  });
});
