import type { DonationId, DonorId, NeedId } from '@/write/domain/shared/ids';

export type DonationStatus = 'BOOKED' | 'FULFILLED' | 'CANCELLED';

export class Donation {
  constructor(
    private readonly id: DonationId,
    private readonly donorId: DonorId,
    private readonly needId: NeedId,
    private readonly status: DonationStatus,
    private readonly bookedAt: Date,
    private readonly fulfilledAt?: Date,
  ) {}
}
