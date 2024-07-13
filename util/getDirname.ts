import { dirname } from 'path';
import { fileURLToPath } from 'url';

export const getDirname = (fileURL: string): string => {
  return dirname(fileURLToPath(fileURL));
};
