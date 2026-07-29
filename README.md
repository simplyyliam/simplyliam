# Simply Liam

Portfolio built with React, Vite, Tailwind CSS, shadcn/ui, and Supabase.

## Developer project publishing

Visitors can read projects without signing in. The portfolio owner signs in at
`/admin`; after a successful admin session, a plus button appears beside the
Projects heading and opens the add-project dialog.

Security is enforced by Supabase Row Level Security (RLS), not by hiding the
button. Only the configured Supabase user UUID can insert rows.

### 1. Create the admin user

In the Supabase dashboard:

1. Open **Authentication → Users**.
2. Create your user with an email and password.
3. Copy the generated user UUID.
4. Open **Authentication → Sign In / Providers → Email** and disable
   **Allow new users to sign up**. Existing users can still sign in.

### 2. Create the projects table

Open
[`supabase/migrations/20260729000000_create_projects.sql`](supabase/migrations/20260729000000_create_projects.sql),
replace the zero UUID with your copied user UUID, and run the file in the
Supabase SQL Editor.

Then run
[`supabase/migrations/20260729010000_add_project_avatars_and_editing.sql`](supabase/migrations/20260729010000_add_project_avatars_and_editing.sql).
This follow-up migration already contains the same admin UUID and adds:

- project editing access for the portfolio owner;
- `avatar_url` and `avatar_path` project fields;
- a public `project-avatars` Storage bucket;
- a 2 MB image-only upload limit; and
- admin-only avatar upload and deletion policies.

The migration:

- creates the `projects` table;
- enables RLS;
- allows public reads; and
- allows inserts only when `auth.uid()` matches your admin UUID.

### 3. Configure the app

Copy `.env.example` to `.env` and fill in:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_SUPABASE_ADMIN_USER_ID=your-admin-user-uuid
```

Use the publishable key from **Project Settings → API Keys**. Never put a
Supabase secret or service-role key in a `VITE_*` variable.

Add the same three variables to the hosting provider before deploying.

### 4. Add a project

1. Run the app.
2. Visit `/admin` and sign in.
3. Return to `/`.
4. Select the plus button beside **Projects**.
5. Enter the project name, description, full `https://` link, and an
   optional avatar image.

The new row is saved to Supabase and appears immediately. Public visitors can
see it but cannot add projects.

To edit a project, hover its row and select the pencil beside the year. The
edit control is always visible on touch-sized layouts while you are signed in.
Replacing an avatar removes the previous image after the project update
succeeds.

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run lint
npm run build
```

Supabase references:

- [Password sign-in](https://supabase.com/docs/reference/javascript/auth-signinwithpassword)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Auth configuration](https://supabase.com/docs/guides/auth/general-configuration)
