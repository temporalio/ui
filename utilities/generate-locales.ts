import { mkdir, stat, writeFile } from 'fs/promises';
import path, { relative } from 'path';

import ts from 'typescript';
import { $, chalk, glob } from 'zx';

const SRC_DIR = path.resolve('./src/lib/i18n/locales');
const DEST_DIR = path.resolve('./static/i18n/locales');

const logAndExit = (msg: string, logError: (msg: string) => void) => {
  logError(chalk.red(msg));

  if (logError === console.error) {
    process.exit(0);
  }
};

const relativeTo = (path: string) => {
  return relative('./', path);
};

export const generateLocales = async (
  src: string = SRC_DIR,
  dest: string = DEST_DIR,
  logError: (msg: string) => void = console.error,
) => {
  const pattern = path.join(src, '*/*.ts');
  const filesToTranslate = await glob(pattern);

  filesToTranslate.map(async (source) => {
    const program = ts.createProgram([source], ts.getDefaultCompilerOptions());
    const sourceFile = program.getSourceFile(source);
    const checker = program.getTypeChecker();

    if (sourceFile === undefined) {
      logAndExit(
        `Error retrieving source file information for ${source}`,
        logError,
      );
      return;
    }

    const sourceFileSymbol = checker.getSymbolAtLocation(sourceFile);

    if (sourceFileSymbol === undefined) {
      logAndExit(`Error parsing source file: ${source}`, logError);
      return;
    }

    const stringsExport = checker.tryGetMemberInModuleExports(
      'Strings',
      sourceFileSymbol,
    );

    if (stringsExport === undefined) {
      logAndExit(`No "Strings" export in source: ${source}`, logError);
      return;
    }

    const i18nStringsMap: Record<string, string> = {};
    if (
      stringsExport.declarations &&
      stringsExport.declarations[0] &&
      stringsExport.declarations[0].kind === ts.SyntaxKind.VariableDeclaration
    ) {
      stringsExport.declarations[0].forEachChild((child) => {
        if (child.kind === ts.SyntaxKind.AsExpression) {
          child.forEachChild((grandchild) => {
            if (grandchild.kind === ts.SyntaxKind.ObjectLiteralExpression) {
              grandchild.forEachChild((greatGrandChild) => {
                let i18nKey = '';
                let translatedString = '';
                const keyNode = greatGrandChild.getChildAt(0);
                const valueNode = greatGrandChild.getChildAt(2);

                /**
                 * when an object is defined with strings as keys, i.e. { 'my-key': 'my-value' },
                 * both Nodes will be ts.SyntaxKind.StringLiteral
                 * when an object is defined as identifier as keys, i.e. { myKey: "my-value" },
                 * the key Node will be ts.SyntaxKind.Identifier and the value Node will be ts.SyntaxKind.StringLiteral
                 */
                if (
                  ts.isStringLiteral(keyNode) &&
                  ts.isStringLiteral(valueNode)
                ) {
                  i18nKey = keyNode.text;
                  translatedString = valueNode.text;
                } else if (
                  ts.isIdentifier(keyNode) &&
                  ts.isStringLiteral(valueNode)
                ) {
                  i18nKey = keyNode.getText();
                  translatedString = valueNode.text;
                }

                i18nStringsMap[i18nKey] = translatedString;
              });
            }
          });
        }
      });
    }

    const subDir = source.split(src)[1];
    const fullDir = path.join(dest, subDir.split(/\w+\.ts/)[0]);
    const fullPath = path.join(dest, subDir.replace('.ts', '.json'));

    try {
      await stat(fullDir);
    } catch {
      await mkdir(fullDir, { recursive: true });
    }

    try {
      await writeFile(fullPath, JSON.stringify(i18nStringsMap));
      $.cwd = process.cwd();
      await $`prettier --write --plugin-search-dir=. --no-error-on-unmatched-pattern ./static/i18n/locales/*/*.json`.quiet();
      console.log(
        chalk.green(
          `Parsed locale file: ${relativeTo(source)} to ${relativeTo(
            fullPath,
          )}`,
        ),
      );
    } catch (error) {
      logAndExit(
        `Unable to write file: ${relativeTo(fullPath)} with JSON content`,
        logError,
      );
    }
  });
};
