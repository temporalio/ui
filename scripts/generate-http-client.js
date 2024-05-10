import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';

import prettier from 'prettier';
import ts from 'typescript';

// Resolve file paths for the input TypeScript definitions and output client file.
const inputFilePath = resolve('./src/api/schema.d.ts');
const outputFilePath = resolve('./src/api/client.ts');

// Load prettier configuration for code formatting.
const prettierConfigutation = await readFile('.prettierrc', 'utf8').then(
  JSON.parse,
);

try {
  const operations = await generateOperations();
  writeClient(operations);
} catch (error) {
  console.error(error);
  process.exit(1);
}

/**
 * Represents the configuration for an API operation.
 * @typedef {Object} OperationConfig
 * @property {string} [route] - The API route.
 * @property {string} [method] - The HTTP method.
 * @property {Record<string, string>} [params] - The parameters for the operation.
 * @property {string} [body] - The body schema reference.
 */

/**
 * Parses a TypeScript file to extract API operation configurations.
 *
 * @param {string} filePath - The path to the TypeScript file to be parsed.
 * @returns {Promise<Record<string, OperationConfig>>} A promise that resolves to a record of operation names to their configurations.
 */
async function generateOperations(filePath = inputFilePath) {
  const fileContents = await readFile(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    fileContents,
    ts.ScriptTarget.Latest,
    true,
  );

  /** @type {Record<string, OperationConfig>} */
  const result = {};

  /**
   * Processes each node (interface declaration) in the abstract syntax tree (AST).
   * @param {ts.Node} node - The current node in the AST.
   */
  function processInterface(node) {
    if (!ts.isInterfaceDeclaration(node)) return;

    if (node.name.text === 'paths' || node.name.text === 'operations') {
      node.members.forEach((member) =>
        processMember(member, result, sourceFile, node.name.text),
      );
    }
  }

  ts.forEachChild(sourceFile, processInterface);
  return result;
}

/**
 * Formats and writes the client TypeScript file using the extracted API operation configurations.
 *
 * @param {Record<string, OperationConfig>} operations - The record of operation names to their configurations.
 */
async function writeClient(operations) {
  /** @type {string[]} */
  const types = [];

  const methods = Object.entries(operations)
    .map(([operation, config]) => formatMethod(operation, config, types))
    .join('\n\n');

  const clientTemplate = getClientTemplate(methods, types);

  const formattedCode = await prettier.format(clientTemplate, {
    ...prettierConfigutation,
    parser: 'typescript',
  });

  await writeFile(outputFilePath, formattedCode);
}

/**
 * Processes each member of the 'paths' or 'operations' interface.
 *
 * @param {ts.TypeElement} member - The current member of the interface being processed.
 * @param {Record<string, OperationConfig>} result - The result object being populated with API operation configurations.
 * @param {ts.SourceFile} sourceFile - The TypeScript source file being parsed.
 * @param {string} interfaceName - The name of the interface ('paths' or 'operations') containing the member.
 */
function processMember(member, result, sourceFile, interfaceName) {
  if (!ts.isPropertySignature(member) || !member.type) return;

  const name = member.name.getText(sourceFile);
  if (interfaceName === 'paths') {
    processPathsMember(member, result, sourceFile, name);
  } else if (interfaceName === 'operations') {
    processOperationsMember(member, result, sourceFile);
  }
}

/**
 * Processes a member of the 'paths' interface to extract route, method information, and JSDoc comments.
 *
 * @param {ts.PropertySignature} member - The property signature to process.
 * @param {Record<string, OperationConfig>} result - The result object being populated.
 * @param {ts.SourceFile} sourceFile - The source file being parsed.
 * @param {string} name - The name of the path.
 */
function processPathsMember(member, result, sourceFile, name) {
  if (!ts.isTypeLiteralNode(member.type)) return;

  member.type.members.forEach((typeMember) => {
    if (!ts.isPropertySignature(typeMember) || !typeMember.type) return;

    const methodName = typeMember.name.getText(sourceFile).toUpperCase();
    const operationName = typeMember.type
      .getText(sourceFile)
      .match(/operations\['(.*?)'\]/)?.[1];

    if (!operationName) return;
    if (!result[operationName]) result[operationName] = {};

    result[operationName].route = name.replace(/'/g, '');
    result[operationName].method = methodName;
  });
}

/**
 * Processes a member of the 'operations' interface, handling parameters and request bodies.
 *
 * @param {ts.PropertySignature} member - The property signature to process.
 * @param {Record<string, OperationConfig>} result - The result object being populated.
 * @param {ts.SourceFile} sourceFile - The source file being parsed.
 */
function processOperationsMember(member, result, sourceFile) {
  const operation = member.name.getText(sourceFile);
  if (!ts.isTypeLiteralNode(member.type)) return;
  if (!result[operation]) result[operation] = {};

  const description = getJSDocComments(member, sourceFile);

  if (description) {
    result[operation].description = description;
  }

  member.type.members.forEach((typeMember) => {
    switch (typeMember.name.getText(sourceFile)) {
      case 'parameters':
        processParameters(typeMember, result, operation, sourceFile);
        break;
      case 'requestBody':
        processRequestBody(typeMember, result, operation, sourceFile);
        break;
    }
  });
}

/**
 * Processes parameter information for an operation.
 *
 * @param {ts.TypeElement} typeMember - The member of the type literal node representing parameters.
 * @param {Record<string, OperationConfig>} result - The result object being populated.
 * @param {string} operation - The name of the operation being processed.
 * @param {ts.SourceFile} sourceFile - The source file being parsed.
 */
function processParameters(typeMember, result, operation, sourceFile) {
  if (!result[operation].params) result[operation].params = {};

  typeMember.type.members.forEach((paramMember) => {
    if (ts.isPropertySignature(paramMember) && paramMember.type) {
      const paramName = paramMember.name.getText(sourceFile);
      const paramType = paramMember.type.getText(sourceFile);
      result[operation].params[paramName] = paramType;
    }
  });
}

/**
 * Processes request body information for an operation.
 *
 * @param {ts.TypeElement} typeMember - The member of the type literal node representing the request body.
 * @param {Record<string, OperationConfig>} result - The result object being populated.
 * @param {string} operation - The name of the operation being processed.
 * @param {ts.SourceFile} sourceFile - The source file being parsed.
 */
function processRequestBody(typeMember, result, operation, sourceFile) {
  typeMember.type.members.forEach((requestBodyMember) => {
    if (ts.isPropertySignature(requestBodyMember) && requestBodyMember.type) {
      requestBodyMember.type.members.forEach((requestBodyMember) => {
        if (ts.isPropertySignature(requestBodyMember)) {
          const body = requestBodyMember.type.getText(sourceFile);
          result[operation].body = body.replace(/"/g, "'");
        }
      });
    }
  });
}

/**
 * Extracts JSDoc comments from a TypeScript AST node, specifically looking for JSDoc directly associated with the node.
 *
 * @param {ts.Node} node - The AST node to extract comments from.
 * @param {ts.SourceFile} sourceFile - The source file being parsed.
 * @returns {string} The concatenated JSDoc comment descriptions or an empty string if no JSDoc comment is found.
 */
function getJSDocComments(node, sourceFile) {
  const comments = ts.getJSDocCommentsAndTags(node, sourceFile);
  return comments.map((comment) => comment.getText(sourceFile)).join('\n');
}

/**
 * Formats a method for an API client.
 *
 * @param {string} operation - The name of the operation to be formatted.
 * @param {Object} config - The configuration object for the method.
 * @param {string} config.route - The API route the method will call.
 * @param {string} config.method - The HTTP method to be used.
 * @param {string} config.description - JSDoc comments for the method.
 * @param {Object} [config.params] - The parameters for the route, if any.
 * @param {string} [config.body] - The body schema reference, if applicable.
 * @param {string[]} types - A manifest of all of the types generated.
 * @returns {string} The formatted method as a string.
 */
function formatMethod(operation, config, types) {
  // Convert the first character to lowercase to follow JS naming conventions
  const methodName = operation.charAt(0).toLowerCase() + operation.slice(1);

  // Base method structure
  let methodSignature = `${methodName}(`;
  let methodBody = `return this.client.${config.method.toUpperCase()}('${
    config.route
  }'`;

  // Determine if params or body are required
  const hasParams = config.params && Object.keys(config.params).length > 0;
  const hasBody = !!config.body;

  // Handling params and/or body
  if (hasParams || hasBody) {
    /** @type { string[] } */
    let paramsList = [];
    /** @type { string[] } */
    let paramsSignature = [];
    let methodParams = '{ ';

    const params = Object.keys(config.params || {}).map((key) =>
      key === 'path' ? 'path: params' : key,
    );

    if (config.params) {
      for (let [key, value] of Object.entries(config.params)) {
        if (key === 'path') key = 'params';
        paramsList.push(key);
        if (key === 'query') key = 'query?';
        paramsSignature.push(`${key}: ${value}`);
      }
    }

    if (hasBody) {
      paramsList.push('body');
      paramsSignature.push(`body: ${config.body}`);
    }

    const paramsTypeName = `${operation}RequestParameters`;
    const paramsType = `export type ${paramsTypeName} = { ${paramsSignature.join(
      '; ',
    )} }`;

    types.push(paramsType);

    methodSignature += `{ ${paramsList.join(', ')} }: ${paramsTypeName}`;

    // Add a default value if there are only optional parameters
    if (paramsSignature.every((key) => key.includes('?'))) {
      methodSignature += ' = {}';
    }

    methodParams += hasParams ? `params: { ${params.join(', ')} }` : '';

    if (hasBody) {
      methodParams += hasParams ? ', body' : 'body';
    }

    methodParams += ' ';
    methodBody += `, ${methodParams} }`;
  } else {
    methodBody += ', {}';
  }

  const returnTypeName = `${operation}Response`;
  const returnType = `export type ${returnTypeName} = Promise<FetchResponse<paths['${
    config.route
  }']['${config.method.toLowerCase()}'], operations['${operation}'], 'application/json'>>`;

  types.push(returnType);

  methodSignature += `): ${returnTypeName} {\n\t`;
  methodBody += ');\n};';

  return config.description + '\n' + methodSignature + methodBody;
}

/**
 * Generates the API client class template with dynamically inserted methods.
 *
 * @param {string} methods - The string representation of all methods generated from the API schema.
 * @param {string[]} types - A manifest of all of the types generated.
 * @returns {string} The full client class as a string ready to be formatted and written to a file.
 */
function getClientTemplate(methods, types) {
  return `
    import createClient, { type ClientOptions, type FetchResponse } from 'openapi-fetch';
    
    import type { components, operations, paths } from './schema.js';
    
		${types.join('\n\n')}

    /**
     * The API client class encapsulating all methods for interacting with Temporal's HTTP API.
     */
    export class Client {
      private client: ReturnType<typeof createClient<paths>>;
      private _options: ClientOptions;

      constructor(options: ClientOptions = {}) {
        this._options = options;
        this.client = createClient(options);
      }

			/**
			 * Generates a new client with an updated \`baseUrl\`.
			 */
      set baseUrl(baseUrl: string) {
        this.client = createClient<paths>({ ...this._options, baseUrl });
      }

      /**
       * Gets the current options for the API client.
       */
      get options(): ClientOptions {
        return this._options;
      }

      /**
       * Sets new options for the API client.
       */
      set options(options: ClientOptions) {
        this._options = options;
        this.client = createClient({ ...this._options, ...options });
      }

      ${methods}
    }
  `.trim();
}
