import { Field, ObjectType } from 'type-graphql';
import { Identifiable } from '../types/identifiable';

@ObjectType()
export class User extends Identifiable {
  @Field()
  name: string;

  @Field()
  email: string;
}

@ObjectType()
export class UserPrincipal extends Identifiable implements Omit<User, 'name'> {
  @Field()
  email: string;
}

export class UserEntry extends Identifiable {
  name: string;
  email: string;
}
