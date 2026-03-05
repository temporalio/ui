declare module 'virtual:holocene-usage' {
  const data: {
    basePath: string;
    usage: Record<
      string,
      { count: number; files: { path: string; line: number }[] }
    >;
  };
  export default data;
}
