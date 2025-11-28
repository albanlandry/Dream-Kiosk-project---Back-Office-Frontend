# User Management Tests

This directory contains comprehensive tests for user management functionality in the frontend.

## Test Files

### 1. `users-api.test.ts`
Tests for User CRUD operations:
- **GET Operations**: Fetching all users, fetching by ID, pagination, filtering
- **CREATE Operations**: Creating new users with required and optional fields
- **UPDATE Operations**: Updating user information and roles
- **DELETE Operations**: Deleting users

### 2. `user-status.test.ts`
Tests for user status management:
- **Activate User**: Activating inactive or suspended users
- **Suspend User**: Suspending active users
- **Status Transitions**: Testing all valid status transitions
- **Update Status**: Updating status via the update endpoint

### 3. `user-permissions.test.ts`
Tests for rights escalation and restriction:
- **Role Escalation**: Escalating from viewer → user → admin
- **Role Restriction**: Restricting admin → user → viewer
- **Permission Updates**: Granting and revoking permissions
- **Security Restrictions**: Testing authorization checks and validation

## Running Tests

```bash
# Run all user tests
npm test -- __tests__/users/

# Run specific test file
npm test -- __tests__/users/users-api.test.ts

# Run in watch mode
npm run test:watch -- __tests__/users/

# Run with coverage
npm run test:coverage -- __tests__/users/
```

## Test Coverage

The tests cover:
- ✅ User CRUD operations (Create, Read, Update, Delete)
- ✅ User status management (Activate, Suspend, Status transitions)
- ✅ Rights escalation (Role promotion)
- ✅ Rights restriction (Role demotion)
- ✅ Permission management
- ✅ Security validations
- ✅ Error handling

## API Endpoints Tested

- `GET /backoffice/admins` - List all users
- `GET /backoffice/admins/:id` - Get user by ID
- `POST /backoffice/admins` - Create new user
- `PATCH /backoffice/admins/:id` - Update user
- `DELETE /backoffice/admins/:id` - Delete user
- `PUT /backoffice/admins/:id/activate` - Activate user
- `PUT /backoffice/admins/:id/suspend` - Suspend user
- `PUT /backoffice/admins/:id/role` - Update user role

