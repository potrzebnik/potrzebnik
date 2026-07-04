import type { DonorId, NeedId, UserId } from '@/write/domain/shared/ids';

export class Donor {
  constructor(
    private readonly id: DonorId,
    private readonly userId: UserId,
    private readonly name: string,
    private readonly favouriteNeeds: readonly NeedId[],

    private readonly createdAt: Date,
    private readonly updatedAt: Date,
  ) {}
}
