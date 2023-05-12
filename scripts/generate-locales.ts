import ts from 'typescript';
import path from 'path';
import { writeFile, mkdir, stat } from 'fs/promises';
import { glob, chalk } from 'zx';

const SRC_DIR = path.resolve('./src/lib/i18n/locales');
const DEST_DIR = path.resolve('./static/i18n/locales');

const logAndExit = (msg: string) => {
  console.error(chalk.red(msg));
  process.exit(0);
};

const pattern = path.join(SRC_DIR, '*/*.ts');
const filesToTranslate = await glob(pattern);

filesToTranslate.map(async (source) => {
  const program = ts.createProgram([source], ts.getDefaultCompilerOptions());
  const sourceFile = program.getSourceFile(source);
  const checker = program.getTypeChecker();

  if (!sourceFile) {
    logAndExit(`Error retrieving source file information for ${source}`);
  }

  const sourceFileSymbol = checker.getSymbolAtLocation(sourceFile!);

  if (!sourceFileSymbol) {
    logAndExit(`Error parsing source file: ${source}`);
  }

  const defaultExport = checker.tryGetMemberInModuleExports(
    'default',
    sourceFileSymbol!,
  );

  if (!defaultExport) {
    logAndExit(`No default export in source: ${source}`);
  }

  const jsObject = {};

  if (defaultExport?.declarations && defaultExport.declarations[0]) {
    defaultExport.declarations[0].forEachChild((child) => {
      if (child.kind === ts.SyntaxKind.ObjectLiteralExpression) {
        child.forEachChild((grandchild) => {
          if (grandchild.kind === ts.SyntaxKind.PropertyAssignment) {
            const [keyNode, valueNode] = [
              grandchild.getChildAt(0),
              grandchild.getChildAt(2),
            ];

            if (ts.isStringLiteral(keyNode) && ts.isStringLiteral(valueNode)) {
              const key = keyNode.text;
              const value = valueNode.text;
              jsObject[key] = value;
            } else if (
              ts.isIdentifier(keyNode) &&
              ts.isStringLiteral(valueNode)
            ) {
              const key = keyNode.getText();
              const value = valueNode.text;

              jsObject[key] = value;
            }
          }
        });
      }
    });
  }

  const subDir = source.split(SRC_DIR)[1];
  const fullDir = path.join(DEST_DIR, subDir.split(/\w+\.ts/)[0]);
  const fullPath = path.join(DEST_DIR, subDir.replace('.ts', '.json'));

  try {
    await stat(fullDir);
  } catch {
    await mkdir(fullDir, { recursive: true });
  }

  try {
    console.log(jsObject);
    await writeFile(fullPath, JSON.stringify(jsObject));
  } catch (error) {
    logAndExit(`Unable to write file: ${fullPath} with JSON content`);
  }
});
