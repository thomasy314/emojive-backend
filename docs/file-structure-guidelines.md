# File Structure Guidelines:

Information about how files are organized in this project and why that was chosen.

## Test Files

Tests file are collocated with the files they are testing. This is to encourage TDD development and create a stronger coupling between them instead of having tests be an after thought.

```
✅ co-located test files
📦
├─ src
│  └─ users
│     ├─ users.service.spec.ts
│     ├─ users.service.ts
│   ...
```

vs

```
❌ Separated test files
📦
├─ src
│  └─ users
│     ├─ users.service.ts
│    ...
├─ test
│  └─ users
│     ├─ users.service.spec.ts
│   ...
```

## Group by Feature

Folders should be used to group files based on the feature they implement instead of the functionality it fulfills. For example, instead of grouping files by `controllers`, `routes`, `middleware`, `db` like so:

```
❌ Group by Functionality
📦
├─ src
│  ├─ controllers
│     ├─ chatrooms.controller.ts
│     ├─ users.controller.ts
│    ...
│  ├─ db
│     ├─ chatrooms.db.ts
│     ├─ users.db.ts
│    ...
│  ├─ middleware
│     ├─ chatrooms.middleware.ts
│     ├─ users.middleware.ts
│    ...
│  ├─ routes
│     ├─ chatrooms.routes.ts
│     ├─ users.routes.ts
│    ...
```

The project will be grouped by features like `users`, `chatrooms`, etc.:

```
✅ Group by Feature
📦
├─ src
│  ├─ users
│     ├─ users.controller.ts
│     ├─ users.db.ts
│     ├─ users.middleware.ts
│     ├─ users.routes.ts
│    ...
│  ├─ chatrooms
│     ├─ chatrooms.controller.ts
│     ├─ chatrooms.db.ts
│     ├─ chatrooms.middleware.ts
│     ├─ chatrooms.routes.ts
│    ...
```

### Why?

1. Improve workflow when working on a feature. All files will be close by and easy to locate
2. Avoid folders getting bloated as features are added

### Exceptions

**Feature Agnostic Folders**

Since some files will be unrelated to a specific feature, these files will be groups by their functionality. For example, there are route files that aggregate the routes from each feature and pass this to the HTTP server.
