import React, { useState, useEffect } from 'react';

// Types
interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'personal' | 'doctor' | 'professional' | 'institution';
  country: string;
  specialization?: string;
  institution?: string;
  completed: boolean;
  createdAt: string;
}

interface ProfileSetupProps {
  onProfileComplete: (profile: UserProfile) => void;
  userEmail: string;
  existingProfile?: UserProfile | null;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({
  onProfileComplete,
  userEmail,
  existingProfile
}) => {
  const [showSetup, setShowSetup] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    role: '' as UserProfile['role'],
    country: '',
    specialization: '',
    institution: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Countries list for dropdown
  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Japan',
    'South Korea', 'Brazil', 'India', 'China', 'Singapore', 'Sweden', 'Norway', 'Netherlands'
  ];

  // Specializations for medical professionals
  const specializations = [
    'Genetic Counselor', 'Oncologist', 'Cardiologist', 'Neurologist', 'Pediatrician',
    'General Practitioner', 'Research Scientist', 'Bioinformatician', 'Genetic Researcher'
  ];

  useEffect(() => {
    // Show setup if no existing profile or profile is incomplete
    if (!existingProfile || !existingProfile.completed) {
      setShowSetup(true);
    }
  }, [existingProfile]);

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Full name is required';
      }
      if (!formData.role) {
        newErrors.role = 'Please select your role';
      }
    }

    if (step === 2) {
      if (!formData.country) {
        newErrors.country = 'Please select your country';
      }
      if (formData.role === 'doctor' && !formData.specialization) {
        newErrors.specialization = 'Please select your specialization';
      }
      if (formData.role === 'institution' && !formData.institution) {
        newErrors.institution = 'Institution name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      const profile: UserProfile = {
        id: existingProfile?.id || `user_${Date.now()}`,
        name: formData.name,
        email: userEmail,
        role: formData.role,
        country: formData.country,
        specialization: formData.role === 'doctor' ? formData.specialization : undefined,
        institution: formData.role === 'institution' ? formData.institution : undefined,
        completed: true,
        createdAt: existingProfile?.createdAt || new Date().toISOString()
      };

      onProfileComplete(profile);
      setShowSetup(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'personal':
        return 'Store and manage your personal genetic data and family health history';
      case 'doctor':
        return 'Access patient data, upload genetic reports, and provide medical insights';
      case 'professional':
        return 'Analyze genetic data, conduct research, and provide professional services';
      case 'institution':
        return 'Access anonymized data pools for research and analytics';
      default:
        return '';
    }
  };

  if (!showSetup) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Complete Your Profile</h2>
              <p className="text-emerald-50 mt-1">
                {currentStep === 1 && 'Tell us about yourself'}
                {currentStep === 2 && 'Additional information'}
                {currentStep === 3 && 'Review your profile'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full ${step === currentStep
                      ? 'bg-white'
                      : step < currentStep
                        ? 'bg-emerald-300'
                        : 'bg-white/30'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-100 h-1">
          <div
            className="bg-emerald-500 h-1 transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>

        <div className="p-8 overflow-y-auto max-h-[60vh]">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all ${errors.name ? 'border-red-500' : 'border-slate-200'
                    }`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs font-bold uppercase tracking-wide mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  I am a... *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      value: 'personal',
                      label: 'Individual/Family User',
                      icon: '👤',
                      description: 'Store and manage personal genetic data'
                    },
                    {
                      value: 'doctor',
                      label: 'Healthcare Professional',
                      icon: '👨‍⚕️',
                      description: 'Medical practitioners and counselors'
                    },
                    {
                      value: 'professional',
                      label: 'Research Professional',
                      icon: '🔬',
                      description: 'Researchers and data analysts'
                    },
                    {
                      value: 'institution',
                      label: 'Institution',
                      icon: '🏛️',
                      description: 'Hospitals, labs, and research centers'
                    }
                  ].map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => handleInputChange('role', role.value)}
                      className={`p-4 border-2 rounded-xl text-left transition-all duration-200 ${formData.role === role.value
                          ? 'border-emerald-500 bg-emerald-50 shadow-md transform scale-[1.02]'
                          : 'border-slate-100 hover:border-emerald-300 hover:bg-slate-50'
                        }`}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{role.icon}</span>
                        <div>
                          <h3 className={`font-bold ${formData.role === role.value ? 'text-emerald-900' : 'text-slate-700'}`}>{role.label}</h3>
                          <p className={`text-sm mt-1 ${formData.role === role.value ? 'text-emerald-700' : 'text-slate-500'}`}>{role.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {errors.role && (
                  <p className="text-red-500 text-xs font-bold uppercase tracking-wide mt-2">{errors.role}</p>
                )}
              </div>

              {formData.role && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                  <span className="text-blue-500 text-lg">💡</span>
                  <p className="text-blue-700 text-sm leading-relaxed">
                    {getRoleDescription(formData.role)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Additional Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Country *
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all ${errors.country ? 'border-red-500' : 'border-slate-200'
                    }`}
                >
                  <option value="">Select your country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-red-500 text-xs font-bold uppercase tracking-wide mt-1">{errors.country}</p>
                )}
              </div>

              {formData.role === 'doctor' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Specialization *
                  </label>
                  <select
                    value={formData.specialization}
                    onChange={(e) => handleInputChange('specialization', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all ${errors.specialization ? 'border-red-500' : 'border-slate-200'
                      }`}
                  >
                    <option value="">Select your specialization</option>
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                  {errors.specialization && (
                    <p className="text-red-500 text-xs font-bold uppercase tracking-wide mt-1">{errors.specialization}</p>
                  )}
                </div>
              )}

              {formData.role === 'institution' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Institution Name *
                  </label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => handleInputChange('institution', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all ${errors.institution ? 'border-red-500' : 'border-slate-200'
                      }`}
                    placeholder="Enter your institution name"
                  />
                  {errors.institution && (
                    <p className="text-red-500 text-xs font-bold uppercase tracking-wide mt-1">{errors.institution}</p>
                  )}
                </div>
              )}

              {(formData.role === 'personal' || formData.role === 'professional') && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-start gap-3">
                  <span className="text-slate-500 text-lg">ℹ️</span>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {formData.role === 'personal'
                      ? 'You can always update your profile and add more details later in settings.'
                      : 'Your professional profile will be visible to institutions for collaboration opportunities.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 tracking-tight">
                  Profile Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Name:</span>
                    <span className="font-bold text-slate-900">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Role:</span>
                    <span className="font-bold text-slate-900 capitalize">
                      {formData.role === 'personal' ? 'Individual User' :
                        formData.role === 'doctor' ? 'Healthcare Professional' :
                          formData.role === 'professional' ? 'Research Professional' : 'Institution'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Country:</span>
                    <span className="font-bold text-slate-900">{formData.country}</span>
                  </div>
                  {formData.specialization && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Specialization:</span>
                      <span className="font-bold text-slate-900">{formData.specialization}</span>
                    </div>
                  )}
                  {formData.institution && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Institution:</span>
                      <span className="font-bold text-slate-900">{formData.institution}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-slate-200">
                    <span className="text-slate-500 font-medium">Email:</span>
                    <span className="font-bold text-slate-900">{userEmail}</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
                <span className="text-emerald-500 text-lg">🎉</span>
                <div>
                  <p className="text-emerald-800 font-bold">You're almost ready!</p>
                  <p className="text-emerald-700 text-sm mt-1">
                    Complete your profile to start using AZ-Genes with features tailored to your needs.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Navigation */}
        <div className="border-t border-slate-100 px-8 py-6 bg-slate-50">
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-colors ${currentStep === 1
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-600 hover:bg-slate-200'
                }`}
            >
              Back
            </button>

            <div className="flex items-center space-x-3">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-emerald-600 transition-colors flex items-center space-x-2 shadow-lg shadow-emerald-500/20"
                >
                  <span>Complete Protocol</span>
                  <span>🎯</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;