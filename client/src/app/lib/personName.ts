export type PersonName = {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
};

export type PersonNameInput = {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
};

const NAME_SUFFIXES = new Set([
  'jr',
  'jr.',
  'sr',
  'sr.',
  'ii',
  'iii',
  'iv',
  'v',
  'phd',
  'ph.d.',
  'md',
  'm.d.',
  'esq',
  'esq.',
]);

export function emptyPersonName(): PersonNameInput {
  return {
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
  };
}

export function normalizePersonNameInput(
  input: PersonNameInput,
): Required<PersonNameInput> {
  return {
    firstName: input.firstName.trim(),
    middleName: input.middleName?.trim() ?? '',
    lastName: input.lastName.trim(),
    suffix: input.suffix?.trim() ?? '',
  };
}

export function isPersonNameValid(input: PersonNameInput): boolean {
  const normalized = normalizePersonNameInput(input);
  return Boolean(normalized.firstName && normalized.lastName);
}

export function formatPersonName(
  parts: Pick<PersonName, 'firstName' | 'middleName' | 'lastName' | 'suffix'>,
): string {
  return [parts.firstName, parts.middleName, parts.lastName, parts.suffix]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');
}

export function personNameInitials(
  parts: Pick<PersonName, 'firstName' | 'lastName'>,
): string {
  const first = parts.firstName?.trim().charAt(0) ?? '';
  const last = parts.lastName?.trim().charAt(0) ?? '';
  const initials = `${first}${last}`.toUpperCase();
  return initials || '?';
}

export function parseLegacyFullName(fullName: string): PersonName {
  const tokens = fullName.trim().split(/\s+/).filter(Boolean);

  if (tokens.length === 0) {
    return { firstName: '', lastName: '' };
  }

  if (tokens.length === 1) {
    return { firstName: tokens[0], lastName: '' };
  }

  const lastToken = tokens[tokens.length - 1];
  const hasSuffix = NAME_SUFFIXES.has(lastToken.toLowerCase());

  if (hasSuffix && tokens.length >= 3) {
    const suffix = tokens.pop() ?? '';
    const lastName = tokens.pop() ?? '';
    const firstName = tokens.shift() ?? '';
    const middleName = tokens.join(' ');

    return {
      firstName,
      middleName: middleName || undefined,
      lastName,
      suffix,
    };
  }

  if (tokens.length === 2) {
    return { firstName: tokens[0], lastName: tokens[1] };
  }

  const firstName = tokens.shift() ?? '';
  const lastName = tokens.pop() ?? '';
  const middleName = tokens.join(' ');

  return {
    firstName,
    middleName: middleName || undefined,
    lastName,
  };
}

type LegacyStoredUser = {
  name?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  suffix?: string;
};

export function resolvePersonName(user: LegacyStoredUser): PersonName {
  if (user.firstName?.trim() || user.lastName?.trim()) {
    return {
      firstName: user.firstName?.trim() ?? '',
      middleName: user.middleName?.trim() || undefined,
      lastName: user.lastName?.trim() ?? '',
      suffix: user.suffix?.trim() || undefined,
    };
  }

  if (user.name?.trim()) {
    return parseLegacyFullName(user.name);
  }

  return { firstName: '', lastName: '' };
}
