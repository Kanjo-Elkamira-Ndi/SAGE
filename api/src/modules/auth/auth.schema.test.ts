import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from './auth.schema';

const validUser = {
  fullName: 'Jane Doe',
  email: 'jane@university.edu',
  password: 'Str0ng!Pass',
  role: 'student',
};

describe('registerSchema', () => {
  it('accepts a valid student registration', () => {
    const out = registerSchema.parse(validUser);
    expect(out.role).toBe('student');
    expect(out.email).toBe('jane@university.edu');
  });

  it('defaults role to student and lowercases email', () => {
    const out = registerSchema.parse({ ...validUser, email: '  JANE@University.Edu ', role: undefined });
    expect(out.role).toBe('student');
    expect(out.email).toBe('jane@university.edu');
  });

  it('accepts explicit lecturer/admin roles', () => {
    expect(registerSchema.parse({ ...validUser, role: 'lecturer' }).role).toBe('lecturer');
    expect(registerSchema.parse({ ...validUser, role: 'admin' }).role).toBe('admin');
  });

  it('rejects a role outside the allowed set', () => {
    expect(() => registerSchema.parse({ ...validUser, role: 'superuser' })).toThrow();
  });

  it('rejects weak passwords', () => {
    const cases = [
      'short', // too short
      '12345678aA!', // no lowercase? has 1 2 3 4 5 6 7 8 a A ! -> has lowercase a
    ];
    expect(() => registerSchema.parse({ ...validUser, password: 'short' })).toThrow();
    expect(() => registerSchema.parse({ ...validUser, password: 'ABCDEFG1!' })).toThrow(); // no lowercase
    expect(() => registerSchema.parse({ ...validUser, password: 'abcdefgh1' })).toThrow(); // no uppercase
    expect(() => registerSchema.parse({ ...validUser, password: 'abcdefgH!' })).toThrow(); // no digit
    expect(() => registerSchema.parse({ ...validUser, password: 'abcdefgH1' })).toThrow(); // no symbol
    void cases;
  });

  it('rejects missing fullName or bad email', () => {
    expect(() => registerSchema.parse({ ...validUser, fullName: '' })).toThrow();
    expect(() => registerSchema.parse({ ...validUser, email: 'not-an-email' })).toThrow();
  });
});

describe('loginSchema', () => {
  it('accepts email + password and lowercases email', () => {
    const out = loginSchema.parse({ email: '  JANE@University.Edu ', password: 'x' });
    expect(out.email).toBe('jane@university.edu');
  });

  it('rejects empty password', () => {
    expect(() => loginSchema.parse({ email: 'a@b.edu', password: '' })).toThrow();
  });
});
