# GraphQL Query Language Course - egghead

## 1. Send a Query with GraphQL Playground

```graphql
query {
  totalPets
}
```

## 2. Query a List of Objects with GraphQL

```graphql
query {
  allPets {
    name
    weight
  }
}
```

## 3. Query an Enumeration Type with GraphQL

```graphql
query PetNamesAndCategories {
  allPets {
    name
    category
  }
}
```

## 4. Query Nested Fields with GraphQL

```graphql
query PetInfo {
  totalPets
  allPets {
    name
    category
    weight
    checkedOut
    photo {
      full
      thumb
    }
  }
}
```

## 5. Filter a GraphQL Query Result Using Arguments

```graphql
query CheckedOutPets {
  totalPets(status: CHECKEDOUT)
}
```

## 6. Filter a GraphQL Result Using Enumerator Arguments

```graphql
query CatsInLibrary {
  allPets(category: CAT) {
    name
    category
    checkedOut
  }
}
```

- Test with Multiple Argument Filters

```graphql
query CheckedOutCats {
  allPets(category: CAT, status: AVAILABLE) {
    name
    category
    checkedOut
  }
}
```

## 7. Use Variables to Filter a Query Result with GraphQL

```graphql
query($category: PetCategory, $status: PetStatus) AllPets {
  allPets(category: $category, status: $status) {
    name
    category
    checkedOut
  }
}
```

_Query Variables Passed as JSON_

```json
{
  "category": "DOG",
  "status": "CHECKEDOUT"
}
```

## 8. Query Connected Types with GraphQL

- Connect Pet to Customer

```graphql
query($id: String!) {
  petById(id: $id) {
    name
    inCareOf {
      name
      username
    }
  }
}
```

_query vars_

```json
{
  "id": "C-1"
}
```

- Connect Customer to Pet

```graphql
query {
  allCustomers {
    name
    username
    currentPets {
      name
    }
  }
}
```

## 9. Use GraphQL Aliases to Rename Response Fields

```graphql
query {
  biscuit: petById(name: "C-1") {
    name
    type
    photo {
      thumb
    }
  }
  jungle: petByName(name: "C-2") {
    name
    type
    photo {
      thumb
    }
  }
}
```

## 10. Use Operation Names for GraphQL Queries

```graphql
query AllData {
  availablePets: totalPets(status: AVAILABLE)
  unavailablePets: totalPets(status: CHECKEDOUT)
  allPets {
    name
    category
    weight
    checkedOut
    photo {
      full
      thumb
    }
    inCareOf {
      name
      username
    }
  }
  totalCustomers
  allCustomers {
    name
    username
    currentPets {
      name
    }
  }
}
```

- Split into two queries
- Show without Operation Name First

```graphql
query PetsPage {
  availablePets: totalPets(status: AVAILABLE)
  unavailablePets: totalPets(status: CHECKEDOUT)
  allPets {
    name
    category
    weight
    checkedOut
    photo {
      full
      thumb
    }
    inCareOf {
      name
      username
    }
  }
}
query CustomersPage {
  allCustomers {
    name
    username
    currentPets {
      name
    }
  }
}
```

## 12. Create Account Mutation

```graphql
mutation($input: CreateAccountInput!) {
  createAccount(input: $input) {
    name
    username
    password
  }
}
```

```json
{
  "input": {
    "name": "Joe Jazzman",
    "username": "joejazz",
    "password": "jazz4lyfe"
  }
}
```

_Response_

```json
{
  "data": {
    "createAccount": {
      "name": "Joe Jazzman",
      "username": "joejazz",
      "password": "jazz4lyfe"
    }
  }
}
```

## 13. Authenticate a User with a GraphQL Mutation

```graphql
mutation ($username: ID! password: String!) {
  logIn(username: $username password: $password) {
    user {
      name
    }
    token
  }
}
```

_query vars_

```json
{
  "username": "joejazz",
  "password": "keep-it-jazzy"
}
```

_Response_

```json
{
  "data": {
    "logIn": {
      "user": {
        "name": "Joe Jazzman"
      },
      "token": "124120t41w20412"
    }
  }
}
```

_send a me query_

```graphql
query {
  me {
    name
  }
}
```

_pass auth token as HTTP headers_

```json
{
  "Authorization": "124120t41w20412"
}
```

_Response_

```json
{
  "data": {
    "me": {
      "name": "Joe Jazzman"
    }
  }
}
```

## 14. Understand Errors with GraphQL Mutations

- Show Successful Mutation

```graphql
mutation {
  checkOut(id: "C-1") {
    name
    dueDate
  }
}
```

## 15. Reuse GraphQL Selection Sets with Fragments

```graphql
query AvailableStingrays {
  allPets(category: STINGRAY, checkedOut: false) {
    name
    weight
    category
    checkedOut
  }
}
```

_Refactor to add fragment to Query_

```graphql
query AvailableStingrays {
  allPets(category: STINGRAY, checkedOut: false) {
    ...PetDetails
  }
}

fragment PetDetails on Pet {
  name
  weight
  category
  checkedOut
}
```

_Add add'l fields to fragment_

```graphql
fragment PetDetails on Pet {
  name
  weight
  category
  checkedOut
  inCareOf {
    name
  }
}
```

_use more than once_

```graphql
query {
  allPets(category: STINGRAY, checkedOut: false) {
    ...PetDetails
  }
  petByName(name: "Biscuit") {
    ...PetDetails
  }
}
```

## 16. Query Multiple Types using a Union in GraphQL

```graphql
query {
  search(searchString: "bis") {
    __typename
    ... on Customer {
      name
      username
      currentPet {
        name
      }
    }
    ... on Pet {
      name
      checkedOut
    }
  }
}
```

_Response_

```json
{
  "data": {
    "search": [
      {
        "__typename": "Customer",
        "name": "Bismarck Flenders",
        "username": "bismarck.flenders",
        "currentPet": {
          "name": "Sugar"
        }
      },
      {
        "__typename": "Cat",
        "name": "Biscuit",
        "checkedOut": true
      }
    ]
  }
}
```

## 17. Query GraphQL Interface Types in GraphQL Playground

```graphql
query {
  allPets {
    __typename
    name
    weight
    checkedOut
    ... on Cat {
      sleepAmount
      curious
    }
    ... on Dog {
      good
    }
    ... on Stingray {
      chill
      fast
    }
  }
}
```

_Response_

```json
{
  "data": {
    "allPets": [
      {
        "__typename": "Dog",
        "name": "Einstein",
        "good": true
      },
      {
        "__typename": "Stingray",
        "name": "Jack",
        "chill": false,
        "fast": true
      },
      {
        "__typename": "Cat",
        "name": "Joseph",
        "sleepAmount": 16,
        "curious": true
      }
    ]
  }
}
```

## 18. Listen For Data Changes With a GraphQL Subscription

```graphql
subscription {
  returnedPet {
    name
  }
}
```

```graphql
mutation {
  checkIn(name: "Biscuit") {
    name
  }
}
```

_Response_

```json
{
  "data": {
    "checkIn": {
      "name": "Biscuit"
    }
  }
}
```

```graphql
mutation {
  checkIn(name: "Jungle") {
    name
  }
}
```

_Response_

```json
{
  "data": {
    "checkIn": {
      "name": "Jungle"
    }
  }
}
```

## 19. Query a GraphQL API's Types With Introspection Queries

```graphql
query AllTypes {
  __schema {
    types {
      name
      kind
      description
    }
  }
}
```

```graphql
query Customer {
  __type(name: "Customer") {
    fields {
      name
      description
    }
  }
}
```

```graphql
query AvailableQueries {
  __schema {
    queryType {
      fields {
        name
        description
      }
    }
  }
}
```

```graphql
query UnionInterfaceTypes {
  __type(name: "Pet") {
    kind
    name
    description
    possibleTypes {
      name
      kind
      description
    }
  }
}
```
