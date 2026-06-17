describe('Security & Isolation E2E Tests', () => {
  beforeEach(() => {
    // Intercept API calls to mock auth state and roles for testing without needing a real DB
    cy.intercept('POST', '**/auth/token/', {
      statusCode: 200,
      body: { access: 'fake-token', refresh: 'fake-refresh' }
    }).as('login');

    cy.intercept('GET', '**/organizations/my-orgs/', {
      statusCode: 200,
      body: {
        results: [
          { id: '1', name: 'Org Test', slug: 'org-test', current_role: 'User' } // Mock user as 'User' (Client)
        ]
      }
    }).as('getOrgs');

    // Visit login and mock a successful flow
    cy.visit('/login');
    cy.get('input[type="email"]').type('client@test.com');
    cy.get('input[type="password"]').type('password');
    cy.get('button[type="submit"]').click();
    
    // Select the first org
    cy.wait('@getOrgs');
    cy.contains('Org Test').click();
  });

  it('hides restricted sidebar menus for User role', () => {
    cy.url().should('include', '/dashboard/general');
    
    // As a User, "Configurações" should NOT exist in the sidebar
    cy.contains('Configurações').should('not.exist');
    cy.contains('Fila').should('not.exist');
    cy.contains('Meu Dia').should('not.exist');
  });

  it('redirects back to general if trying to access settings directly', () => {
    // Force visit settings
    cy.visit('/dashboard/settings');
    
    // Should be redirected immediately back to general because role is User
    cy.url().should('include', '/dashboard/general');
  });

  it('does not show Internal Note checkbox in TicketDetail for User role', () => {
    // Mock a ticket
    cy.intercept('GET', '**/tickets/100/', {
      statusCode: 200,
      body: {
        id: '100',
        title: 'Mock Ticket',
        status: 'ABERTO',
        priority: 2,
        creator_name: 'Client',
      }
    }).as('getTicket');
    
    cy.intercept('GET', '**/tickets/100/comments/', {
      statusCode: 200,
      body: []
    });

    cy.visit('/tickets/100');
    cy.wait('@getTicket');

    // The checkbox should not exist for Client
    cy.contains('Nota Interna').should('not.exist');
  });
});
