import type { OrganizationId, NeedId } from '@/write/domain/shared/ids';
import type { NeedStatusHistory } from '@/write/domain/entities/need-status-history';
import type { Address } from '@/write/domain/value-objects';

export type NeedStatus = 'ACTIVE' | 'FULFILLED';

export class Need {
  constructor(
    private readonly id: NeedId,
    private readonly organizationId: OrganizationId,
    private readonly deliveryAddress: Address,
    private readonly description: string,
    private readonly beneficiaryName: string,
    private readonly requestedItem: string,
    private readonly statusTimeline: readonly NeedStatusHistory[],

    private readonly createdAt: Date,
    private readonly updatedAt: Date,
    private readonly photo?: string,
  ) {}
}
