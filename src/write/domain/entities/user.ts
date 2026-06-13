import type { UserId } from '@/write/domain/shared/ids';

export class User {
  constructor(
    private readonly id: UserId,
    private readonly email: string,
  ) {}
}
