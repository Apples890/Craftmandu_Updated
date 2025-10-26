import { AppError } from '@/utils/error.utils';

describe('AppError', () => {
  it('should create an error with status code and message', () => {
    const err = new AppError('Something went wrong', 404);
    expect(err.message).toBe('Something went wrong');
    expect(err.status).toBe(404);
  });
});
