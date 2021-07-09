import { registerEnumType } from 'type-graphql';

export enum TimeOrder {
  EARLIEST,
  LATEST,
}

registerEnumType(TimeOrder, { name: 'TimeOrder' });
