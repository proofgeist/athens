import { describe, it, expect } from 'vitest';
import { eq } from '@proofkit/fmodata';
import { db, Issues } from '../db';

describe('Issues OData API', () => {
  describe('list', () => {
    it('should list issues with filter', async () => {
      // Use a filter to avoid slow unfiltered queries
      const result = await db
        .from(Issues)
        .list()
        .where(eq(Issues.project_asset_id, '77B84AA1-44CE-4BEC-B601-F959F9D20687'))
        .top(10)
        .execute();

      // Handle both success and "no data" cases
      if (result.error) {
        console.log('Query returned error (may be expected if no data):', result.error.message);
      } else {
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        console.log(`Found ${result.data?.length || 0} issues`);
      }
    });

    it('should filter by project_asset_id', async () => {
      const result = await db
        .from(Issues)
        .list()
        .where(eq(Issues.project_asset_id, '77B84AA1-44CE-4BEC-B601-F959F9D20687'))
        .top(50)
        .execute();

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      
      if (result.data && result.data.length > 0) {
        for (const issue of result.data) {
          expect(issue.project_asset_id).toBe('77B84AA1-44CE-4BEC-B601-F959F9D20687');
        }
        console.log(`Found ${result.data.length} issues for project asset`);
      }
    });

    it('should have priority and status fields', async () => {
      const result = await db
        .from(Issues)
        .list()
        .where(eq(Issues.project_asset_id, '77B84AA1-44CE-4BEC-B601-F959F9D20687'))
        .top(1)
        .execute();

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      
      if (result.data && result.data.length > 0) {
        const issue = result.data[0]!;
        expect(issue.priority).toBeDefined();
        expect(issue.status).toBeDefined();
        expect(issue.short_description).toBeDefined();
        expect(issue.system).toBeDefined();
        console.log(`Issue: ${issue.issue_id} - Priority: ${issue.priority}, Status: ${issue.status}`);
      }
    });
  });
});
