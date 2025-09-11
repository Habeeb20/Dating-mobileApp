// import express from 'express';
// import { sendVerificationCode } from '../config/email.js';
// import User from '../models/userSchema.js';
// import  { validateEmail, validateCode, validatePhone, validateProfile, validatePassword, verifyToken }  from '../middlewares/validation.js';
// import bcrypt from "bcrypt"
// import jwt from 'jsonwebtoken';
// import { transporter } from '../config/email.js';
// const router = express.Router();

// // Step 1: Submit Email
// router.post('/email', validateEmail, async (req, res) => {
//   const { email } = req.body;
//   try {
//     let user = await User.findOne({ email });
//     if (user) return res.status(400).json({ message: 'Email already registered' });

//     const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
//     const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

//     user = new User({ email, verificationCode, verificationCodeExpires });
//     await user.save();

//     await sendVerificationCode(email, verificationCode);
//     res.status(200).json({ message: 'Verification code sent' });
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Step 2: Verify Code
// router.post('/verify', validateCode, async (req, res) => {
//   const { email, code } = req.body;
//   console.log(req.body, "your body")
//   try {
//     const user = await User.findOne({ email });
//     console.log(user?.email)
//     if (!user) return res.status(400).json({ message: 'User not found' });

//     if (user.verificationCode !== code || user.verificationCodeExpires < new Date()) {
//       return res.status(400).json({ message: 'Invalid or expired code' });
//     }

//     user.verificationCode = undefined;
//     user.verificationCodeExpires = undefined;
//     await user.save();
//     res.status(200).json({ message: 'Code verified', nextStep: 'phone' });
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Step 3: Submit Phone Number
// router.post('/phone', validatePhone, async (req, res) => {
//   const { email, phoneNumber } = req.body;
//   console.log(req.body)
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: 'User not found' });

//     user.phoneNumber = phoneNumber;
//     await user.save();
//     res.status(200).json({ message: 'Phone number saved', nextStep: 'profile' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });



// // Step 5: Submit Interests
// router.post('/interests', async (req, res) => {
//   const { email, interests } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: 'User not found' });

//     user.interests = interests;
//     await user.save();
//     res.status(200).json({ message: 'Interests saved', nextStep: 'contacts' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Step 6: Submit Contacts
// router.post('/contacts', async (req, res) => {
//   const { email, contactsFiltered } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: 'User not found' });

//     user.contactsFiltered = contactsFiltered;
//     await user.save();
//     res.status(200).json({ message: 'Contacts saved', nextStep: 'notifications' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });


// router.post('/profile', validateProfile, async (req, res) => {
  
//   const { email, firstName, lastName, profilePicture, dateOfBirth,  password } = req.body;
//   console.log(req.body)
//   try {
//     const user = await User.findOne({ email });
//     console.log("email not found")
//     if (!user) return res.status(400).json({ message: 'User not found' });



//     user.firstName = firstName;
//     user.lastName = lastName;
//     user.profilePicture = profilePicture;
//     user.dateOfBirth = new Date(dateOfBirth);
  
//     user.password = password
//     await user.save();
//     res.status(200).json({ message: 'Profile and password saved', nextStep: 'gender' });
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });


// router.post('/gender', async(req, res) => {
//   const {email, gender} = req.body;
//   console.log(req.body)
//   try {
//     const user = await User.findOne({email});
//     if(!user) return res.status(400).json({message: "email doesnt exist or not found"})


//     user.gender = gender
//     await user.save()
//       res.status(200).json({ message: 'Phone number saved', nextStep: 'interests' });
//   } catch (error) {
//     console.log(error)
//       res.status(500).json({ message: 'Server error', error: error.message });
//   }
// })


// // ... Keep interests, contacts as is

// // Step 7: Toggle Notifications and Generate Unique Number
// router.post('/notifications', async (req, res) => {
//   const { email, notificationsEnabled } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: 'User not found' });

//     user.notificationsEnabled = notificationsEnabled;

//     let uniqueNumber;
//     let isUnique = false;
//     while (!isUnique) {
//       uniqueNumber = crypto.randomInt(100000, 1000000).toString(); // 6-digit number
//       const existingUser = await User.findOne({ uniqueNumber });
//       if (!existingUser) isUnique = true;
//     }

//     user.uniqueNumber = uniqueNumber;
//     await user.save();

//     const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: '1h',
//     });
//     res.status(200).json({ message: 'Onboarding complete', token, uniqueNumber: user.uniqueNumber });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });






// router.post('/login', async (req, res) => {
//   const { email, token: inputToken } = req.body;
// console.log(req.body, "login body")
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: 'User not found' });

//     // Step 1: If no token is provided, generate and send a new one
//     if (!inputToken) {
//       const verificationToken = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit token
//       user.verificationCode = verificationToken;
//       user.verificationCodeExpires = Date.now() + 10 * 60 * 1000; 
//       await user.save();

//       const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: email,
//         subject: 'Your Login Verification Code',
//         text: `Your verification code is ${verificationToken}. It expires in 10 minutes.`,
//       };

//       await transporter.sendMail(mailOptions);
//       return res.status(200).json({ message: 'Verification code sent to your email' });
//     }

//     // Step 2: Verify the token
//     if (user.verificationCode !== inputToken || Date.now() > user.verificationCodeExpires) {
//       return res.status(400).json({ message: 'Invalid or expired verification code' });
//     }

//     // Step 3: Clear verification token and issue JWT
//     user.verificationCode = undefined;
//     user.verificationCodeExpires = undefined;
//     await user.save();

  

//     const jwtToken = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: '1h',
//     });
//     res.status(200).json({ message: 'Login successful', token: jwtToken, nextStep: 'dashboard' });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });


// router.get("/dashboard", verifyToken, async(req, res) => {
//   const userId = req.user.id 

//   try {
//     const user = await User.findOne({_id: userId})
//     if(!user)return res.status(404).json({message: "user data not found"})

//     return res.status(200).json(user)
//   } catch (error) {
//     console.log(error)
//     return res.status(500).json({message :"an error occurred in the server"})
//   }
// } )






// // Update user profile
// router.put('/profile', verifyToken, async (req, res) => {
  

//   const userId = req.user.id; 
//   const updateData = { ...req.body };

//   // Convert single values to arrays for array fields
//   const arrayFields = ['interests', 'aboutMe', 'myFaith', 'personality', 'languages', 'ethnicity', 'contactsFiltered', 'gallery'];
//   arrayFields.forEach(field => {
//     if (updateData[field] && !Array.isArray(updateData[field])) {
//       updateData[field] = [updateData[field]];
//     }
//   });


//   if (updateData.dateOfBirth) {
//     updateData.dateOfBirth = new Date(updateData.dateOfBirth);
//   }

//   try {
   
//     if (updateData.email) {
//       const existingUser = await User.findOne({ email: updateData.email, _id: { $ne: userId } });
//       if (existingUser) {
//         return res.status(400).json({ message: 'Email already in use' });
//       }
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     ).select('-password -verificationCode -verificationCodeExpires');

//     if (!updatedUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }


// })



// export default router;

































import express from 'express';
import { sendVerificationCode } from '../config/email.js';
import User from '../models/userSchema.js';
import { validateEmail, validateCode, validatePhone, validateProfile, validatePassword, verifyToken } from '../middlewares/validation.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; // Added for randomInt in /notifications

const router = express.Router();

// Step 1: Submit Email
router.post('/email', validateEmail, async (req, res) => {
  const { email } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Email already registered' });

    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); 

    // Generate uniqueNumber
    let uniqueNumber;
    let isUnique = false;
    while (!isUnique) {
      uniqueNumber = crypto.randomInt(100000, 1000000).toString(); 
      const existingUser = await User.findOne({ uniqueNumber });
      if (!existingUser) isUnique = true;
    }

    user = new User({ email, verificationCode, verificationCodeExpires, uniqueNumber });
    await user.save();

    if (!process.env.EMAIL_USER) {
      throw new Error('EMAIL_USER is not defined');
    }

    await sendVerificationCode(email, verificationCode);
    res.status(200).json({ message: 'Verification code sent' });
  } catch (error) {
    console.error('Email submission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Step 2: Verify Code
router.post('/verify', validateCode, async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (user.verificationCode !== code || user.verificationCodeExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();
    res.status(200).json({ message: 'Code verified', nextStep: 'phone' });
  } catch (error) {
    console.error('Code verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Step 3: Submit Phone Number
router.post('/phone', validatePhone, async (req, res) => {
  const { email, phoneNumber } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    user.phoneNumber = phoneNumber;
    await user.save();
    res.status(200).json({ message: 'Phone number saved', nextStep: 'profile' });
  } catch (error) {
    console.error('Phone submission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Step 4: Submit Profile
router.post('/profile', validateProfile, validatePassword, async (req, res) => {
  const { email, firstName, lastName, profilePicture, dateOfBirth, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    user.firstName = firstName;
    user.lastName = lastName;
    user.profilePicture = profilePicture;
    user.dateOfBirth = new Date(dateOfBirth);
    user.password = await bcrypt.hash(password, 10); // Hash password
    await user.save();

    res.status(200).json({ message: 'Profile and password saved', nextStep: 'gender' });
  } catch (error) {
    console.error('Profile submission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Step 5: Submit Gender
router.post('/gender', async (req, res) => {
  const { email, gender } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    user.gender = gender;
    await user.save();
    res.status(200).json({ message: 'Gender saved', nextStep: 'interests' });
  } catch (error) {
    console.error('Gender submission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Step 6: Submit Interests
router.post('/interests', async (req, res) => {
  const { email, interests } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    user.interests = Array.isArray(interests) ? interests : [interests]; // Ensure interests is an array
    await user.save();
    res.status(200).json({ message: 'Interests saved', nextStep: 'contacts' });
  } catch (error) {
    console.error('Interests submission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Step 7: Submit Contacts
router.post('/contacts', async (req, res) => {
  const { email, contactsFiltered } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    user.contactsFiltered = Array.isArray(contactsFiltered) ? contactsFiltered : [contactsFiltered]; // Ensure array
    await user.save();
    res.status(200).json({ message: 'Contacts saved', nextStep: 'notifications' });
  } catch (error) {
    console.error('Contacts submission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Step 8: Toggle Notifications and Generate Unique Number
// Step 8: Toggle Notifications
router.post('/notifications', async (req, res) => {
  const { email, notificationsEnabled } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    user.notificationsEnabled = notificationsEnabled;
    await user.save();

    const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.status(200).json({ message: 'Onboarding complete', token, uniqueNumber: user.uniqueNumber });
  } catch (error) {
    console.error('Notifications submission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, token: inputToken } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    // Step 1: If no token is provided, generate and send a new one
    if (!inputToken) {
      const verificationCode = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit code
      user.verificationCode = verificationCode;
      user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();

      // Use sendVerificationCode for consistency
      if (!process.env.EMAIL_USER) {
        throw new Error('EMAIL_USER is not defined');
      }
      await sendVerificationCode(email, verificationCode);
      return res.status(200).json({ message: 'Verification code sent to your email' });
    }

    // Step 2: Verify the code
    if (user.verificationCode !== inputToken || user.verificationCodeExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // Step 3: Clear verification code and issue JWT
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    const jwtToken = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.status(200).json({ message: 'Login successful', token: jwtToken, nextStep: 'dashboard' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Dashboard Route
router.get('/dashboard', verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId).select('-password -verificationCode -verificationCodeExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json(user);
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update User Profile
router.put('/profile', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const updateData = { ...req.body };

  // Convert single values to arrays for array fields
  const arrayFields = ['interests', 'aboutMe', 'myFaith', 'personality', 'languages', 'ethnicity', 'contactsFiltered', 'gallery'];
  arrayFields.forEach((field) => {
    if (updateData[field] && !Array.isArray(updateData[field])) {
      updateData[field] = [updateData[field]];
    }
  });

  if (updateData.dateOfBirth) {
    updateData.dateOfBirth = new Date(updateData.dateOfBirth);
  }

  // Hash password if provided
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  try {
    if (updateData.email) {
      const existingUser = await User.findOne({ email: updateData.email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      // Optionally require email verification for new email
      updateData.verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
      updateData.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
      await sendVerificationCode(updateData.email, updateData.verificationCode);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -verificationCode -verificationCodeExpires');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;