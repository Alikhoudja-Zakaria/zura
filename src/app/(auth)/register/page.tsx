"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, ChevronLeft, ChevronRight, Upload, X, Loader2, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getLocationsByCountry, INTEREST_OPTIONS, InterestedIn } from "@/types";
import { compressImageToBase64, validateImageFile } from "@/lib/imageUtils";
import { getCountryName } from "@/lib/utils";
import { CountryFlag } from "@/components/ui/CountryFlag";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { signUp } = useAuth();

  const [formData, setFormData] = useState({
    country: "",
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    city: "",
    bio: "",
    lookingFor: "",
    interestedIn: "both" as InterestedIn,
    interests: [] as string[],
    photos: [] as string[],
  });

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => setStep(s => Math.min(s + 1, 5));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (formData.photos.length + files.length > 2) {
      setError("You can only upload exactly 2 photos.");
      return;
    }

    try {
      const newPhotos = [...formData.photos];
      for (const file of files) {
        const validationError = validateImageFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }
        const base64 = await compressImageToBase64(file);
        newPhotos.push(base64);
      }
      updateForm("photos", newPhotos.slice(0, 2));
    } catch (err: any) {
      setError("Failed to process image. Please try another one.");
    }
  };

  const removePhoto = (index: number) => {
    updateForm("photos", formData.photos.filter((_, i) => i !== index));
  };

  const toggleInterest = (interest: string) => {
    const current = formData.interests;
    if (current.includes(interest)) {
      updateForm("interests", current.filter(i => i !== interest));
    } else if (current.length < 5) {
      updateForm("interests", [...current, interest]);
    }
  };

  const handleSubmit = async () => {
    if (formData.photos.length !== 2) {
      setError("Exactly 2 photos are required.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      await signUp(
        formData.email,
        formData.password,
        {
          name: formData.name.trim(),
          age: parseInt(formData.age),
          gender: (formData.gender.toLowerCase() as any) || "female",
          country: (formData.country.toLowerCase() as any) || "algeria",
          city: formData.city,
          bio: formData.bio.trim(),
          lookingFor: (formData.lookingFor.toLowerCase() as any) || "serious",
          interestedIn: formData.interestedIn || "both",
          interests: formData.interests,
          photo1: formData.photos[0] || "",
          photo2: formData.photos[1] || "",
        }
      );
      router.push("/pending");
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col pb-20">
      <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {step > 1 ? (
            <button onClick={handleBack} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-xl">
              <ChevronLeft className="w-6 h-6" />
            </button>
          ) : (
            <div className="w-10"></div>
          )}
          
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-[#FF4458]" fill="#FF4458" />
            <span className="font-bold text-lg text-[#1A1A2E]">Zura</span>
          </div>
          
          <div className="w-10 text-right text-sm font-medium text-gray-400">
            {step}/5
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#FF4458] transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto p-6 mt-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#1A1A2E] mb-2">Where are you?</h2>
              <p className="text-gray-500">Select your country to get started</p>
            </div>
            
            <div className="grid gap-4">
              {[
                { id: "algeria", name: "Algeria" },
                { id: "morocco", name: "Morocco" },
                { id: "tunisia", name: "Tunisia" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    updateForm("country", c.id);
                    updateForm("city", ""); // Reset city
                    handleNext();
                  }}
                  className={`flex items-center p-5 rounded-2xl border-2 transition-all bg-white hover:scale-[1.01] ${
                    formData.country === c.id 
                      ? "border-[#FF4458] shadow-sm ring-2 ring-[#FF4458]/10" 
                      : "border-gray-200 shadow-xs hover:border-gray-300"
                  }`}
                >
                  <CountryFlag country={c.id} size="lg" className="mr-4 rounded-md shadow-xs" />
                  <span className="text-xl font-bold text-[#1A1A2E]">{c.name}</span>
                  <ChevronRight className="w-6 h-6 ml-auto text-gray-400" />
                </button>
              ))}
            </div>
            <div className="mt-8 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-[#FF4458] hover:underline">
                Log in
              </Link>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#1A1A2E] mb-2">Basic Info</h2>
              <p className="text-gray-500">Tell us a bit about yourself</p>
            </div>

            <div className="space-y-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div>
                <label className="block text-sm font-semibold text-[#1A1A2E] mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => updateForm("name", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#FF4458] bg-white text-[#1A1A2E]"
                  placeholder="First name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1A1A2E] mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => updateForm("email", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#FF4458] bg-white text-[#1A1A2E]"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1A1A2E] mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => updateForm("password", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#FF4458] bg-white text-[#1A1A2E]"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A2E] mb-1">Age</label>
                  <input
                    type="number"
                    min="18"
                    value={formData.age}
                    onChange={e => updateForm("age", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#FF4458] bg-white text-[#1A1A2E]"
                    placeholder="18+"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A2E] mb-1">Gender</label>
                  <div className="flex gap-2">
                    {[
                      { id: "male", label: "Male" },
                      { id: "female", label: "Female" },
                    ].map(g => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => updateForm("gender", g.id)}
                        className={`flex-1 py-3 rounded-xl font-medium border ${
                          formData.gender === g.id 
                            ? "bg-[#FF4458] text-white border-[#FF4458]" 
                            : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1A1A2E] mb-1">
                  {formData.country === "algeria" ? "Wilaya (58 Wilayas)" : formData.country === "morocco" ? "Region" : "Governorate"} / City
                </label>
                <select
                  value={formData.city}
                  onChange={e => updateForm("city", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#FF4458] bg-white text-[#1A1A2E] cursor-pointer"
                >
                  <option value="">
                    {`-- Select ${formData.country === "algeria" ? "Wilaya" : formData.country === "morocco" ? "Region" : "Governorate"} --`}
                  </option>
                  {getLocationsByCountry(formData.country).map(loc => (
                    <option key={loc.value} value={loc.label}>{loc.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={!formData.name || !formData.email || !formData.password || !formData.age || !formData.gender || !formData.city}
              className="w-full bg-[#FF4458] text-white font-bold py-4 rounded-xl hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-sm"
            >
              Continue
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#1A1A2E] mb-2">About You</h2>
              <p className="text-gray-500">What are you looking for?</p>
            </div>

            <div className="space-y-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div>
                <label className="block text-sm font-semibold text-[#1A1A2E] mb-1">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={e => updateForm("bio", e.target.value.slice(0, 300))}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#FF4458] bg-white resize-none text-[#1A1A2E]"
                  placeholder="Tell us about yourself..."
                />
                <div className="text-right text-xs text-gray-400 mt-1">
                  {formData.bio.length}/300
                </div>
              </div>

              {/* Who do you want to meet? */}
              <div>
                <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">Who do you want to meet?</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "women", label: "👩 Women" },
                    { id: "men", label: "👨 Men" },
                    { id: "both", label: "✨ Everyone" },
                  ].map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => updateForm("interestedIn", option.id)}
                      className={`py-3 rounded-xl font-medium border text-sm transition-all ${
                        formData.interestedIn === option.id
                          ? "bg-[#FF4458] text-white border-[#FF4458] shadow-sm font-bold"
                          : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* What are you looking for? */}
              <div>
                <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">What are you looking for?</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "serious", label: "💝 Serious", desc: "Long-term" },
                    { id: "casual", label: "😊 Casual", desc: "Dating" },
                    { id: "friends", label: "🤝 Friends", desc: "New pals" },
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => updateForm("lookingFor", item.id)}
                      className={`p-3 rounded-xl font-medium border text-sm flex flex-col items-center justify-center gap-1 transition-all ${
                        formData.lookingFor === item.id 
                          ? "bg-[#FF4458] text-white border-[#FF4458] shadow-sm font-bold" 
                          : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className={`text-[11px] ${formData.lookingFor === item.id ? "text-white/80" : "text-gray-400"}`}>
                        {item.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">
                  Interests ({formData.interests.length}/5)
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map(interest => {
                    const isSelected = formData.interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        disabled={!isSelected && formData.interests.length >= 5}
                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                          isSelected
                            ? "bg-[#FF4458] bg-opacity-10 text-[#FF4458] border-[#FF4458]"
                            : "bg-white text-gray-600 border-gray-300 hover:border-gray-400 disabled:opacity-50"
                        }`}
                      >
                        {interest}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={!formData.bio || !formData.lookingFor || !formData.interestedIn || formData.interests.length === 0}
              className="w-full bg-[#FF4458] text-white font-bold py-4 rounded-xl hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Continue
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#1A1A2E] mb-2">Your Photos</h2>
              <p className="text-gray-500">Add exactly 2 photos to show your best self</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[0, 1].map((index) => (
                  <div 
                    key={index} 
                    className="aspect-[3/4] bg-[#F5F5F5] rounded-xl border-2 border-dashed border-gray-300 relative overflow-hidden flex items-center justify-center"
                  >
                    {formData.photos[index] ? (
                      <>
                        <img 
                          src={formData.photos[index]} 
                          alt={`Upload ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <div className="text-gray-400 flex flex-col items-center">
                        <Upload className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-sm font-medium">Photo {index + 1}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="relative">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handlePhotoUpload}
                  disabled={formData.photos.length >= 2}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className={`w-full py-4 rounded-xl font-bold text-center border-2 transition-colors ${
                  formData.photos.length >= 2 
                    ? "bg-gray-100 text-gray-400 border-gray-200" 
                    : "bg-white text-[#FF4458] border-[#FF4458] hover:bg-[#FF4458] hover:bg-opacity-5"
                }`}>
                  Select Photos
                </div>
              </div>
              <p className="text-center text-xs text-gray-500 mt-3">Max 5MB per image. JPEG, PNG, WEBP.</p>
            </div>

            <button
              onClick={handleNext}
              disabled={formData.photos.length !== 2}
              className="w-full bg-[#FF4458] text-white font-bold py-4 rounded-xl hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Continue
            </button>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#1A1A2E] mb-2">Review Profile</h2>
              <p className="text-gray-500">Almost there! Check your details.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="aspect-square bg-gray-100 relative">
                <img 
                  src={formData.photos[0]} 
                  alt="Profile primary" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-[#1A1A2E]">
                      {formData.name}, {formData.age}
                    </h3>
                    <p className="text-gray-500 flex items-center gap-1.5 mt-1">
                      <CountryFlag country={formData.country} size="sm" />
                      <span>{formData.city}, {getCountryName(formData.country)}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">About</h4>
                  <p className="text-[#1A1A2E] text-sm leading-relaxed">{formData.bio}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Looking For</h4>
                    <span className="inline-block px-3 py-1.5 bg-[#F5F5F5] rounded-xl text-sm font-medium">
                      {formData.lookingFor === 'serious' ? '💝 Serious' : 
                       formData.lookingFor === 'casual' ? '😊 Casual' : '🤝 Friends'}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Wants to Meet</h4>
                    <span className="inline-block px-3 py-1.5 bg-[#F5F5F5] rounded-xl text-sm font-medium capitalize">
                      {formData.interestedIn === 'women' ? '👩 Women' :
                       formData.interestedIn === 'men' ? '👨 Men' : '✨ Everyone'}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.interests.map(interest => (
                      <span key={interest} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#FF4458] text-white font-bold py-4 rounded-xl hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <Check className="w-6 h-6" /> Submit Profile
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
