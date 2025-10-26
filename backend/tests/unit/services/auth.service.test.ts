import { AuthService } from '@/services/auth.service';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      signUp: vi.fn().mockResolvedValue({ data: { user: { id: '123' } }, error: null }),
    },
  }),
}));

describe('AuthService', () => {
  it('should register a new user successfully', async () => {
    const result = await AuthService.register('test@example.com', 'password123');
    expect(result).toHaveProperty('user.id', '123');
  });
});
