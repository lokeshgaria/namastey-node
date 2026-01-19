class UserService {
  constructor(userRepository) {
    this.userRepo = userRepository;
  }

  getUser = async (req) => {
    try {
        const userId = req.user._id;
      const user = await this.userRepo.findByIdSafe(userId);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      throw error;
    }
  };

  updateProfile = async (req) => {
    try {
      const userId = req.user._id;
      const updateData = req.body;
      const user = await this.userRepo.updateById(userId, updateData, { new: true });
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      throw error;
    }
  };
  //   login = async (email, password) => {
  //     try {
  //       const user = await this.userRepo.findByEmailWithPassword(email);
  //       if (!user) {
  //         throw new Error("User not found");
  //       }
  //       const isPasswordValid = await user.validatePassword(password);
  //       if (!isPasswordValid) {
  //         throw new Error("Invalid password");
  //       }
  //       return user;
  //     } catch (error) {
  //       throw error;
  //     }
  //   };

  //   // user singup

  //   signup = async (firstName, lastName, email, age, gender, password) => {
  //     try {
  //       // check if user is already exists
  //       const existingUser = await this.userRepo.findByEmail(email);
  //       if (existingUser) {
  //         throw new Error("User already exists");
  //       }
  //       // check if password is strong

  //       // hash the password
  //       const hashedPassword = await bcrypt.hash(password, 10);
  //       // add this user in to database
  //       const newUser = await this.userRepo.create({
  //         firstName,
  //         lastName,
  //         email,
  //         age,
  //         gender,
  //         password: hashedPassword
  //       });
  //       return newUser;
  //     } catch (error) {
  //         throw error;
  //     }
  //   };
}

module.exports = UserService;
