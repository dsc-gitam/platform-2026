-- Signing in with Google now counts as joining (no separate membership form), so existing accounts are members too.
UPDATE "User" SET "onboarded" = true WHERE "isAnonymous" = false;
