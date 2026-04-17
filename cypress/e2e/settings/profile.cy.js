describe('User Profile Settings', { tags: ["@smoke", "@regression"] }, () => {
  beforeEach(() => {
    cy.visit('/settings/profile');
  });

  it('should display the profile form with current user data', { tags: ["@test-20"] }, () => {
    cy.get('[data-cy="profile-form"]').should('be.visible');
    cy.get('[data-cy="first-name-input"]').should('not.have.value', '');
    cy.get('[data-cy="email-input"]').should('not.have.value', '');
  });

  it('should save profile changes successfully', { tags: ["@critical"] }, () => {
    cy.get('[data-cy="first-name-input"]').clear().type('Updated Name');
    cy.get('[data-cy="save-profile-btn"]').click();
    cy.get('[data-cy="success-toast"]').should('contain', 'Profile updated');
  });

  it('should validate required fields before saving', { tags: ["@test-20"] }, () => {
    cy.get('[data-cy="first-name-input"]').clear();
    cy.get('[data-cy="save-profile-btn"]').click();
    cy.get('[data-cy="field-error"]').should('be.visible');
  });

  it('should upload a new profile avatar', { tags: ["@wip"] }, () => {
    cy.get('[data-cy="avatar-upload"]').selectFile('cypress/fixtures/avatar.png');
    cy.get('[data-cy="avatar-preview"]').should('be.visible');
  });
});
