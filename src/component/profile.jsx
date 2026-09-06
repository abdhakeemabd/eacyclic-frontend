import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import ProfileBanner from './profile-banner';
import { FaEdit, FaSave, FaTimes, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBirthdayCake, FaVenusMars, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

function Profile() {
  const { user, updateUserProfile, loading } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    address: '',
  });
  const [saveMessage, setSaveMessage] = useState('');

  // Initialize form data from user context or localStorage
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        age: user.age || '',
        gender: user.gender || '',
        address: user.address || '',
      });
    } else {
      // Load from localStorage if no user context
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        try {
          setFormData(JSON.parse(savedProfile));
        } catch (e) {
          console.error('Failed to parse profile from localStorage:', e);
        }
      }
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Save to localStorage
      localStorage.setItem('userProfile', JSON.stringify(formData));

      // Try to save to API if user is authenticated
      if (user) {
        const result = await updateUserProfile(formData);
        if (result.success) {
          setSaveMessage('Profile updated successfully!');
        } else {
          setSaveMessage('Profile saved locally. Please login to sync with server.');
        }
      } else {
        setSaveMessage('Profile saved locally. Please login to sync with server.');
      }

      setIsEditing(false);
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage('Error saving profile. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleCancel = () => {
    // Reset form data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        age: user.age || '',
        gender: user.gender || '',
        address: user.address || '',
      });
    } else {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        setFormData(JSON.parse(savedProfile));
      }
    }
    setIsEditing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <>
      <ProfileBanner />
      <section className='profile_sec py-10 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen'>
        <div className="container mx-auto px-4">
          {/* Success / Local Warning Message */}
          {saveMessage && (
            <div className="max-w-4xl mx-auto mb-6 transition-all duration-300">
              <div className={`border px-5 py-4 rounded-2xl shadow-sm flex items-center gap-3.5 animate-fadeIn ${
                saveMessage.toLowerCase().includes('locally')
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-green-50 border-green-200 text-green-800'
              }`}>
                {saveMessage.toLowerCase().includes('locally') ? (
                  <FaExclamationCircle className="text-amber-500 text-xl shrink-0" />
                ) : (
                  <FaCheckCircle className="text-green-500 text-xl shrink-0" />
                )}
                <span className="font-semibold text-sm">{saveMessage}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-6xl mx-auto">
            {/* Profile Card */}
            <div className="md:col-span-4">
              <div className="bg-gradient-to-br from-blue-900 to-blue-950 text-white rounded-2xl p-6 shadow-xl sticky top-6">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mb-4 shadow-lg border-4 border-white">
                    <FaUser className="text-5xl text-white" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm opacity-90 mb-1">Hello, {getGreeting()}</div>
                    <div className="text-2xl font-bold capitalize mb-2">
                      {formData.name || 'Guest User'}
                    </div>
                    {formData.email && (
                      <div className="text-sm opacity-75 flex items-center justify-center gap-2">
                        <FaEnvelope className="text-xs" />
                        {formData.email}
                      </div>
                    )}
                  </div>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full mt-6 bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <FaEdit />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Personal Info Card */}
            <div className="md:col-span-8">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Personal Information</h2>
                  {isEditing && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                      >
                        <FaSave />
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-all duration-300 flex items-center gap-2"
                      >
                        <FaTimes />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-6">
                  {/* Name Field */}
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <FaUser className="text-orange-500" />
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors duration-200"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                        {formData.name || 'Not provided'}
                      </div>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <FaEnvelope className="text-orange-500" />
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors duration-200"
                        placeholder="Enter your email"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                        {formData.email || 'Not provided'}
                      </div>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <FaPhone className="text-orange-500" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        maxLength="10"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors duration-200"
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                        {formData.phone || 'Not provided'}
                      </div>
                    )}
                  </div>

                  {/* Age and Gender Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Age Field */}
                    <div className="group">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <FaBirthdayCake className="text-orange-500" />
                        Age
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          name="age"
                          value={formData.age}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors duration-200"
                          placeholder="Enter your age"
                          min="1"
                          max="120"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                          {formData.age || 'Not provided'}
                        </div>
                      )}
                    </div>

                    {/* Gender Field */}
                    <div className="group">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <FaVenusMars className="text-orange-500" />
                        Gender
                      </label>
                      {isEditing ? (
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors duration-200"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium capitalize">
                          {formData.gender || 'Not provided'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Address Field */}
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <FaMapMarkerAlt className="text-orange-500" />
                      Address
                    </label>
                    {isEditing ? (
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors duration-200 resize-none"
                        placeholder="Enter your full address"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                        {formData.address || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Profile;