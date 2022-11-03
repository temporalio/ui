describe('Set Data Encoder Settings', () => {
  describe('Data Encoder without site setting endpoint', () => {
    beforeEach(() => {
      cy.interceptApi();

      cy.visit('/namespaces/default/workflows');

      cy.fixture('namespaces.json')
        .then(({ namespaces }) => {
          return namespaces
            .map((n) => n.namespaceInfo.name)
            .filter((name) => name !== 'temporal-system');
        })
        .as('namespaces');

      cy.wait('@workflows-api');
      cy.wait('@namespaces-api');

      cy.get('[data-cy="navigation-header"]').as('header');
    });

    it('can set and clear both endpoint and port with error message', () => {
      cy.get('@header').find('[data-cy="data-encoder-status"]').click();
      cy.get('[data-cy="data-encoder-title"]').contains('Data Encoder');
      cy.get('[data-cy="data-encoder-endpoint-title"]').contains(
        'Remote Codec Endpoint',
      );
      cy.get('[data-cy="data-encoder-endpoint-input"]').should(
        'have.value',
        '',
      );
      cy.get('[data-cy="modal-confirm-button"]').contains('Set Endpoint');

      // Set invalid endpoint and get error
      cy.get('[data-cy="data-encoder-endpoint-input"]').type('abc123');
      cy.get('[data-cy="modal-confirm-button"]').click();
      cy.get('[data-cy="data-encoder-endpoint-error"]').contains(
        'Endpoint must start with http:// or https://',
      );

      // Clear endpoint and set valid endpoint
      cy.get('[data-cy="data-encoder-endpoint-input"]').clear();
      cy.get('[data-cy="data-encoder-endpoint-input"]').type('http://test.com');
      cy.get('[data-cy="modal-confirm-button"]').click();

      cy.get('[data-cy="data-encoder-title"]').should('not.exist');

      cy.get('@header')
        .find('[data-cy="data-encoder-status-configured"]')
        .click();
      cy.get('[data-cy="data-encoder-title"]').contains('Data Encoder');
      cy.get('[data-cy="data-encoder-endpoint-input"]').should(
        'have.value',
        'http://test.com',
      );
    });
  });

  describe('Data Encoder with site setting endpoint', () => {
    beforeEach(() => {
      cy.interceptApi();

      cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/settings*', {
        Auth: { Enabled: false, Options: null },
        Codec: {
          Endpoint: 'http://test.com',
        },
      }).as('settings-api');

      cy.visit('/namespaces/default/workflows');

      cy.fixture('namespaces.json')
        .then(({ namespaces }) => {
          return namespaces
            .map((n) => n.namespaceInfo.name)
            .filter((name) => name !== 'temporal-system');
        })
        .as('namespaces');

      cy.wait('@namespaces-api');
      cy.wait('@workflows-api');
      cy.wait('@settings-api');

      cy.get('[data-cy="navigation-header"]').as('header');
    });

    it('can set and clear endpoint with error message', () => {
      cy.get('@header')
        .find('[data-cy="data-encoder-status-configured"]')
        .click();
      cy.get('[data-cy="data-encoder-title"]').contains('Data Encoder');
      cy.get('[data-cy="data-encoder-endpoint-title"]').contains(
        'Remote Codec Endpoint',
      );
      cy.get('[data-cy="data-encoder-endpoint-input"]').should(
        'have.value',
        '',
      );
      cy.get('[data-cy="modal-confirm-button"]').contains('Set Endpoint');

      cy.get('[data-cy="data-encoder-endpoint-info"]').contains(
        'Set endpoint overrides site setting endpoint.',
      );

      // Clear endpoint and set valid endpoint
      cy.get('[data-cy="data-encoder-endpoint-input"]').clear();
      cy.get('[data-cy="data-encoder-endpoint-input"]').type('http://test.com');
      cy.get('[data-cy="modal-confirm-button"]').click();

      cy.get('[data-cy="data-encoder-title"]').should('not.exist');
    });
  });

  describe('Data Encoder with site setting endpoint and access token', () => {
    beforeEach(() => {
      cy.interceptApi();

      cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/settings*', {
        Auth: { Enabled: false, Options: null },
        Codec: {
          Endpoint: 'http://test.com',
          PassAccessToken: true,
        },
      }).as('settings-api');

      cy.visit('/namespaces/default/workflows');

      cy.fixture('namespaces.json')
        .then(({ namespaces }) => {
          return namespaces
            .map((n) => n.namespaceInfo.name)
            .filter((name) => name !== 'temporal-system');
        })
        .as('namespaces');

      cy.wait('@namespaces-api');
      cy.wait('@workflows-api');
      cy.wait('@settings-api');

      cy.get('[data-cy="navigation-header"]').as('header');
    });

    it('can set and clear endpoint with error message', () => {
      cy.get('@header')
        .find('[data-cy="data-encoder-status-configured"]')
        .click();
      cy.get('[data-cy="data-encoder-title"]').contains('Data Encoder');
      cy.get('[data-cy="data-encoder-endpoint-title"]').contains(
        'Remote Codec Endpoint',
      );
      cy.get('[data-cy="data-encoder-endpoint-input"]').should(
        'have.value',
        '',
      );
      cy.get('[data-cy="modal-confirm-button"]').contains('Set Endpoint');

      cy.get('[data-cy="data-encoder-endpoint-info"]').contains(
        'Set endpoint overrides site setting endpoint.',
      );

      // Clear endpoint and set valid endpoint
      cy.get('[data-cy="data-encoder-endpoint-input"]').clear();
      cy.get('[data-cy="data-encoder-endpoint-input"]').type('http://test.com');
      cy.get('[data-cy="modal-confirm-button"]').click();

      cy.get('[data-cy="data-encoder-endpoint-error"]').contains(
        'Endpoint must start with https:// to authenticate',
      );

      cy.get('[data-cy="data-encoder-endpoint-input"]').clear();
      cy.get('[data-cy="data-encoder-endpoint-input"]').type(
        'https://test.com',
      );
      cy.get('[data-cy="modal-confirm-button"]').click();

      cy.get('[data-cy="data-encoder-title"]').should('not.exist');
    });
  });
});
