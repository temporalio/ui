import ts from 'typescript';
import path, { relative } from 'path';
import { writeFile, mkdir, stat } from 'fs/promises';
import { glob, chalk } from 'zx';

const SRC_DIR = path.resolve('./src/lib/i18n/locales');
const DEST_DIR = path.resolve('./static/i18n/locales');

const logAndExit = (msg: string) => {
  console.error(chalk.red(msg));
  process.exit(0);
};

const relativeTo = (path: string) => {
  return relative('./', path);
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

  const jsObject: Record<string, string> = {};
  if (defaultExport?.declarations && defaultExport.declarations[0]) {
    defaultExport.declarations[0].forEachChild((child) => {
      if (child.kind === ts.SyntaxKind.ObjectLiteralExpression) {
        child.forEachChild((grandchild) => {
          if (grandchild.kind === ts.SyntaxKind.PropertyAssignment) {
            let key = '';
            let value = '';
            const [keyNode, valueNode] = [
              grandchild.getChildAt(0),
              grandchild.getChildAt(2),
            ];

            /**
             * when an object is defined with strings as keys, i.e. { 'my-key': 'my-value' },
             * both Nodes will be ts.SyntaxKind.StringLiteral
             * when an object is defined as identifier as keys, i.e. { myKey: "my-value" },
             * the key Node will be ts.SyntaxKind.Identifier and the value Node will be ts.SyntaxKind.StringLiteral
             */
            if (ts.isStringLiteral(keyNode) && ts.isStringLiteral(valueNode)) {
              key = keyNode.text;
              value = valueNode.text;
            } else if (
              ts.isIdentifier(keyNode) &&
              ts.isStringLiteral(valueNode)
            ) {
              key = keyNode.getText();
              value = valueNode.text;
            }

            jsObject[key] = value;
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
    await writeFile(fullPath, JSON.stringify(jsObject));
    console.log(chalk.green(`Parsed locale file: ${relativeTo(source)}`));
  } catch (error) {
    logAndExit(`Unable to write file: ${fullPath} with JSON content`);
  }
});
