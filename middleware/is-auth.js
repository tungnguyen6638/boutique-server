const User = require("../models/User");

exports.isAdmin = (req, res, next) => {
  const email = req.body.email;
  // Khi client đăng nhập thành công thì server đã trả về object user có password được mã háo
  // nên khi chứng thực ở đây thì client truyền vào password đã mã hóa đó chứ không phải là 1 text nên ở đây không cần bcrypt
  const password = req.body.password;
  const role = req.body.role;

  // Check role trước khi tìm, nếu không phải admin thì không được phép sử dụng API
  if (role !== "admin") {
    const error = new Error();
    error.httpStatusCode = 401;
    return next(error);
  } else {
    // Trong method findOne tìm theo role 1 lần nữa để khẳng định là admin
    User.findOne({ email: email, password: password, role: "admin" })
      .then((result) => {
        req.user = result;
        next();
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 401;
        return next(error);
      });
  }
};
