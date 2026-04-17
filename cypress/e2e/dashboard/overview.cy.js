describe('Dashboard Overview', { tags: ["@smoke", "@prod"] }, () => {
  beforeEach(() => {
    cy.visit('/dashboard');
  });

  it('should display the main dashboard widgets', { tags: ["@critical"] }, () => {
    cy.get('[data-cy="stats-widget"]').should('have.length.greaterThan', 0);
    cy.get('[data-cy="activity-feed"]').should('be.visible');
  });

  it('should show the correct page title', { tags: ["@test-13"] }, () => {
    cy.title().should('include', 'Dashboard');
  });

  it('should display a welcome message with the user name', { tags: ["@test-14"] }, () => {
    cy.get('[data-cy="welcome-message"]').should('contain', 'Welcome');
  });
});

describe('Dashboard Data Loading', { tags: ["@regression"] }, () => {
  it('should show a loading spinner while data fetches', { tags: ["@wip"] }, () => {
    cy.intercept('GET', '/api/dashboard', (req) => {
      req.on('response', (res) => { res.setDelay(1000); });
    }).as('dashboardData');
    cy.visit('/dashboard');
    cy.get('[data-cy="loading-spinner"]').should('be.visible');
    cy.wait('@dashboardData');
    cy.get('[data-cy="loading-spinner"]').should('not.exist');
  });

  it('should display an error state when the API fails', { tags: ["@test-15"] }, () => {
    cy.intercept('GET', '/api/dashboard', { statusCode: 500 }).as('dashboardError');
    cy.visit('/dashboard');
    cy.wait('@dashboardError');
    cy.get('[data-cy="error-banner"]').should('be.visible');
  });
});
