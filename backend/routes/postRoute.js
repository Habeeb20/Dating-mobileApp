import express from 'express';

import { createPost, editPost,
  deletePost,
  likePost,
  commentOnPost,
  sharePost,
  savePost,
  trackPostView,
  followUser,
  unfollowUser,
  sendBroadcastMessage,
  getFeed, } from '../controllers/postController.js';
import {protect} from "../middlewares/authMiddleware.js";
const router = express.Router();

// Post routes
router.post('/', protect, createPost);
router.put('/:postId', protect, editPost);
router.delete('/:postId', protect, deletePost);
router.post('/:postId/like', protect, likePost);
router.post('/:postId/comment', protect, commentOnPost);
router.post('/:postId/share', protect, sharePost);
router.post('/:postId/save', protect, savePost);
router.post('/:postId/view', protect, trackPostView);

// Follow routes
router.post('/follow/:userId', protect, followUser);
router.delete('/follow/:userId', protect, unfollowUser);

// Broadcast message route
router.post('/broadcast', protect, sendBroadcastMessage);

// Feed route
router.get('/feed', protect, getFeed);

export default router;