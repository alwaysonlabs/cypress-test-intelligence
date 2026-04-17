describe('Billing Overview', { tags: ["@prod", "@smoke"] }, () => {
  beforeEach(() => {
    cy.visit('/settings/billing');
  });

  it('should display the current subscription plan', { tags: ["@critical"] }, () => {
    cy.get('[data-cy="current-plan"]').should('be.visible');
    cy.get('[data-cy="plan-name"]').should('not.be.empty');
  });

  it('should show billing history table', { tags: ["@test-19"] }, () => {
    cy.get('[data-cy="billing-history-table"]').should('be.visible');
    cy.get('[data-cy="billing-row"]').should('have.length.greaterThan', 0);
  });

  it('should download an invoice as PDF', { tags: ["@wip"] }, () => {
    cy.get('[data-cy="billing-row"]').first().find('[data-cy="download-invoice-btn"]').click();
    cy.readFile('cypress/downloads/invoice.pdf').should('exist');
  });
});

describe.skip('Billing Overview', { tags: ["@regression"] }, () => {
  it('should display available upgrade plans', { tags: ["@test-19"] }, () => {
    cy.visit('/settings/billing');
    cy.get('[data-cy="upgrade-btn"]').click();
    cy.get('[data-cy="plan-options"]').should('be.visible');
    cy.get('[data-cy="plan-card"]').should('have.length.greaterThan', 1);
  });

  it('should confirm plan change with a summary modal', { tags: ["@critical"] }, () => {
    cy.visit('/settings/billing');
    cy.get('[data-cy="upgrade-btn"]').click();
    cy.get('[data-cy="plan-card"]').last().find('[data-cy="select-plan-btn"]').click();
    cy.get('[data-cy="upgrade-confirm-modal"]').should('be.visible');
  });
});
