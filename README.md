# Velocity Changelog API
For managing the changelogs available on the [Velocity Website](https://github.com/autocrystal/velocity.lat).

## Auth

Protected endpoints require:

```
Authorization: Bearer <SECRET>
```

---

## GET /changelogs

Returns all changelogs (newest first).

**Response**

```json
[
  {
    "id": 1,
    "created_at": "timestamp",
    "lines": ["text"]
  }
]
```

---

## GET /changelogs/latest

Returns the most recent changelog.

**Response**

```json
{
  "id": 1,
  "created_at": "timestamp",
  "lines": ["text"]
}
```

**Errors**

* 404: no changelogs

---

## POST /changelogs

Creates a new changelog.

**Body**

```json
{
  "lines": ["text"]
}
```

**Response**

```json
{
  "id": 1,
  "lines": ["text"]
}
```

**Errors**

* 401: unauthorized
* 400: invalid input

---

## DELETE /changelogs/:id

Deletes a changelog.

**Response**

```json
{
  "deleted": true,
  "id": 1
}
```

**Errors**

* 401: unauthorized
* 404: not found