type AuditDateValue = Date | string | null | undefined;

type AuditDateFields = {
  createdOnUtc?: AuditDateValue;
  modifiedOnUtc?: AuditDateValue;
};

function toDate(value: AuditDateValue): AuditDateValue {
  if (!value || value instanceof Date) return value;
  return new Date(value);
}

export function transformAuditFields<T extends AuditDateFields>(data: T): T {
  data.createdOnUtc = toDate(data.createdOnUtc) as T['createdOnUtc'];
  data.modifiedOnUtc = toDate(data.modifiedOnUtc) as T['modifiedOnUtc'];
  return data;
}

export function transformAuditFieldsList<T extends AuditDateFields>(
  items: T[],
): T[] {
  return items.map(transformAuditFields);
}
