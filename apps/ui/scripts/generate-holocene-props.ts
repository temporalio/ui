import fs from 'fs';
import path from 'path';

import { svelte2tsx } from 'svelte2tsx';

const holocenePath = new URL('../src/lib/holocene', import.meta.url).pathname;

const getFilesRecursively = (directory: string, root = directory) => {
  let files: string[] = [];
  const filesInDirectory = fs.readdirSync(directory);
  for (const file of filesInDirectory) {
    const absolute = path.join(directory, file);

    if (fs.statSync(absolute).isDirectory()) {
      files = [...files, ...getFilesRecursively(absolute, root)];
    } else {
      files.push(absolute);
    }
  }
  return files
    .filter((file) => !file.includes('/icon/'))
    .filter((file) => !file.includes('.story.'))
    .filter((file) => file.endsWith('.svelte'));
};

const holoceneFilePaths = getFilesRecursively(holocenePath);

const holoceneComponents = holoceneFilePaths
  .map((filename) => {
    const fileContent = fs.readFileSync(filename, 'utf-8');
    const { exportedNames } = svelte2tsx(fileContent, {
      filename,
      mode: 'ts',
      isTsFile: true,
    });
    return {
      component: path.basename(filename, '.svelte'),
      props: [
        ...(
          exportedNames as Map<
            string,
            { identifierText?: string; required?: boolean; type?: string }
          >
        ).values(),
      ].map((prop) => {
        return {
          name: prop.identifierText,
          required: prop.required,
          type: prop.type,
        };
      }),
    };
  })
  .reduce((acc, curr) => {
    acc[curr.component] = curr.props;
    return acc;
  }, {});

fs.writeFileSync(
  path.join(holocenePath, 'holocene-components.json'),
  JSON.stringify(holoceneComponents, null, 2),
);
