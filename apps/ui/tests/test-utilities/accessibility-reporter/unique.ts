export const unique = <T extends { id: string }>(items: T[]) =>
  items.reduce((acc: T[], current: T) => {
    const x = acc.find((item) => item.id === current.id);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);
