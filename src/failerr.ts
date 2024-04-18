
const toString = Object.prototype.toString;

const isObject = (item: any): item is Object => {
  return toString.call(item) === '[object Object]';
};

const __fail__ = Symbol('fail');

const empty = Object.freeze(Object.create(null));

export interface Fail<D = {}> {
  [__fail__]: true;
  message: string;
  data: D;
}

export const mkFail = <D = {}>(message: string, data: D = empty): Fail<D> => {
  return { [__fail__]: true, message, data };
};

export const isFail = (val: any): val is Fail<any> => {
  return isObject(val) && __fail__ in val;
};
