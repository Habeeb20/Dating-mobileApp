// Update to models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String,  },
  phoneNumber: { type: String,  },
  firstName: { type: String,  },
  lastName: { type: String,  },
  profilePicture: { type: String,  }, // Cloudinary URL
  dateOfBirth: { type: Date,  },
  gender: { type: String , enum: ['male', 'female', 'other'] },
  interests: [{ type: String }],
  aboutMe: [{ type: String }],
  myFaith: [{ type: String }],
  personality:[{type:String}],
  languages:[{type:String}],
  ethnicity:[{type:String}],
  state:{type:String},
  age:{type:String},
  bio:{type:String},
  education:{type:String},
  uniqueNumber: { type: String, unique: true, sparse: true },
  contactsFiltered: [{ type: String }], // Filtered contact emails or IDs
  notificationsEnabled: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationCodeExpires: { type: Date },
  gallery: [{ type: String }],
   likedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users this user has liked
  passedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users this user has passed
  favorite: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Favorite users
  
  visitors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who visited this profile
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who liked this user
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Accepted friends
  sentCompliments: [{
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String },
    createdAt: { type: Date, default: Date.now },
  }],
  receivedCompliments: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String },
    createdAt: { type: Date, default: Date.now },
  }],

});


userSchema.pre('save', function(next) {
  if (this.dateOfBirth && !this.age) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    this.age = today.getFullYear() - birthDate.getFullYear() - 
      (today.getMonth() < birthDate.getMonth() || 
       (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);
  }
  next();
});



const User = mongoose.model('User', userSchema);

export default User;







