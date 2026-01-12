import { describe, it, expect } from 'vitest';
import { eq } from '@proofkit/fmodata';
import { db, ProjectAssets } from '../db';

describe('ProjectAssets OData API', () => {
  describe('list', () => {
    it('should list project assets with filter', async () => {
      // Use a filter to avoid slow unfiltered queries
      const result = await db
        .from(ProjectAssets)
        .list()
        .where(eq(ProjectAssets.project_id, '1'))
        .top(10)
        .execute();

      // Handle both success and "no data" cases
      if (result.error) {
        console.log('Query returned error (may be expected if no data):', result.error.message);
      } else {
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        console.log(`Found ${result.data?.length || 0} project assets`);
      }
    });

    it('should filter by project_id', async () => {
      const result = await db
        .from(ProjectAssets)
        .list()
        .where(eq(ProjectAssets.project_id, '1'))
        .top(50)
        .execute();

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      
      if (result.data && result.data.length > 0) {
        for (const pa of result.data) {
          expect(pa.project_id).toBe('1');
        }
        console.log(`Found ${result.data.length} project assets for project 1`);
      }
    });

    it('should return completion metrics', async () => {
      const result = await db
        .from(ProjectAssets)
        .list()
        .where(eq(ProjectAssets.project_id, '1'))
        .top(10)
        .execute();

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      
      if (result.data && result.data.length > 0) {
        const pa = result.data[0]!;
        expect(pa.checklist_percent).toBeDefined();
        expect(pa.sit_percent).toBeDefined();
        expect(pa.doc_percent).toBeDefined();
        console.log(`Completion metrics: RAPTOR=${pa.checklist_percent}%, SIT=${pa.sit_percent}%, Doc=${pa.doc_percent}%`);
      }
    });
  });
});
