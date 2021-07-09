import { registerEnumType } from 'type-graphql';

export enum BegOrEnd {
  BEG,
  END,
}

registerEnumType(BegOrEnd, { name: 'BegOrEnd' });

export interface KeyPaths {
  primaryKey: 'beg' | 'end';
  altKey: 'beg' | 'end';
}

export const getKeyPaths = (begOrEnd: BegOrEnd = BegOrEnd.BEG): KeyPaths => ({
  primaryKey: begOrEnd === BegOrEnd.BEG ? 'beg' : 'end',
  altKey: begOrEnd === BegOrEnd.BEG ? 'end' : 'beg',
});
