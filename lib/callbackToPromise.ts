type AnyCallback = (...arguments_: unknown[]) => void;

type CallbackFromRegister<Register extends (callback: AnyCallback) => void> = Parameters<Register>[0];

type CallbackParameters<Callback extends AnyCallback> = Callback extends (...arguments_: infer Parameters_) => unknown
  ? Parameters_
  : never;

type RegisterData<Register extends (callback: AnyCallback) => void> = CallbackParameters<CallbackFromRegister<Register>>[1];

type RegisterError<Register extends (callback: AnyCallback) => void> = Exclude<
  CallbackParameters<CallbackFromRegister<Register>>[0],
  null
>;

export const callbackToPromise = <Register extends (callback: AnyCallback) => void>(
  register: Register,
): Promise<RegisterData<Register> | undefined> =>
  new Promise((resolve, reject) => {
    register(((error, data) => {
      if (error) {
        reject(error as RegisterError<Register>);
        return;
      }

      resolve(data as RegisterData<Register> | undefined);
    }) as CallbackFromRegister<Register>);
  });

export const callbackToPromiseRequired = <Register extends (callback: AnyCallback) => void>(
  register: Register,
  missingDataMessage: string,
): Promise<Exclude<RegisterData<Register>, undefined>> =>
  new Promise((resolve, reject) => {
    register(((error, data) => {
      if (error) {
        reject(error as RegisterError<Register>);
        return;
      }

      if (data === undefined) {
        reject(new Error(missingDataMessage));
        return;
      }

      resolve(data as Exclude<RegisterData<Register>, undefined>);
    }) as CallbackFromRegister<Register>);
  });
