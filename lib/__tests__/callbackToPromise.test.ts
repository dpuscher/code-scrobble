import { callbackToPromise, callbackToPromiseRequired } from "../callbackToPromise";

describe("lib/callbackToPromise", () => {
  describe("callbackToPromise", () => {
    it("resolves with data when callback is called without error", async () => {
      const result = await callbackToPromise((callback: (error: null, data: string) => void) => {
        callback(null, "hello");
      });

      expect(result).toBe("hello");
    });

    it("resolves with undefined when callback passes no data", async () => {
      const result = await callbackToPromise((callback: (error: null, data?: string) => void) => {
        callback(null);
      });

      expect(result).toBeUndefined();
    });

    it("rejects with the error when callback is called with an error", async () => {
      await expect(
        callbackToPromise((callback: (error: Error, data?: string) => void) => {
          callback(new Error("something went wrong"));
        }),
      ).rejects.toThrow("something went wrong");
    });
  });

  describe("callbackToPromiseRequired", () => {
    it("resolves with data when callback is called without error", async () => {
      const result = await callbackToPromiseRequired(
        (callback: (error: null, data: string) => void) => {
          callback(null, "hello");
        },
        "missing",
      );

      expect(result).toBe("hello");
    });

    it("rejects with the given message when callback passes no data", async () => {
      await expect(
        callbackToPromiseRequired(
          (callback: (error: null, data?: string) => void) => {
            callback(null);
          },
          "data is required",
        ),
      ).rejects.toThrow("data is required");
    });

    it("rejects with the error when callback is called with an error", async () => {
      await expect(
        callbackToPromiseRequired(
          (callback: (error: Error, data?: string) => void) => {
            callback(new Error("upstream failed"));
          },
          "missing",
        ),
      ).rejects.toThrow("upstream failed");
    });
  });
});
