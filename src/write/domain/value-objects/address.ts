export class Address {
  constructor(
    public readonly city: string,
    public readonly street: string,
    public readonly building: string,
    public readonly zipCode: string,
    public readonly apartment?: string,
  ) {}
}
