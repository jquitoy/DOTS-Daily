import { Input } from './ui/input';
import { Label } from './ui/label';
import type { PersonNameInput } from '../lib/personName';

type PersonNameFieldsProps = {
  value: PersonNameInput;
  onChange: (value: PersonNameInput) => void;
  disabled?: boolean;
  required?: boolean;
  idPrefix?: string;
};

export function PersonNameFields({
  value,
  onChange,
  disabled = false,
  required = false,
  idPrefix = 'person-name',
}: PersonNameFieldsProps) {
  const update = (field: keyof PersonNameInput, nextValue: string) => {
    onChange({ ...value, [field]: nextValue });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-first`}>First name</Label>
        <Input
          id={`${idPrefix}-first`}
          value={value.firstName}
          onChange={(event) => update('firstName', event.target.value)}
          placeholder="Jane"
          disabled={disabled}
          required={required}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-middle`}>Middle name</Label>
        <Input
          id={`${idPrefix}-middle`}
          value={value.middleName ?? ''}
          onChange={(event) => update('middleName', event.target.value)}
          placeholder="Optional"
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-last`}>Last name</Label>
        <Input
          id={`${idPrefix}-last`}
          value={value.lastName}
          onChange={(event) => update('lastName', event.target.value)}
          placeholder="Smith"
          disabled={disabled}
          required={required}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-suffix`}>Suffix</Label>
        <Input
          id={`${idPrefix}-suffix`}
          value={value.suffix ?? ''}
          onChange={(event) => update('suffix', event.target.value)}
          placeholder="Jr., III, PhD"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
