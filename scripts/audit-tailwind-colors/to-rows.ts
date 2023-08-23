import { type Result } from './types';
import { getProjectRoot } from '../get-project-root';

export const toRow = (result: Result) => {
  return [
    result.path.replace(getProjectRoot(), ''),
    result.line,
    result.class,
    result.variant || '',
    result.utility || '',
    result.color || '',
    result.shade || '',
  ].join(',');
};

export const toRows = (results: Result[]) => {
  return results.reduce((rows, result) => {
    return rows + toRow(result) + '\n';
  }, 'File,Line Number,Class,Variant,Utility,Color,Shade\n');
};
