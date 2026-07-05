import type { Page } from '@playwright/test';

const TAG_GROUPS = [
  { id: 'mode-group', name: 'Mode', type: 'mode', is_system: true },
  {
    id: 'location-group',
    name: 'Location',
    type: 'location',
    is_system: true,
  },
  { id: 'tools-group', name: 'Tools', type: 'tools', is_system: true },
];

const TAGS_BY_GROUP: Record<
  string,
  { id: string; name: string; tag_group_id: string; is_system: boolean }[]
> = {
  'mode-group': [
    {
      id: 'mode-1',
      name: 'Focus',
      tag_group_id: 'mode-group',
      is_system: true,
    },
  ],
  'location-group': [
    {
      id: 'place-1',
      name: 'Home',
      tag_group_id: 'location-group',
      is_system: true,
    },
  ],
  'tools-group': [
    {
      id: 'tool-1',
      name: 'None',
      tag_group_id: 'tools-group',
      is_system: true,
    },
  ],
};

/** Stub backend API calls so E2E runs without a real server. */
export async function mockBackendApi(page: Page) {
  await page.route('**/api/tasks/tag-groups', async (route) => {
    if (route.request().method() !== 'GET') {
      return route.continue();
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(TAG_GROUPS),
    });
  });

  await page.route(
    /\/api\/tasks\/tag-groups\/[^/]+\/tags\/?$/,
    async (route) => {
      if (route.request().method() !== 'GET') {
        return route.continue();
      }
      const groupId = route
        .request()
        .url()
        .match(/tag-groups\/([^/]+)\/tags/)?.[1];
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(TAGS_BY_GROUP[groupId ?? ''] ?? []),
      });
    }
  );

  await page.route(/\/api\/recommend\/?$/, async (route) => {
    if (route.request().method() !== 'POST') {
      return route.continue();
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ recommended_tasks: [] }),
    });
  });
}
