export type ConfigurableTableHeaderOption = {
  id: string;
  label: string;
  key?: string | object;
};

export type ConfigurableTableHeadersModel = {
  inView: ConfigurableTableHeaderOption[];
  available: ConfigurableTableHeaderOption[];
  availableHeading?: string;
  customAvailable?: {
    heading: string;
    columns: ConfigurableTableHeaderOption[];
    emptyLabel: string;
  };
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  onMove: (from: number, to: number) => void;
};
