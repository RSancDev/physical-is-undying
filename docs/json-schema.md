# 4K Vault JSON Schema

Current schema version: `1`.

Exports use this top-level shape:

```ts
{
  schemaVersion: 1;
  exportedAt: string;
  appName: "4K Vault";
  items: CollectionItem[];
}
```

Each `CollectionItem` is a specific physical release. Required MVP fields include:

- `id`
- `title`
- `sortTitle`
- `format: "4K UHD Blu-ray"`
- `owned`
- `wishlist`
- `watchedStatus`
- `watchHistory`
- rating fields
- `hdrFormats`
- `audioFormats`
- `dateAdded`
- `dateUpdated`
- `validationStatus`
- `validationConfidence`
- `validationReasons`
- `validationWarnings`

Provider metadata is stored in `providerSnapshots`. User edits are tracked in `userEditedFields` so future metadata refreshes can avoid overwriting user corrections.
