export interface GraphQLCache {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(key: string | bigint, variables: any): any | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    insert(key: string | bigint, variables: any, value: any): void;
}

// Basic in-memory cache for Node.js
const inMemoryCache: { [key: string]: string } = {};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stringifyValue = (value: any) =>
    JSON.stringify(value, (_, value) => {
        if (typeof value === 'bigint') {
            return value.toString() + 'n';
        }
        return value;
    });

const parseValue = (value: string) =>
    JSON.parse(value, (_, value) => {
        if (typeof value === 'string' && /\d+n$/.test(value)) {
            return BigInt(value.slice(0, -1));
        }
        return value;
    });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cacheKey = (key: string | bigint, variables: any): string =>
    `${stringifyValue(key)}:${stringifyValue(variables)}`;

export function createGraphQLCache(): GraphQLCache {
    return __BROWSER__
        ? {
              // Browser
              get: (key, variables) => {
                  const value = localStorage.getItem(cacheKey(key, variables));
                  return value === null ? null : parseValue(value);
              },
              insert: (key, variables, value) => {
                  localStorage.setItem(cacheKey(key, variables), stringifyValue(value));
              },
          }
        : {
              // Node.js
              get: (key, variables) => {
                  const value = inMemoryCache[cacheKey(key, variables)];
                  return value === undefined ? null : parseValue(value);
              },
              insert: (key, variables, value) => {
                  inMemoryCache[cacheKey(key, variables)] = stringifyValue(value);
              },
          };
}
