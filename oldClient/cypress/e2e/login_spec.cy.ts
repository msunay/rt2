describe('Login Test', () => {
  it('should log in a user', () => {
    cy.visit('http://localhost:3000');

    cy.contains('LOGIN').click();

    cy.get('[data-cy="login-form"]').within(() => {
      cy.get('[data-cy="username-input"]').type('dave');
      cy.get('[data-cy="password-input"]').type('testword');

      cy.contains('Submit').click();
    });
  });
});
