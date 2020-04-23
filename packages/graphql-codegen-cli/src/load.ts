import {
  loadSchema as loadSchemaToolkit,
  loadDocuments as loadDocumentsToolkit,
  UnnormalizedTypeDefPointer,
} from '@graphql-toolkit/core';
import { DetailedError, Types } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema } from 'graphql';
import { CodeFileLoader } from '@graphql-toolkit/code-file-loader';
import { GitLoader } from '@graphql-toolkit/git-loader';
import { GithubLoader } from '@graphql-toolkit/github-loader';
import { GraphQLFileLoader } from '@graphql-toolkit/graphql-file-loader';
import { JsonFileLoader } from '@graphql-toolkit/json-file-loader';
import { UrlLoader } from '@graphql-toolkit/url-loader';
import { ApolloEngineLoader } from '@graphql-toolkit/apollo-engine-loader';
import { PrismaLoader } from '@graphql-toolkit/prisma-loader';
import { join } from 'path';

export async function loadSchema(
  schemaPointers: UnnormalizedTypeDefPointer,
  config: Types.Config
): Promise<GraphQLSchema> {
  try {
    const loaders = [
      new CodeFileLoader(),
      new GitLoader(),
      new GithubLoader(),
      new GraphQLFileLoader(),
      new JsonFileLoader(),
      new UrlLoader(),
      new ApolloEngineLoader(),
      new PrismaLoader(),
    ];

    const schema = await loadSchemaToolkit(schemaPointers, {
      assumeValidSDL: true,
      loaders,
      sort: true,
      convertExtensions: true,
      includeSources: true,
      ...config,
    });
    return schema;
  } catch (e) {
    throw new DetailedError(
      'Failed to load schema',
      `
        Failed to load schema from ${Object.keys(schemaPointers).join(',')}:

        ${e.message || e}
        ${e.stack || ''}
    
        GraphQL Code Generator supports:
          - ES Modules and CommonJS exports (export as default or named export "schema")
          - Introspection JSON File
          - URL of GraphQL endpoint
          - Multiple files with type definitions (glob expression)
          - String in config file
    
        Try to use one of above options and run codegen again.
    
      `
    );
  }
}

export async function loadDocuments(
  documentPointers: UnnormalizedTypeDefPointer | UnnormalizedTypeDefPointer[],
  config: Types.Config
): Promise<Types.DocumentFile[]> {
  const loaders = [new CodeFileLoader(), new GitLoader(), new GithubLoader(), new GraphQLFileLoader()];

  const loadedFromToolkit = await loadDocumentsToolkit(documentPointers, {
    ignore: Object.keys(config.generates).map(p => join(process.cwd(), p)),
    loaders,
    sort: true,
    skipGraphQLImport: true,
    ...config,
  });

  return loadedFromToolkit;
}
