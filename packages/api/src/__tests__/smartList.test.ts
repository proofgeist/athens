import { describe, it, expect } from 'vitest';
import { SmartListLayout } from '@athens/fm-client';

describe('SmartList Data API', () => {
  describe('find', () => {
    it('should list all smart list items', async () => {
      const result = await SmartListLayout.find({
        query: [{ id: '*' }],
        limit: 50,
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      console.log(`Found ${result.data?.length || 0} smart list items`);
    });

    it('should filter by priority', async () => {
      const result = await SmartListLayout.find({
        query: [{ priority: 'High' }],
        limit: 50,
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      
      if (result.data && result.data.length > 0) {
        for (const item of result.data) {
          expect(item.fieldData.priority).toBe('High');
        }
        console.log(`Found ${result.data.length} High priority items`);
      }
    });

    it('should filter by status', async () => {
      const result = await SmartListLayout.find({
        query: [{ status: 'Open' }],
        limit: 50,
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      
      if (result.data && result.data.length > 0) {
        for (const item of result.data) {
          expect(item.fieldData.status).toBe('Open');
        }
        console.log(`Found ${result.data.length} Open items`);
      }
    });

    it('should filter by project_asset_id', async () => {
      const result = await SmartListLayout.find({
        query: [{ project_asset_id: '1' }],
        limit: 50,
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      
      if (result.data && result.data.length > 0) {
        for (const item of result.data) {
          expect(item.fieldData.project_asset_id).toBe('1');
        }
        console.log(`Found ${result.data.length} items for project asset 1`);
      }
    });

    it('should have required fields', async () => {
      const result = await SmartListLayout.find({
        query: [{ id: '*' }],
        limit: 1,
      });

      expect(result.data).toBeDefined();
      
      if (result.data && result.data.length > 0) {
        const item = result.data[0];
        expect(item.fieldData.title).toBeDefined();
        expect(item.fieldData.priority).toBeDefined();
        expect(item.fieldData.status).toBeDefined();
        expect(item.fieldData.due_date).toBeDefined();
        console.log(`SmartList item: "${item.fieldData.title}" (${item.fieldData.priority}, ${item.fieldData.status})`);
      }
    });
  });
});
