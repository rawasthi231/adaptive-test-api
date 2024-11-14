import { User } from "../models/User";

export default class UserService {
  async signup(user: Partial<typeof User>) {
    try {
    } catch (error) {
      console.log("Error in signup: ", error);

      return null;
    }
  }
}
