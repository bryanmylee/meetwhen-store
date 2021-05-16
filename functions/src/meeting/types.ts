import { Field, ObjectType } from 'type-graphql';
import { Identifiable } from '../types/identifiable';
import { User } from '../user/types';

@ObjectType()
export class Meeting extends Identifiable {
  @Field()
  name: string;

  @Field()
  owner?: User;
}

export class MeetingEntry extends Identifiable {
  name: string;
  ownerId?: string;
}
