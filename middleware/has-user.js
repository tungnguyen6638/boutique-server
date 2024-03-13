const User = require("../models/User");

// Middleware để lấy thông tin user

exports.hasUser = (req, res, next) => {
  const email = req.body.email;
  // Khi client đăng nhập thành công thì server đã trả về object user có password được mã háo
  // nên khi chứng thực ở đây thì client truyền vào password đã mã hóa đó chứ không phải là 1 text nên ở đây không cần bcrypt
  const password = req.body.password;

  User.findOne({ email: email, password: password })
    .then((result) => {
      req.user = result;
      next();
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 401;
      return next(error);
    });
};
