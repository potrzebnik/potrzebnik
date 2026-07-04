import type { OrganizationId, UserId } from '@/write/domain/shared/ids';
import type { Address, PhoneNumber } from '@/write/domain/value-objects';

export class Organization {
  constructor(
    private readonly id: OrganizationId,
    private readonly userId: UserId,
    private readonly name: string,
    private readonly krs: string,
    private readonly mainAddress: Address,
    private readonly shippingAddresses: readonly Address[],
    private readonly phoneNumber: PhoneNumber,

    private readonly createdAt: Date,
    private readonly updatedAt: Date,
  ) {}
}
