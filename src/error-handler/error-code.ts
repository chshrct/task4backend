export class ErrorCode {
  public static readonly Unauthenticated = 'Account doesnt exist';
  public static readonly Blocked = 'Account is blocked';
  public static readonly NotFound = 'NotFound';
  public static readonly MaximumAllowedGrade = 'MaximumAllowedGrade';
  public static readonly AsyncError = 'AsyncError';
  public static readonly DuplicateEntityError = 'Email allready taken';
  public static readonly UnknownError = 'UnknownError';
}
