export class DomainError extends Error {
  constructor(
    public readonly code:
      | 'INVALID_FORMAT'
      | 'UNSUPPORTED_DEVICE'
      | 'OUT_OF_RANGE'
      | 'AMBIGUOUS_INPUT'
      | 'INVALID_NUMERIC_LITERAL',
    message: string
  ) {
    super(message);
    this.name = 'DomainError';
  }
}
