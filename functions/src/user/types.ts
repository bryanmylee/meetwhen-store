import { Field, ObjectType } from 'type-graphql';
import { Identifiable } from '../types/identifiable';

@ObjectType()
export class User extends Identifiable {
  @Field()
  name: string;
}

export class UserEntry extends Identifiable {
  name: string;
}
