// controllers/userController.js
import User from '../models/User.js';

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ user });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { displayName, firstName, lastName, preferences } = req.body;
    
    // Fields that are allowed to be updated
    const updatedFields = {};
    
    if (displayName) updatedFields.displayName = displayName;
    if (firstName) updatedFields.firstName = firstName;
    if (lastName) updatedFields.lastName = lastName;
    if (preferences) updatedFields.preferences = preferences;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json({ user: updatedUser });
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user preferences
export const getUserPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('preferences');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ preferences: user.preferences });
  } catch (err) {
    console.error('Error fetching user preferences:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user preferences
export const updateUserPreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    
    if (!preferences) {
      return res.status(400).json({ message: 'Preferences are required' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { preferences } },
      { new: true, runValidators: true }
    ).select('preferences');
    
    res.status(200).json({ preferences: user.preferences });
  } catch (err) {
    console.error('Error updating user preferences:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
