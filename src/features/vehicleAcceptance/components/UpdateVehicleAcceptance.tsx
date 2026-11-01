// @ts-nocheck

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Step, StepLabel, Stepper } from "@mui/material";
import { Spinner } from "@/components/ui/spinner.tsx";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getVehicleAcceptanceById,
  updateVehicleAcceptance,
} from "../api/vehicleAcceptance";
import { useNavigate, useParams } from "react-router-dom";
import { ClipboardCheck } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { t } from "i18next";
import axiosInstance from "@/api/axios";
import { Input } from "@/components/ui/input";
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

// Zod Schema for Vehicle Acceptance with broken fields
const vehicleAcceptanceSchema = z.object({
  customer: z
    .string()
    .min(1, "Customer is required")
    .max(100, "Customer must be less than 100 characters")
    .optional(),
  vehicle: z
    .string()
    .min(1, "Vehicle is required")
    .max(100, "Vehicle must be less than 100 characters")
    .optional(),
  customer_name: z
    .string()
    .max(100, "Customer name must be less than 100 characters")
    .optional(),
  customer_phone: z
    .string()
    .max(100, "Customer phone must be less than 100 characters")
    .optional(),
  customer_tin_number: z
    .string()
    .max(100, "Customer TIN must be less than 100 characters")
    .optional(),
  vehicle_model: z
    .string()
    .min(1, "Vehicle model is required")
    .max(100, "Vehicle model must be less than 100 characters")
    .optional(),
  vehicle_shanci_kutir: z
    .string()
    .max(100, "Shanci Kutir must be less than 100 characters")
    .optional(),
  vehicle_motor_kutir: z
    .string()
    .max(100, "Motor Kutir must be less than 100 characters")
    .optional(),
  vehicle_targa_kutir: z
    .string()
    .max(100, "Targa Kutir must be less than 100 characters")
    .optional(),
  ken: z.string().optional(),
  ye_fren_zeyt: z.boolean().default(false),
  ye_fren_zeyt_broken: z.boolean().default(false),
  ye_meri_zeyt: z.boolean().default(false),
  ye_meri_zeyt_broken: z.boolean().default(false),
  ye_motor_zeyt: z.boolean().default(false),
  ye_motor_zeyt_broken: z.boolean().default(false),
  ye_radiator: z.boolean().default(false),
  ye_radiator_broken: z.boolean().default(false),
  battery: z.boolean().default(false),
  battery_broken: z.boolean().default(false),
  zinab_metregya: z.boolean().default(false),
  zinab_metregya_broken: z.boolean().default(false),
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
  ferfango_left: z.boolean().default(false),
  ferfango_right: z.boolean().default(false),
  ye_fit_mebrat_left: z.boolean().default(false),
  ye_fit_mebrat_right: z.boolean().default(false),
  frecha_mebrat_left: z.boolean().default(false),
  frecha_mebrat_right: z.boolean().default(false),
  ye_fit_targa: z
    .object({
      have: z.boolean().default(false).optional(),
      dont_have: z.boolean().default(false).optional(),
      broken: z.boolean().default(false).optional(),
    })
    .optional(),
  nifas_mekelakeya_left: z.boolean().default(false),
  nifas_mekelakeya_right: z.boolean().default(false),
  spekiyo_left: z.boolean().default(false),
  spekiyo_right: z.boolean().default(false),
  ye_ber_ijeta_left: z.boolean().default(false),
  ye_ber_ijeta_right: z.boolean().default(false),
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
  ye_zinab_metregiya_ye_bilon_kidan_left: z.boolean().default(false),
  ye_zinab_metregiya_ye_bilon_kidan_right: z.boolean().default(false),
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
  tiras: z.boolean().default(false),
  tiras_broken: z.boolean().default(false),
  meterkosha: z.boolean().default(false),
  meterkosha_broken: z.boolean().default(false),
  ye_welel_mintaf: z.boolean().default(false),
  ye_welel_mintaf_broken: z.boolean().default(false),
  ye_wember_libs: z.boolean().default(false),
  ye_wember_libs_broken: z.boolean().default(false),
  ye_wist_spekiyo: z.boolean().default(false),
  ye_wist_spekiyo_broken: z.boolean().default(false),
  ye_wist_mebrat: z.boolean().default(false),
  ye_wist_mebrat_broken: z.boolean().default(false),
  tep: z.boolean().default(false),
  tep_broken: z.boolean().default(false),
  isat_adega_mekelakeya: z.boolean().default(false),
  isat_adega_mekelakeya_broken: z.boolean().default(false),
  mebrat_mabriya: z.boolean().default(false),
  mebrat_mabriya_broken: z.boolean().default(false),
  zinab_metregiya_mebrat: z.boolean().default(false),
  zinab_metregiya_mebrat_broken: z.boolean().default(false),
  nedaj: z
    .string()
    .max(100, "Nedaj must be less than 100 characters")
    .nullable()
    .optional(),
  ye_tsehay_mekelakeya: z.boolean().default(false),
  ye_tsehay_mekelakeya_broken: z.boolean().default(false),
  ye_wist_ber_mekfecha: z.boolean().default(false),
  ye_wist_ber_mekfecha_broken: z.boolean().default(false),
  ye_mestewat_mawcha_mawreja: z.boolean().default(false),
  ye_mestewat_mawcha_mawreja_broken: z.boolean().default(false),
  ye_fit_ye_kofen_amorzrater: z.boolean().default(false),
  ye_fit_ye_kofen_amorzrater_broken: z.boolean().default(false),
  ye_huala_ye_kofen_amorzrater: z.boolean().default(false),
  ye_huala_ye_kofen_amorzrater_broken: z.boolean().default(false),
  klaks: z.boolean().default(false),
  klaks_broken: z.boolean().default(false),
  ye_wist_dashboard_kis_kulf: z.boolean().default(false),
  ye_wist_dashboard_kis_kulf_broken: z.boolean().default(false),
  ye_kofen_gomini: z.boolean().default(false),
  ye_kofen_gomini_broken: z.boolean().default(false),
  ye_wuha_mercha: z.boolean().default(false),
  ye_wuha_mercha_broken: z.boolean().default(false),
  ye_ginbar_mestewat: z.boolean().default(false),
  ye_ginbar_mestewat_broken: z.boolean().default(false),
  goma: z.string().max(100, "Goma must be less than 100 characters").optional(),
  kirk: z.boolean().default(false),
  kirk_broken: z.boolean().default(false),
  goma_mefcha: z.boolean().default(false),
  goma_mefcha_broken: z.boolean().default(false),
  eskort_goma: z.boolean().default(false),
  eskort_goma_broken: z.boolean().default(false),
  kolenet: z
    .string()
    .max(100, "Kolenet must be less than 100 characters")
    .nullable()
    .optional(),
  ye_cherke_get: z.boolean().default(false),
  ye_cherke_get_broken: z.boolean().default(false),
  asrekabi_sim: z
    .string()
    .min(1, "Asrekabi Sim is required")
    .max(100, "Asrekabi Sim must be less than 100 characters")
    .optional(),
  asrekabi_name: z
    .string()
    .max(100, "Asrekabi name must be less than 100 characters")
    .optional(),
  terekabi_sim: z
    .string()
    .min(1, "Terekabi Sim is required")
    .max(100, "Terekabi Sim must be less than 100 characters")
    .optional(),
  terekabi_name: z
    .string()
    .max(100, "Terekabi name must be less than 100 characters")
    .optional(),
  firma: z.string().optional().nullable(),
  ken_footer: z.string().optional(),
  ken_2: z.string().optional(),
  ye_miwetabet_ken: z.string().nullable().optional(),
  makomiya_mebrat_left: z.boolean().default(false).optional(),
  makomiya_mebrat_right: z.boolean().default(false).optional(),
  antsebaraki: z
    .object({
      have: z.boolean().default(false).optional(),
      dont_have: z.boolean().default(false).optional(),
      broken: z.boolean().default(false).optional(),
    })
    .optional(),
});

type VehicleAcceptanceFormData = z.infer<typeof vehicleAcceptanceSchema>;

const steps = [
  t("vehicle_information"),
  t("motor_part"),
  t("outer_part"),
  t("inner_part"),
  t("outer_condition"),
  t("footer_section"),
];

export const UpdateVehicleAcceptance = () => {
  const { id } = useParams<{ id: string }>();
  const [activeStep, setActiveStep] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [shanciKutirs, setShanciKutirs] = useState([]);
  const [motorKutirs, setMotorKutirs] = useState([]);
  const [targaKutirs, setTargaKutirs] = useState([]);
  const [tinKutirs, setTinKutirs] = useState([]);
  const [phones, setPhones] = useState([]);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: vehicleAcceptance, isLoading } = useQuery({
    queryKey: ["vehicleAcceptance", id],
    queryFn: () => getVehicleAcceptanceById(Number(id)),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const form = useForm<VehicleAcceptanceFormData>({
    resolver: zodResolver(vehicleAcceptanceSchema),
  });

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axiosInstance.get("api/garage/customers/");
        setCustomers(response?.data?.results);
        const tins = response?.data?.results
          .map((c) => c.tin_number)
          .filter(Boolean);
        const phones = response?.data?.results
          .map((c) => c.phone)
          .filter(Boolean);
        setTinKutirs([...new Set(tins)]);
        setPhones([...new Set(phones)]);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axiosInstance.get("api/garage/vehicles/");
        setVehicles(response?.data?.results);
        const shancis = response?.data?.results
          .map((v) => v.shanci_kutir)
          .filter(Boolean);
        const motors = response?.data?.results
          .map((v) => v.motor_kutir)
          .filter(Boolean);
        const targas = response?.data?.results
          .map((v) => v.license_plate)
          .filter(Boolean);
        setShanciKutirs([...new Set(shancis)]);
        setMotorKutirs([...new Set(motors)]);
        setTargaKutirs([...new Set(targas)]);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    };
    fetchVehicles();
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("auth/user/");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const selectedCustomerId = form.watch("customer");

  // Filter vehicles by selected customer
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
    }
  }, [selectedCustomerId, vehicles, customers]);

  // Reset form with fetched data
  useEffect(() => {
    if (vehicleAcceptance) {
      form.reset({
        customer: vehicleAcceptance.customer?.toString() || "",
        vehicle: vehicleAcceptance.vehicle?.toString() || "",
        customer_name: vehicleAcceptance.customer_name || "",
        customer_phone: vehicleAcceptance.customer_phone || "",
        customer_tin_number: vehicleAcceptance.customer_tin_number || "",
        vehicle_model: vehicleAcceptance.vehicle_model || "",
        vehicle_shanci_kutir: vehicleAcceptance.vehicle_shanci_kutir || "",
        vehicle_motor_kutir: vehicleAcceptance.vehicle_motor_kutir || "",
        vehicle_targa_kutir: vehicleAcceptance.vehicle_targa_kutir || "",
        ken: vehicleAcceptance.ken || "",
        ye_fren_zeyt: vehicleAcceptance.ye_fren_zeyt?.have || false,
        ye_fren_zeyt_broken: vehicleAcceptance.ye_fren_zeyt?.broken || false,
        ye_meri_zeyt: vehicleAcceptance.ye_meri_zeyt?.have || false,
        ye_meri_zeyt_broken: vehicleAcceptance.ye_meri_zeyt?.broken || false,
        ye_motor_zeyt: vehicleAcceptance.ye_motor_zeyt?.have || false,
        ye_motor_zeyt_broken: vehicleAcceptance.ye_motor_zeyt?.broken || false,
        ye_radiator: vehicleAcceptance.ye_radiator?.have || false,
        ye_radiator_broken: vehicleAcceptance.ye_radiator?.broken || false,
        battery: vehicleAcceptance.battery?.have || false,
        battery_broken: vehicleAcceptance.battery?.broken || false,
        zinab_metregya: vehicleAcceptance.zinab_metregya?.have || false,
        zinab_metregya_broken:
          vehicleAcceptance.zinab_metregya?.broken || false,
        maskerya: {
          have: vehicleAcceptance.maskerya?.have || false,
          dont_have: vehicleAcceptance.maskerya?.dont_have || false,
          broken: vehicleAcceptance.maskerya?.broken || false,
        },
        antenna: {
          have: vehicleAcceptance.antenna?.have || false,
          dont_have: vehicleAcceptance.antenna?.dont_have || false,
          broken: vehicleAcceptance.antenna?.broken || false,
        },
        ferfango_left: vehicleAcceptance.ferfango?.left || false,
        ferfango_right: vehicleAcceptance.ferfango?.right || false,
        ye_fit_mebrat_left: vehicleAcceptance.ye_fit_mebrat?.left || false,
        ye_fit_mebrat_right: vehicleAcceptance.ye_fit_mebrat?.right || false,
        frecha_mebrat_left: vehicleAcceptance.frecha_mebrat?.left || false,
        frecha_mebrat_right: vehicleAcceptance.frecha_mebrat?.right || false,
        ye_fit_targa: {
          have: vehicleAcceptance.ye_fit_targa?.have || false,
          dont_have: vehicleAcceptance.ye_fit_targa?.dont_have || false,
          broken: vehicleAcceptance.ye_fit_targa?.broken || false,
        },
        nifas_mekelakeya_left:
          vehicleAcceptance.nifas_mekelakeya?.left || false,
        nifas_mekelakeya_right:
          vehicleAcceptance.nifas_mekelakeya?.right || false,
        spekiyo_left: vehicleAcceptance.spekiyo?.left || false,
        spekiyo_right: vehicleAcceptance.spekiyo?.right || false,
        ye_ber_ijeta_left: vehicleAcceptance.ye_ber_ijeta?.left || false,
        ye_ber_ijeta_right: vehicleAcceptance.ye_ber_ijeta?.right || false,
        ika_mekelakeya: {
          have: vehicleAcceptance.ika_mekelakeya?.have || false,
          dont_have: vehicleAcceptance.ika_mekelakeya?.dont_have || false,
          broken: vehicleAcceptance.ika_mekelakeya?.broken || false,
        },
        ye_sivat_kidan: {
          have: vehicleAcceptance.ye_sivat_kidan?.have || false,
          dont_have: vehicleAcceptance.ye_sivat_kidan?.dont_have || false,
          broken: vehicleAcceptance.ye_sivat_kidan?.broken || false,
        },
        ye_huala_targa: {
          have: vehicleAcceptance.ye_huala_targa?.have || false,
          dont_have: vehicleAcceptance.ye_huala_targa?.dont_have || false,
          broken: vehicleAcceptance.ye_huala_targa?.broken || false,
        },
        ye_huala_mebrat_birchiko: {
          have: vehicleAcceptance.ye_huala_mebrat_birchiko?.have || false,
          dont_have: vehicleAcceptance.ye_huala_mebrat_birchiko?.dont_have || false,
          broken: vehicleAcceptance.ye_huala_mebrat_birchiko?.broken || false,
        },
        ye_ber_gomini_mestawat_lstic_frame: {
          have: vehicleAcceptance.ye_ber_gomini_mestawat_lstic_frame?.have || false,
          dont_have: vehicleAcceptance.ye_ber_gomini_mestawat_lstic_frame?.dont_have || false,
          broken: vehicleAcceptance.ye_ber_gomini_mestawat_lstic_frame?.broken || false,
        },
        ye_fit_prawlit: {
          have: vehicleAcceptance.ye_fit_prawlit?.have || false,
          dont_have: vehicleAcceptance.ye_fit_prawlit?.dont_have || false,
          broken: vehicleAcceptance.ye_fit_prawlit?.broken || false,
        },
        ye_zinab_metregiya_ye_bilon_kidan_left:
          vehicleAcceptance.ye_zinab_metregiya_ye_bilon_kidan?.left || false,
        ye_zinab_metregiya_ye_bilon_kidan_right:
          vehicleAcceptance.ye_zinab_metregiya_ye_bilon_kidan?.right || false,
        birjineri_bilon: {
          have: vehicleAcceptance.birjineri_bilon?.have || false,
          dont_have: vehicleAcceptance.birjineri_bilon?.dont_have || false,
          broken: vehicleAcceptance.birjineri_bilon?.broken || false,
        },
        ye_huala_prawlit_antsebaraki: {
          have: vehicleAcceptance.ye_huala_prawlit_antsebaraki?.have || false,
          dont_have: vehicleAcceptance.ye_huala_prawlit_antsebaraki?.dont_have || false,
          broken: vehicleAcceptance.ye_huala_prawlit_antsebaraki?.broken || false,
        },
        ye_fit_igir_fren_lock: {
          have: vehicleAcceptance.ye_fit_igir_fren_lock?.have || false,
          dont_have: vehicleAcceptance.ye_fit_igir_fren_lock?.dont_have || false,
          broken: vehicleAcceptance.ye_fit_igir_fren_lock?.broken || false,
        },
        ye_huala_goma_libs: {
          have: vehicleAcceptance.ye_huala_goma_libs?.have || false,
          dont_have: vehicleAcceptance.ye_huala_goma_libs?.dont_have || false,
          broken: vehicleAcceptance.ye_huala_goma_libs?.broken || false,
        },
        fortomegala: {
          have: vehicleAcceptance.fortomegala?.have || false,
          dont_have: vehicleAcceptance.fortomegala?.dont_have || false,
          broken: vehicleAcceptance.fortomegala?.broken || false,
        },
        eskort_goma_mefcha: {
          have: vehicleAcceptance.eskort_goma_mefcha?.have || false,
          dont_have: vehicleAcceptance.eskort_goma_mefcha?.dont_have || false,
          broken: vehicleAcceptance.eskort_goma_mefcha?.broken || false,
        },
        tiras: vehicleAcceptance.tiras?.have || false,
        tiras_broken: vehicleAcceptance.tiras?.broken || false,
        meterkosha: vehicleAcceptance.meterkosha?.have || false,
        meterkosha_broken: vehicleAcceptance.meterkosha?.broken || false,
        ye_welel_mintaf: vehicleAcceptance.ye_welel_mintaf?.have || false,
        ye_welel_mintaf_broken:
          vehicleAcceptance.ye_welel_mintaf?.broken || false,
        ye_wember_libs: vehicleAcceptance.ye_wember_libs?.have || false,
        ye_wember_libs_broken:
          vehicleAcceptance.ye_wember_libs?.broken || false,
        ye_wist_spekiyo: vehicleAcceptance.ye_wist_spekiyo?.have || false,
        ye_wist_spekiyo_broken:
          vehicleAcceptance.ye_wist_spekiyo?.broken || false,
        ye_wist_mebrat: vehicleAcceptance.ye_wist_mebrat?.have || false,
        ye_wist_mebrat_broken:
          vehicleAcceptance.ye_wist_mebrat?.broken || false,
        tep: vehicleAcceptance.tep?.have || false,
        tep_broken: vehicleAcceptance.tep?.broken || false,
        isat_adega_mekelakeya:
          vehicleAcceptance.isat_adega_mekelakeya?.have || false,
        isat_adega_mekelakeya_broken:
          vehicleAcceptance.isat_adega_mekelakeya?.broken || false,
        mebrat_mabriya: vehicleAcceptance.mebrat_mabriya?.have || false,
        mebrat_mabriya_broken:
          vehicleAcceptance.mebrat_mabriya?.broken || false,
        zinab_metregiya_mebrat:
          vehicleAcceptance.zinab_metregiya_mebrat?.have || false,
        zinab_metregiya_mebrat_broken:
          vehicleAcceptance.zinab_metregiya_mebrat?.broken || false,
        nedaj: vehicleAcceptance.nedaj || null,
        ye_tsehay_mekelakeya:
          vehicleAcceptance.ye_tsehay_mekelakeya?.have || false,
        ye_tsehay_mekelakeya_broken:
          vehicleAcceptance.ye_tsehay_mekelakeya?.broken || false,
        ye_wist_ber_mekfecha:
          vehicleAcceptance.ye_wist_ber_mekfecha?.have || false,
        ye_wist_ber_mekfecha_broken:
          vehicleAcceptance.ye_wist_ber_mekfecha?.broken || false,
        ye_mestewat_mawcha_mawreja:
          vehicleAcceptance.ye_mestewat_mawcha_mawreja?.have || false,
        ye_mestewat_mawcha_mawreja_broken:
          vehicleAcceptance.ye_mestewat_mawcha_mawreja?.broken || false,
        ye_fit_ye_kofen_amorzrater:
          vehicleAcceptance.ye_fit_ye_kofen_amorzrater?.have || false,
        ye_fit_ye_kofen_amorzrater_broken:
          vehicleAcceptance.ye_fit_ye_kofen_amorzrater?.broken || false,
        ye_huala_ye_kofen_amorzrater:
          vehicleAcceptance.ye_huala_ye_kofen_amorzrater?.have || false,
        ye_huala_ye_kofen_amorzrater_broken:
          vehicleAcceptance.ye_huala_ye_kofen_amorzrater?.broken || false,
        klaks: vehicleAcceptance.klaks?.have || false,
        klaks_broken: vehicleAcceptance.klaks?.broken || false,
        ye_wist_dashboard_kis_kulf:
          vehicleAcceptance.ye_wist_dashboard_kis_kulf?.have || false,
        ye_wist_dashboard_kis_kulf_broken:
          vehicleAcceptance.ye_wist_dashboard_kis_kulf?.broken || false,
        ye_kofen_gomini: vehicleAcceptance.ye_kofen_gomini?.have || false,
        ye_kofen_gomini_broken:
          vehicleAcceptance.ye_kofen_gomini?.broken || false,
        ye_wuha_mercha: vehicleAcceptance.ye_wuha_mercha?.have || false,
        ye_wuha_mercha_broken:
          vehicleAcceptance.ye_wuha_mercha?.broken || false,
        ye_ginbar_mestewat: vehicleAcceptance.ye_ginbar_mestewat?.have || false,
        ye_ginbar_mestewat_broken:
          vehicleAcceptance.ye_ginbar_mestewat?.broken || false,
        goma: vehicleAcceptance.goma || "",
        kirk: vehicleAcceptance.kirk?.have || false,
        kirk_broken: vehicleAcceptance.kirk?.broken || false,
        goma_mefcha: vehicleAcceptance.goma_mefcha?.have || false,
        goma_mefcha_broken: vehicleAcceptance.goma_mefcha?.broken || false,
        eskort_goma: vehicleAcceptance.eskort_goma?.have || false,
        eskort_goma_broken: vehicleAcceptance.eskort_goma?.broken || false,
        kolenet: vehicleAcceptance.kolenet || null,
        ye_cherke_get: vehicleAcceptance.ye_cherke_get?.have || false,
        ye_cherke_get_broken: vehicleAcceptance.ye_cherke_get?.broken || false,
        asrekabi_sim: vehicleAcceptance.asrekabi_sim?.toString() || "",
        asrekabi_name: vehicleAcceptance.asrekabi_name || "",
        terekabi_sim: vehicleAcceptance.terekabi_sim?.toString() || "",
        terekabi_name: vehicleAcceptance.terekabi_name || "",
        firma: vehicleAcceptance.firma || null,
        ken_footer: vehicleAcceptance.ken_footer || "",
        ken_2: vehicleAcceptance.ken_2 || "",
        ye_miwetabet_ken: vehicleAcceptance.ye_miwetabet_ken || null,
        makomiya_mebrat_left: vehicleAcceptance.makomiya_mebrat?.left || false,
        makomiya_mebrat_right:
          vehicleAcceptance.makomiya_mebrat?.right || false,
        antsebaraki: {
          have: vehicleAcceptance.antsebaraki?.have || false,
          dont_have: vehicleAcceptance.antsebaraki?.dont_have || false,
          broken: vehicleAcceptance.antsebaraki?.broken || false,
        },
      });
    }
  }, [vehicleAcceptance, form]);

  const submitMutation = useMutation({
    mutationFn: (values: VehicleAcceptanceFormData) =>
      updateVehicleAcceptance(Number(id), {
        customer: values.customer,
        vehicle: values.vehicle,
        customer_name: values.customer_name,
        customer_phone: values.customer_phone,
        customer_tin_number: values.customer_tin_number,
        vehicle_model: values.vehicle_model,
        vehicle_shanci_kutir: values.vehicle_shanci_kutir,
        vehicle_motor_kutir: values.vehicle_motor_kutir,
        vehicle_targa_kutir: values.vehicle_targa_kutir,
        ken: values.ken,
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
        goma: values.goma,
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
        asrekabi_sim: values.asrekabi_sim,
        asrekabi_name: values.asrekabi_name,
        terekabi_sim: values.terekabi_sim,
        terekabi_name: values.terekabi_name,
        firma: values.firma,
        ken_footer: values.ken_footer,
        ken_2: values.ken_2,
        ye_miwetabet_ken: values.ye_miwetabet_ken,
        makomiya_mebrat: {
          left: values.makomiya_mebrat_left,
          right: values.makomiya_mebrat_right,
        },
        antsebaraki: values.antsebaraki,
      }),
    onSuccess: () => {
      toast.success("Vehicle Acceptance updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["vehicleAcceptances"] });
      navigate("/manage-vehicle-acceptance");
    },
    onError: (error) => {
      toast.error("Failed to update vehicle acceptance.");
    },
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const onSubmit = (values: VehicleAcceptanceFormData) => {
    submitMutation.mutate(values);
  };

  const handleStepClick = (stepIndex: number) => {
    setActiveStep(stepIndex);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

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
    { name: "ye_ginbar_mestewat", label: t("ye_ginbar_mestewat") },
  ];

  const outerConditionItems = [
    { name: "kirk", label: t("kirk") },
    { name: "goma_mefcha", label: t("goma_mefcha") },
    { name: "eskort_goma", label: t("eskort_goma") },
    { name: "ye_cherke_get", label: t("ye_cherke_get") },
  ];

  const renderCheckboxGroup = (fieldName: string, label: string) => {
    return (
      <FormField
        key={fieldName}
        control={form.control}
        name={fieldName as keyof VehicleAcceptanceFormData}
        render={({ field }) => (
          <FormItem className="space-y-2 bg-white dark:bg-gray-800/60 border border-emerald-100 dark:border-emerald-900/40 rounded-xl px-5 py-4 shadow-sm">
            <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</FormLabel>
            <div className="flex items-center gap-6">
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value === true}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        field.onChange(true);
                        form.setValue(`${fieldName}_broken`, false);
                      }
                    }}
                  />
                </FormControl>
                <FormLabel className="font-normal">{t("tekikel")}</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value === false}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        field.onChange(false);
                        form.setValue(`${fieldName}_broken`, false);
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
                    checked={form.watch(`${fieldName}_broken`)}
                    onCheckedChange={(checked) => {
                      form.setValue(`${fieldName}_broken`, checked);
                      if (checked) {
                        field.onChange(true);
                      }
                    }}
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
  };

  const renderObjectCheckboxGroup = (
    fieldName: string,
    label: string,
  ) => {
    return (
      <FormField
        key={fieldName}
        control={form.control}
        name={fieldName as keyof VehicleAcceptanceFormData}
        render={({ field }) => (
          <FormItem className="space-y-2 bg-white dark:bg-gray-800/60 border border-emerald-100 dark:border-emerald-900/40 rounded-xl px-5 py-4 shadow-sm">
            <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</FormLabel>
            <div className="flex items-center gap-6">
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value?.have}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        form.setValue(fieldName as keyof VehicleAcceptanceFormData, {
                          have: true,
                          dont_have: false,
                          broken: false,
                        });
                      }
                    }}
                  />
                </FormControl>
                <FormLabel className="font-normal">{t("tekikel")}</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value?.dont_have}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        form.setValue(fieldName as keyof VehicleAcceptanceFormData, {
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
                      form.setValue(fieldName as keyof VehicleAcceptanceFormData, {
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
    );
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-6xl mx-auto container mb-40">
      <div className="-mt-2 mb-5">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="cursor-pointer">
              <BreadcrumbLink
                onClick={() => navigate("/manage-vehicle-acceptance")}
              >
                <span className="px-4 font-bold mt-4 mb-4">
                  {t("manage_vehicle_acceptance")}
                </span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t("update_vehicle_acceptance")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            {t("update_vehicle_acceptance")}
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
                  <h4 className="text-base font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-2">{t("vehicle_information")}</h4>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Customer */}
                    <FormField
                      control={form.control}
                      name="customer"
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
                                value: customer.id.toString(),
                                label: customer.organization || customer.name,
                              }))}
                              value={
                                vehicleAcceptance?.customer
                                  ? {
                                    value: vehicleAcceptance.customer.toString(),
                                    label: vehicleAcceptance.customer_name || "",
                                  }
                                  : null
                              }
                              onChange={(option: any) => {
                                const val = option?.value || "";
                                field.onChange(val);

                                const selectedCustomer = customers.find(
                                  (c) => c.id.toString() === val,
                                );

                                if (selectedCustomer) {
                                  form.setValue(
                                    "customer_name",
                                    selectedCustomer.organization ||
                                    selectedCustomer.name ||
                                    "",
                                  );

                                  form.setValue(
                                    "customer_tin_number",
                                    selectedCustomer.tin_number || "",
                                  );

                                  form.setValue(
                                    "customer_phone",
                                    selectedCustomer.phone || "",
                                  );
                                }
                              }}
                              isDisabled
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
                      name="vehicle_model"
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
                                  form.setValue("vehicle_shanci_kutir", selectedVehicle.shanci_kutir || "");
                                  form.setValue("vehicle_motor_kutir", selectedVehicle.motor_kutir || "");
                                  form.setValue("vehicle_targa_kutir", selectedVehicle.license_plate || "");
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

                    <FormField
                      control={form.control}
                      name="vehicle_shanci_kutir"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("shanci_kutir")}</FormLabel>
                          <FormControl>
                            <Input
                              className="p-5 border-emerald-200 dark:border-emerald-800"
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
                      name="vehicle_motor_kutir"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("motor_kutir")}</FormLabel>
                          <FormControl>
                            <Input
                              className="p-5 border-emerald-200 dark:border-emerald-800"
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
                      name="vehicle_targa_kutir"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("targa_kutir")}</FormLabel>
                          <FormControl>
                            <Input
                              className="p-5 border-emerald-200 dark:border-emerald-800"
                              placeholder={t("targa_kutir")}
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
                      name="customer_tin_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("tin_kutir")}</FormLabel>
                          <FormControl>
                            <Input
                              className="p-5 border-emerald-200 dark:border-emerald-800"
                              placeholder={t("tin_kutir")}
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
                      name="customer_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("phone")}</FormLabel>
                          <FormControl>
                            <Input
                              className="p-5 border-emerald-200 dark:border-emerald-800"
                              placeholder={t("phone")}
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
                  ].map((item) => renderCheckboxGroup(item.name, item.label))}
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
                  {outerPartItemsSingle.map((item) => renderObjectCheckboxGroup(item.name, item.label))}
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
                      return (
                        <FormField
                          key={item.name}
                          control={form.control}
                          name="nedaj"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("nedaj")}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t("enter_nedaj_condition")}
                                  className="p-5 border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      );
                    }
                    return renderCheckboxGroup(item.name, item.label);
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

                  <FormField
                    control={form.control}
                    name="goma"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("goma")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("enter_goma_condition")}
                            className="p-5 border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500"
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
                            className="p-5 border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500"
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

                  {outerConditionItems.map((item) =>
                    renderCheckboxGroup(item.name, item.label),
                  )}
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
                      name="asrekabi_sim"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("asrekabi_sim")}</FormLabel>
                          <FormControl>
                            <Select
                              styles={emeraldSelectStyles}
                              placeholder={t("select_a_customer")}
                              options={customers?.map((customer) => ({
                                value: customer.id.toString(),
                                label: customer.name,
                              }))}
                              value={
                                field.value
                                  ? { value: field.value, label: customers.find((c) => c.id.toString() === field.value)?.name || "" }
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
                      name="terekabi_sim"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("terekabi_sim")}</FormLabel>
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
                                  ? { value: field.value, label: users.find((u) => u.id.toString() === field.value)?.name || "" }
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
                      name="ye_miwetabet_ken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("ye_miwetabet_ken")}</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              placeholder={t("select_a_date")}
                              className="p-5 border-emerald-200 dark:border-emerald-800"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value)}
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
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                      type="submit"
                      disabled={submitMutation.isPending}
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

export default UpdateVehicleAcceptance;
