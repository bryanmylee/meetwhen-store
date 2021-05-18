import { AuthChecker } from 'type-graphql';
import { Context } from './context';

export const authChecker: AuthChecker<Context> = ({ context }) => {
  return context.principal !== null;
};
