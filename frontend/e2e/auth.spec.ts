import { test, expect, Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------

/**
 * Navigate to /login, fill credentials, and submit.
 * Waits for navigation to / before returning — use only when login is expected
 * to succeed.
 */
async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/');
}

/**
 * Inject an arbitrary token string into localStorage.
 * Navigates to /login first to establish the correct localStorage origin.
 */
async function setFakeToken(page: Page, token: string) {
  await page.goto('/login');
  await page.evaluate((t) => localStorage.setItem('token', t), token);
}

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const ADMIN = { email: 'admin@test.com', password: 'TestPass123!', name: 'Test Admin' };
const AGENT = { email: 'agent@test.com', password: 'TestPass123!', name: 'Test Agent' };

// ---------------------------------------------------------------------------
// 1. Login page rendering
// ---------------------------------------------------------------------------

test.describe('Login page rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
  });

  test('should show email field, password field, and Sign in button', async ({ page }) => {
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('should display the HelpDesk brand name', async ({ page }) => {
    // The brand text appears in the left panel (desktop) and the page title area.
    // We use a broad locator to match any visible instance of the brand text.
    await expect(page.getByText('HelpDesk').first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 2 & 3. Successful login
// ---------------------------------------------------------------------------

test.describe('Successful login', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
  });

  test('should redirect ADMIN to dashboard and store token in localStorage', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', ADMIN.email);
    await page.fill('#password', ADMIN.password);
    await page.click('button[type="submit"]');

    await page.waitForURL('/');
    await expect(page).toHaveURL('/');

    // Token must be stored in localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();

    // User name should be visible in the Sidebar user section
    await expect(page.getByText(ADMIN.name)).toBeVisible();
  });

  test('should redirect AGENT to dashboard and store token in localStorage', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', AGENT.email);
    await page.fill('#password', AGENT.password);
    await page.click('button[type="submit"]');

    await page.waitForURL('/');
    await expect(page).toHaveURL('/');

    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// 4 & 5. Invalid credentials
// ---------------------------------------------------------------------------

test.describe('Invalid credentials', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
  });

  test('should show error message for wrong password', async ({ page }) => {
    await page.fill('#email', ADMIN.email);
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Error div appears with "Invalid credentials" text
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
    // Must remain on /login
    await expect(page).toHaveURL('/login');
  });

  test('should show error message for unknown email', async ({ page }) => {
    await page.fill('#email', 'nobody@nowhere.com');
    await page.fill('#password', ADMIN.password);
    await page.click('button[type="submit"]');

    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
    await expect(page).toHaveURL('/login');
  });
});

// ---------------------------------------------------------------------------
// 6. Empty form submission
// ---------------------------------------------------------------------------

test.describe('Empty form submission', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
  });

  test('should not submit when both fields are empty (HTML5 required validation)', async ({ page }) => {
    // Click submit without filling anything — browser required validation fires
    await page.click('button[type="submit"]');

    // Page must stay on /login — no navigation should occur
    await expect(page).toHaveURL('/login');

    // Verify the email input is still visible (form was not submitted)
    await expect(page.locator('#email')).toBeVisible();
  });

  test('should not submit when only email is filled', async ({ page }) => {
    await page.fill('#email', ADMIN.email);
    // Leave password empty
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/login');
  });
});

// ---------------------------------------------------------------------------
// 7, 8, 9. Route protection — unauthenticated access
// ---------------------------------------------------------------------------

test.describe('Route protection for unauthenticated users', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure no token is present before each test
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
  });

  test('should redirect unauthenticated user from / to /login', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('/login');
    await expect(page).toHaveURL('/login');
  });

  test('should redirect unauthenticated user from /tickets to /login', async ({ page }) => {
    await page.goto('/tickets');
    await page.waitForURL('/login');
    await expect(page).toHaveURL('/login');
  });

  test('should redirect unauthenticated user from /users to /login', async ({ page }) => {
    await page.goto('/users');
    await page.waitForURL('/login');
    await expect(page).toHaveURL('/login');
  });
});

// ---------------------------------------------------------------------------
// 10. Session persistence across page reload
// ---------------------------------------------------------------------------

test.describe('Session persistence', () => {
  test('should remain authenticated after a full page reload', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await loginAs(page, ADMIN.email, ADMIN.password);

    // Hard reload — token must be re-read from localStorage and /api/auth/me called
    await page.reload();

    // Should still be on the dashboard (or stay at /), not redirected to /login
    await expect(page).toHaveURL('/');
    await expect(page.getByText(ADMIN.name)).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 11. Logout
// ---------------------------------------------------------------------------

test.describe('Logout', () => {
  test('should clear token, navigate to /login, and protect / after logout', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await loginAs(page, ADMIN.email, ADMIN.password);

    // The Sidebar renders a "Sign out" button
    await page.getByRole('button', { name: 'Sign out' }).click();

    // Should land on /login
    await page.waitForURL('/login');
    await expect(page).toHaveURL('/login');

    // Token must be removed from localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();

    // Navigating to / should redirect back to /login
    await page.goto('/');
    await page.waitForURL('/login');
    await expect(page).toHaveURL('/login');
  });
});

// ---------------------------------------------------------------------------
// 12 & 13. Role-based access control
// ---------------------------------------------------------------------------

test.describe('Role-based access control', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
  });

  test('ADMIN should be able to access /users without restriction', async ({ page }) => {
    await loginAs(page, ADMIN.email, ADMIN.password);
    await page.goto('/users');

    // Should NOT show the Forbidden page
    await expect(page.getByText('Access Denied')).not.toBeVisible();

    // The URL must remain /users (no redirect)
    await expect(page).toHaveURL('/users');
  });

  test('AGENT should see Forbidden page when navigating to /users', async ({ page }) => {
    await loginAs(page, AGENT.email, AGENT.password);
    await page.goto('/users');

    // RequireAdmin renders <Forbidden> which shows "Access Denied"
    await expect(page.getByText('Access Denied')).toBeVisible();

    // The URL stays at /users (no redirect — Forbidden is rendered in-place)
    await expect(page).toHaveURL('/users');

    // The "Go to Dashboard" button from Forbidden.tsx should be present
    await expect(page.getByRole('button', { name: 'Go to Dashboard' })).toBeVisible();
  });

  test('ADMIN should see Users nav link in Sidebar, AGENT should not', async ({ page }) => {
    // ADMIN has the "Admin" section in the sidebar with the Users link
    await loginAs(page, ADMIN.email, ADMIN.password);
    await expect(page.getByRole('link', { name: 'Users' })).toBeVisible();

    // Log out and log in as AGENT
    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.waitForURL('/login');

    await page.fill('#email', AGENT.email);
    await page.fill('#password', AGENT.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    await expect(page.getByRole('link', { name: 'Users' })).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 14. Invalid / expired token in localStorage
// ---------------------------------------------------------------------------

test.describe('Invalid token handling', () => {
  test('should clear invalid token and redirect to /login when navigating to a protected route', async ({ page }) => {
    // Inject a syntactically-valid-looking but cryptographically-invalid JWT
    await setFakeToken(page, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.INVALID_SIGNATURE');

    // Navigate to the protected dashboard
    await page.goto('/');

    // useAuthProvider catches the /api/auth/me error and removes the token,
    // then RequireAuth redirects to /login
    await page.waitForURL('/login');
    await expect(page).toHaveURL('/login');

    // The bad token must have been cleared from localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });

  test('should clear a completely malformed token string and redirect to /login', async ({ page }) => {
    await setFakeToken(page, 'not-a-jwt-at-all');

    await page.goto('/');

    await page.waitForURL('/login');
    await expect(page).toHaveURL('/login');
  });
});

// ---------------------------------------------------------------------------
// 15. Loading spinner on initial auth check
// ---------------------------------------------------------------------------

test.describe('Loading state during auth check', () => {
  test('should show a loading spinner while the auth state is being resolved', async ({ page, context }) => {
    // Slow down /api/auth/me to make the spinner visible
    await context.route('**/api/auth/me', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.continue();
    });

    // First log in normally to get a valid token into localStorage
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.fill('#email', ADMIN.email);
    await page.fill('#password', ADMIN.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Now reload so the app starts fresh and must call /api/auth/me
    const [spinnerVisible] = await Promise.all([
      // The spinner is a div with the animate-spin class rendered by RequireAuth
      page.locator('.animate-spin').isVisible().catch(() => false),
      page.reload(),
    ]);

    // We check that the spinner appeared OR the page settled on / (auth succeeded)
    // The assertion is soft because timing makes deterministic spinner capture tricky
    expect.soft(spinnerVisible).toBe(true);

    // After the delayed response, we must end up authenticated at /
    await page.waitForURL('/');
    await expect(page).toHaveURL('/');
  });
});

// ---------------------------------------------------------------------------
// 16. Submit button loading state
// ---------------------------------------------------------------------------

test.describe('Submit button loading state', () => {
  test('should disable button and show "Signing in…" text while request is in flight', async ({
    page,
    context,
  }) => {
    await page.evaluate(() => localStorage.clear());

    // Introduce a delay on the login endpoint so the loading state is observable
    await context.route('**/api/auth/login', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      await route.continue();
    });

    await page.goto('/login');
    await page.fill('#email', ADMIN.email);
    await page.fill('#password', ADMIN.password);

    // Click submit and immediately check loading state before response arrives
    await page.click('button[type="submit"]');

    const button = page.getByRole('button', { name: /signing in/i });
    await expect(button).toBeVisible();
    await expect(button).toBeDisabled();

    // Let auth complete
    await page.waitForURL('/');
  });
});
