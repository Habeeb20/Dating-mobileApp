import User from '../models/userSchema.js';

import asyncHandler from 'express-async-handler';
import { Post,ContentPreference, BroadcastMessage, Follower } from '../models/post.js';
// Create a new post
const createPost = asyncHandler(async (req, res) => {
  const { content, media, tags, visibility, categories } = req.body;
  const post = new Post({
    author: req.user._id,
    content,
    media,
    tags,
    visibility,
    categories,
  });
  const savedPost = await post.save();
  
  // Update content preferences
  await updateContentPreferences(req.user._id, categories);
  
  res.status(201).json(savedPost);
});

// Edit a post
const editPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { content, media, tags, visibility, categories, isHidden } = req.body;
  
  const post = await Post.findOne({ _id: postId, author: req.user._id });
  if (!post) {
    res.status(404);
    throw new Error('Post not found or unauthorized');
  }
  
  post.content = content || post.content;
  post.media = media || post.media;
  post.tags = tags || post.tags;
  post.visibility = visibility || post.visibility;
  post.categories = categories || post.categories;
  post.isHidden = isHidden !== undefined ? isHidden : post.isHidden;
  
  const updatedPost = await post.save();
  
  // Update content preferences
  await updateContentPreferences(req.user._id, categories);
  
  res.json(updatedPost);
});

// Delete a post
const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findOneAndDelete({ _id: postId, author: req.user._id });
  if (!post) {
    res.status(404);
    throw new Error('Post not found or unauthorized');
  }
  res.json({ message: 'Post deleted successfully' });
});

// Like a post
const likePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findById(postId);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  if (post.likes.includes(req.user._id)) {
    post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
  } else {
    post.likes.push(req.user._id);
  }
  await post.save();
  res.json(post);
});

// Comment on a post
// const commentOnPost = asyncHandler(async (req, res) => {
//   const { postId } = req.params;
//   const { content } = req.body;
//   const post = await Post.findById(postId);
//   if (!post) {
//     res.status(404);
//     throw new Error('Post not found');
//   }
//   post.comments.push({ author: req.user._id, content });
//   await post.save();
//   res.json(post);
// });
const commentOnPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body; // Expecting { content: string }
  if (!content || typeof content !== 'string') {
    res.status(400);
    throw new Error('Comment content must be a non-empty string');
  }
  const post = await Post.findById(postId);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  post.comments.push({ author: req.user._id, content });
  await post.save();
  const updatedPost = await Post.findById(postId)
    .populate('author', 'firstName lastName profilePicture')
    .populate('tags', 'firstName lastName')
    .populate('comments.author', 'firstName lastName');
  res.json(updatedPost);
});

// Share a post
const sharePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findById(postId);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  if (!post.shares.includes(req.user._id)) {
    post.shares.push(req.user._id);
    await post.save();
  }
  res.json(post);
});

// Save a post
const savePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findById(postId);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  if (post.savedBy.includes(req.user._id)) {
    post.savedBy = post.savedBy.filter(id => id.toString() !== req.user._id.toString());
  } else {
    post.savedBy.push(req.user._id);
  }
  await post.save();
  res.json(post);
});

// Track post view
const trackPostView = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findById(postId);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  if (!post.views.includes(req.user._id)) {
    post.views.push(req.user._id);
    await updateContentPreferences(req.user._id, post.categories);
    await post.save();
  }
  res.json(post);
});

const getPost = asyncHandler(async (req, res) => {
  console.log(req.params.postId);
  const post = await Post.findById(req.params.postId)
    .populate('author', 'firstName lastName profilePicture')
    .populate('tags', 'firstName lastName')
    .populate('comments.author', 'firstName lastName');
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  res.json(post);
});



// Follow a user
const followUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (userId === req.user._id.toString()) {
    res.status(400);
    throw new Error('Cannot follow yourself');
  }
  const existing = await Follower.findOne({ user: userId, follower: req.user._id });
  if (existing) {
    res.status(400);
    throw new Error('Already following this user');
  }
  const follow = new Follower({ user: userId, follower: req.user._id });
  await follow.save();
  res.json({ message: 'Followed successfully' });
});

// Unfollow a user
const unfollowUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const follow = await Follower.findOneAndDelete({ user: userId, follower: req.user._id });
  if (!follow) {
    res.status(404);
    throw new Error('Not following this user');
  }
  res.json({ message: 'Unfollowed successfully' });
});

// Send broadcast message to selected followers
const sendBroadcastMessage = asyncHandler(async (req, res) => {
  const { content, recipientIds } = req.body;
  const followers = await Follower.find({ user: req.user._id, follower: { $in: recipientIds } });
  const validRecipientIds = followers.map(f => f.follower);
  const message = new BroadcastMessage({
    sender: req.user._id,
    recipients: validRecipientIds,
    content,
  });
  await message.save();
  res.json({ message: 'Broadcast message sent successfully' });
});

// Get personalized feed

// Helper function to update content preferences
const updateContentPreferences = async (userId, categories) => {
  if (!categories || !categories.length) return;
  let preferences = await ContentPreference.findOne({ user: userId });
  if (!preferences) {
    preferences = new ContentPreference({ user: userId, viewedCategories: [] });
  }
  categories.forEach(category => {
    const existing = preferences.viewedCategories.find(c => c.category === category);
    if (existing) {
      existing.count += 1;
      existing.lastViewed = new Date();
    } else {
      preferences.viewedCategories.push({ category, count: 1, lastViewed: new Date() });
    }
  });
  await preferences.save();
};



const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id || req.user.id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user);
});

const getFollowers = asyncHandler(async (req, res) => {
  const followers = await Follower.find({ user: req.params.userId }).populate('follower', 'firstName lastName profilePicture');
  res.json(followers.map(f => f.follower));
});


// controllers/postController.js
const getFeed = asyncHandler(async (req, res) => {
  const followedUsers = await Follower.find({ follower: req.user._id }).select('user');
  const followedUserIds = followedUsers.map(f => f.user);
  const preferences = await ContentPreference.findOne({ user: req.user._id });
  const preferredCategories = preferences ? preferences.viewedCategories
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(p => p.category) : [];

  const posts = await Post.find({
    $or: [
      { author: { $in: followedUserIds } },
      { categories: { $in: preferredCategories } },
      { visibility: 'public' },
    ],
    isHidden: false,
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('author', 'firstName lastName profilePicture')
    .populate('tags', 'firstName lastName')
    .populate('comments.author', 'firstName lastName');
  
  res.json(posts);
});



export {
  createPost,
  getFeed,
  editPost,
  deletePost,
  likePost,
  commentOnPost,
  sharePost,
  savePost,
  trackPostView,
  followUser,
  unfollowUser,
  sendBroadcastMessage,
  getPost,
  getUserById, 
  getFollowers
};