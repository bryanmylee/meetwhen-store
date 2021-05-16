# Developing

Install `firebase-tools` with:

```bash
npm i -g firebase-tools
```

Then, the local emulator can be started with `firebase emulators:start`. For continuous development, use `npm run dev` from within `functions/`.

The local endpoint is available at `http://localhost:5001/meetwhen-store/asia-east2/api/graphql`.

# Deploying

To deploy, use `npm run deploy` from within `functions/`.

The deployed endpoint is available at `https://asia-east2-meetwhen-store.cloudfunctions.net/api/graphql`.

# Organization

## Project structure

`functions/src/index.ts` serves as the entrypoint for the application.

Source files are grouped by concerns e.g. for the `User` concern, the type definitions, service, repository, and resolver are stored together under `functions/src/user/`.

## Types

Class and interface names follow a certain convention for readability. Given the `Meeting` concern:

- `Meeting` defines the GraphQL schema type.
- `MeetingEntry` defines the Firestore document type.
  - Although each entry does not canonically have an `id` field in the database, we assign the document ID as `id`.
- `...Input` defines the input types for GraphQL mututations. Each prefix should describe the mutation.
