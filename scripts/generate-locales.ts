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

  const exports = checker.getExportsOfModule(sourceFileSymbol!);

  if (!exports) {
    logAndExit(`No exports defined in ${source}`);
  }

  const keysExportSymbol = exports.find((e) => e.escapedName === 'keys')!;

  if (!keysExportSymbol) {
    logAndExit(`No 'keys' export defined in ${source}`);
  }

  if (
    !keysExportSymbol.declarations ||
    !keysExportSymbol.declarations[0] ||
    !ts.isVariableDeclaration(keysExportSymbol!.declarations![0])
  ) {
    logAndExit(`'keys' export in source: ${source} must be defined`);
  }
  const keysDeclaration =
    keysExportSymbol.declarations![0] as ts.VariableDeclaration;

  if (
    keysDeclaration.initializer?.kind !== ts.SyntaxKind.ObjectLiteralExpression
  ) {
    logAndExit(`'keys' export in source: ${source} must be an object literal`);
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
        logAndExit(
          `Property ${prop.name?.getText()} must be a property assignment`,
        );
      }

      jsObject[(prop as ts.PropertyAssignment).name!.getText()] = (
        prop as ts.PropertyAssignment
      ).initializer.getText();
    }
  } else {
    logAndExit(`Unable to parse object at ${source}`);
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
  } catch (error) {
    logAndExit(`Unable to write file: ${fullPath} with JSON content`);
  }
});
