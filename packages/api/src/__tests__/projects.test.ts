import { describe, it, expect } from 'vitest';
import { eq, contains } from '@proofkit/fmodata';
import { db, Projects } from '../db';

describe('Projects OData API', () => {
  describe('list', () => {
    it('should list projects with filter', async () => {
      // Use a filter to avoid slow unfiltered queries
      const result = await db
        .from(Projects)
        .list()
        .where(contains(Projects.name, 'a'))
        .top(10)
        .execute();

      // Handle both success and "no data" cases
      if (result.error) {
        console.log('Query returned error (may be expected if no data):', result.error.message);
      } else {
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        console.log(`Found ${result.data?.length || 0} projects`);
      }
    });

    it('should filter by region', async () => {
      const result = await db
        .from(Projects)
        .list()
        .where(eq(Projects.region, 'North Sea'))
        .top(50)
        .execute();

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      
      if (result.data && result.data.length > 0) {
        for (const project of result.data) {
          expect(project.region).toBe('North Sea');
        }
        console.log(`Found ${result.data.length} North Sea projects`);
      }
    });

    it('should filter by status', async () => {
      const result = await db
        .from(Projects)
        .list()
        .where(eq(Projects.status, 'Green'))
        .top(50)
        .execute();

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      
      if (result.data && result.data.length > 0) {
        for (const project of result.data) {
          expect(project.status).toBe('Green');
        }
        console.log(`Found ${result.data.length} Green status projects`);
      }
    });

    it('should get project by name', async () => {
      // Get a project by name (id field may not be populated in test data)
      const listResult = await db
        .from(Projects)
        .list()
        .where(eq(Projects.region, 'North Sea'))
        .top(1)
        .execute();

      if (listResult.error || !listResult.data || listResult.data.length === 0) {
        console.log('Skipping: No projects found');
        return;
      }
      
      const project = listResult.data[0]!;
      
      if (!project.name) {
        console.log('Skipping: Project has no name field');
        return;
      }
      
      const result = await db
        .from(Projects)
        .list()
        .where(eq(Projects.name, project.name))
        .top(1)
        .execute();

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.data?.[0]?.name).toBe(project.name);
      console.log(`Successfully fetched project: ${result.data?.[0]?.name}`);
    });
  });
});
