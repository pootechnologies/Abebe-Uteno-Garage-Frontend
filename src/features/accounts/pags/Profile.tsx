import { API_BASE_PROFILE, API_ENDPOINTS } from "@/utils/apiConfig.ts";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, User } from "lucide-react";
import axiosInstanceOld from "@/api/axiosOld.tsx";
import { t } from "i18next";
import { Spinner } from "@/components/ui/spinner";

const Profile = () => {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    role: "",
    age: "",
    gender: "",
    address: "",
    mobile: "",
    empNo: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [originalProfile, setOriginalProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("userInfo");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstanceOld.get(
          API_BASE_PROFILE + API_ENDPOINTS.PROFILE
        );
        const userData = response.data.data;
        const profileData = {
          fullName: userData.name || "",
          email: userData.email || "",
          role: userData.role || "",
          age: userData.age || 0,
          gender: userData.gender || "",
          address: userData.address || "",
          mobile: userData.mobile || "",
          empNo: userData.emp_no || "",
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        };
        setProfile(profileData);
        setOriginalProfile(profileData);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setProfile((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleRoleChange = (e) => {
    setProfile((prevState) => ({
      ...prevState,
      role: e.target.value,
    }));
  };

  const handleGenderChange = (e) => {
    setProfile((prevState) => ({
      ...prevState,
      gender: e.target.value,
    }));
  };

  const handleUpdateClick = () => {
    setIsEditing(true);
  };

  const handleUpdatePasswordClick = () => {
    setIsEditingPassword(true);
  };

  const handleSaveInformationClick = async () => {
    setIsLoading(true);
    try {
      const changedData = Object.keys(profile).reduce((acc, key) => {
        if (
          profile[key] !== originalProfile[key] &&
          key !== "oldPassword" &&
          key !== "newPassword" &&
          key !== "confirmPassword"
        ) {
          acc[key] = profile[key];
        }
        return acc;
      }, {});
      const response = await axiosInstanceOld.patch(
        API_BASE_PROFILE + API_ENDPOINTS.PROFILE,
        changedData
      );
      setOriginalProfile(profile);
      setIsEditing(false);
      toast.success("Profile information saved successfully!");
    } catch (error) {
      console.error("Error updating profile data:", error);
      toast.error("Failed to save profile information.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePasswordClick = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstanceOld.post(
        API_BASE_PROFILE + API_ENDPOINTS.CHANGEPASSWORD,
        {
          current_password: profile.oldPassword,
          new_password: profile.newPassword,
          confirm_password: profile.confirmPassword,
        }
      );
      setProfile((prevState) => ({
        ...prevState,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setIsEditingPassword(false);
      toast.success("Password changed successfully!");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.error || "Failed to change password.");
    } finally {
      setIsLoading(false);
    }
  };

  const femaleAvatarUrl =
    "https://static.vecteezy.com/system/resources/previews/019/896/012/large_2x/female-user-avatar-icon-in-flat-design-style-person-signs-illustration-png.png";
  const maleAvatarUrl =
    "https://static.vecteezy.com/system/resources/previews/019/896/008/large_2x/male-user-avatar-icon-in-flat-design-style-person-signs-illustration-png.png";

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-4xl mx-auto animate-in fade-in duration-700">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <User className="h-6 w-6" />
            </div>
            {t("profile")}
          </h2>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <div className="flex flex-col items-center space-y-5 sm:flex-row sm:space-y-0 sm:space-x-8 pb-8 border-b border-muted">
            <div className="relative">
              <img
                className="object-cover w-32 h-32 p-1 rounded-full ring-4 ring-emerald-500/20 bg-emerald-50 shadow-lg"
                src={profile.gender === "Female" ? femaleAvatarUrl : maleAvatarUrl}
                alt="Avatar"
              />
              <div className="absolute bottom-0 right-0 h-8 w-8 bg-emerald-500 rounded-full border-4 border-white dark:border-gray-900 shadow flex items-center justify-center">
                <div className="h-2.5 w-2.5 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex flex-col items-center sm:items-start space-y-2">
              <h3 className="text-2xl font-bold text-foreground">{profile.fullName || t("user_name")}</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                {profile.role || t("n_a")}
              </span>
            </div>
          </div>

          <div className="flex space-x-4 border-b border-muted">
            <button
              className={`pb-3 px-2 border-b-2 transition-all font-semibold ${
                activeTab === "userInfo"
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("userInfo")}
            >
              {t("user_information")}
            </button>
            <button
              className={`pb-3 px-2 border-b-2 transition-all font-semibold ${
                activeTab === "changePassword"
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("changePassword")}
            >
              {t("change_password")}
            </button>
          </div>

          <div className="pt-2">
            {activeTab === "userInfo" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="fullName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      {t("full_name")}
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      placeholder={t("full_name")}
                      className={`w-full h-11 px-3 rounded-xl transition-all outline-none ${
                        isEditing 
                          ? "bg-white dark:bg-gray-800 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20" 
                          : "bg-muted/50 border border-transparent text-muted-foreground cursor-not-allowed"
                      }`}
                      value={profile.fullName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      {t("email")}
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder={t("email")}
                      className={`w-full h-11 px-3 rounded-xl transition-all outline-none ${
                        isEditing 
                          ? "bg-white dark:bg-gray-800 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20" 
                          : "bg-muted/50 border border-transparent text-muted-foreground cursor-not-allowed"
                      }`}
                      value={profile.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  {/* Age */}
                  <div className="space-y-1.5">
                    <label htmlFor="age" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      {t("age")}
                    </label>
                    <input
                      type="number" onWheel={(event) => event.currentTarget.blur()}
                      id="age"
                      placeholder={t("age")}
                      className={`w-full h-11 px-3 rounded-xl transition-all outline-none ${
                        isEditing 
                          ? "bg-white dark:bg-gray-800 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20" 
                          : "bg-muted/50 border border-transparent text-muted-foreground cursor-not-allowed"
                      }`}
                      value={profile.age}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block">
                      {t("gender")}
                    </label>
                    <div className="flex items-center space-x-6 h-11 px-3">
                      <label className={`flex items-center cursor-pointer ${!isEditing ? "opacity-50 cursor-not-allowed" : ""}`}>
                        <input
                          type="radio"
                          id="male"
                          name="gender"
                          value="Male"
                          checked={profile.gender === "Male"}
                          onChange={handleGenderChange}
                          className="mr-2 text-emerald-600 focus:ring-emerald-500"
                          disabled={!isEditing}
                        />
                        <span className="text-sm font-medium">{t("male")}</span>
                      </label>
                      <label className={`flex items-center cursor-pointer ${!isEditing ? "opacity-50 cursor-not-allowed" : ""}`}>
                        <input
                          type="radio"
                          id="female"
                          name="gender"
                          value="Female"
                          checked={profile.gender === "Female"}
                          onChange={handleGenderChange}
                          className="mr-2 text-emerald-600 focus:ring-emerald-500"
                          disabled={!isEditing}
                        />
                        <span className="text-sm font-medium">{t("female")}</span>
                      </label>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="address" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      {t("address")}
                    </label>
                    <input
                      type="text"
                      id="address"
                      placeholder={t("address")}
                      className={`w-full h-11 px-3 rounded-xl transition-all outline-none ${
                        isEditing 
                          ? "bg-white dark:bg-gray-800 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20" 
                          : "bg-muted/50 border border-transparent text-muted-foreground cursor-not-allowed"
                      }`}
                      value={profile.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  {/* Mobile */}
                  <div className="space-y-1.5">
                    <label htmlFor="mobile" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      {t("phone")}
                    </label>
                    <input
                      type="text"
                      id="mobile"
                      placeholder={t("Phone_number")}
                      className={`w-full h-11 px-3 rounded-xl transition-all outline-none ${
                        isEditing 
                          ? "bg-white dark:bg-gray-800 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20" 
                          : "bg-muted/50 border border-transparent text-muted-foreground cursor-not-allowed"
                      }`}
                      value={profile.mobile}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  {/* Employee Number */}
                  <div className="space-y-1.5">
                    <label htmlFor="empNo" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      {t("employee_number")}
                    </label>
                    <input
                      type="text"
                      id="empNo"
                      placeholder={t("employee_number")}
                      className={`w-full h-11 px-3 rounded-xl transition-all outline-none ${
                        isEditing 
                          ? "bg-white dark:bg-gray-800 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20" 
                          : "bg-muted/50 border border-transparent text-muted-foreground cursor-not-allowed"
                      }`}
                      value={profile.empNo}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-muted">
                  {isEditing ? (
                    <button
                      type="button"
                      onClick={handleSaveInformationClick}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 py-3 font-semibold shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                    >
                      {t("save_information")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleUpdateClick}
                      className="bg-white dark:bg-gray-800 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl px-8 py-3 font-semibold transition-all active:scale-95"
                    >
                      {t("update")}
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeTab === "changePassword" && (
              <div className="max-w-md mx-auto space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Old Password */}
                <div className="space-y-1.5 relative">
                  <label htmlFor="oldPassword" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                    {t("old_password")}
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      id="oldPassword"
                      className={`w-full h-11 px-3 pr-10 rounded-xl transition-all outline-none ${
                        isEditingPassword 
                          ? "bg-white dark:bg-gray-800 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20" 
                          : "bg-muted/50 border border-transparent text-muted-foreground cursor-not-allowed"
                      }`}
                      value={profile.oldPassword}
                      onChange={handleInputChange}
                      disabled={!isEditingPassword}
                      required
                    />
                    <button
                      type="button"
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${!isEditingPassword ? "opacity-50 cursor-not-allowed" : "text-muted-foreground hover:text-emerald-600"} transition-colors`}
                      onClick={() => isEditingPassword && setShowOldPassword(!showOldPassword)}
                      disabled={!isEditingPassword}
                    >
                      {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5 relative">
                  <label htmlFor="newPassword" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                    {t("new_password")}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      className={`w-full h-11 px-3 pr-10 rounded-xl transition-all outline-none ${
                        isEditingPassword 
                          ? "bg-white dark:bg-gray-800 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20" 
                          : "bg-muted/50 border border-transparent text-muted-foreground cursor-not-allowed"
                      }`}
                      value={profile.newPassword}
                      onChange={handleInputChange}
                      disabled={!isEditingPassword}
                      required
                    />
                    <button
                      type="button"
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${!isEditingPassword ? "opacity-50 cursor-not-allowed" : "text-muted-foreground hover:text-emerald-600"} transition-colors`}
                      onClick={() => isEditingPassword && setShowNewPassword(!showNewPassword)}
                      disabled={!isEditingPassword}
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5 relative">
                  <label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                    {t("confirm_password")}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      className={`w-full h-11 px-3 pr-10 rounded-xl transition-all outline-none ${
                        isEditingPassword 
                          ? "bg-white dark:bg-gray-800 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20" 
                          : "bg-muted/50 border border-transparent text-muted-foreground cursor-not-allowed"
                      }`}
                      value={profile.confirmPassword}
                      onChange={handleInputChange}
                      disabled={!isEditingPassword}
                      required
                    />
                    <button
                      type="button"
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${!isEditingPassword ? "opacity-50 cursor-not-allowed" : "text-muted-foreground hover:text-emerald-600"} transition-colors`}
                      onClick={() => isEditingPassword && setShowConfirmPassword(!showConfirmPassword)}
                      disabled={!isEditingPassword}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  {isEditingPassword ? (
                    <button
                      type="button"
                      onClick={handleSavePasswordClick}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 py-3 font-semibold shadow-lg shadow-emerald-600/20 transition-all active:scale-95 w-full sm:w-auto"
                    >
                      {t("save_password")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleUpdatePasswordClick}
                      className="bg-white dark:bg-gray-800 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl px-8 py-3 font-semibold transition-all active:scale-95 w-full sm:w-auto"
                    >
                      {t("update")}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm z-50">
          <div className="bg-white p-4 rounded-xl shadow-xl flex items-center gap-3">
            <Spinner className="h-6 w-6 text-emerald-600" />
            <span className="font-semibold text-gray-700">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
