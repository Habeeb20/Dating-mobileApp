
import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, trim: true },
  media: [{
    type: { type: String, enum: ['image', 'video'], required: true },
    url: { type: String, required: true },
    thumbnail: { type: String },
  }],
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Tagged users
  visibility: { 
    type: String, 
    enum: ['public', 'followers', 'private'], 
    default: 'public' 
  },
  isHidden: { type: Boolean, default: false },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  }],
  shares: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who saved the post
  views: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Unique users who viewed the post
  categories: [{ type: String }], // For content preference tracking
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

// Update updatedAt on save
postSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Schema for tracking user content preferences
const contentPreferenceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  viewedCategories: [{
    category: { type: String },
    count: { type: Number, default: 0 },
    lastViewed: { type: Date, default: Date.now },
  }],
});

// Schema for broadcast messages
const broadcastMessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  content: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

// Schema for followers
const followerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

// Indexes for performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ categories: 1 });
contentPreferenceSchema.index({ user: 1 });
followerSchema.index({ user: 1, follower: 1 }, { unique: true });

// Models
const Post = mongoose.model('Post', postSchema);
const ContentPreference = mongoose.model('ContentPreference', contentPreferenceSchema);
const BroadcastMessage = mongoose.model('BroadcastMessage', broadcastMessageSchema);
const Follower = mongoose.model('Follower', followerSchema);

export { Post, ContentPreference, BroadcastMessage, Follower };