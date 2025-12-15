# @proofkit/fmodata Bug Report

**Package Version:** `@proofkit/fmodata@0.1.0-alpha.17`  
**FileMaker Server:** FileMaker Server with OData enabled (via OttoFMS)  
**Date:** December 2024

---

## Summary

While integrating `@proofkit/fmodata` with a FileMaker database, we discovered four issues that cause queries to fail or return incomplete data:

1. **`inArray()` operator generates syntax rejected by FileMaker OData**
2. **Filtering by `.primaryKey()` fields fails with syntax error**
3. **Nested `$expand` is silently ignored** (FileMaker limitation, but worth documenting)
4. **`db.batch()` generates empty request body** (CRITICAL - batch operations completely broken)

---

## Issue 1: `inArray()` Generates Invalid Syntax

### Description
The `inArray()` filter operator generates OData syntax that FileMaker rejects.

### Reproduction

```typescript
import { db, Projects, inArray } from '@proofkit/fmodata';

const testIds = ['2BFD5060-1CA7-4CED-A40A-DBDD634E9758'];

const query = db
  .from(Projects)
  .list()
  .where(inArray(Projects.id, testIds))
  .top(10);

console.log('Query:', query.getQueryString());
const result = await query.execute();
console.log('Error:', result.error?.message);
```

### Generated Query String
```
/Projects?$filter=id in ('2BFD5060-1CA7-4CED-A40A-DBDD634E9758')&$top=10&$select=name,region,phase,risk_level,overall_completion,readiness_score,status,created_at,updated_at,"id"
```

### Error
```
ODataError: OData error: Error: syntax error in URL at: ' in '
```

### Analysis
The `in` operator syntax looks valid per OData 4.0 spec, but FileMaker's OData implementation appears to not support it. The library may need to:
- Document that `inArray()` is not supported on FileMaker
- Or provide an alternative that uses multiple `or` clauses: `(id eq 'a' or id eq 'b' or id eq 'c')`

---

## Issue 2: Filtering by `.primaryKey()` Field Fails

### Description
When a field is marked with `.primaryKey()`, using it in a `$filter` clause causes a syntax error.

### Schema Definition
```typescript
export const Projects = fmTableOccurrence("Projects", {
    "name": textField().entityId("FMFID:4296032386"),
    "region": textField().entityId("FMFID:8590999682"),
    // ... other fields ...
    "id": textField().primaryKey().entityId("FMFID:42950738050")  // <- primaryKey()
}, {
  entityId: "FMTID:1065090",
  navigationPaths: ["ProjectAssets"]
});
```

### Reproduction

```typescript
import { db, Projects, eq } from '@proofkit/fmodata';

const testId = '2BFD5060-1CA7-4CED-A40A-DBDD634E9758';

const query = db
  .from(Projects)
  .list()
  .where(eq(Projects.id, testId))
  .select({ id: Projects.id, name: Projects.name, region: Projects.region });

console.log('Query:', query.getQueryString());
const result = await query.execute();
console.log('Error:', result.error?.message);
```

### Generated Query String
```
/Projects?$filter=id eq '2BFD5060-1CA7-4CED-A40A-DBDD634E9758'&$top=1000&$select="id",name,region
```

### Error
```
ODataError: OData error: Error: syntax error in URL at: ' eq '
```

### Observation
Note that in the `$select` clause, `"id"` is wrapped in double quotes while `name` and `region` are not:
```
$select="id",name,region
```

This quoting appears to be caused by the `.primaryKey()` modifier. The quoted field name may be causing FileMaker to misparse the query.

### Workaround
Filtering by non-primaryKey fields works correctly:

```typescript
// This WORKS:
db.from(ProjectAssets).list().where(eq(ProjectAssets.project_id, testId)).execute();

// Query: /ProjectAssets?$filter=project_id eq '...'&$select=project_id,asset_id,...,"id"
```

---

## Issue 3: Nested `$expand` is Silently Ignored

### Description
When using nested `expand()` calls (e.g., `SmartList → ProjectAssets → Projects`), FileMaker returns the first level of expanded data but silently omits nested expansions. No error is returned.

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
- `item.ProjectAssets[0].Projects` is **NOT present** (silently omitted)

### Analysis
This appears to be a FileMaker OData limitation rather than a library bug. FileMaker only supports single-level `$expand`. The library generates valid OData syntax, but FileMaker ignores the nested portion.

**Recommendation:** Document this limitation in the library docs. Consider adding a warning in development mode when nested expands are used.

---

## Issue 4: `db.batch()` Generates Empty Request Body (CRITICAL)

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

We've created a comprehensive test file that demonstrates all three issues:

**File:** `packages/api/src/__tests__/expand-exploration.test.ts`

### Running the Tests

```bash
cd packages/api
npx vitest run src/__tests__/expand-exploration.test.ts
```

### Expected Output

```
✅ Single-level expand works. ProjectAssets returned: 1 items
❌ Nested expand silently ignored. Has Projects? false
✅ Direct expand works. Has Projects? true Has Assets? true
❌ inArray() failed: OData error: Error: syntax error in URL at: ' in '
❌ Filter by id failed: OData error: Error: syntax error in URL at: ' eq '
✅ Filter by non-primaryKey field works. Found: 1 items
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

1. **For `inArray()`:**
   - Document as unsupported on FileMaker, OR
   - Transform to `or` chain: `(field eq 'a' or field eq 'b')`

2. **For primaryKey field filtering:**
   - Investigate why `.primaryKey()` causes field names to be quoted
   - The quoting may be interfering with `$filter` parsing

3. **For nested expands:**
   - Add documentation noting FileMaker only supports single-level `$expand`
   - Consider a dev-mode warning when nested expands are detected

4. **For batch operations (CRITICAL):**
   - The batch body serialization is completely broken - `toRequest()` returns a Request with `body: null`
   - This needs immediate investigation as batch is a core feature
   - Check if `addRequest()` needs to be called manually vs passing array to constructor
   - Until fixed, document that users should use `Promise.all()` as a workaround

---

## Contact

Please reach out if you need additional information or access to our test database for debugging.

