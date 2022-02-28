import { isNetworkError } from './is-network-error';

const networkErr = {
  statusCode: 200,
  statusText: "Error'd",
  response: {},
};

describe(isNetworkError, () => {
  it('Should infer a networkError error with the correct shape', () => {
    try {
      throw networkErr;
    } catch (err) {
      expect(isNetworkError(err)).toBeTruthy();
    }
  });
  it('Should not infer a networkError error with the incorrecrt shape', () => {
    try {
      throw { somethingElse: '' };
    } catch (err) {
      expect(isNetworkError(err)).toBeFalsy();
    }
  });
  it("Should not infer a networkError when it's a js error", () => {
    try {
      throw new Error('error');
    } catch (err) {
      expect(isNetworkError(err)).toBeFalsy();
    }
  });
  it("Should not infer a networkError when it's a promise", async () => {
    try {
      await Promise.reject();
    } catch (err) {
      expect(isNetworkError(err)).toBeFalsy();
    }
  });
});
