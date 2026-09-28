'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { compressImageToBase64 } from '@/lib/imageUtils';
import { getCountryName } from '@/lib/utils';
import { Camera, ArrowLeft, Loader2 } from 'lucide-react';
import { INTEREST_OPTIONS, LookingFor, InterestedIn } from '@/types';
import { CountryFlag } from '@/components/ui/CountryFlag';
import Link from 'next/link';

export default function EditProfilePage() {
  const { profile, updateProfile } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [lookingFor, setLookingFor] = useState<LookingFor>(profile?.lookingFor || 'serious');
  const [interestedIn, setInterestedIn] = useState<InterestedIn>(profile?.interestedIn || 'both');
  const [interests, setInterests] = useState<string[]>(profile?.interests || []);
  const [photo1, setPhoto1] = useState(profile?.photo1 || '');
  const [photo2, setPhoto2] = useState(profile?.photo2 || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  if (!profile) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, photoIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await compressImageToBase64(file);
      if (photoIndex === 0) setPhoto1(base64);
      else setPhoto2(base64);
    } catch (err) {
      console.error('Error compressing image:', err);
      setError('Failed to upload image. Please try again.');
    }
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      if (interests.length >= 5) {
        setError('You can only select up to 5 interests');
        return;
      }
      setInterests([...interests, interest]);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!photo1 || !photo2) {
      setError('Both photos are required');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await updateProfile({
        name,
        bio,
        lookingFor,
        interestedIn,
        interests,
        photo1,
        photo2,
      });
      router.push('/profile');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
      setIsSaving(false);
    }
  };

  const photos = [photo1, photo2];

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100">
        <Link href="/profile" className="p-2 -ml-2 text-gray-600 hover:text-[#1A1A2E] transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-[#1A1A2E]">Edit Profile</h1>
        <div className="w-10"></div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            {error}
          </div>
        )}

        {/* Photos */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-[#1A1A2E] mb-4">Photos</h3>
          <p className="text-xs text-gray-500 mb-4">Upload exactly 2 photos. These will be shown on your profile.</p>
          <div className="grid grid-cols-2 gap-4">
            {[0, 1].map((index) => (
              <div key={index} className="aspect-[3/4] relative rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                {photos[index] ? (
                  <>
                    <img src={photos[index]} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => index === 0 ? fileInputRef1.current?.click() : fileInputRef2.current?.click()}
                      className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <Camera className="w-6 h-6 text-white mb-1" />
                      <span className="text-white text-xs font-semibold">Change</span>
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => index === 0 ? fileInputRef1.current?.click() : fileInputRef2.current?.click()}
                    className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 hover:text-[#FF4458] hover:bg-gray-50 transition-colors"
                  >
                    <Camera className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Add Photo</span>
                  </button>
                )}
              </div>
            ))}
            <input type="file" ref={fileInputRef1} className="hidden" accept="image/jpeg,image/png,image/webp" onChange={(e) => handlePhotoUpload(e, 0)} />
            <input type="file" ref={fileInputRef2} className="hidden" accept="image/jpeg,image/png,image/webp" onChange={(e) => handlePhotoUpload(e, 1)} />
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-semibold text-[#1A1A2E] mb-2">Basic Info</h3>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF4458]/20 focus:border-[#FF4458] transition-colors"
              placeholder="Your name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Country</label>
              <div className="flex items-center gap-2 w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-700">
                <CountryFlag country={profile.country} size="xs" />
                <span className="text-sm font-medium">{getCountryName(profile.country)}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">City / Wilaya</label>
              <input type="text" value={profile.city} disabled className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed text-sm" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">Location cannot be changed after registration.</p>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Bio</label>
            <textarea 
              value={bio} 
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF4458]/20 focus:border-[#FF4458] transition-colors resize-none"
              placeholder="Tell others about yourself..."
              maxLength={300}
            />
            <div className="text-right text-xs text-gray-400 mt-1">{bio.length}/300</div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          {/* Who do you want to meet? */}
          <div>
            <h3 className="font-semibold text-[#1A1A2E] mb-3">Who do you want to meet?</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'women' as InterestedIn, label: '👩 Women' },
                { id: 'men' as InterestedIn, label: '👨 Men' },
                { id: 'both' as InterestedIn, label: '✨ Everyone' },
              ].map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setInterestedIn(option.id)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-colors ${
                    interestedIn === option.id 
                      ? 'border-[#FF4458] bg-[#FF4458]/5 text-[#FF4458] font-bold' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Looking For */}
          <div>
            <h3 className="font-semibold text-[#1A1A2E] mb-3">Looking For</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'serious' as LookingFor, label: '💝 Serious' },
                { id: 'casual' as LookingFor, label: '😊 Casual' },
                { id: 'friends' as LookingFor, label: '🤝 Friends' },
              ].map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setLookingFor(option.id)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-colors ${
                    lookingFor === option.id 
                      ? 'border-[#FF4458] bg-[#FF4458]/5 text-[#FF4458] font-bold' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-[#1A1A2E] mb-1">Interests</h3>
            <p className="text-xs text-gray-500 mb-3">Select up to 5 interests to show on your profile.</p>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                    interests.includes(interest)
                      ? 'border-[#FF4458] bg-[#FF4458] text-white'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-4 bg-[#FF4458] text-white rounded-xl font-bold text-lg hover:bg-[#ff3045] transition-colors disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Profile'
          )}
        </button>
      </div>
    </div>
  );
}
