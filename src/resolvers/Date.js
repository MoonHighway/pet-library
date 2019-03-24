const { GraphQLScalarType } = require("graphql");

module.exports = new GraphQLScalarType({
  name: "Date",
  description: "A valid datetime value",
  serialize: value => new Date(value).toISOString(),
  parseValue: value => new Date(value),
  parseLiteral: ast => new Date(ast.value)
});
