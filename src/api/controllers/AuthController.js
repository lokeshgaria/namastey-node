// Role: Handles authentication HTTP requests
// Purpose: Login, Signup, Logout endpoints

class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await this.authService.login(email, password);

      // set http-only cookie
      res.cookie("token", await user.getJWT(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.status(200).json({
        success: true,
        data: user,
        message: "Login successful",
      });
    } catch (error) {
      next(error);
    }
  };
  logout = async (req, res, next) => {
    try {
        res.cookie("token",null,{
            expires: new Date(Date.now())
        })
      res.json({ success: true, message: "Logout successfull" });
    } catch (error) {
      next(error);
    }
  };

  signup = async (req, res, next) => {
    try {
      const { firstName, lastName, email, age, gender, password } = req.body;

      const AddUser = await this.authService.signup(
        firstName,
        lastName,
        email,
        age,
        gender,
        password
      );
      res.status(201).json({
        success: true,
        data: AddUser,
        mesage: "New user added successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = AuthController;
