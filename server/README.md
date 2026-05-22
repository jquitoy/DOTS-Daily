# Server

Backend code and database definitions live here.

## Database

Normalized user names are defined in `database/schema.sql`:

- `first_name` (required)
- `middle_name` (optional)
- `last_name` (required)
- `name_suffix` (optional, e.g. Jr., III)

Audit logs store a denormalized `display_name` for readability while user records keep separate name columns.
