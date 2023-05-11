import { GraphQLScalarType } from "graphql";

export default {
  Date: new GraphQLScalarType({
    name: "Date",
    description: "A valid datetime value",
    serialize: (value) => new Date(value).toISOString(),
    parseValue: (value) => new Date(value),
    parseLiteral: (ast) => new Date(ast.value),
  }),
};
