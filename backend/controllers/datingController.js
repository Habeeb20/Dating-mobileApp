
import User from '../models/userSchema.js';
import Message from '../models/message.js';
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -verificationCode -verificationCodeExpires')
      .lean();
    res.status(200).json({ data: users });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFilteredUsers = async (req, res) => {
  try {
    const { email, state } = req.query; 
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const loggedInUser = await User.findOne({ email }).select('gender').lean();
    if (!loggedInUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { gender } = loggedInUser;
    if (!gender || !['male', 'female'].includes(gender)) {
      return res.status(400).json({ message: 'User gender must be male or female for filtering' });
    }

    const oppositeGender = gender === 'male' ? 'female' : 'male';
    const query = { gender: oppositeGender };
    if (state) {
      query.state = state;
    }

    const users = await User.find(query)
      .select('-password -verificationCode -verificationCodeExpires')
      .lean();

    res.status(200).json({ data: users });
  } catch (error) {
    console.error('Error fetching filtered users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// // Register user
// export const registerUser = async (req, res) => {
//   const { email, password, firstName, lastName, gender } = req.body;
//   try {
//     const userExists = await User.findOne({ email });
//     if (userExists) return res.status(400).json({ message: 'User already exists' });

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const user = await User.create({
//       email,
//       password: hashedPassword,
//       firstName,
//       lastName,
//       gender,
//     });

//     res.status(201).json({
//       _id: user._id,
//       email: user.email,
//       token: generateToken(user._id),
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Login user
// export const loginUser = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: 'Invalid credentials' });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

//     res.json({
//       _id: user._id,
//       email: user.email,
//       token: generateToken(user._id),
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// Get users of opposite gender
export const getDiscoverUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('gender');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const oppositeGender = user.gender === 'male' ? 'female' : user.gender === 'female' ? 'male' : 'other';
    const users = await User.find({
      gender: oppositeGender,
      _id: { $nin: [req.user.id, ...user.likedUsers, ...user.passedUsers] },
    }).select('firstName lastName profilePicture age bio');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like a user
export const likeUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(req.user.id);
    const targetUser = await User.findById(userId);

    if (!targetUser) return res.status(404).json({ message: 'Target user not found' });
    if (user.likedUsers.includes(userId)) return res.status(400).json({ message: 'User already liked' });

    user.likedUsers.push(userId);
    targetUser.likedBy.push(req.user.id);
    await user.save();
    await targetUser.save();

    res.json({ message: 'User liked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Pass a user
export const passUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.passedUsers.includes(userId)) return res.status(400).json({ message: 'User already passed' });

    user.passedUsers.push(userId);
    await user.save();

    res.json({ message: 'User passed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add to favorites
export const addToFavorites = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.favorites.includes(userId)) return res.status(400).json({ message: 'User already in favorites' });

    user.favorites.push(userId);
    await user.save();

    res.json({ message: 'User added to favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept like request
export const acceptLike = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(req.user.id);
    const requester = await User.findById(userId);

    if (!requester) return res.status(404).json({ message: 'Requester not found' });
    if (!user.likedBy.includes(userId)) return res.status(400).json({ message: 'No like request from this user' });

    user.friends.push(userId);
    requester.friends.push(req.user.id);
    user.likedBy = user.likedBy.filter(id => id.toString() !== userId);
    await user.save();
    await requester.save();

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject like request
export const rejectLike = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.likedBy.includes(userId)) return res.status(400).json({ message: 'No like request from this user' });

    user.likedBy = user.likedBy.filter(id => id.toString() !== userId);
    await user.save();

    res.json({ message: 'Like request rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unfriend
export const unfriendUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(req.user.id);
    const friend = await User.findById(userId);

    if (!friend) return res.status(404).json({ message: 'Friend not found' });
    if (!user.friends.includes(userId)) return res.status(400).json({ message: 'Not friends with this user' });

    user.friends = user.friends.filter(id => id.toString() !== userId);
    friend.friends = friend.friends.filter(id => id.toString() !== req.user.id.toString());
    await user.save();
    await friend.save();

    res.json({ message: 'Unfriended successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send compliment
export const sendCompliment = async (req, res) => {
  const { userId, message } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const recipient = await User.findById(userId);

    if (!recipient) return res.status(404).json({ message: 'Recipient not found' });

    user.sentCompliments.push({ recipient: userId, message });
    recipient.receivedCompliments.push({ sender: req.user.id, message });
    await user.save();
    await recipient.save();

    res.json({ message: 'Compliment sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Add to visitors list if not the same user
    if (userId !== req.user.id.toString()) {
      const currentUser = await User.findById(req.user.id);
      if (!user.visitors.includes(req.user.id)) {
        user.visitors.push(req.user.id);
        await user.save();
      }
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get liked users
export const getLikedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('likedUsers', 'firstName lastName profilePicture');
    res.json(user.likedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get passed users
export const getPassedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('passedUsers', 'firstName lastName profilePicture');
    res.json(user.passedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get favorites
export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites', 'firstName lastName profilePicture');
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get visitors
export const getVisitors = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('visitors', 'firstName lastName profilePicture');
    res.json(user.visitors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get liked by users
export const getLikedBy = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('likedBy', 'firstName lastName profilePicture');
    res.json(user.likedBy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get friends
export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends', 'firstName lastName profilePicture');
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get sent compliments
export const getSentCompliments = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('sentCompliments.recipient', 'firstName lastName');
    res.json(user.sentCompliments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get received compliments
export const getReceivedCompliments = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('receivedCompliments.sender', 'firstName lastName');
    res.json(user.receivedCompliments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get chat history
export const getChatHistory = async (req, res) => {
  const { friendId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: friendId },
        { sender: friendId, recipient: req.user.id },
      ],
    }).sort({ createdAt: 1 }).populate('sender', 'firstName lastName');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};