// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command';

addMatchImageSnapshotCommand();

declare global {
  namespace Cypress {
    interface Chainable {
      interceptNamespacesApi(): void;
      interceptSearchAttributesApi(): void;
      interceptWorkflowsApi(): void;
      interceptWorkflowApi(): void;
      interceptUserApi(): void;
      interceptClusterApi(fixture?: string): void;
      interceptArchivedWorkflowsApi(): void;
      interceptSettingsApi(): void;
      interceptGithubReleasesApi(): void;
      interceptQueryApi(): void;
      interceptTaskQueuesApi(): void;
      interceptApi(): void;
      matchImageSnapshot(): void;
    }
  }
}

import settings from '../fixtures/settings.json';

Cypress.Commands.add('interceptNamespacesApi', () => {
  cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/namespaces*', {
    fixture: 'namespaces.json',
  }).as('namespaces-api');
});

Cypress.Commands.add('interceptSearchAttributesApi', () => {
  cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/search-attributes*', {
    fixture: 'search-attributes.json',
  }).as('search-attributes-api');
});

Cypress.Commands.add('interceptWorkflowsApi', () => {
  cy.intercept(
    Cypress.env('VITE_API_HOST') + `/api/v1/namespaces/*/workflows?query=*`,
    { fixture: 'workflows.json' },
  ).as('workflows-api');
});

Cypress.Commands.add(
  'interceptWorkflowApi',
  (fixture = 'workflow-completed.json') => {
    cy.intercept(
      Cypress.env('VITE_API_HOST') + '/api/v1/namespaces/*/workflows/*/runs/*?',
      { fixture },
    ).as('workflow-api');
  },
);

Cypress.Commands.add('interceptUserApi', () => {
  cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/me*', {
    fixture: 'me.json',
  }).as('user-api');
});

Cypress.Commands.add('interceptClusterApi', (fixture = 'cluster.json') => {
  cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/cluster*', {
    fixture,
  }).as('cluster-api');
});

Cypress.Commands.add('interceptArchivedWorkflowsApi', () => {
  cy.intercept(
    Cypress.env('VITE_API_HOST') +
      `/api/v1/namespaces/*/workflows/archived?query=*`,
    { fixture: 'workflows.json' },
  ).as('workflows-archived-api');
});

Cypress.Commands.add('interceptSettingsApi', (namespace = 'default') => {
  cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/settings*', {
    ...settings,
    DefaultNamespace: namespace,
  }).as('settings-api');
});

Cypress.Commands.add('interceptGithubReleasesApi', () => {
  cy.intercept('https://api.github.com/repos/temporalio/ui-server/releases', {
    fixture: 'github-releases.json',
  }).as('github-releases-api');
});

Cypress.Commands.add('interceptQueryApi', () => {
  cy.intercept(
    Cypress.env('VITE_API_HOST') +
      `/api/v1/namespaces/*/workflows/*/runs/*/query*`,
    { fixture: 'query-stack-trace.json' },
  ).as('query-api');
});

Cypress.Commands.add('interceptTaskQueuesApi', () => {
  cy.intercept(
    Cypress.env('VITE_API_HOST') +
      `/api/v1/namespaces/*/task-queues/*?taskQueueType=*`,
    {
      fixture: 'task-queues.json',
    },
  ).as('task-queues-api');
});

Cypress.Commands.add('interceptApi', () => {
  cy.interceptNamespacesApi();
  cy.interceptWorkflowsApi();
  cy.interceptUserApi();
  cy.interceptClusterApi();
  cy.interceptArchivedWorkflowsApi();
  cy.interceptGithubReleasesApi();
  cy.interceptQueryApi();
  cy.interceptTaskQueuesApi();
  cy.interceptSettingsApi();
  cy.interceptSearchAttributesApi();
});

export {};
