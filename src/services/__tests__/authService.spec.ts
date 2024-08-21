import casual from "casual";
import { UserRole } from "../../models/User";
import { isAdmin, isSuperAdmin } from "../authService";

describe('isAdmin', () => {
  let token;
  beforeEach(() => {
    token = { id: casual.integer(1, 999), givenName: casual.first_name, surName: casual.last_name };
  });

  it('returns false if token is null', async () => {
    expect(isAdmin(null)).toBe(false);
  });

  it('returns false if token.role is not ADMIN or SUPERADMIN', async () => {
    token.role = UserRole.RESEARCHER;
    token.affiliationId = casual.url;
    expect(isAdmin(token)).toBeFalsy();
  });

  it('returns false if token.affiliationId is null', async () => {
    token.role = UserRole.ADMIN;
    expect(isAdmin(token)).toBeFalsy();
  });

  it('returns true if token.role is ADMIN', async () => {
    token.role = UserRole.ADMIN;
    token.affiliationId = casual.url;
    expect(isAdmin(token)).toBeTruthy();
  });

  it('returns true if token.role is SUPERADMIN', async () => {
    token.role = UserRole.SUPERADMIN;
    token.affiliationId = casual.url;
    expect(isAdmin(token)).toBeTruthy();
  });
});

describe('isSuperAdmin', () => {
  let token;
  beforeEach(() => {
    token = { id: casual.integer(1, 999), givenName: casual.first_name, surName: casual.last_name };
  });

  it('returns false if token is null', async () => {
    expect(isSuperAdmin(null)).toBeFalsy();
  });

  it('returns false if token.role is RESEARCHER', async () => {
    token.role = UserRole.RESEARCHER;
    token.affiliationId = casual.url;
    expect(isSuperAdmin(token)).toBeFalsy();
  });

  it('returns false if token.role is ADMIN', async () => {
    token.role = UserRole.ADMIN;
    token.affiliationId = casual.url;
    expect(isSuperAdmin(token)).toBeFalsy();
  });

  it('returns true if token.role is SUPERADMIN', async () => {
    token.role = UserRole.SUPERADMIN;
    token.affiliationId = casual.url;
    expect(isSuperAdmin(token)).toBeTruthy();
  });
});