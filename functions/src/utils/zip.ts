export const zip = <A, B>(a: A[], b: B[]): [A, B][] => {
  if (a.length !== b.length) {
    throw new Error('cannot zip arrays of non-equal length');
  }
  const result: [A, B][] = [];
  for (let i = 0; i < a.length; i++) {
    result.push([a[i], b[i]]);
  }
  return result;
};
