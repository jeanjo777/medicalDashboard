# Patient Status Values Reference

## Database Constraint: `patients_status_check`

The `patients` table has a CHECK constraint that **ONLY** allows these 4 values for the `status` column:

### Allowed Values (MUST be lowercase):

| Database Value | Display Label | Color Scheme | Description |
|---------------|---------------|--------------|-------------|
| `active` | Active | Green (emerald) | Patient is currently active |
| `inactive` | Inactive | Gray | Patient is inactive |
| `in_treatment` | In Treatment | Orange | Patient is currently receiving treatment |
| `recovered` | Recovered | Blue | Patient has recovered |

## Important Notes

### ✅ DO:
- Always use **lowercase** values when writing to database
- Use the exact strings: `'active'`, `'inactive'`, `'in_treatment'`, `'recovered'`
- Use `formatStatus()` helper function to display capitalized labels in UI
- Validate status values before sending to database

### ❌ DON'T:
- Never use capitalized values like `'Active'`, `'Recovered'`
- Never use underscores with capital letters like `'Under_Treatment'`
- Never use variations like `'under_treatment'`, `'processing'`, `'on_treatment'`
- Never use spaces in database values like `'Under Treatment'`

## Code Examples

### ✅ Correct Usage:

```typescript
// In database queries
const { data, error } = await supabase
  .from('patients')
  .update({ status: 'in_treatment' })  // ✅ Correct
  .eq('id', patientId);

// In form select options
<select name="status">
  <option value="active">Active</option>
  <option value="inactive">Inactive</option>
  <option value="in_treatment">In Treatment</option>
  <option value="recovered">Recovered</option>
</select>

// In TypeScript types
type PatientStatus = 'active' | 'inactive' | 'in_treatment' | 'recovered';
```

### ❌ Incorrect Usage:

```typescript
// WRONG - Capitalized
status: 'Active'  // ❌ Will violate constraint

// WRONG - Different spelling
status: 'under_treatment'  // ❌ Will violate constraint

// WRONG - Spaces
status: 'Under Treatment'  // ❌ Will violate constraint

// WRONG - Wrong underscore placement
status: 'in-treatment'  // ❌ Will violate constraint
```

## Files Using Status Values

- `/src/pages/EnhancedPatientsPage.tsx` - Main patients list with filters
- `/src/components/EditPatientModal.tsx` - Patient edit form
- `/src/components/AddPatientModal.tsx` - New patient form
- `/src/components/PatientDetailModalEnhanced.tsx` - Patient details view

## Helper Functions

### `formatStatus(status: string)`
Converts database values to display-friendly labels:
- `'active'` → `'Active'`
- `'inactive'` → `'Inactive'`
- `'in_treatment'` → `'In Treatment'`
- `'recovered'` → `'Recovered'`

### `getStatusColor(status: string)`
Returns Tailwind CSS classes for status badge styling based on status value.

## Error Messages

If you see: `new row for relation "patients" violates check constraint "patients_status_check"`

**Solution:** Check that you're using one of the 4 allowed lowercase values.

## Testing Validation

```sql
-- ✅ This works
UPDATE patients SET status = 'in_treatment' WHERE id = '...';

-- ❌ This fails with constraint violation
UPDATE patients SET status = 'Under Treatment' WHERE id = '...';
UPDATE patients SET status = 'under_treatment' WHERE id = '...';
UPDATE patients SET status = 'Recovered' WHERE id = '...';
```

## Last Updated
2025-10-29
