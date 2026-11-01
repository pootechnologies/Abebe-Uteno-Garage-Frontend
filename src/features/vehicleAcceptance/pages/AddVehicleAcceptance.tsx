// @ts-nocheck
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-hot-toast";
import { Step, StepLabel, Stepper } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import { addVehicleAcceptance } from "../api/vehicleAcceptance";
import { t } from "i18next";
import { ClipboardCheck } from "lucide-react";
import Select from "react-select";

const emeraldSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    borderColor: state.isFocused ? '#10b981' : '#a7f3d0',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(16, 185, 129, 0.25)' : 'none',
    borderRadius: '0.375rem',
    minHeight: '2.5rem',
    fontSize: '0.875rem',
    transition: 'all 0.15s ease',
    '&:hover': { borderColor: '#10b981' },
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected ? '#10b981' : state.isFocused ? '#ecfdf5' : 'white',
    color: state.isSelected ? 'white' : '#1f2937',
    fontSize: '0.875rem',
    '&:active': { backgroundColor: '#059669' },
  }),
  placeholder: (base: any) => ({ ...base, color: '#9ca3af', fontSize: '0.875rem' }),
  singleValue: (base: any) => ({ ...base, fontSize: '0.875rem' }),
  menu: (base: any) => ({ ...base, borderRadius: '0.5rem', overflow: 'hidden', zIndex: 9999 }),
  menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
};

interface Vehicle {
  id: string | number;
  model: string;
  shanci_kutir?: string;
  motor_kutir?: string;
  license_plate?: string;
  customer: string | number;
}

interface Customer {
  id: string | number;
  name: string;
  tin_number?: string;
  phone?: string;
  organization?: string;
  address?: string;
  user?: string;
  email?: string;
}

// Zod Schema for Vehicle Acceptance
const vehicleAcceptanceSchema = z.object({
  model: z.string().min(1, "Model is required").max(100, "Model must be less than 100 characters"),
  ye_bale_nibret_sim: z
    .string()
    .min(1, "Customer Name is required")
    .max(100, "Customer Name must be less than 100 characters"),
  shanci_kutir: z
    .string()
    .max(100, "Shanci Kutir must be less than 100 characters")
    .optional(),
  motor_kutir: z
    .string()
    .max(100, "Motor Kutir must be less than 100 characters")
    .optional(),
  targa_kutir: z
    .string()
    .max(100, "Targa Kutir must be less than 100 characters")
    .optional(),
  license_plate: z
    .string()
    .max(100, "License plate must be less than 100 characters")
    .optional(),
  phone: z
    .string()
    .max(100, "Silk Kutir must be less than 100 characters")
    .optional(),
  tin_kutir: z
    .string()
    .max(100, "Tin Kutir must be less than 100 characters")
    .optional(),
  ye_fren_zeyt: z.boolean().default(false).optional(),
  ye_fren_zeyt_broken: z.boolean().default(false).optional(),
  ye_meri_zeyt: z.boolean().default(false).optional(),
  ye_meri_zeyt_broken: z.boolean().default(false).optional(),
  ye_motor_zeyt: z.boolean().default(false).optional(),
  ye_motor_zeyt_broken: z.boolean().default(false).optional(),
  ye_radiator: z.boolean().default(false).optional(),
  ye_radiator_broken: z.boolean().default(false).optional(),
  battery: z.boolean().default(false).optional(),
  battery_broken: z.boolean().default(false).optional(),
  zinab_metregya: z.boolean().default(false).optional(),
  zinab_metregya_broken: z.boolean().default(false).optional(),
  maskerya: z
    .object({
      have: z.boolean().default(false).optional(),
      dont_have: z.boolean().default(false).optional(),
      broken: z.boolean().default(false).optional(),
    })
    .optional(),
  antenna: z
    .object({
      have: z.boolean().default(false).optional(),
      dont_have: z.boolean().default(false).optional(),
      broken: z.boolean().default(false).optional(),
    })
    .optional(),
  ferfango_left: z.boolean().default(false).optional(),
  ferfango_right: z.boolean().default(false).optional(),
  ye_fit_mebrat_left: z.boolean().default(false).optional(),
  ye_fit_mebrat_right: z.boolean().default(false).optional(),
  frecha_mebrat_left: z.boolean().default(false).optional(),
  frecha_mebrat_right: z.boolean().default(false).optional(),
  ye_fit_targa: z
    .object({
      have: z.boolean().default(false).optional(),
      dont_have: z.boolean().default(false).optional(),
      broken: z.boolean().default(false).optional(),
    })
    .optional(),
  nifas_mekelakeya_left: z.boolean().default(false).optional(),
  nifas_mekelakeya_right: z.boolean().default(false).optional(),
  spekiyo_left: z.boolean().default(false).optional(),
  spekiyo_right: z.boolean().default(false).optional(),
  ye_ber_ijeta_left: z.boolean().default(false).optional(),
  ye_ber_ijeta_right: z.boolean().default(false).optional(),
  ika_mekelakeya: z
    .object({
      have: z.boolean().default(false).optional(),
      dont_have: z.boolean().default(false).optional(),
      broken: z.boolean().default(false).optional(),
    })
    .optional(),
  ye_sivat_kidan: z
    .object({
      have: z.boolean().default(false).optional(),
      dont_have: z.boolean().default(false).optional(),
      broken: z.boolean().default(false).optional(),
    })
    .optional(),
  ye_huala_targa: z
    .object({
      have: z.boolean().default(false).optional(),
      dont_have: z.boolean().default(false).optional(),
      broken: z.boolean().default(false).optional(),
    })
    .optional(),
  ye_huala_mebrat_birchiko: z
    .object({
      have: z.boolean().default(false).optional(),
      dont_have: z.boolean().default(false).optional(),
      broken: z.boolean().default(false).optional(),
    })
    .optional(),
  ye_ber_gomini_mestawat_lstic_frame: z
    .object({
      have: z.boolean().default(false).optional(),
      dont_have: z.boolean().default(false).optional(),
      broken: z.boolean().default(false).optional(),
    })
    .optional(),
  ye_fit_prawlit: z
    .object({
      have: z.boolean().default(false).optional(),
      dont_have: z.boolean().default(false).optional(),
      broken: z.boolean().default(false).optional(),
    })
    .optional(),
  ye_zinab_metregiya_ye_bilon_kidan_left: z.boolean().default(false).optional(),
  ye_zinab_metregiya_ye_bilon_kidan_right: z
    .boolean()
    .default(false)
    .optional(),
  birjineri_bilon: z
    .object({
      have: z.boolean().default(false).optional(),
      dont_have: z.boolean().default(false).optional(),
      broken: z.boolean().default(false).optional(),
    })
    .optional(),
  ye_huala_prawlit_antsebaraki: z
    .object({
      have: z.boolean().default(false).optional(),
      dont_have: z.boolean().default(false).optional(),
      broken: z.boolean().default(false).optional(),
    })
    .optional(),
  ye_fit_igir_fren_lock: z
    .object({
      have: z.boolean().default(false).optional(),
      dont_have: z.boolean().default(false).optional(),
      broken: z.boolean().default(false).optional(),
    })
    .optional(),
  ye_huala_goma_libs: z
    .object({
      have: z.boolean().default(false).optional(),
      dont_have: z.boolean().default(false).optional(),
      broken: z.boolean().default(false).optional(),
    })
    .optional(),
  fortomegala: z
    .object({
      have: z.boolean().default(false).optional(),
      dont_have: z.boolean().default(false).optional(),
      broken: z.boolean().default(false).optional(),
    })
    .optional(),
  eskort_goma_mefcha: z
    .object({
      have: z.boolean().default(false).optional(),
      dont_have: z.boolean().default(false).optional(),
      broken: z.boolean().default(false).optional(),
    })
    .optional(),
  tiras: z.boolean().default(false).optional(),
  tiras_broken: z.boolean().default(false).optional(),
  meterkosha: z.boolean().default(false).optional(),
  meterkosha_broken: z.boolean().default(false).optional(),
  ye_welel_mintaf: z.boolean().default(false).optional(),
  ye_welel_mintaf_broken: z.boolean().default(false).optional(),
  ye_wember_libs: z.boolean().default(false).optional(),
  ye_wember_libs_broken: z.boolean().default(false).optional(),
  ye_wist_spekiyo: z.boolean().default(false).optional(),
  ye_wist_spekiyo_broken: z.boolean().default(false).optional(),
  ye_wist_mebrat: z.boolean().default(false).optional(),
  ye_wist_mebrat_broken: z.boolean().default(false).optional(),
  tep: z.boolean().default(false).optional(),
  tep_broken: z.boolean().default(false).optional(),
  isat_adega_mekelakeya: z.boolean().default(false).optional(),
  isat_adega_mekelakeya_broken: z.boolean().default(false).optional(),
  mebrat_mabriya: z.boolean().default(false).optional(),
  mebrat_mabriya_broken: z.boolean().default(false).optional(),
  zinab_metregiya_mebrat: z.boolean().default(false).optional(),
  zinab_metregiya_mebrat_broken: z.boolean().default(false).optional(),
  nedaj: z
    .string()
    .max(100, "Nedaj must be less than 100 characters")
    .nullable()
    .optional(),
  ye_tsehay_mekelakeya: z.boolean().default(false).optional(),
  ye_tsehay_mekelakeya_broken: z.boolean().default(false).optional(),
  ye_wist_ber_mekfecha: z.boolean().default(false).optional(),
  ye_wist_ber_mekfecha_broken: z.boolean().default(false).optional(),
  ye_mestewat_mawcha_mawreja: z.boolean().default(false).optional(),
  ye_mestewat_mawcha_mawreja_broken: z.boolean().default(false).optional(),
  ye_fit_ye_kofen_amorzrater: z.boolean().default(false).optional(),
  ye_fit_ye_kofen_amorzrater_broken: z.boolean().default(false).optional(),
  ye_huala_ye_kofen_amorzrater: z.boolean().default(false).optional(),
  ye_huala_ye_kofen_amorzrater_broken: z.boolean().default(false).optional(),
  klaks: z.boolean().default(false).optional(),
  klaks_broken: z.boolean().default(false).optional(),
  ye_wist_dashboard_kis_kulf: z.boolean().default(false).optional(),
  ye_wist_dashboard_kis_kulf_broken: z.boolean().default(false).optional(),
  ye_kofen_gomini: z.boolean().default(false).optional(),
  ye_kofen_gomini_broken: z.boolean().default(false).optional(),
  ye_wuha_mercha: z.boolean().default(false).optional(),
  ye_wuha_mercha_broken: z.boolean().default(false).optional(),
  ye_ginbar_mestewat: z.boolean().default(false).optional(),
  ye_ginbar_mestewat_broken: z.boolean().default(false).optional(),
  goma: z
    .string()
    .max(100, "Goma must be less than 100 characters")
    .nullable()
    .optional(),
  kirk: z.boolean().default(false).optional(),
  kirk_broken: z.boolean().default(false).optional(),
  goma_mefcha: z.boolean().default(false).optional(),
  goma_mefcha_broken: z.boolean().default(false).optional(),
  eskort_goma: z.boolean().default(false).optional(),
  eskort_goma_broken: z.boolean().default(false).optional(),
  kolenet: z
    .string()
    .max(100, "Kolenet must be less than 100 characters")
    .nullable()
    .optional(),
  ye_cherke_get: z.boolean().default(false).optional(),
  ye_cherke_get_broken: z.boolean().default(false).optional(),
  antsebaraki: z
    .object({
      have: z.boolean().default(false).optional(),
      dont_have: z.boolean().default(false).optional(),
      broken: z.boolean().default(false).optional(),
    })
    .optional(),
  makomiya_mebrat_left: z.boolean().default(false).optional(),
  makomiya_mebrat_right: z.boolean().default(false).optional(),
  asrekabi_sim: z
    .string()
    .min(1, "Asrekabi Sim is required")
    .max(100, "Asrekabi Sim must be less than 100 characters"),
  terekabi_sim: z
    .string()
    .min(1, "Terekabi Sim is required")
    .max(100, "Terekabi Sim must be less than 100 characters"),
  ye_miwetabet_ken: z.preprocess(
    (val) => {
      if (!val || val === "" || val === null) return null;
      const date = new Date(val as string);
      return isNaN(date.getTime()) ? null : date;
    },
    z.date().nullable().optional(),
  ),
});

type VehicleAcceptanceFormData = z.infer<typeof vehicleAcceptanceSchema>;

const steps = [
  t("vehicle_info"),
  t("motor_part"),
  t("outer_part"),
  t("inner_part"),
  t("outer_condition"),
  t("footer_section"),
];

const AddVehicleAcceptance = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState([]);
  const queryClient = useQueryClient();

  const form = useForm<VehicleAcceptanceFormData>({
    resolver: zodResolver(vehicleAcceptanceSchema),
    defaultValues: {
      model: "",
      ye_bale_nibret_sim: "",
      shanci_kutir: "",
      motor_kutir: "",
      targa_kutir: "",
      license_plate: "",
      phone: "",
      tin_kutir: "",
      ye_fren_zeyt: false,
      ye_fren_zeyt_broken: false,
      ye_meri_zeyt: false,
      ye_meri_zeyt_broken: false,
      ye_motor_zeyt: false,
      ye_motor_zeyt_broken: false,
      ye_radiator: false,
      ye_radiator_broken: false,
      battery: false,
      battery_broken: false,
      zinab_metregya: false,
      zinab_metregya_broken: false,
      maskerya: { have: false, dont_have: false, broken: false },
      antenna: { have: false, dont_have: false, broken: false },
      ferfango_left: false,
      ferfango_right: false,
      ye_fit_mebrat_left: false,
      ye_fit_mebrat_right: false,
      frecha_mebrat_left: false,
      frecha_mebrat_right: false,
      ye_fit_targa: { have: false, dont_have: false, broken: false },
      nifas_mekelakeya_left: false,
      nifas_mekelakeya_right: false,
      spekiyo_left: false,
      spekiyo_right: false,
      ye_ber_ijeta_left: false,
      ye_ber_ijeta_right: false,
      ika_mekelakeya: { have: false, dont_have: false, broken: false },
      ye_sivat_kidan: { have: false, dont_have: false, broken: false },
      ye_huala_targa: { have: false, dont_have: false, broken: false },
      ye_huala_mebrat_birchiko: { have: false, dont_have: false, broken: false },
      ye_ber_gomini_mestawat_lstic_frame: { have: false, dont_have: false, broken: false },
      ye_fit_prawlit: { have: false, dont_have: false, broken: false },
      ye_zinab_metregiya_ye_bilon_kidan_left: false,
      ye_zinab_metregiya_ye_bilon_kidan_right: false,
      birjineri_bilon: { have: false, dont_have: false, broken: false },
      ye_huala_prawlit_antsebaraki: { have: false, dont_have: false, broken: false },
      ye_fit_igir_fren_lock: { have: false, dont_have: false, broken: false },
      ye_huala_goma_libs: { have: false, dont_have: false, broken: false },
      fortomegala: { have: false, dont_have: false, broken: false },
      eskort_goma_mefcha: { have: false, dont_have: false, broken: false },
      tiras: false,
      tiras_broken: false,
      meterkosha: false,
      meterkosha_broken: false,
      ye_welel_mintaf: false,
      ye_welel_mintaf_broken: false,
      ye_wember_libs: false,
      ye_wember_libs_broken: false,
      ye_wist_spekiyo: false,
      ye_wist_spekiyo_broken: false,
      ye_wist_mebrat: false,
      ye_wist_mebrat_broken: false,
      tep: false,
      tep_broken: false,
      isat_adega_mekelakeya: false,
      isat_adega_mekelakeya_broken: false,
      mebrat_mabriya: false,
      mebrat_mabriya_broken: false,
      zinab_metregiya_mebrat: false,
      zinab_metregiya_mebrat_broken: false,
      nedaj: null,
      ye_tsehay_mekelakeya: false,
      ye_tsehay_mekelakeya_broken: false,
      ye_wist_ber_mekfecha: false,
      ye_wist_ber_mekfecha_broken: false,
      ye_mestewat_mawcha_mawreja: false,
      ye_mestewat_mawcha_mawreja_broken: false,
      ye_fit_ye_kofen_amorzrater: false,
      ye_fit_ye_kofen_amorzrater_broken: false,
      ye_huala_ye_kofen_amorzrater: false,
      ye_huala_ye_kofen_amorzrater_broken: false,
      klaks: false,
      klaks_broken: false,
      ye_wist_dashboard_kis_kulf: false,
      ye_wist_dashboard_kis_kulf_broken: false,
      ye_kofen_gomini: false,
      ye_kofen_gomini_broken: false,
      ye_wuha_mercha: false,
      ye_wuha_mercha_broken: false,
      ye_ginbar_mestewat: false,
      ye_ginbar_mestewat_broken: false,
      goma: null,
      kirk: false,
      kirk_broken: false,
      goma_mefcha: false,
      goma_mefcha_broken: false,
      eskort_goma: false,
      eskort_goma_broken: false,
      kolenet: null,
      ye_cherke_get: false,
      ye_cherke_get_broken: false,
      makomiya_mebrat_left: false,
      makomiya_mebrat_right: false,
      antsebaraki: { have: false, dont_have: false, broken: false },
      asrekabi_sim: "",
      terekabi_sim: "",
      ye_miwetabet_ken: null,
    },
  });

  const selectedCustomerId = form.watch("ye_bale_nibret_sim");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axiosInstance.get(
          "api/garage/customers/?include_all=True",
        );
        setCustomers(response?.data?.all_results || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error(t("Failed to fetch customers."));
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axiosInstance.get("/api/garage/vehicles/");
        setVehicles(response?.data?.results || []);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        toast.error(t("Failed to fetch vehicles."));
      }
    };
    fetchVehicles();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("/auth/user/");
        setUsers(response.data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error(t("Failed to fetch users."));
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedCustomerId && customers) {
      // Find the customer ID from the selected organization
      const selectedCustomer = customers.find(
        (c) => (c.organization || c.name) === selectedCustomerId
      );
      const customerId = selectedCustomer?.id?.toString();
      
      if (customerId) {
        const filtered = vehicles.filter(
          (vehicle) => vehicle.customer == customerId,
        );
        setFilteredVehicles(filtered);
      } else {
        setFilteredVehicles(vehicles);
      }
    } else {
      setFilteredVehicles(vehicles);
      // Reset model and related fields when customer is cleared
      form.setValue("model", "");
      form.setValue("shanci_kutir", "");
      form.setValue("motor_kutir", "");
      form.setValue("targa_kutir", "");
      form.setValue("license_plate", "");
    }
  }, [selectedCustomerId, vehicles, customers, form]);

  const submitMutation = useMutation({
    mutationFn: addVehicleAcceptance,
    onSuccess: () => {
      toast.success(t("Vehicle Acceptance submitted successfully!"));
      queryClient.invalidateQueries({ queryKey: ["vehicleAcceptances"] });
      form.reset();
      setActiveStep(0);
    },
  });

  const handleNext = () => {
    const { ye_bale_nibret_sim, model } = form.getValues();
    if (activeStep === 0 && (!ye_bale_nibret_sim || !model)) {
      toast.error(t("Please fill in all required fields."));
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleStepClick = (stepIndex: number) => setActiveStep(stepIndex);

  const onSubmit = (values: VehicleAcceptanceFormData) => {
    const selectedVehicle = vehicles.find((v) => v.model === values.model);
    // Find the customer ID from the selected organization
    const selectedCustomer = customers.find(
      (c) => (c.organization || c.name) === values.ye_bale_nibret_sim
    );
    const transformedData = {
      customer: selectedCustomer?.id || values.ye_bale_nibret_sim,
      vehicle: selectedVehicle?.id,
      model: values.model,
      ye_bale_nibret_sim: values.ye_bale_nibret_sim,
      shanci_kutir: values.shanci_kutir,
      motor_kutir: values.motor_kutir,
      targa_kutir: values.targa_kutir,
      license_plate: values.license_plate,
      phone: values.phone,
      tin_kutir: values.tin_kutir,
      ye_fren_zeyt: {
        have: values.ye_fren_zeyt,
        dont_have: !values.ye_fren_zeyt,
        broken: values.ye_fren_zeyt_broken,
      },
      ye_meri_zeyt: {
        have: values.ye_meri_zeyt,
        dont_have: !values.ye_meri_zeyt,
        broken: values.ye_meri_zeyt_broken,
      },
      ye_motor_zeyt: {
        have: values.ye_motor_zeyt,
        dont_have: !values.ye_motor_zeyt,
        broken: values.ye_motor_zeyt_broken,
      },
      ye_radiator: {
        have: values.ye_radiator,
        dont_have: !values.ye_radiator,
        broken: values.ye_radiator_broken,
      },
      battery: {
        have: values.battery,
        dont_have: !values.battery,
        broken: values.battery_broken,
      },
      zinab_metregya: {
        have: values.zinab_metregya,
        dont_have: !values.zinab_metregya,
        broken: values.zinab_metregya_broken,
      },
      maskerya: values.maskerya,
      antenna: values.antenna,
      ferfango: {
        left: values.ferfango_left,
        right: values.ferfango_right,
      },
      ye_fit_mebrat: {
        left: values.ye_fit_mebrat_left,
        right: values.ye_fit_mebrat_right,
      },
      frecha_mebrat: {
        left: values.frecha_mebrat_left,
        right: values.frecha_mebrat_right,
      },
      ye_fit_targa: values.ye_fit_targa,
      nifas_mekelakeya: {
        left: values.nifas_mekelakeya_left,
        right: values.nifas_mekelakeya_right,
      },
      spekiyo: {
        left: values.spekiyo_left,
        right: values.spekiyo_right,
      },
      ye_ber_ijeta: {
        left: values.ye_ber_ijeta_left,
        right: values.ye_ber_ijeta_right,
      },
      ika_mekelakeya: values.ika_mekelakeya,
      ye_sivat_kidan: values.ye_sivat_kidan,
      ye_huala_targa: values.ye_huala_targa,
      ye_huala_mebrat_birchiko: values.ye_huala_mebrat_birchiko,
      ye_ber_gomini_mestawat_lstic_frame: values.ye_ber_gomini_mestawat_lstic_frame,
      ye_fit_prawlit: values.ye_fit_prawlit,
      ye_zinab_metregiya_ye_bilon_kidan: {
        left: values.ye_zinab_metregiya_ye_bilon_kidan_left,
        right: values.ye_zinab_metregiya_ye_bilon_kidan_right,
      },
      birjineri_bilon: values.birjineri_bilon,
      ye_huala_prawlit_antsebaraki: values.ye_huala_prawlit_antsebaraki,
      ye_fit_igir_fren_lock: values.ye_fit_igir_fren_lock,
      ye_huala_goma_libs: values.ye_huala_goma_libs,
      fortomegala: values.fortomegala,
      eskort_goma_mefcha: values.eskort_goma_mefcha,
      tiras: {
        have: values.tiras,
        dont_have: !values.tiras,
        broken: values.tiras_broken,
      },
      meterkosha: {
        have: values.meterkosha,
        dont_have: !values.meterkosha,
        broken: values.meterkosha_broken,
      },
      ye_welel_mintaf: {
        have: values.ye_welel_mintaf,
        dont_have: !values.ye_welel_mintaf,
        broken: values.ye_welel_mintaf_broken,
      },
      ye_wember_libs: {
        have: values.ye_wember_libs,
        dont_have: !values.ye_wember_libs,
        broken: values.ye_wember_libs_broken,
      },
      ye_wist_spekiyo: {
        have: values.ye_wist_spekiyo,
        dont_have: !values.ye_wist_spekiyo,
        broken: values.ye_wist_spekiyo_broken,
      },
      ye_wist_mebrat: {
        have: values.ye_wist_mebrat,
        dont_have: !values.ye_wist_mebrat,
        broken: values.ye_wist_mebrat_broken,
      },
      tep: {
        have: values.tep,
        dont_have: !values.tep,
        broken: values.tep_broken,
      },
      isat_adega_mekelakeya: {
        have: values.isat_adega_mekelakeya,
        dont_have: !values.isat_adega_mekelakeya,
        broken: values.isat_adega_mekelakeya_broken,
      },
      mebrat_mabriya: {
        have: values.mebrat_mabriya,
        dont_have: !values.mebrat_mabriya,
        broken: values.mebrat_mabriya_broken,
      },
      zinab_metregiya_mebrat: {
        have: values.zinab_metregiya_mebrat,
        dont_have: !values.zinab_metregiya_mebrat,
        broken: values.zinab_metregiya_mebrat_broken,
      },
      nedaj: values.nedaj || null,
      ye_tsehay_mekelakeya: {
        have: values.ye_tsehay_mekelakeya,
        dont_have: !values.ye_tsehay_mekelakeya,
        broken: values.ye_tsehay_mekelakeya_broken,
      },
      ye_wist_ber_mekfecha: {
        have: values.ye_wist_ber_mekfecha,
        dont_have: !values.ye_wist_ber_mekfecha,
        broken: values.ye_wist_ber_mekfecha_broken,
      },
      ye_mestewat_mawcha_mawreja: {
        have: values.ye_mestewat_mawcha_mawreja,
        dont_have: !values.ye_mestewat_mawcha_mawreja,
        broken: values.ye_mestewat_mawcha_mawreja_broken,
      },
      ye_fit_ye_kofen_amorzrater: {
        have: values.ye_fit_ye_kofen_amorzrater,
        dont_have: !values.ye_fit_ye_kofen_amorzrater,
        broken: values.ye_fit_ye_kofen_amorzrater_broken,
      },
      ye_huala_ye_kofen_amorzrater: {
        have: values.ye_huala_ye_kofen_amorzrater,
        dont_have: !values.ye_huala_ye_kofen_amorzrater,
        broken: values.ye_huala_ye_kofen_amorzrater_broken,
      },
      klaks: {
        have: values.klaks,
        dont_have: !values.klaks,
        broken: values.klaks_broken,
      },
      ye_wist_dashboard_kis_kulf: {
        have: values.ye_wist_dashboard_kis_kulf,
        dont_have: !values.ye_wist_dashboard_kis_kulf,
        broken: values.ye_wist_dashboard_kis_kulf_broken,
      },
      ye_kofen_gomini: {
        have: values.ye_kofen_gomini,
        dont_have: !values.ye_kofen_gomini,
        broken: values.ye_kofen_gomini_broken,
      },
      ye_wuha_mercha: {
        have: values.ye_wuha_mercha,
        dont_have: !values.ye_wuha_mercha,
        broken: values.ye_wuha_mercha_broken,
      },
      ye_ginbar_mestewat: {
        have: values.ye_ginbar_mestewat,
        dont_have: !values.ye_ginbar_mestewat,
        broken: values.ye_ginbar_mestewat_broken,
      },
      goma: values.goma || null,
      kirk: {
        have: values.kirk,
        dont_have: !values.kirk,
        broken: values.kirk_broken,
      },
      goma_mefcha: {
        have: values.goma_mefcha,
        dont_have: !values.goma_mefcha,
        broken: values.goma_mefcha_broken,
      },
      eskort_goma: {
        have: values.eskort_goma,
        dont_have: !values.eskort_goma,
        broken: values.eskort_goma_broken,
      },
      kolenet: values.kolenet || null,
      ye_cherke_get: {
        have: values.ye_cherke_get,
        dont_have: !values.ye_cherke_get,
        broken: values.ye_cherke_get_broken,
      },
      antsebaraki: values.antsebaraki,
      makomiya_mebrat: {
        left: values.makomiya_mebrat_left,
        right: values.makomiya_mebrat_right,
      },
      asrekabi_sim: values.asrekabi_sim,
      terekabi_sim: values.terekabi_sim,
      ye_miwetabet_ken: values.ye_miwetabet_ken
        ? values.ye_miwetabet_ken.toISOString().split("T")[0]
        : null,
    };
    submitMutation.mutate(transformedData);
  };

  const outerPartItems = [
    { name: "ferfango", label: t("ferfango") },
    { name: "ye_fit_mebrat", label: t("ye_fit_mebrat") },
    { name: "frecha_mebrat", label: t("frecha_mebrat") },
    { name: "makomiya_mebrat", label: t("makomiya_mebrat") },
    { name: "nifas_mekelakeya", label: t("nifas_mekelakeya") },
    { name: "spekiyo", label: t("spekiyo") },
    { name: "ye_ber_ijeta", label: t("ye_ber_ijeta") },
    {
      name: "ye_zinab_metregiya_ye_bilon_kidan",
      label: t("ye_zinab_metregiya_ye_bilon_kidan"),
    },
  ];

  const outerPartItemsSingle = [
    { name: "maskerya", label: t("maskerya") },
    { name: "antenna", label: t("antenna") },
    { name: "ye_fit_targa", label: t("ye_fit_targa") },
    { name: "ika_mekelakeya", label: t("ika_mekelakeya") },
    { name: "ye_sivat_kidan", label: t("ye_sivat_kidan") },
    { name: "ye_huala_targa", label: t("ye_huala_targa") },
    { name: "ye_huala_mebrat_birchiko", label: t("ye_huala_mebrat_birchiko") },
    {
      name: "ye_ber_gomini_mestawat_lstic_frame",
      label: t("ye_ber_gomini_mestawat_lstic_frame"),
    },
    { name: "ye_fit_prawlit", label: t("ye_fit_prawlit") },
    { name: "birjineri_bilon", label: t("birjineri_bilon") },
    {
      name: "ye_huala_prawlit_antsebaraki",
      label: t("ye_huala_prawlit_antsebaraki"),
    },
    { name: "ye_fit_igir_fren_lock", label: t("ye_fit_igir_fren_lock") },
    { name: "ye_huala_goma_libs", label: t("ye_huala_goma_libs") },
    { name: "fortomegala", label: t("fortomegala") },
    { name: "eskort_goma_mefcha", label: t("eskort_goma_mefcha") },
  ];

  const innerPartItems = [
    { name: "tiras", label: t("tiras") },
    { name: "meterkosha", label: t("meterkosha") },
    { name: "ye_welel_mintaf", label: t("ye_welel_mintaf") },
    { name: "ye_wember_libs", label: t("ye_wember_libs") },
    { name: "ye_wist_spekiyo", label: t("ye_wist_spekiyo") },
    { name: "ye_wist_mebrat", label: t("ye_wist_mebrat") },
    { name: "tep", label: t("tep") },
    { name: "isat_adega_mekelakeya", label: t("isat_adega_mekelakeya") },
    { name: "mebrat_mabriya", label: t("mebrat_mabriya") },
    { name: "zinab_metregiya_mebrat", label: t("zinab_metregiya_mebrat") },
    { name: "nedaj", label: t("nedaj") },
    { name: "ye_tsehay_mekelakeya", label: t("ye_tsehay_mekelakeya") },
    { name: "ye_wist_ber_mekfecha", label: t("ye_wist_ber_mekfecha") },
    {
      name: "ye_mestewat_mawcha_mawreja",
      label: t("ye_mestewat_mawcha_mawreja"),
    },
    {
      name: "ye_fit_ye_kofen_amorzrater",
      label: t("ye_fit_ye_kofen_amorzrater"),
    },
    {
      name: "ye_huala_ye_kofen_amorzrater",
      label: t("ye_huala_ye_kofen_amorzrater"),
    },
    { name: "klaks", label: t("klaks") },
    {
      name: "ye_wist_dashboard_kis_kulf",
      label: t("ye_wist_dashboard_kis_kulf"),
    },
    { name: "ye_kofen_gomini", label: t("ye_kofen_gomini") },
    { name: "ye_wuha_mercha", label: t("ye_wuha_mercha") },
  ];

  const outerConditionItems = [
    { name: "antsebaraki", label: t("antsebaraki") },
    { name: "ye_ginbar_mestewat", label: t("ye_ginbar_mestewat") },
    { name: "kirk", label: t("kirk") },
    { name: "goma_mefcha", label: t("goma_mefcha") },
    { name: "eskort_goma", label: t("eskort_goma") },
    { name: "ye_cherke_get", label: t("ye_cherke_get") },
  ];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-6xl mx-auto container mb-40">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            {t("add_vehicle_acceptance")}
          </h2>
        </div>
        <div className="p-6 md:p-8 relative z-10">
          <div className="overflow-x-auto pb-6 mb-6 border-b border-muted">
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label, index) => (
                <Step
                  key={label}
                  onClick={() => handleStepClick(index)}
                  style={{ cursor: "pointer" }}
                >
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {activeStep === 0 && (
                <>
                  <h4 className="text-base font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-2">{t("vehicle_info")}</h4>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Ye Bale Nibret Sim */}
                    <FormField
                      control={form.control}
                      name="ye_bale_nibret_sim"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("customer")}{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Select
                              styles={emeraldSelectStyles}
                              placeholder={t("select_a_customer")}
                              options={customers?.map((customer) => ({
                                value: customer.organization || customer.name,
                                label: customer.organization || customer.name,
                              }))}
                              value={
                                field.value
                                  ? { value: field.value, label: field.value }
                                  : null
                              }
                              onChange={(option: any) => {
                                const val = option?.value || "";
                                field.onChange(val);
                                const selectedCustomer = customers.find((c) => (c.organization || c.name) === val);
                                if (selectedCustomer) {
                                  form.setValue("tin_kutir", selectedCustomer.tin_number || "");
                                  form.setValue("phone", selectedCustomer.phone || "");
                                } else {
                                  // Clear customer-related fields when customer is deselected
                                  form.setValue("tin_kutir", "");
                                  form.setValue("phone", "");
                                }
                              }}
                              isClearable
                              isSearchable
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Model */}
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("model")} <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Select
                              styles={emeraldSelectStyles}
                              placeholder={t("select_a_model")}
                              options={filteredVehicles?.map((vehicle) => ({
                                value: vehicle.model,
                                label: vehicle.license_plate ? `${vehicle.model} - ${vehicle.license_plate}` : vehicle.model,
                              }))}
                              value={
                                field.value
                                  ? {
                                      value: field.value,
                                      label: filteredVehicles.find(v => v.model === field.value)?.license_plate 
                                        ? `${field.value} - ${filteredVehicles.find(v => v.model === field.value)?.license_plate}`
                                        : field.value
                                    }
                                  : null
                              }
                              onChange={(option: any) => {
                                const val = option?.value || "";
                                field.onChange(val);
                                const selectedVehicle = filteredVehicles.find((v) => v.model === val);
                                if (selectedVehicle) {
                                  form.setValue("shanci_kutir", selectedVehicle.shanci_kutir || "");
                                  form.setValue("motor_kutir", selectedVehicle.motor_kutir || "");
                                  form.setValue("targa_kutir", selectedVehicle.license_plate ? `${selectedVehicle.license_plate}` : "");
                                  form.setValue("license_plate", selectedVehicle.license_plate || "");
                                }
                              }}
                              isClearable
                              isSearchable
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Disabled Fields */}
                    <FormField
                      control={form.control}
                      name="shanci_kutir"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("shanci_kutir")}</FormLabel>
                          <FormControl>
                            <Input
                              className="p-5"
                              placeholder={t("shanci_kutir")}
                              {...field}
                              disabled
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="motor_kutir"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("motor_kutir")}</FormLabel>
                          <FormControl>
                            <Input
                              className="p-5"
                              placeholder={t("motor_kutir")}
                              {...field}
                              disabled
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="targa_kutir"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("targa_kutir")}</FormLabel>
                          <FormControl>
                            <Input
                              className="p-5"
                              placeholder={t("targa_kutir")}
                              value={field.value || ""}
                              disabled
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="license_plate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("license_plate")}</FormLabel>
                          <FormControl>
                            <Input
                              className="p-5"
                              placeholder={t("license_plate")}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("silk_kutir")}</FormLabel>
                          <FormControl>
                            <Input
                              className="p-5"
                              placeholder={t("silk_kutir")}
                              {...field}
                              disabled
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tin_kutir"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("tin_kutir")}</FormLabel>
                          <FormControl>
                            <Input
                              className="p-5"
                              placeholder={t("tin_kutir")}
                              {...field}
                              disabled
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="mt-8 flex items-center justify-end gap-4 pt-6 border-t border-muted">
                    <Button
                      type="button"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                      onClick={handleNext}
                    >
                      {t("next")}
                    </Button>
                  </div>
                </>
              )}
              {activeStep === 1 && (
                <div className="space-y-4">
                  <h4 className="text-base font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-2">{t("motor_part")}</h4>
                  {[
                    { name: "ye_fren_zeyt", label: t("ye_fren_zeyt") },
                    { name: "ye_meri_zeyt", label: t("ye_meri_zeyt") },
                    { name: "ye_motor_zeyt", label: t("ye_motor_zeyt") },
                    { name: "ye_radiator", label: t("ye_radiator") },
                    { name: "battery", label: t("battery") },
                    { name: "zinab_metregya", label: t("zinab_metregya") },
                  ].map((item) => (
                    <FormField
                      key={item.name}
                      control={form.control}
                      name={item.name as keyof VehicleAcceptanceFormData}
                      render={({ field }) => (
                        <FormItem className="space-y-2 bg-white dark:bg-gray-800/60 border border-emerald-100 dark:border-emerald-900/40 rounded-xl px-5 py-4 shadow-sm">
                          <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">{item.label}</FormLabel>
                          <div className="flex items-center gap-6">
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value === true}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange(true);
                                      form.setValue(`${item.name}_broken`, false);
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {t("tekikel")}
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value === false}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange(false);
                                      form.setValue(`${item.name}_broken`, false);
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {t("tekikel_yalhone")}
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={form.watch(`${item.name}_broken`)}
                                  onCheckedChange={(checked) =>
                                    form.setValue(`${item.name}_broken`, checked)
                                  }
                                  disabled={field.value === false}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {t("yetebelashe")}
                              </FormLabel>
                            </FormItem>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                  <div className="mt-8 flex items-center justify-end gap-4 pt-6 border-t border-muted">
                    <Button type="button" onClick={handleBack} variant="outline" className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl px-8 transition-all">
                      {t("back")}
                    </Button>
                    <Button
                      type="button"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                      onClick={handleNext}
                    >
                      {t("next")}
                    </Button>
                  </div>
                </div>
              )}
              {activeStep === 2 && (
                <div className="space-y-4">
                  <h4 className="text-base font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-2">{t("outer_part")}</h4>
                  {outerPartItemsSingle.map((item) => (
                    <FormField
                      key={item.name}
                      control={form.control}
                      name={item.name as keyof VehicleAcceptanceFormData}
                      render={({ field }) => (
                        <FormItem className="space-y-2 bg-white dark:bg-gray-800/60 border border-emerald-100 dark:border-emerald-900/40 rounded-xl px-5 py-4 shadow-sm">
                          <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">{item.label}</FormLabel>
                          <div className="flex items-center gap-6">
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.have}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      form.setValue(item.name as keyof VehicleAcceptanceFormData, {
                                        have: true,
                                        dont_have: false,
                                        broken: false,
                                      });
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {t("tekikel")}
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.dont_have}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      form.setValue(item.name as keyof VehicleAcceptanceFormData, {
                                        have: false,
                                        dont_have: true,
                                        broken: false,
                                      });
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {t("tekikel_yalhone")}
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.broken}
                                  onCheckedChange={(checked) => {
                                    form.setValue(item.name as keyof VehicleAcceptanceFormData, {
                                      have: true,
                                      dont_have: false,
                                      broken: checked,
                                    });
                                  }}
                                  disabled={!field.value?.have}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {t("yetebelashe")}
                              </FormLabel>
                            </FormItem>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                  {outerPartItems.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between bg-white dark:bg-gray-800/60 border border-emerald-100 dark:border-emerald-900/40 rounded-xl px-5 py-3 shadow-sm"
                    >
                      <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[180px]">
                        {item.label}
                      </FormLabel>
                      <div className="flex gap-6">
                        <FormField
                          control={form.control}
                          name={
                            `${item.name}_left` as keyof VehicleAcceptanceFormData
                          }
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {t("left")}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={
                            `${item.name}_right` as keyof VehicleAcceptanceFormData
                          }
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {t("right")}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="mt-8 flex items-center justify-end gap-4 pt-6 border-t border-muted">
                    <Button type="button" onClick={handleBack} variant="outline" className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl px-8 transition-all">
                      {t("back")}
                    </Button>
                    <Button
                      type="button"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                      onClick={handleNext}
                    >
                      {t("next")}
                    </Button>
                  </div>
                </div>
              )}
              {activeStep === 3 && (
                <div className="space-y-4">
                  <h4 className="text-base font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-2">{t("inner_part")}</h4>
                  {innerPartItems.map((item) => {
                    if (item.name === "nedaj") {
                      // Render nedaj as an input field
                      return (
                        <FormField
                          control={form.control}
                          name="nedaj"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("nedaj")}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t("enter_nedaj_condition")}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      );
                    } else {
                      // Render other items as checkboxes
                      return (
                        <FormField
                          key={item.name}
                          control={form.control}
                          name={item.name as keyof VehicleAcceptanceFormData}
                          render={({ field }) => (
                            <FormItem className="space-y-2 bg-white dark:bg-gray-800/60 border border-emerald-100 dark:border-emerald-900/40 rounded-xl px-5 py-4 shadow-sm">
                              <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">{item.label}</FormLabel>
                              <div className="flex items-center gap-6">
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value === true}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          field.onChange(true);
                                          form.setValue(
                                            `${item.name}_broken`,
                                            false,
                                          );
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {t("tekikel")}
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value === false}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          field.onChange(false);
                                          form.setValue(
                                            `${item.name}_broken`,
                                            false,
                                          );
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {t("tekikel_yalhone")}
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={form.watch(`${item.name}_broken`)}
                                      onCheckedChange={(checked) =>
                                        form.setValue(
                                          `${item.name}_broken`,
                                          checked,
                                        )
                                      }
                                      disabled={field.value === false}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {t("yetebelashe")}
                                  </FormLabel>
                                </FormItem>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      );
                    }
                  })}
                  <div className="mt-8 flex items-center justify-end gap-4 pt-6 border-t border-muted">
                    <Button type="button" onClick={handleBack} variant="outline" className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl px-8 transition-all">
                      {t("back")}
                    </Button>
                    <Button
                      type="button"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                      onClick={handleNext}
                    >
                      {t("next")}
                    </Button>
                  </div>
                </div>
              )}

              {activeStep === 4 && (
                <div className="space-y-4">
                  <h4 className="text-base font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-2">{t("outer_condition")}</h4>
                  {/* Goma Select Field */}
                  <FormField
                    control={form.control}
                    name="goma"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("goma")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("enter_goma_condition")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Kolenet Field */}
                  <FormField
                    control={form.control}
                    name="kolenet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("kolenet")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("enter_kolenet_condition")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Antsebaraki Field */}
                  <FormField
                    control={form.control}
                    name="antsebaraki"
                    render={({ field }) => (
                      <FormItem className="space-y-2 bg-white dark:bg-gray-800/60 border border-emerald-100 dark:border-emerald-900/40 rounded-xl px-5 py-4 shadow-sm">
                        <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t("antsebaraki")}</FormLabel>
                        <div className="flex items-center gap-6">
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.have}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    form.setValue("antsebaraki", {
                                      have: true,
                                      dont_have: false,
                                      broken: false,
                                    });
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {t("tekikel")}
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.dont_have}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    form.setValue("antsebaraki", {
                                      have: false,
                                      dont_have: true,
                                      broken: false,
                                    });
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {t("tekikel_yalhone")}
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.broken}
                                onCheckedChange={(checked) => {
                                  form.setValue("antsebaraki", {
                                    have: true,
                                    dont_have: false,
                                    broken: checked,
                                  });
                                }}
                                disabled={!field.value?.have}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {t("yetebelashe")}
                            </FormLabel>
                          </FormItem>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Kirk Field */}
                  <FormField
                    control={form.control}
                    name="kirk"
                    render={({ field }) => (
                      <FormItem className="space-y-2 bg-white dark:bg-gray-800/60 border border-emerald-100 dark:border-emerald-900/40 rounded-xl px-5 py-4 shadow-sm">
                        <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t("kirk")}</FormLabel>
                        <div className="flex items-center gap-6">
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value === true}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange(true);
                                    form.setValue("kirk_broken", false);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {t("tekikel")}
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value === false}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange(false);
                                    form.setValue("kirk_broken", false);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {t("tekikel_yalhone")}
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={form.watch("kirk_broken")}
                                onCheckedChange={(checked) =>
                                  form.setValue("kirk_broken", checked)
                                }
                                disabled={field.value === false}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {t("yetebelashe")}
                            </FormLabel>
                          </FormItem>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Goma Mefcha Field */}
                  <FormField
                    control={form.control}
                    name="goma_mefcha"
                    render={({ field }) => (
                      <FormItem className="space-y-2 bg-white dark:bg-gray-800/60 border border-emerald-100 dark:border-emerald-900/40 rounded-xl px-5 py-4 shadow-sm">
                        <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t("goma_mefcha")}</FormLabel>
                        <div className="flex items-center gap-6">
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value === true}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange(true);
                                    form.setValue("goma_mefcha_broken", false);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {t("tekikel")}
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value === false}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange(false);
                                    form.setValue("goma_mefcha_broken", false);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {t("tekikel_yalhone")}
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={form.watch("goma_mefcha_broken")}
                                onCheckedChange={(checked) =>
                                  form.setValue("goma_mefcha_broken", checked)
                                }
                                disabled={field.value === false}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {t("yetebelashe")}
                            </FormLabel>
                          </FormItem>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Eskort Goma Field */}
                  <FormField
                    control={form.control}
                    name="eskort_goma"
                    render={({ field }) => (
                      <FormItem className="space-y-2 bg-white dark:bg-gray-800/60 border border-emerald-100 dark:border-emerald-900/40 rounded-xl px-5 py-4 shadow-sm">
                        <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t("eskort_goma")}</FormLabel>
                        <div className="flex items-center gap-6">
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value === true}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange(true);
                                    form.setValue("eskort_goma_broken", false);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {t("tekikel")}
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value === false}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange(false);
                                    form.setValue("eskort_goma_broken", false);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {t("tekikel_yalhone")}
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={form.watch("eskort_goma_broken")}
                                onCheckedChange={(checked) =>
                                  form.setValue("eskort_goma_broken", checked)
                                }
                                disabled={field.value === false}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {t("yetebelashe")}
                            </FormLabel>
                          </FormItem>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Kolenet Field */}
                  <FormField
                    control={form.control}
                    name="kolenet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("kolenet")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("enter_kolenet_condition")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Ye Cherke Get Field */}
                  <FormField
                    control={form.control}
                    name="ye_cherke_get"
                    render={({ field }) => (
                      <FormItem className="space-y-2 bg-white dark:bg-gray-800/60 border border-emerald-100 dark:border-emerald-900/40 rounded-xl px-5 py-4 shadow-sm">
                        <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t("ye_cherke_get")}</FormLabel>
                        <div className="flex items-center gap-6">
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value === true}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange(true);
                                    form.setValue("ye_cherke_get_broken", false);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {t("tekikel")}
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value === false}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange(false);
                                    form.setValue("ye_cherke_get_broken", false);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {t("tekikel_yalhone")}
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={form.watch("ye_cherke_get_broken")}
                                onCheckedChange={(checked) =>
                                  form.setValue("ye_cherke_get_broken", checked)
                                }
                                disabled={field.value === false}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {t("yetebelashe")}
                            </FormLabel>
                          </FormItem>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Ye Ginbar Mestewat Field */}
                  <FormField
                    control={form.control}
                    name="ye_ginbar_mestewat"
                    render={({ field }) => (
                      <FormItem className="space-y-2 bg-white dark:bg-gray-800/60 border border-emerald-100 dark:border-emerald-900/40 rounded-xl px-5 py-4 shadow-sm">
                        <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t("ye_ginbar_mestewat")}</FormLabel>
                        <div className="flex items-center gap-6">
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value === true}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange(true);
                                    form.setValue(
                                      "ye_ginbar_mestewat_broken",
                                      false,
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {t("tekikel")}
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value === false}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange(false);
                                    form.setValue(
                                      "ye_ginbar_mestewat_broken",
                                      false,
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {t("tekikel_yalhone")}
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={form.watch("ye_ginbar_mestewat_broken")}
                                onCheckedChange={(checked) =>
                                  form.setValue(
                                    "ye_ginbar_mestewat_broken",
                                    checked,
                                  )
                                }
                                disabled={field.value === false}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {t("yetebelashe")}
                            </FormLabel>
                          </FormItem>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Navigation Buttons */}
                  <div className="mt-8 flex items-center justify-end gap-4 pt-6 border-t border-muted">
                    <Button type="button" onClick={handleBack} variant="outline" className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl px-8 transition-all">
                      {t("back")}
                    </Button>
                    <Button
                      type="button"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                      onClick={handleNext}
                    >
                      {t("next")}
                    </Button>
                  </div>
                </div>
              )}
              {activeStep === 5 && (
                <div className="space-y-4">
                  <h4 className="text-base font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-2">{t("footer_section")}</h4>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="terekabi_sim"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("terekabi_sim")}{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Select
                              styles={emeraldSelectStyles}
                              placeholder={t("select_a_user")}
                              options={users?.map((user) => ({
                                value: user.id.toString(),
                                label: user.name,
                              }))}
                              value={
                                field.value
                                  ? { value: field.value, label: users.find((u) => u.id == field.value)?.name || "" }
                                  : null
                              }
                              onChange={(option: any) => field.onChange(option?.value || "")}
                              isClearable
                              isSearchable
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="asrekabi_sim"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("asrekabi_sim")}{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Select
                              styles={emeraldSelectStyles}
                              placeholder={t("select_a_user")}
                              options={customers?.map((customer) => ({
                                value: customer.id.toString(),
                                label: customer.name,
                              }))}
                              value={
                                field.value
                                  ? { value: field.value, label: customers.find((c) => c.id == field.value)?.name || "" }
                                  : null
                              }
                              onChange={(option: any) => field.onChange(option?.value || "")}
                              isClearable
                              isSearchable
                              menuPortalTarget={document.body}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ye_miwetabet_ken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("ye_miwetabet_ken")}</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              value={
                                field.value
                                  ? field.value.toISOString().split("T")[0]
                                  : ""
                              }
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? new Date(e.target.value) : null,
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="mt-8 flex items-center justify-end gap-4 pt-6 border-t border-muted">
                    <Button type="button" onClick={handleBack} variant="outline" className="border-muted-foreground/20 text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 rounded-xl px-8 transition-all">
                      {t("back")}
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitMutation.isPending}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                    >
                      {submitMutation.isPending ? t("submitting") : t("submit")}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AddVehicleAcceptance;
