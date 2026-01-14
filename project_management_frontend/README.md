# Project Management Frontend (React)

## Configuration

The frontend calls the backend using an environment variable:

- `REACT_APP_API_BASE_URL` (default: `http://localhost:3001`)

Create a `.env` file locally (or set env vars in your environment), e.g.:

```bash
REACT_APP_API_BASE_URL=http://localhost:3001
```

See `.env.example` for the template.

## Expected local ports

- Frontend dev server: `http://localhost:3000`
- Backend API: `http://localhost:3001`
- Database (PostgreSQL): `localhost:5000` (used by backend)
