// api/vehicleAcceptance.ts
import axiosInstance from "@/api/axios";
import toast from "react-hot-toast";

// Define the structure of the vehicle acceptance data
export interface VehicleAcceptanceData {
  model?: string;
  ye_bale_nibret_sim?: string;
  shanci_kutir?: string;
  motor_kutir?: string;
  targa_kutir?: string;
  license_plate?: string;
  silk_kutir?: string;
  tin_kutir?: string;
  ye_fren_zeyt: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  ye_meri_zeyt: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  ye_motor_zeyt: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  ye_radiator: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  battery: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  zinab_metregya: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  maskerya: {
    left: boolean;
    right: boolean;
  };
  antenna: {
    left: boolean;
    right: boolean;
  };
  ferfango: {
    left: boolean;
    right: boolean;
  };
  ye_fit_mebrat: {
    left: boolean;
    right: boolean;
  };
  frecha_mebrat: {
    left: boolean;
    right: boolean;
  };
  ye_fit_targa: {
    left: boolean;
    right: boolean;
  };
  nifas_mekelakeya: {
    left: boolean;
    right: boolean;
  };
  spekiyo: {
    left: boolean;
    right: boolean;
  };
  ye_ber_ijeta: {
    left: boolean;
    right: boolean;
  };
  ika_mekelakeya: {
    left: boolean;
    right: boolean;
  };
  ye_sivat_kidan: {
    left: boolean;
    right: boolean;
  };
  ye_huala_targa: {
    left: boolean;
    right: boolean;
  };
  ye_huala_mebrat_birchiko: {
    left: boolean;
    right: boolean;
  };
  ye_ber_gomini_mestawat_lstic_frame: {
    left: boolean;
    right: boolean;
  };
  ye_fit_prawlit: {
    left: boolean;
    right: boolean;
  };
  ye_zinab_metregiya_ye_bilon_kidan: {
    left: boolean;
    right: boolean;
  };
  birjineri_bilon: {
    left: boolean;
    right: boolean;
  };
  ye_huala_prawlit_antsebaraki: {
    left: boolean;
    right: boolean;
  };
  ye_fit_igir_fren_lock: {
    left: boolean;
    right: boolean;
  };
  ye_huala_goma_libs: {
    left: boolean;
    right: boolean;
  };
  fortomegala: {
    left: boolean;
    right: boolean;
  };
  eskort_goma_mefcha: {
    left: boolean;
    right: boolean;
  };
  tiras: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  meterkosha: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  ye_welel_mintaf: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  ye_wember_libs: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  ye_wist_spekiyo: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  ye_wist_mebrat: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  tep: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  isat_adega_mekelakeya: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  mebrat_mabriya: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  zinab_metregiya_mebrat: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  nedaj: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  ye_tsehay_mekelakeya: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  ye_wist_ber_mekfecha: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  ye_mestewat_mawcha_mawreja: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  ye_fit_ye_kofen_amorzrater: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  ye_huala_ye_kofen_amorzrater: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  klaks: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  ye_wist_dashboard_kis_kulf: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  ye_kofen_gomini: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  ye_wuha_mercha: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  ye_ginbar_mestewat: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  goma?: "new" | "mid" | "old";
  kirk: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  goma_mefcha: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  eskort_goma: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  kolenet: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  ye_cherke_get: {
    have: boolean;
    dont_have: boolean;
    broken: boolean;
  };
  asrekabi_sim?: string;
  terekabi_sim?: string;
}

// Function to submit vehicle acceptance data
export const addVehicleAcceptance = async (
  vehicleAcceptanceData: VehicleAcceptanceData
) => {
  try {
    const response = await axiosInstance.post(
      "/api/garage/acceptance/",
      vehicleAcceptanceData
    );
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to submit vehicle acceptance.";
    toast.error(message);
    throw error;
  }
};

// Function to fetch vehicle acceptances with search
export const getVehicleAcceptances = async (
  page: number = 1,
  search: string | null = null
): Promise<{
  count: number;
  results: any[];
  next: string | null;
  previous: string | null;
}> => {
  try {
    const params: any = { page };
    if (search) {
      params.search = search; // Use 'search' as the parameter name
    }
    const response = await axiosInstance.get(
      `api/garage/acceptance/`,
      { params }
    );
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch vehicle acceptances.";
    toast.error(message);
    throw error;
  }
};


// Function to delete a vehicle acceptance
export const deleteVehicleAcceptance = async (id: number) => {
  try {
    const response = await axiosInstance.delete(`api/garage/acceptance/${id}/`);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to delete vehicle acceptance.";
    toast(message);
    throw error;
  }
};

export const getVehicleAcceptanceById = async (id: number) => {
  console.log(id);
  try {
    const response = await axiosInstance.get(`api/garage/acceptance/${id}/`);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch vehicle acceptance details.";
    toast.error(message);
    throw error;
  }
};

export const updateVehicleAcceptance = async (
  id: number,
  vehicleAcceptanceData: VehicleAcceptanceData
) => {
  console.log("IDDDD", id);
  try {
    const response = await axiosInstance.put(
      `/api/garage/acceptance/${id}/`,
      vehicleAcceptanceData
    );
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to update vehicle acceptance.";
    toast(message);
    throw error;
  }
};


export async function getAllCustomers() {
  try {
    const response = await axiosInstance.get("api/garage/customers/?include_all=True");
    return response?.data?.all_results; // { count: number, results: Customer[], next: string | null, previous: string | null }
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch customers. Please try again.";
    toast.error(message);
    throw error;
  }
}