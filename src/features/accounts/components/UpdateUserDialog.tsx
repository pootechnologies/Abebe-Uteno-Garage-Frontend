// components/UpdateUserDialog.js
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { patchUpdateUser } from "../api/user.ts";
import toast from "react-hot-toast";
import LoadingOverlay from "@/utils/LoadingOverlay";
import { t } from "i18next";

const roleOptions = [
  "Manager",
  "Assistant Manager",
  "Mechanic",
  "Electrician",
  "Paint Worker",
  "Technical Examiner",
  "Bat Lamera",
  "Store Manager",
  "Customer Officer",
  "Cashier",
  "Receptionist",
  "Field Operator",
];

const UpdateUserDialog = ({ user, isOpen, onClose }: any) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    role: user?.role || "Technical Examiner",
  });

  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (updatedData) => patchUpdateUser(user.id, updatedData),
    onSuccess: () => {
      toast.success("User updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
    },
    onError: (error) => {
      console.error("Error updating user:", error);
      toast.error("Error updating user.");
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
    };

    // Only include password if the user entered a new password
    if (formData.password.trim() !== "") {
      updatedData.password = formData.password;
    }

    mutate(updatedData);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("update_user")}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                {t("name")}
              </label>

              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                {t("email")}
              </label>

              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                {t("new_password")}
              </label>

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3 mt-6"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                {t("role")}
              </label>

              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {t(role.toLowerCase().replace(/\s/g, "_"))}
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                {t("cancel")}
              </Button>

              <Button
                type="submit"
                disabled={isPending}
                className="text-white bg-[#55B990] hover:bg-[#54ce9b] px-4 py-2 rounded-md"
              >
                {t("update")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {isPending && <LoadingOverlay />}
    </>
  );
};

export default UpdateUserDialog;