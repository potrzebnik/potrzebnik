import type { NeedStatusHistoryId, UserId } from '@/write/domain/shared/ids';
import type { NeedStatus } from '@/write/domain/entities/need';

export class NeedStatusHistory {
  constructor(
    private readonly id: NeedStatusHistoryId,
    private readonly toStatus: NeedStatus,
    private readonly changedByUserId: UserId,
    private readonly changedAt: Date,
  ) {}
}
