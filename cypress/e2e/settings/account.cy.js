describe('Account Security Settings', { tags: ["@prod"] }, () => {
  beforeEach(() => {
    cy.visit('/settings/account');
  });

  it('should change password successfully', { tags: ["@critical"] }, () => {
    cy.get('[data-cy="current-password"]').type('OldPass!1');
    cy.get('[data-cy="new-password"]').type('NewPass!2');
    cy.get('[data-cy="confirm-password"]').type('NewPass!2');
    cy.get('[data-cy="change-password-btn"]').click();
    cy.get('[data-cy="success-toast"]').should('contain', 'Password changed');
  });

  it('should reject mismatched new passwords', { tags: ["@smoke"] }, () => {
    cy.get('[data-cy="new-password"]').type('NewPass!2');
    cy.get('[data-cy="confirm-password"]').type('DifferentPass!3');
    cy.get('[data-cy="change-password-btn"]').click();
    cy.get('[data-cy="password-mismatch-error"]').should('be.visible');
  });

  it('should enable two-factor authentication', { tags: ["@wip"] }, () => {
    cy.get('[data-cy="enable-2fa-btn"]').click();
    cy.get('[data-cy="qr-code"]').should('be.visible');
    cy.get('[data-cy="2fa-instructions"]').should('be.visible');
  });
});

describe('Account Deletion', { tags: ["@regression"] }, () => {
  it('should show a warning before deleting the account', { tags: ["@ignore"] }, () => {
    cy.visit('/settings/account');
    cy.get('[data-cy="delete-account-btn"]').click();
    cy.get('[data-cy="delete-confirm-dialog"]').should('be.visible');
    cy.get('[data-cy="delete-warning-text"]').should('contain', 'This action cannot be undone');
  });

  it('should require typing confirmation text to delete', { tags: ["@test-18"] }, () => {
    cy.visit('/settings/account');
    cy.get('[data-cy="delete-account-btn"]').click();
    cy.get('[data-cy="delete-confirm-input"]').type('DELETE');
    cy.get('[data-cy="confirm-delete-btn"]').should('not.be.disabled');
  });
});
