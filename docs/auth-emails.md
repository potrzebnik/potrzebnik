# Auth Emails

Auth email delivery is opt-in. `src/lib/auth-config.ts` wires it into Better
Auth, while email subjects and content live in `src/lib/emails/templates`.
When disabled, local development does not need Resend credentials.

## Config

Disabled mode, default for local development:

```env
EMAIL_SENDING_ENABLED=false
```

In disabled mode:

- email/password sign-up works
- users can sign in without email verification
- no verification email is sent
- password reset email is disabled
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `RESEND_FROM_NAME` are not required

Enabled mode:

```env
EMAIL_SENDING_ENABLED=true
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@example.com
RESEND_FROM_NAME=Potrzebnik
```

Required when enabled:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Optional when enabled:

- `RESEND_FROM_NAME`

Enabled mode behavior:

- sign-up sends a verification email
- credential login is blocked until the email is verified
- password reset email is enabled
- Better Auth stores verification and reset tokens in the existing
  `verification` table

## Code Usage

Use the existing Better Auth client from `src/lib/auth-client.ts`:

```ts
import { authClient } from '@/lib/auth-client';
```

Sign up with email/password. When email sending is enabled, this sends the
verification email automatically.

```ts
await authClient.signUp.email({
  name,
  email,
  password,
  callbackURL: '/dashboard',
});
```

Sign in with email/password. When email sending is enabled, unverified users get
a `403` response from Better Auth.

```ts
await authClient.signIn.email({
  email,
  password,
});
```

Request a password reset email:

```ts
await authClient.requestPasswordReset({
  email,
  redirectTo: '/reset-password',
});
```

Set the new password after the user opens the reset link and the UI receives a
reset token:

```ts
await authClient.resetPassword({
  token,
  newPassword,
});
```

Optional manual resend of the verification email:

```ts
await authClient.sendVerificationEmail({
  email,
  callbackURL: '/dashboard',
});
```

The underlying Better Auth endpoints stay mounted under `/api/auth/*`:

- `POST /api/auth/sign-up/email`
- `POST /api/auth/sign-in/email`
- `GET /api/auth/verify-email?token=...`
- `POST /api/auth/request-password-reset`
- `GET /api/auth/reset-password/:token`
- `POST /api/auth/reset-password`
