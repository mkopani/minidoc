import { faker } from '@faker-js/faker';
import { v4 as uuid } from 'uuid';

import type { Document } from '@/models';

export const generateMockDocuments = (count: number): Document[] => {
  return Array.from({ length: count }).map(() => {
    return {
      id: uuid(),
      title: faker.lorem.words(3),
      content: faker.lorem.paragraphs(5),
      created_at: faker.date.recent().toISOString(),
      updated_at: faker.date.recent().toISOString(),
    };
  });
};
