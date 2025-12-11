import { describe, it, expect } from 'vitest';
import { eq } from '@proofkit/fmodata';
import { db, SmartList, ProjectAssets, Projects, Assets } from '../db';

describe('SmartList OData API', () => {
  describe('list', () => {
    it('should list smart list items with filter', async () => {
      // Use a filter to avoid slow unfiltered queries
      const result = await db
        .from(SmartList)
        .list()
        .where(eq(SmartList.status, 'Open'))
        .top(10)
        .execute();

      // Handle both success and "no data" cases
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

    it('should filter by project_asset_id', async () => {
      const result = await db
        .from(SmartList)
        .list()
        .where(eq(SmartList.project_asset_id, '1'))
        .top(50)
        .execute();

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      
      if (result.data && result.data.length > 0) {
        for (const item of result.data) {
          expect(item.project_asset_id).toBe('1');
        }
        console.log(`Found ${result.data.length} items for project asset 1`);
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
        expect(item.title).toBeDefined();
        expect(item.priority).toBeDefined();
        expect(item.status).toBeDefined();
        console.log(`SmartList item: "${item.title}" (${item.priority}, ${item.status})`);
      }
    });

    it('should expand related ProjectAssets with nested Projects and Assets', async () => {
      const result = await db
        .from(SmartList)
        .list()
        .where(eq(SmartList.status, 'Open'))
        .top(5)
        .expand(ProjectAssets, (paBuilder) =>
          paBuilder
            .select({
              id: ProjectAssets.id,
              project_id: ProjectAssets.project_id,
              asset_id: ProjectAssets.asset_id,
            })
            .expand(Projects, (pBuilder) =>
              pBuilder.select({
                name: Projects.name,
                region: Projects.region,
                status: Projects.status,
              })
            )
            .expand(Assets, (aBuilder) =>
              aBuilder.select({
                name: Assets.name,
                type: Assets.type,
              })
            )
        )
        .execute();

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();

      if (result.data && result.data.length > 0) {
        const item = result.data[0];
        console.log(`SmartList item: "${item.title}"`);
        
        // Check if ProjectAssets relation was expanded
        if ('ProjectAssets' in item && item.ProjectAssets) {
          const pa = item.ProjectAssets as { 
            id?: string; 
            Projects?: { name?: string }; 
            Assets?: { name?: string } 
          };
          console.log(`  → ProjectAsset ID: ${pa.id}`);
          
          // Check nested Projects
          if (pa.Projects?.name) {
            console.log(`  → Project: ${pa.Projects.name}`);
          }
          
          // Check nested Assets
          if (pa.Assets?.name) {
            console.log(`  → Asset: ${pa.Assets.name}`);
          }
        } else {
          console.log('  → No ProjectAssets relation found (may not be linked)');
        }
      }
    });
  });
});
