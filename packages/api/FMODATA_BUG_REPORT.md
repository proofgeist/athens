# @proofkit/fmodata Bug Report

**Package Version:** `@proofkit/fmodata@0.1.0-alpha.17`  
**FileMaker Server:** FileMaker Server with OData enabled (via OttoFMS)  
**Date:** December 2024

---

## Summary

While integrating `@proofkit/fmodata` with a FileMaker database, we discovered two issues that cause queries to fail or return incomplete data:

1. **Nested `$expand` data is stripped during response validation** (library bug - API returns the data correctly)
2. **`db.batch()` generates empty request body** (CRITICAL - batch operations completely broken)

---

## Issue 1: Nested `$expand` Data Stripped During Response Validation

### Description
When using nested `expand()` calls (e.g., `SmartList → ProjectAssets → Projects`), FileMaker's OData API correctly returns nested expansion data, but the library's response validation/coercion logic strips out the nested data. The raw API response contains the nested data, but after processing through the library, it is missing.

### Reproduction

```typescript
import { db, SmartList, ProjectAssets, Projects, eq } from '@proofkit/fmodata';

const query = db
  .from(SmartList)
  .list()
  .where(eq(SmartList.status, 'Open'))
  .top(3)
  .expand(ProjectAssets, (paBuilder) =>
    paBuilder.expand(Projects)  // Nested expand
  );

console.log('Query:', query.getQueryString());
const result = await query.execute();

// Check if nested data is present
const item = result.data?.[0];
const pa = (item as any).ProjectAssets?.[0];
console.log('Has Projects?', pa && 'Projects' in pa);  // false
```

### Generated Query String
```
/SmartList?$filter=status eq 'Open'&$top=3&$select=...&$expand=ProjectAssets($select=...;$expand=Projects($select=...))
```

The query syntax appears correct with nested `$expand` using semicolon notation.

### Result
- `result.error` is `undefined` (no error)
- `result.data` contains SmartList items
- `item.ProjectAssets` is present with data
- `item.ProjectAssets[0].Projects` is **NOT present** (stripped during validation)

### Analysis
The FileMaker OData API correctly returns nested expansion data in the raw HTTP response. However, the library's response validation/coercion logic is removing the nested data when processing the response. This is a library bug in the response parsing/validation layer, not a FileMaker API limitation.

**Root Cause:** The library's schema validation or response coercion is likely only validating/coercing the first level of expanded data and discarding nested expansions that don't match the expected schema structure.

**Recommendation:** Fix the response validation/coercion logic to preserve nested expansion data. The validation should recursively handle nested expands rather than stripping them.

---

## Issue 2: `db.batch()` Generates Empty Request Body (CRITICAL)

### Description
The `db.batch()` feature generates an HTTP request with an **empty body**, causing FileMaker to return an error about missing batch boundaries. This makes the entire batch feature non-functional.

### Reproduction

```typescript
import { db, Projects, Assets, eq } from '@proofkit/fmodata';

// Create query builders
const projectQuery = db
  .from(Projects)
  .list()
  .where(eq(Projects.name, 'Test Project'))
  .top(1);

const assetQuery = db
  .from(Assets)
  .list()
  .where(eq(Assets.name, 'Test Asset'))
  .top(1);

// Inspect the batch request
const batchBuilder = db.batch([projectQuery, assetQuery]);
const request = batchBuilder.toRequest("https://example.com");

console.log('Method:', request.method);         // POST
console.log('URL:', request.url);               // https://example.com/database.fmp12/$batch
console.log('Headers:', Object.fromEntries(request.headers.entries()));
console.log('Has Body:', request.body !== null);  // false ← PROBLEM

// Read the body
const bodyText = await request.text();
console.log('Body Length:', bodyText.length);   // 0 ← EMPTY!
console.log('Body Preview:', bodyText);         // "" ← EMPTY!

// Execute the batch
const result = await db.batch([projectQuery, assetQuery]).execute();
console.log('Error:', result.results[0]?.error?.message);
```

### Debug Log Evidence

From runtime debugging, we captured the following:

```json
{
  "location": "smartList.ts:175",
  "message": "Batch builder debug info",
  "data": {
    "builderMethods": ["constructor", "addRequest", "getRequestConfig", "toRequest", "processResponse", "execute"],
    "hasToRequest": true,
    "hasExecute": true,
    "requestMethod": "POST",
    "requestUrl": "https://example.com/athens-web.fmp12/$batch",
    "requestHeaders": {
      "content-type": "multipart/mixed",
      "odata-version": "4.0"
    },
    "hasBody": false,      // ← Body is NULL
    "bodyUsed": false,
    "bodyLength": 0,       // ← Zero bytes
    "bodyPreview": ""      // ← Empty string
  }
}
```

### Error Response from FileMaker

```json
{
  "code": "-1015",
  "message": "OData error: Expected batch boundary at '{}...' batch body near line:1"
}
```

### Expected Behavior

The batch request body should contain multipart MIME content with boundaries, like:

```
--batch_boundary
Content-Type: application/http
Content-Transfer-Encoding: binary

GET /Projects?$filter=name eq 'Test'&$top=1 HTTP/1.1

--batch_boundary
Content-Type: application/http
Content-Transfer-Encoding: binary

GET /Assets?$filter=name eq 'Test'&$top=1 HTTP/1.1

--batch_boundary--
```

### Actual Behavior

The request body is completely empty (`null`), with `content-type: multipart/mixed` header set correctly but no actual content.

### Workaround

Use `Promise.all()` to execute queries in parallel instead of batch:

```typescript
// Instead of batch (broken):
// const result = await db.batch([query1, query2]).execute();

// Use Promise.all (works):
const results = await Promise.all([
  query1.execute(),
  query2.execute(),
]);
```

This provides similar parallelism benefits without relying on the broken batch feature.

### Impact

- **Severity:** Critical
- **Affected:** All batch operations
- **Workaround:** Yes (Promise.all)

---

## Test File

We've created a comprehensive test file that demonstrates both issues:

**File:** `packages/api/src/__tests__/expand-exploration.test.ts`

### Running the Tests

```bash
cd packages/api
npx vitest run src/__tests__/expand-exploration.test.ts
```

### Expected Output

```
✅ Single-level expand works. ProjectAssets returned: 1 items
❌ Nested expand data stripped during validation. Has Projects? false
✅ Direct expand works. Has Projects? true Has Assets? true
```

---

## Environment

- **Node.js:** v20+
- **@proofkit/fmodata:** 0.1.0-alpha.17
- **FileMaker Server:** (version TBD)
- **OttoFMS:** (version TBD)
- **Database:** FileMaker with OData enabled

---

## Recommendations

1. **For nested expands:**
   - Fix the response validation/coercion logic to preserve nested expansion data
   - The validation should recursively handle nested expands rather than stripping them
   - Verify that the raw API response contains nested data (it should) and ensure the library preserves it through validation

2. **For batch operations (CRITICAL):**
   - The batch body serialization is completely broken - `toRequest()` returns a Request with `body: null`
   - This needs immediate investigation as batch is a core feature
   - Check if `addRequest()` needs to be called manually vs passing array to constructor
   - Until fixed, document that users should use `Promise.all()` as a workaround

---

## Contact

Please reach out if you need additional information or access to our test database for debugging.

