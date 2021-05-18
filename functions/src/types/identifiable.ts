import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType()
export class Identifiable {
  @Field(() => ID)
  id: string;
}
