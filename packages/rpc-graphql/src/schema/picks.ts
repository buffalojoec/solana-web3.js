import {
    GraphQLBoolean,
    GraphQLEnumType,
    GraphQLFieldConfig,
    GraphQLFloat,
    GraphQLInputObjectType,
    GraphQLInt,
    GraphQLInterfaceType,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLScalarType,
    GraphQLString,
    GraphQLUnionType,
    ThunkObjMap,
} from 'graphql';

import { BigIntScalar } from './scalars';

type GraphQLType =
    | GraphQLEnumType
    | GraphQLInputObjectType
    | GraphQLInterfaceType
    | GraphQLObjectType
    | GraphQLScalarType
    | GraphQLUnionType;

export const boolean = () => ({ type: GraphQLBoolean });
export const bigint = () => ({ type: BigIntScalar });
export const float = () => ({ type: GraphQLFloat });
export const number = () => ({ type: GraphQLInt });
export const string = () => ({ type: GraphQLString });

export function type<TFieldType extends GraphQLType>(
    fieldType: TFieldType
): {
    type: TFieldType;
} {
    return {
        type: fieldType,
    };
}

export function nonNull<TFieldType extends GraphQLType>(fieldType: {
    type: TFieldType;
}): {
    type: GraphQLList<TFieldType>;
} {
    return {
        type: new GraphQLNonNull(fieldType.type),
    };
}

export function list<TElementType extends GraphQLType>(elementType: {
    type: TElementType;
}): {
    type: GraphQLList<TElementType>;
} {
    return {
        type: new GraphQLList(elementType.type),
    };
}

export function object(
    name: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fields: ThunkObjMap<GraphQLFieldConfig<any, any, any>>
): { type: GraphQLObjectType } {
    return {
        type: new GraphQLObjectType({
            fields,
            name,
        }),
    };
}
