import { describe, it, expect } from 'vitest';
import { ProjectsLayout } from '@athens/fm-client';

describe('Projects Data API', () => {
  describe('find', () => {
    it('should list all projects', async () => {
      const result = await ProjectsLayout.find({
        query: [{ id: '*' }],
        limit: 50,
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      console.log(`Found ${result.data?.length || 0} projects`);
    });

    it('should filter by region', async () => {
      const result = await ProjectsLayout.find({
        query: [{ region: 'North Sea' }],
        limit: 50,
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      
      // If data returned, verify region filter worked
      if (result.data && result.data.length > 0) {
        for (const project of result.data) {
          expect(project.fieldData.region).toBe('North Sea');
        }
        console.log(`Found ${result.data.length} North Sea projects`);
      }
    });

    it('should filter by status', async () => {
      const result = await ProjectsLayout.find({
        query: [{ status: 'Green' }],
        limit: 50,
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      
      if (result.data && result.data.length > 0) {
        for (const project of result.data) {
          expect(project.fieldData.status).toBe('Green');
        }
        console.log(`Found ${result.data.length} Green status projects`);
      }
    });

    it('should get project by id', async () => {
      // First get a project to get a valid ID
      const listResult = await ProjectsLayout.find({
        query: [{ id: '*' }],
        limit: 1,
      });

      expect(listResult.data).toBeDefined();
      
      if (listResult.data && listResult.data.length > 0) {
        const projectId = listResult.data[0].fieldData.id;
        
        const result = await ProjectsLayout.find({
          query: [{ id: projectId }],
          limit: 1,
        });

        expect(result.data).toBeDefined();
        expect(result.data?.length).toBe(1);
        expect(result.data?.[0].fieldData.id).toBe(projectId);
        console.log(`Successfully fetched project: ${result.data?.[0].fieldData.name}`);
      }
    });
  });
});
