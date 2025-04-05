export type TailwindClass = {
  variant: string | null;
  utility: string | null;
  color: string | null;
  shade: string | null;
};

export type Result = {
  path: string;
  line: number;
  class: string;
} & TailwindClass;
