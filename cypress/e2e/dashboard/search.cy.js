describe('Global Search', { tags: ["@smoke", "@regression"] }, () => {
  beforeEach(() => {
    cy.visit('/dashboard');
  });

  it.only('should focus the search bar with keyboard shortcut', { tags: ["@test-16"] }, () => {
    cy.get('body').type('{ctrl}/');
    cy.get('[data-cy="global-search-input"]').should('be.focused');
  });

  it('should display search results for a valid query', { tags: ["@critical"] }, () => {
    cy.get('[data-cy="global-search-input"]').type('report');
    cy.get('[data-cy="search-results"]').should('be.visible');
    cy.get('[data-cy="search-result-item"]').should('have.length.greaterThan', 0);
  });

  it('should show no-results message for an unknown query', { tags: ["@test-17"] }, () => {
    cy.get('[data-cy="global-search-input"]').type('xyznotfound999');
    cy.get('[data-cy="no-results-message"]').should('be.visible');
  });
});

describe('Search Filters', { tags: ["@regression"] }, () => {
  it('should filter search results by category', { tags: ["@wip"] }, () => {
    cy.visit('/dashboard');
    cy.get('[data-cy="global-search-input"]').type('report');
    cy.get('[data-cy="filter-category"]').select('Documents');
    cy.get('[data-cy="search-result-item"]').each(($el) => {
      cy.wrap($el).should('have.attr', 'data-category', 'documents');
    });
  });

  it.only('should persist the last search query on page reload', { tags: ["@ignore"] }, () => {
    cy.visit('/dashboard');
    cy.get('[data-cy="global-search-input"]').type('report');
    cy.reload();
    cy.get('[data-cy="global-search-input"]').should('have.value', 'report');
  });
});
