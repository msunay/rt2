
describe('Dashboard Functionality', () => {

before(function () {
  cy.visit('http://localhost:3000');

  cy.contains('LOGIN').click();

  cy.get('[data-cy="login-form"]').within(() => {
    cy.get('[data-cy="username-input"]').type('dave');
    cy.get('[data-cy="password-input"]').type('testword');
    cy.contains('Submit').click();
  });

  cy.window().its('localStorage.jwt_token').should('exist').then((jwt_token) => {
    this.token = jwt_token;
  });
});

   beforeEach(function () {

    cy.intercept('GET', '**/quizzes', {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    }).as('getQuizzes');

    cy.intercept('GET', '**/userId', {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    }).as('getUserId');

    cy.visit('http://localhost:3000/dashboard', {
      onBeforeLoad: (win) => {
        win.localStorage.setItem('jwt_token', this.token);
      }
    });
  });

  it('Should navigate to the correct paths when navbar buttons are clicked', () => {

    // Test for the "play next quiz" button
    cy.get('[data-cy="Play Next Quiz"]').should('be.visible').click();
    cy.url().should('include', '/dashboard/quizLoading');

    cy.visit('http://localhost:3000/dashboard');

    // Test for the "participating in" button
    cy.get('[data-cy="Discover Quizzes"]').click();
    cy.url().should('include', '/dashboard/discover');

    cy.visit('http://localhost:3000/dashboard');

    // Test for the "hosting" button for a non-premium user
    cy.get('[data-cy="Hosting"]').click();
    cy.url().should('include', '/dashboard/premium-upgrade');

    cy.visit('http://localhost:3000/dashboard');

    // Test for the "create a quiz" button for a non-premium user
    cy.get('[data-cy="Create a Quiz"]').click();
    cy.url().should('include', '/dashboard/premium-upgrade');

    cy.visit('http://localhost:3000/dashboard');

    // Test for logout button
    cy.get('[alt="exit image"]').should('be.visible').click();
  });
});