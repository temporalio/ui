// jsDom works for some dom implementation stuffs but $app/env browser fails whenever it's imported so lets mock it instead
export const browser = jest.fn(() => false);
