describe.skip('Dashboard Charts', { tags: ["@prod", "@regression"] }, () => {
  beforeEach(() => {
    cy.visit('/dashboard/analytics');
  });

  it('should render the main analytics chart', { tags: ["@critical"] }, () => {
    cy.get('[data-cy="analytics-chart"]').should('be.visible');
  });

  it('should update chart when date range changes', { tags: ["@test-09"] }, () => {
    cy.get('[data-cy="date-range-picker"]').click();
    cy.get('[data-cy="range-last-30-days"]').click();
    cy.get('[data-cy="analytics-chart"]').should('be.visible');
    cy.get('[data-cy="chart-title"]').should('contain', 'Last 30 Days');
  });

  it('should switch between chart types', { tags: ["@test-10"] }, () => {
    cy.get('[data-cy="chart-type-bar"]').click();
    cy.get('[data-cy="analytics-chart"]').should('have.attr', 'data-type', 'bar');
    cy.get('[data-cy="chart-type-line"]').click();
    cy.get('[data-cy="analytics-chart"]').should('have.attr', 'data-type', 'line');
  });

  it('should export chart data as CSV', { tags: ["@wip"] }, () => {
    cy.get('[data-cy="export-csv-btn"]').click();
    cy.readFile('cypress/downloads/analytics.csv').should('exist');
  });
});
