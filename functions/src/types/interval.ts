import { Field, Int, ObjectType } from 'type-graphql';

@ObjectType()
export class Interval {
  @Field(() => Int)
  beg: number;

  @Field(() => Int)
  end: number;
}
