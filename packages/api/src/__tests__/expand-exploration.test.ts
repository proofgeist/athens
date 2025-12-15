import { describe, it, expect } from 'vitest';
import { eq, inArray } from '@proofkit/fmodata';
import { db, SmartList, ProjectAssets, Projects, Assets } from '../db';

/**
 * Exploration tests to understand FileMaker OData expand/navigation limits
 * 
 * FINDINGS SUMMARY:
 * 1. Single-level expand works ✅
 * 2. Nested expands are SILENTLY IGNORED by FileMaker OData ❌
 * 3. inArray() generates invalid OData syntax for FileMaker ❌
 * 4. Filtering by primaryKey() field (id) fails with syntax error ❌
 * 
 * These tests document the behavior for reporting to @proofkit/fmodata developers.
 */
describe('OData Expand Exploration', () => {
  
  // ============================================================================
  // EXPAND TESTS
  // ============================================================================

  describe('Expand behavior', () => {
    
    it('Single-level expand works (SmartList → ProjectAssets)', async () => {
      const query = db
        .from(SmartList)
        .list()
        .where(eq(SmartList.status, 'Open'))
        .top(3)
        .expand(ProjectAssets);

      const queryString = query.getQueryString();
      console.log('Single-level expand query:', queryString);

      const result = await query.execute();

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      
      if (result.data && result.data.length > 0) {
        const item = result.data[0]!;
        expect('ProjectAssets' in item).toBe(true);
        const pa = (item as any).ProjectAssets;
        expect(Array.isArray(pa)).toBe(true);
        console.log('✅ Single-level expand works. ProjectAssets returned:', pa.length, 'items');
      }
    });

    it('Nested expand is SILENTLY IGNORED (SmartList → ProjectAssets → Projects)', async () => {
      const query = db
        .from(SmartList)
        .list()
        .where(eq(SmartList.status, 'Open'))
        .top(3)
        .expand(ProjectAssets, (paBuilder) =>
          paBuilder.expand(Projects)
        );

      const queryString = query.getQueryString();
      console.log('Nested expand query:', queryString);
      // Expected query includes: $expand=ProjectAssets(...;$expand=Projects(...))

      const result = await query.execute();

      // No error is returned - FileMaker silently ignores the nested expand
      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();

      if (result.data && result.data.length > 0) {
        const item = result.data[0];
        const pa = (item as any).ProjectAssets?.[0];
        
        // The nested Projects expand is NOT present
        const hasProjects = pa && 'Projects' in pa;
        console.log('❌ Nested expand silently ignored. Has Projects?', hasProjects);
        
        // This documents the limitation - nested expands don't work
        expect(hasProjects).toBe(false);
      }
    });

    it('Direct expand from middle table works (ProjectAssets → Projects + Assets)', async () => {
      const query = db
        .from(ProjectAssets)
        .list()
        .top(3)
        .expand(Projects, (p) => p.select({ name: Projects.name, region: Projects.region }))
        .expand(Assets, (a) => a.select({ name: Assets.name, type: Assets.type }));

      const queryString = query.getQueryString();
      console.log('Direct expand query:', queryString);

      const result = await query.execute();

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();

      if (result.data && result.data.length > 0) {
        const item = result.data[0]!;
        const hasProjects = 'Projects' in item && Array.isArray((item as any).Projects);
        const hasAssets = 'Assets' in item && Array.isArray((item as any).Assets);
        
        console.log('✅ Direct expand works. Has Projects?', hasProjects, 'Has Assets?', hasAssets);
        expect(hasProjects).toBe(true);
        expect(hasAssets).toBe(true);
        
        console.log('Projects:', JSON.stringify((item as any).Projects));
        console.log('Assets:', JSON.stringify((item as any).Assets));
      }
    });
  });

  // ============================================================================
  // FILTER TESTS - Issues with inArray and primaryKey fields
  // ============================================================================

  describe('Filter behavior', () => {

    it('inArray() generates invalid OData syntax', async () => {
      const testIds = ['2BFD5060-1CA7-4CED-A40A-DBDD634E9758'];
      
      const query = db
        .from(Projects)
        .list()
        .where(inArray(Projects.id, testIds))
        .top(10);

      const queryString = query.getQueryString();
      console.log('inArray query:', queryString);

      const result = await query.execute();

      // This FAILS with: OData error: Error: syntax error in URL at: ' in '
      if (result.error) {
        console.log('❌ inArray() failed:', result.error.message);
        expect(result.error.message).toContain('syntax error');
      } else {
        console.log('✅ inArray() worked (unexpected)');
      }
    });

    it('Filtering by primaryKey field (id) fails', async () => {
      const testId = '2BFD5060-1CA7-4CED-A40A-DBDD634E9758';
      
      const query = db
        .from(Projects)
        .list()
        .where(eq(Projects.id, testId))
        .select({ id: Projects.id, name: Projects.name, region: Projects.region });

      const queryString = query.getQueryString();
      console.log('Filter by id query:', queryString);
      // Note: "id" is quoted in $select but other fields are not

      const result = await query.execute();

      // This FAILS with: OData error: Error: syntax error in URL at: ' eq '
      if (result.error) {
        console.log('❌ Filter by id failed:', result.error.message);
        expect(result.error.message).toContain('syntax error');
      } else {
        console.log('✅ Filter by id worked (unexpected):', result.data);
      }
    });

    it('Filtering by non-primaryKey field works', async () => {
      const testProjectId = '2BFD5060-1CA7-4CED-A40A-DBDD634E9758';
      
      const query = db
        .from(ProjectAssets)
        .list()
        .where(eq(ProjectAssets.project_id, testProjectId))
        .top(5);

      const queryString = query.getQueryString();
      console.log('Filter by project_id query:', queryString);

      const result = await query.execute();

      // This WORKS
      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      console.log('✅ Filter by non-primaryKey field works. Found:', result.data?.length, 'items');
    });
  });
});

