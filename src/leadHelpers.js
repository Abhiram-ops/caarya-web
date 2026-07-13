// Small pieces shared between the leads table/cards and the shortlisted page.

export const IMPORTANT_FIELDS = [
  'Company Name',
  'Role Title',
  'Role Type',
  'Compensation',
  'Location',
  'Work Mode',
  'Status',
  'Apply Link',
]

const EMPTY = new Set(['', 'not stated', 'none stated', 'n/a', 'na', 'null'])
export const isEmpty = (v) => EMPTY.has((v ?? '').toString().trim().toLowerCase())
