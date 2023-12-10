const router = require("express").Router();
const multer = require("multer");
const uploadImageAndSetLogo = require("../file-upload/uploadImageAWS");
const User = require("../models/users");

const upload = multer({ storage: multer.memoryStorage() });

const {
  registerValidation,
  loginValidation,
} = require("../validations/users_validations");
const bcrypt = require("bcryptjs");
// const multer = require('multer')
// const upload = multer({ dest: 'uploads/' })

//post request for registering the user
router.post("/register", async (req, res) => {
  //validating the user details
  const { error } = registerValidation(req.body);

  //If any error occured
  if (error) {
    return res.status(400).json({
      status: {
        status: false,
        code: 400,
        message: error.details[0].message,
      },
    });
  }

  //checking whether email already exists
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) {
    return res.status(400).json({
      status: {
        status: false,
        code: 400,
        message: "Email already Exists",
      },
    });
  }

  //Hashing Password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  //creating a new user with provided details
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  });

  //saving the user to database
  try {
    const savedUser = await user.save();
    // res.send(savedUser);
    return res.status(200).json({
      status: {
        status: true,
        code: 200,
        message: "Registered Successfully",
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status: {
        success: false,
        code: 400,
        message: "Registration Unsuccessful",
      },
    });
  }
});

//post request for user login
router.post("/login", async (req, res) => {
  //validating the login details
  const { error } = loginValidation(req.body);

  //If any error occured
  if (error) {
    return res.status(400).json({
      status: {
        status: false,
        code: 400,
        message: error.details[0].message,
      },
    });
  }

  //checking whether email already exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).json({
      status: {
        status: false,
        code: 400,
        message: "Incorrect Email Address",
      },
    });
  }

  //comparing for the password validation
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    return res.status(400).json({
      status: {
        status: false,
        code: 400,
        message: "Wrong Password",
      },
    });
  }

  res.status(200).json({
    status: {
      status: true,
      code: 200,
      message: "Logged in sucessfully",
    },
  });
});

router.post("/file-upload", upload.single("image"), async (req, res) => {
  try {
    await uploadImageAndSetLogo(req, res);
  } catch (error) {
    console.error('Error in file upload:', error);
    res.status(500).send('Internal Server Error');
  }
});


module.exports = router;
