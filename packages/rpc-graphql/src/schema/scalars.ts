import { GraphQLScalarType, Kind } from 'graphql';

export const BigIntScalar = new GraphQLScalarType({
    name: 'BigInt',

    parseLiteral(ast) {
        if (ast.kind === Kind.STRING) {
            return BigInt(ast.value);
        }
        return null;
    },

    parseValue(value) {
        return BigInt(value as string | number | bigint | boolean);
    },

    serialize(value) {
        return (value as { toString: () => string }).toString();
    },
});
