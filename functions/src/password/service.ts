import bcrypt from 'bcryptjs';
import { Service } from "typedi";

const SALT_LENGTH = 12;

@Service()
export class PasswordService {
  async generateHash(password: string) {
    return bcrypt.hash(password, SALT_LENGTH);
  }
}
