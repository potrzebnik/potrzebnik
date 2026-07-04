import type { Brand } from '@/write/domain/shared/brand';

export type UserId = Brand<string, 'UserId'>;

export type OrganizationId = Brand<number, 'OrganizationId'>;

export type DonorId = Brand<number, 'DonorId'>;

export type NeedId = Brand<number, 'NeedId'>;

export type DonationId = Brand<number, 'DonationId'>;

export type NeedStatusHistoryId = Brand<number, 'NeedStatusHistoryId'>;
