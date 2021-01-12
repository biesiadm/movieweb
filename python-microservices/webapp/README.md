# Web app

## Development

When building Docker image, machine will use API definition from `api.json`. For now, you can get this file from the movies service:
```
wget http://localhost:5000/openapi.json -O api.json
```

Running machine does hot reload for contents of `src` and `public` directories.
