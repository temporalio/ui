import ts from 'typescript';
import path from 'path';
import { readFile, writeFile, mkdir, stat } from 'fs';
import { Plugin } from 'vite';
import { glob } from 'zx';

const readFileAsync = async (fullPath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    readFile(fullPath, (error, data) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(data.toString('utf-8'));
    });
  });
};

const writeFileAsync = async (
  fullPath: string,
  contents: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    writeFile(fullPath, contents, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
};

const statAsync = async (fullPath: string): Promise<boolean> => {
  return new Promise((resolve) => {
    stat(fullPath, (error, stats) => {
      if (error) {
        resolve(false);
        return;
      }

      if (stats.isDirectory()) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

const mkdirAsync = async (fullPath: string): Promise<void> => {
  const isDirectory = await statAsync(fullPath);

  return new Promise((resolve, reject) => {
    if (isDirectory) {
      resolve();
    } else {
      mkdir(fullPath, { recursive: true }, (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    }
  });
};

const getLocaleFiles = async (srcDir: string): Promise<string[]> => {
  const pattern = path.resolve(__dirname, '..', srcDir, '*/*.ts');
  return glob(pattern);
};

type PluginOptions = {
  srcDir: string;
  destDir: string;
};

export default function i18nPlugin(options: PluginOptions): Plugin {
  const { srcDir, destDir } = options;
  let fullDestDir: string;
  let skip = false;
  return {
    name: 'vite-plugin-i18n-generate-locales',
    configResolved({ build: { outDir, target } }) {
      if (
        outDir.includes('server') ||
        (typeof target === 'string' && target.includes('node'))
      ) {
        skip = true;
      }

      fullDestDir = path.join(outDir, destDir);
    },
    async buildEnd(this, err) {
      if (err || skip) return;
      const filesToTranslate = await getLocaleFiles(srcDir);
      filesToTranslate.forEach(async (source) => {
        console.log(source);
        const program = ts.createProgram(
          [source],
          ts.getDefaultCompilerOptions(),
        );

        const sourceFile = program.getSourceFile(source);
        const checker = program.getTypeChecker();

        if (!sourceFile) {
          this.error(`Error retrieving source file information for ${source}`);
        }

        const sourceFileSymbol = checker.getSymbolAtLocation(sourceFile!);

        if (!sourceFileSymbol) {
          this.error(`Error parsing source file: ${source}`);
        }

        const exports = checker.getExportsOfModule(sourceFileSymbol!);

        if (!exports) {
          this.error(`No exports defined in ${source}`);
        }

        const keysExportSymbol = exports.find((e) => e.escapedName === 'keys')!;

        if (!keysExportSymbol) {
          this.error(`No 'keys' export defined in ${source}`);
        }

        if (
          !keysExportSymbol.declarations ||
          !keysExportSymbol.declarations[0] ||
          !ts.isVariableDeclaration(keysExportSymbol!.declarations![0])
        ) {
          this.error(`'keys' export in source: ${source} must be defined`);
        }
        const keysDeclaration =
          keysExportSymbol.declarations![0] as ts.VariableDeclaration;

        if (
          keysDeclaration.initializer?.kind !==
          ts.SyntaxKind.ObjectLiteralExpression
        ) {
          this.error(
            `'keys' export in source: ${source} must be an object literal`,
          );
        }

        const objectLiteral = keysDeclaration.initializer;
        const jsObject: Record<string, string> = {};

        // jsObject = objectLiteral.getText();

        if (
          objectLiteral &&
          objectLiteral.kind === ts.SyntaxKind.ObjectLiteralExpression
        ) {
          for (const prop of (objectLiteral as ts.ObjectLiteralExpression)
            .properties) {
            if (prop.kind !== ts.SyntaxKind.PropertyAssignment) {
              this.error(
                `Property ${prop.name?.getText()} must be a property assignment`,
              );
            }

            jsObject[(prop as ts.PropertyAssignment).name!.getText()] = (
              prop as ts.PropertyAssignment
            ).initializer.getText();
          }

          console.log(jsObject);
        } else {
          this.error(`Unable to parse object at ${source}`);
        }

        const subDir = source.split(srcDir)[1];
        const fullDir = path.join(fullDestDir, subDir.split(/\w+\.ts/)[0]);
        const fullPath = path.join(fullDestDir, subDir.replace('.ts', '.json'));

        try {
          await mkdirAsync(fullDir);
          await writeFileAsync(fullPath, JSON.stringify(jsObject));
        } catch (error) {
          this.error(`Unable to write file: ${fullPath} with JSON content`);
        }
      });
    },
  };
}
