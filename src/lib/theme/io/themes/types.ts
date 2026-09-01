export type IoTheme = {
  color: {
    background: {
      primary: string;
    };
    content: {
      black: string;
      white: string;
      brand: string;
      primary: string;
      secondary: string;
      tertiary: string;
      information: string;
      success: string;
      warning: string;
      danger: string;
      error: string;
      accent: string;
      'inverse-primary': string;
      'inverse-secondary': string;
      static: {
        information: string;
        success: string;
        warning: string;
        danger: string;
        neutral: string;
      };
    };
    surface: {
      primary: string;
      secondary: string;
      tertiary: string;
      neutral: string;
      brand: string;
      information: string;
      success: string;
      warning: string;
      danger: string;
      error: string;
      accent: string;
      overlay: {
        primary: string;
        secondary: string;
        tertiary: string;
        brand: string;
        information: string;
        success: string;
        warning: string;
        danger: string;
        error: string;
        accent: string;
        neutral: string;
      };
    };
    border: {
      primary: string;
      secondary: string;
      tertiary: string;
      brand: string;
      information: string;
      success: string;
      warning: string;
      danger: string;
      error: string;
      accent: string;
    };
    interactive: {
      primary: string;
      'primary-hover': string;
      'primary-press': string;
      secondary: string;
      'secondary-hover': string;
      'secondary-press': string;
      'tertiary-hover': string;
      'tertiary-press': string;
      danger: string;
      'danger-hover': string;
      'danger-press': string;
    };
    actions: {
      info: string;
      success: string;
      warning: string;
      danger: string;
      workflow: {
        workflow: string;
        activity: string;
        signal: string;
        timer: string;
        nexus: string;
        query: string;
        capacity: string;
        fairness: string;
      };
    };
  };
  opacity: {
    disabled: string;
  };
};

type AppendPath<Prefix extends string, Key extends string> = Prefix extends ''
  ? Key
  : `${Prefix}-${Key}`;

type CssVariableName<Theme, Prefix extends string = ''> = {
  [Key in keyof Theme & string]: Theme[Key] extends string
    ? `--${AppendPath<Prefix, Key>}`
    : Theme[Key] extends object
      ? CssVariableName<Theme[Key], AppendPath<Prefix, Key>>
      : never;
}[keyof Theme & string];

export type CssVariableReferences<Theme> = {
  readonly [Key in keyof Theme]: Theme[Key] extends string
    ? string
    : Theme[Key] extends object
      ? CssVariableReferences<Theme[Key]>
      : never;
};

export type CssVariablesFor<Theme, Prefix extends string = ''> = Record<
  CssVariableName<Theme, Prefix>,
  string
>;

export type CssVariables = CssVariablesFor<IoTheme>;
