import express from "express"
import { verifyToken, protect } from "../middlewares/validation.js";
import { getAllUsers, getFilteredUsers, sendMessage } from "../controllers/datingController.js";
import { getDiscoverUsers,  likeUser,
  passUser,
  addToFavorites,
  acceptLike,
  rejectLike,
  unfriendUser,
  sendCompliment,
  getUserProfile,
  getLikedUsers,
  getPassedUsers,
  getFavorites,
  getVisitors,
  getLikedBy,
  getFriends,
  getSentCompliments,
  getReceivedCompliments,
  getChatHistory, } from "../controllers/datingController.js";

const router = express.Router()

router.get('/', getAllUsers);
router.get('/filtered', getFilteredUsers);
router.get('/discover', protect, getDiscoverUsers);
router.post('/:userId/like', protect, likeUser);
router.post('/:userId/pass', protect, passUser);
router.post('/favorites/:userId', protect, addToFavorites);
router.post('/:userId/accept', protect, acceptLike);
router.post('/:userId/reject', protect, rejectLike);
router.post('/unfriend/:userId', protect, unfriendUser);
router.post('/compliment', protect, sendCompliment);
router.get('/profile/:userId', protect, getUserProfile);
router.get('/liked', protect, getLikedUsers);
router.get('/passed', protect, getPassedUsers);
router.get('/favorites', protect, getFavorites);
router.get('/visitors', protect, getVisitors);
router.get('/liked-by', protect, getLikedBy);
router.get('/friends', protect, getFriends);
router.get('/compliments/sent', protect, getSentCompliments);
router.get('/compliments/received', protect, getReceivedCompliments);
router.get('/chat/:friendId', protect, getChatHistory);

// Add to router
router.post('/:friendId/chat', protect, sendMessage);


export default router

