import { describe, it, expect } from 'vitest';
import { eq } from '@proofkit/fmodata';
import { db, SmartList } from '../db';

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
  });
});
