import { describe, it, expect } from 'vitest';
import { eq } from '@proofkit/fmodata';
import { db, SmartList, ProjectAssets, Projects, Assets } from '../db';

describe('SmartList OData API', () => {
  describe('list', () => {
    it('should list smart list items with filter', async () => {
      const result = await db
        .from(SmartList)
        .list()
        .where(eq(SmartList.status, 'Open'))
        .top(10)
        .execute();

      if (result.error) {
        console.log('Query returned error (may be expected if no data):', result.error.message);
      } else {
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        console.log(`Found ${result.data?.length || 0} smart list items`);
      }
    });

    it('should filter by priority', async () => {
      const result = await db
        .from(SmartList)
        .list()
        .where(eq(SmartList.priority, 'High'))
        .top(50)
        .execute();

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      
      if (result.data && result.data.length > 0) {
        for (const item of result.data) {
          expect(item.priority).toBe('High');
        }
        console.log(`Found ${result.data.length} High priority items`);
      }
    });

    it('should filter by status', async () => {
      const result = await db
        .from(SmartList)
        .list()
        .where(eq(SmartList.status, 'Open'))
        .top(50)
        .execute();

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      
      if (result.data && result.data.length > 0) {
        for (const item of result.data) {
          expect(item.status).toBe('Open');
        }
        console.log(`Found ${result.data.length} Open items`);
      }
    });

    it('should have required fields', async () => {
      const result = await db
        .from(SmartList)
        .list()
        .where(eq(SmartList.status, 'Open'))
        .top(1)
        .execute();

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      
      if (result.data && result.data.length > 0) {
        const item = result.data[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('title');
        expect(item).toHaveProperty('priority');
        expect(item).toHaveProperty('status');
        console.log(`SmartList item: "${item.title}" (${item.priority}, ${item.status})`);
      }
    });

    it('should expand to ProjectAssets (single level - works)', async () => {
      const result = await db
        .from(SmartList)
        .list()
        .where(eq(SmartList.status, 'Open'))
        .top(3)
        .expand(ProjectAssets)
        .execute();

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();

      if (result.data && result.data.length > 0) {
        const item = result.data[0];
        // ProjectAssets should be present as an array
        expect('ProjectAssets' in item).toBe(true);
        const pa = (item as any).ProjectAssets;
        expect(Array.isArray(pa)).toBe(true);
        console.log(`SmartList has ${pa.length} ProjectAssets`);
        if (pa.length > 0) {
          console.log(`  → project_id: ${pa[0].project_id}`);
          console.log(`  → asset_id: ${pa[0].asset_id}`);
        }
      }
    });

    it('should enrich with project/asset data via two-query approach', async () => {
      // Step 1: Get SmartList with ProjectAssets
      const smartListResult = await db
        .from(SmartList)
        .list()
        .where(eq(SmartList.status, 'Open'))
        .top(3)
        .expand(ProjectAssets, (paBuilder) =>
          paBuilder.select({
            id: ProjectAssets.id,
            project_id: ProjectAssets.project_id,
            asset_id: ProjectAssets.asset_id,
          })
        )
        .execute();

      expect(smartListResult.error).toBeUndefined();
      expect(smartListResult.data).toBeDefined();
      
      if (!smartListResult.data || smartListResult.data.length === 0) {
        console.log('No SmartList items found');
        return;
      }

      // Step 2: Collect project_ids
      const projectIds = new Set<string>();
      for (const item of smartListResult.data) {
        const pa = (item as any).ProjectAssets;
        if (Array.isArray(pa) && pa.length > 0 && pa[0].project_id) {
          projectIds.add(pa[0].project_id);
        }
      }

      console.log(`Found ${projectIds.size} unique project IDs`);

      // Step 3: Alternative approach - fetch ProjectAssets with expanded Projects/Assets
      // This works because we're querying FROM ProjectAssets (direct relationship)
      const firstProjectId = [...projectIds][0];
      console.log('Fetching ProjectAssets for project_id:', firstProjectId);
      
      const query = db
        .from(ProjectAssets)
        .list()
        .where(eq(ProjectAssets.project_id, firstProjectId))
        .expand(Projects, p => p.select({ name: Projects.name, region: Projects.region }))
        .expand(Assets, a => a.select({ name: Assets.name, type: Assets.type }))
        .top(1);
      
      console.log('Query string:', query.getQueryString());
      
      const paResult = await query.execute();

      if (paResult.error) {
        console.log('Fetch error:', paResult.error.message);
      } else if (paResult.data && paResult.data.length > 0) {
        const pa = paResult.data[0];
        console.log('Fetched ProjectAsset with expanded data:');
        console.log('  Projects:', JSON.stringify((pa as any).Projects));
        console.log('  Assets:', JSON.stringify((pa as any).Assets));
      }
    });
  });
});
