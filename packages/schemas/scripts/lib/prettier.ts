import { file } from 'bun';
import prettier from 'prettier';

type Parser = prettier.Options['parser'];

const defaultOptions: prettier.Options = {
  useTabs: false,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
};

export default class Prettier {
  static options = defaultOptions;
  static parser: Parser = 'typescript';

  static loadOptionsFromFile = async (path: string = '.prettierrc') => {
    const options = await file(path).json();
    Prettier.options = options;
  };

  static format(
    code: string,
    options = this.options,
    parser = this.parser,
  ): Promise<string> {
    return prettier.format(code, {
      ...options,
      parser: parser || this.parser,
    });
  }

  constructor(
    public options: prettier.Options = Prettier.options,
    public parser: prettier.Options['parser'] = Prettier.parser,
  ) {}

  format = (
    code: string,
    options = this.options,
    parser = this.parser,
  ): Promise<string> => {
    return Prettier.format(code, options, parser);
  };
}
