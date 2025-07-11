"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Search,
  Plus,
  Trash2,
  Scale,
  Loader2,
  Sparkles,
  Crown,
  Star,
  User,
  Calculator,
  Target,
  Lightbulb,
  MessageSquare,
  Utensils,
  History,
  Droplet,
  CalendarDays,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Import new components
import CustomFoodForm from "@/components/custom-food-form"
import WaterTracker from "@/components/water-tracker"
import DailyHistory from "@/components/daily-history"
import MealPlanner from "@/components/meal-planner"

interface FoodItem {
  id: string
  name: string
  nameEn?: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  category: string
  source: "local" | "usda" | "custom"
}

interface TrackedFood {
  id: string
  food: FoodItem
  weight: number
  calculatedNutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
  }
  date: string // YYYY-MM-DD
}

interface UserProfile {
  weight: number // kg
  height: number // cm
  age: number
  gender: "male" | "female"
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active"
  goal: "maintain" | "lose" | "gain"
}

interface USDAFood {
  fdcId: number
  description: string
  foodNutrients: Array<{
    nutrientId: number
    value: number
  }>
}

// Initial local food database
const initialLocalFoodDatabase: FoodItem[] = [
  // Makanan Pokok
  {
    id: "nasi-putih",
    name: "Nasi Putih",
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
    fiber: 0.4,
    category: "Makanan Pokok",
    source: "local",
  },
  {
    id: "nasi-merah",
    name: "Nasi Merah",
    calories: 111,
    protein: 2.3,
    carbs: 23,
    fat: 0.9,
    fiber: 1.8,
    category: "Makanan Pokok",
    source: "local",
  },
  {
    id: "nasi-uduk",
    name: "Nasi Uduk",
    calories: 180,
    protein: 3.2,
    carbs: 30,
    fat: 5.5,
    fiber: 0.5,
    category: "Makanan Pokok",
    source: "local",
  },
  {
    id: "lontong",
    name: "Lontong",
    calories: 120,
    protein: 2.5,
    carbs: 26,
    fat: 0.2,
    fiber: 0.3,
    category: "Makanan Pokok",
    source: "local",
  },
  {
    id: "ketupat",
    name: "Ketupat",
    calories: 115,
    protein: 2.3,
    carbs: 25,
    fat: 0.2,
    fiber: 0.4,
    category: "Makanan Pokok",
    source: "local",
  },
  {
    id: "ubi-cilembu",
    name: "Ubi Cilembu",
    calories: 125,
    protein: 1.8,
    carbs: 29,
    fat: 0.2,
    fiber: 3.0,
    category: "Makanan Pokok",
    source: "local",
  },

  // Protein Hewani
  {
    id: "ayam-goreng",
    name: "Ayam Goreng",
    calories: 250,
    protein: 25,
    carbs: 8,
    fat: 15,
    fiber: 0.5,
    category: "Protein Hewani",
    source: "local",
  },
  {
    id: "ayam-bakar",
    name: "Ayam Bakar",
    calories: 220,
    protein: 27,
    carbs: 2,
    fat: 12,
    fiber: 0,
    category: "Protein Hewani",
    source: "local",
  },
  {
    id: "rendang-daging",
    name: "Rendang Daging",
    calories: 280,
    protein: 22,
    carbs: 6,
    fat: 18,
    fiber: 1.2,
    category: "Protein Hewani",
    source: "local",
  },
  {
    id: "ikan-bakar",
    name: "Ikan Bakar",
    calories: 180,
    protein: 25,
    carbs: 0,
    fat: 8,
    fiber: 0,
    category: "Protein Hewani",
    source: "local",
  },
  {
    id: "ikan-goreng",
    name: "Ikan Goreng",
    calories: 220,
    protein: 22,
    carbs: 5,
    fat: 12,
    fiber: 0,
    category: "Protein Hewani",
    source: "local",
  },
  {
    id: "telur-dadar",
    name: "Telur Dadar",
    calories: 180,
    protein: 12,
    carbs: 2,
    fat: 14,
    fiber: 0,
    category: "Protein Hewani",
    source: "local",
  },
  {
    id: "telur-rebus",
    name: "Telur Rebus",
    calories: 155,
    protein: 13,
    carbs: 1.1,
    fat: 11,
    fiber: 0,
    category: "Protein Hewani",
    source: "local",
  },
  {
    id: "udang-rebus",
    name: "Udang Rebus",
    calories: 85,
    protein: 20,
    carbs: 0.3,
    fat: 0.5,
    fiber: 0,
    category: "Protein Hewani",
    source: "local",
  },
  {
    id: "daging-sapi-panggang",
    name: "Daging Sapi Panggang",
    calories: 250,
    protein: 26,
    carbs: 0,
    fat: 15,
    fiber: 0,
    category: "Protein Hewani",
    source: "local",
  },

  // Protein Nabati
  {
    id: "tempe-goreng",
    name: "Tempe Goreng",
    calories: 225,
    protein: 18,
    carbs: 9,
    fat: 12,
    fiber: 8,
    category: "Protein Nabati",
    source: "local",
  },
  {
    id: "tahu-goreng",
    name: "Tahu Goreng",
    calories: 190,
    protein: 12,
    carbs: 8,
    fat: 12,
    fiber: 2,
    category: "Protein Nabati",
    source: "local",
  },
  {
    id: "tempe-bacem",
    name: "Tempe Bacem",
    calories: 200,
    protein: 16,
    carbs: 12,
    fat: 10,
    fiber: 7,
    category: "Protein Nabati",
    source: "local",
  },
  {
    id: "tahu-sumedang",
    name: "Tahu Sumedang",
    calories: 210,
    protein: 11,
    carbs: 10,
    fat: 14,
    fiber: 2.5,
    category: "Protein Nabati",
    source: "local",
  },
  {
    id: "kacang-hijau",
    name: "Kacang Hijau",
    calories: 347,
    protein: 24,
    carbs: 63,
    fat: 1.2,
    fiber: 16,
    category: "Protein Nabati",
    source: "local",
  },
  {
    id: "kacang-merah",
    name: "Kacang Merah",
    calories: 337,
    protein: 23,
    carbs: 60,
    fat: 0.8,
    fiber: 15,
    category: "Protein Nabati",
    source: "local",
  },

  // Sayuran
  {
    id: "gado-gado",
    name: "Gado-gado",
    calories: 180,
    protein: 8,
    carbs: 15,
    fat: 12,
    fiber: 6,
    category: "Sayuran",
    source: "local",
  },
  {
    id: "pecel",
    name: "Pecel",
    calories: 160,
    protein: 7,
    carbs: 12,
    fat: 10,
    fiber: 5,
    category: "Sayuran",
    source: "local",
  },
  {
    id: "sayur-asem",
    name: "Sayur Asem",
    calories: 45,
    protein: 2.5,
    carbs: 8,
    fat: 1,
    fiber: 3,
    category: "Sayuran",
    source: "local",
  },
  {
    id: "sayur-lodeh",
    name: "Sayur Lodeh",
    calories: 85,
    protein: 3,
    carbs: 10,
    fat: 4,
    fiber: 4,
    category: "Sayuran",
    source: "local",
  },
  {
    id: "capcay",
    name: "Capcay",
    calories: 70,
    protein: 4,
    carbs: 8,
    fat: 3,
    fiber: 3.5,
    category: "Sayuran",
    source: "local",
  },
  {
    id: "tumis-kangkung",
    name: "Tumis Kangkung",
    calories: 55,
    protein: 3,
    carbs: 6,
    fat: 2.5,
    fiber: 2.8,
    category: "Sayuran",
    source: "local",
  },
  {
    id: "tumis-bayam",
    name: "Tumis Bayam",
    calories: 35,
    protein: 3.5,
    carbs: 4,
    fat: 1.5,
    fiber: 2.5,
    category: "Sayuran",
    source: "local",
  },
  {
    id: "brokoli",
    name: "Brokoli",
    calories: 34,
    protein: 2.8,
    carbs: 6.6,
    fat: 0.4,
    fiber: 2.6,
    category: "Sayuran",
    source: "local",
  },
  {
    id: "wortel",
    name: "Wortel",
    calories: 41,
    protein: 0.9,
    carbs: 9.6,
    fat: 0.2,
    fiber: 2.8,
    category: "Sayuran",
    source: "local",
  },
  {
    id: "timun",
    name: "Timun",
    calories: 15,
    protein: 0.7,
    carbs: 3.6,
    fat: 0.1,
    fiber: 1.5,
    category: "Sayuran",
    source: "local",
  },
  {
    id: "tomat",
    name: "Tomat",
    calories: 18,
    protein: 0.9,
    carbs: 3.9,
    fat: 0.2,
    fiber: 1.2,
    category: "Sayuran",
    source: "local",
  },
  {
    id: "labu-siam",
    name: "Labu Siam",
    calories: 19,
    protein: 0.8,
    carbs: 4.5,
    fat: 0.1,
    fiber: 1.7,
    category: "Sayuran",
    source: "local",
  },
  {
    id: "terong",
    name: "Terong",
    calories: 25,
    protein: 1.0,
    carbs: 5.9,
    fat: 0.2,
    fiber: 3.0,
    category: "Sayuran",
    source: "local",
  },
  {
    id: "buncis",
    name: "Buncis",
    calories: 31,
    protein: 1.8,
    carbs: 7.0,
    fat: 0.2,
    fiber: 3.0,
    category: "Sayuran",
    source: "local",
  },

  // Buah-buahan
  {
    id: "pisang-raja",
    name: "Pisang Raja",
    calories: 120,
    protein: 1.5,
    carbs: 27,
    fat: 0.5,
    fiber: 3.1,
    category: "Buah",
    source: "local",
  },
  {
    id: "pisang-ambon",
    name: "Pisang Ambon",
    calories: 89,
    protein: 1.1,
    carbs: 23,
    fat: 0.3,
    fiber: 2.6,
    category: "Buah",
    source: "local",
  },
  {
    id: "mangga-harum-manis",
    name: "Mangga Harum Manis",
    calories: 70,
    protein: 0.8,
    carbs: 17,
    fat: 0.4,
    fiber: 1.8,
    category: "Buah",
    source: "local",
  },
  {
    id: "jeruk-bali",
    name: "Jeruk Bali",
    calories: 38,
    protein: 0.8,
    carbs: 9.6,
    fat: 0.1,
    fiber: 1,
    category: "Buah",
    source: "local",
  },
  {
    id: "rambutan",
    name: "Rambutan",
    calories: 68,
    protein: 1,
    carbs: 16,
    fat: 0.2,
    fiber: 0.9,
    category: "Buah",
    source: "local",
  },
  {
    id: "durian",
    name: "Durian",
    calories: 147,
    protein: 1.5,
    carbs: 27,
    fat: 5.3,
    fiber: 3.8,
    category: "Buah",
    source: "local",
  },
  {
    id: "salak",
    name: "Salak",
    calories: 77,
    protein: 0.8,
    carbs: 18,
    fat: 0.4,
    fiber: 4.2,
    category: "Buah",
    source: "local",
  },
  {
    id: "apel",
    name: "Apel",
    calories: 52,
    protein: 0.3,
    carbs: 14,
    fat: 0.2,
    fiber: 2.4,
    category: "Buah",
    source: "local",
  },
  {
    id: "anggur",
    name: "Anggur",
    calories: 69,
    protein: 0.6,
    carbs: 18,
    fat: 0.2,
    fiber: 0.9,
    category: "Buah",
    source: "local",
  },
  {
    id: "semangka",
    name: "Semangka",
    calories: 30,
    protein: 0.6,
    carbs: 7.6,
    fat: 0.2,
    fiber: 0.4,
    category: "Buah",
    source: "local",
  },
  {
    id: "melon",
    name: "Melon",
    calories: 34,
    protein: 0.8,
    carbs: 8.2,
    fat: 0.2,
    fiber: 0.9,
    category: "Buah",
    source: "local",
  },
  {
    id: "pepaya",
    name: "Pepaya",
    calories: 43,
    protein: 0.5,
    carbs: 10.8,
    fat: 0.3,
    fiber: 1.7,
    category: "Buah",
    source: "local",
  },
  {
    id: "jambu-biji",
    name: "Jambu Biji",
    calories: 68,
    protein: 2.6,
    carbs: 14.3,
    fat: 1.0,
    fiber: 5.4,
    category: "Buah",
    source: "local",
  },
  {
    id: "naga",
    name: "Buah Naga",
    calories: 60,
    protein: 1.2,
    carbs: 12.9,
    fat: 0.6,
    fiber: 2.9,
    category: "Buah",
    source: "local",
  },

  // Makanan Tradisional
  {
    id: "gudeg",
    name: "Gudeg",
    calories: 150,
    protein: 5,
    carbs: 20,
    fat: 6,
    fiber: 8,
    category: "Makanan Tradisional",
    source: "local",
  },
  {
    id: "soto-ayam",
    name: "Soto Ayam",
    calories: 180,
    protein: 15,
    carbs: 12,
    fat: 8,
    fiber: 2,
    category: "Makanan Tradisional",
    source: "local",
  },
  {
    id: "rawon",
    name: "Rawon",
    calories: 220,
    protein: 18,
    carbs: 8,
    fat: 12,
    fiber: 3,
    category: "Makanan Tradisional",
    source: "local",
  },
  {
    id: "sate-ayam",
    name: "Sate Ayam",
    calories: 200,
    protein: 20,
    carbs: 8,
    fat: 10,
    fiber: 1,
    category: "Makanan Tradisional",
    source: "local",
  },
  {
    id: "bakso",
    name: "Bakso",
    calories: 180,
    protein: 12,
    carbs: 15,
    fat: 8,
    fiber: 1.5,
    category: "Makanan Tradisional",
    source: "local",
  },
  {
    id: "mie-ayam",
    name: "Mie Ayam",
    calories: 320,
    protein: 15,
    carbs: 45,
    fat: 10,
    fiber: 3,
    category: "Makanan Tradisional",
    source: "local",
  },

  // Cemilan
  {
    id: "kerupuk-udang",
    name: "Kerupuk Udang",
    calories: 540,
    protein: 2.4,
    carbs: 68,
    fat: 28,
    fiber: 0.5,
    category: "Cemilan",
    source: "local",
  },
  {
    id: "rempeyek",
    name: "Rempeyek",
    calories: 480,
    protein: 12,
    carbs: 45,
    fat: 28,
    fiber: 4,
    category: "Cemilan",
    source: "local",
  },
  {
    id: "keripik-singkong",
    name: "Keripik Singkong",
    calories: 520,
    protein: 2.8,
    carbs: 60,
    fat: 30,
    fiber: 3.5,
    category: "Cemilan",
    source: "local",
  },
  {
    id: "onde-onde",
    name: "Onde-onde",
    calories: 180,
    protein: 3,
    carbs: 28,
    fat: 6,
    fiber: 2,
    category: "Cemilan",
    source: "local",
  },
]

// Mapping bahasa Indonesia ke Inggris untuk pencarian USDA
const foodTranslation: Record<string, string> = {
  // Protein
  ayam: "chicken",
  daging: "beef",
  ikan: "fish",
  telur: "egg",
  udang: "shrimp",
  cumi: "squid",
  salmon: "salmon",
  tuna: "tuna",
  // Sayuran
  brokoli: "broccoli",
  bayam: "spinach",
  wortel: "carrot",
  kentang: "potato",
  tomat: "tomato",
  timun: "cucumber",
  selada: "lettuce",
  kubis: "cabbage",
  "kacang panjang": "green beans",
  jagung: "corn",
  labu: "squash",
  terong: "eggplant",
  buncis: "green beans",

  // Buah
  apel: "apple",
  pisang: "banana",
  jeruk: "orange",
  anggur: "grapes",
  semangka: "watermelon",
  melon: "melon",
  strawberry: "strawberry",
  kiwi: "kiwi",
  pepaya: "papaya",
  "jambu biji": "guava",
  "buah naga": "dragon fruit",

  // Karbohidrat
  nasi: "rice",
  roti: "bread",
  pasta: "pasta",
  mie: "noodles",
  oats: "oats",
  quinoa: "quinoa",
  ubi: "sweet potato",

  // Lainnya
  susu: "milk",
  keju: "cheese",
  yogurt: "yogurt",
  madu: "honey",
  gula: "sugar",
  minyak: "oil",
}

const getTodayDate = () => {
  const today = new Date()
  return today.toISOString().split("T")[0] // YYYY-MM-DD
}

export default function NutrisiMeter() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [foodWeight, setFoodWeight] = useState("")
  const [trackedFoods, setTrackedFoods] = useState<TrackedFood[]>([]) // Tracked for current day
  const [activeTab, setActiveTab] = useState("tracker")
  const [searchResults, setSearchResults] = useState<FoodItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isCustomFoodDialogOpen, setIsCustomFoodDialogOpen] = useState(false)

  // New states for additional features
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([])
  const [dailyTrackedFoodsHistory, setDailyTrackedFoodsHistory] = useState<Record<string, TrackedFood[]>>({})
  const [dailyWaterIntake, setDailyWaterIntake] = useState<Record<string, number>>({})
  const [mealPlans, setMealPlans] = useState<Record<string, FoodItem[]>>({}) // Stores planned foods for each day

  const today = getTodayDate()

  // Combine initial local foods with custom foods
  const combinedFoodDatabase = useMemo(() => {
    return [...initialLocalFoodDatabase, ...customFoods]
  }, [customFoods])

  // Load data from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem("nutriMeterProfile")
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile))
    }
    const savedCustomFoods = localStorage.getItem("nutriMeterCustomFoods")
    if (savedCustomFoods) {
      setCustomFoods(JSON.parse(savedCustomFoods))
    }
    const savedDailyTrackedFoodsHistory = localStorage.getItem("nutriMeterDailyTrackedFoodsHistory")
    if (savedDailyTrackedFoodsHistory) {
      setDailyTrackedFoodsHistory(JSON.parse(savedDailyTrackedFoodsHistory))
    }
    const savedDailyWaterIntake = localStorage.getItem("nutriMeterDailyWaterIntake")
    if (savedDailyWaterIntake) {
      setDailyWaterIntake(JSON.parse(savedDailyWaterIntake))
    }
    const savedMealPlans = localStorage.getItem("nutriMeterMealPlans")
    if (savedMealPlans) {
      setMealPlans(JSON.parse(savedMealPlans))
    }

    // Set current day's tracked foods
    setTrackedFoods(dailyTrackedFoodsHistory[today] || [])
  }, [])

  // Update localStorage whenever relevant states change
  useEffect(() => {
    localStorage.setItem("nutriMeterCustomFoods", JSON.stringify(customFoods))
  }, [customFoods])

  useEffect(() => {
    localStorage.setItem("nutriMeterDailyTrackedFoodsHistory", JSON.stringify(dailyTrackedFoodsHistory))
    // Update current day's tracked foods when history changes
    setTrackedFoods(dailyTrackedFoodsHistory[today] || [])
  }, [dailyTrackedFoodsHistory, today])

  useEffect(() => {
    localStorage.setItem("nutriMeterDailyWaterIntake", JSON.stringify(dailyWaterIntake))
  }, [dailyWaterIntake])

  useEffect(() => {
    localStorage.setItem("nutriMeterMealPlans", JSON.stringify(mealPlans))
  }, [mealPlans])

  // Save user profile to localStorage
  const saveUserProfile = (profile: UserProfile) => {
    setUserProfile(profile)
    localStorage.setItem("nutriMeterProfile", JSON.stringify(profile))
  }

  // Calculate BMR using Mifflin-St Jeor Equation
  const calculateBMR = (profile: UserProfile): number => {
    if (profile.gender === "male") {
      return 88.362 + 13.397 * profile.weight + 4.799 * profile.height - 5.677 * profile.age
    } else {
      return 447.593 + 9.247 * profile.weight + 3.098 * profile.height - 4.33 * profile.age
    }
  }

  // Calculate TDEE (Total Daily Energy Expenditure)
  const calculateTDEE = (profile: UserProfile): number => {
    const bmr = calculateBMR(profile)
    const activityMultipliers = {
      sedentary: 1.2, // Little/no exercise
      light: 1.375, // Light exercise 1-3 days/week
      moderate: 1.55, // Moderate exercise 3-5 days/week
      active: 1.725, // Hard exercise 6-7 days/week
      very_active: 1.9, // Very hard exercise, physical job
    }
    return bmr * activityMultipliers[profile.activityLevel]
  }

  // Calculate daily calorie needs based on goal
  const calculateCalorieNeeds = (profile: UserProfile): number => {
    const tdee = calculateTDEE(profile)
    switch (profile.goal) {
      case "lose":
        return Math.round(tdee - 500) // 500 calorie deficit for ~0.5kg/week loss
      case "gain":
        return Math.round(tdee + 500) // 500 calorie surplus for ~0.5kg/week gain
      default:
        return Math.round(tdee)
    }
  }

  // Calculate protein needs (1.6-2.2g per kg for active individuals)
  const calculateProteinNeeds = (profile: UserProfile): number => {
    const proteinMultipliers = {
      sedentary: 0.8,
      light: 1.2,
      moderate: 1.6,
      active: 2.0,
      very_active: 2.2,
    }
    return Math.round(profile.weight * proteinMultipliers[profile.activityLevel])
  }

  // Get personalized nutrition targets
  const getNutritionTargets = () => {
    if (!userProfile) {
      return {
        calories: 2000,
        protein: 50,
        carbs: 300,
        fat: 65,
        fiber: 25,
      }
    }

    const calories = calculateCalorieNeeds(userProfile)
    const protein = calculateProteinNeeds(userProfile)
    const fat = Math.round((calories * 0.25) / 9) // 25% of calories from fat
    const carbs = Math.round((calories - protein * 4 - fat * 9) / 4) // Remaining calories from carbs
    const fiber = Math.round((calories / 1000) * 14) // 14g per 1000 calories

    return { calories, protein, carbs, fat, fiber }
  }

  const searchUSDAFood = async (query: string): Promise<FoodItem[]> => {
    try {
      // Translate Indonesian to English
      let englishQuery = query.toLowerCase()
      for (const [indo, eng] of Object.entries(foodTranslation)) {
        if (englishQuery.includes(indo)) {
          englishQuery = englishQuery.replace(indo, eng)
        }
      }

      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?query=${englishQuery}&pageSize=10&api_key=DEMO_KEY`,
      )

      if (!response.ok) {
        throw new Error("USDA API request failed")
      }

      const data = await response.json()

      return (
        data.foods
          ?.map((food: USDAFood) => {
            // Extract nutrients (per 100g)
            const nutrients = food.foodNutrients.reduce(
              (acc: any, nutrient) => {
                switch (nutrient.nutrientId) {
                  case 1008: // Energy (kcal)
                    acc.calories = nutrient.value
                    break
                  case 1003: // Protein
                    acc.protein = nutrient.value
                    break
                  case 1005: // Carbohydrate
                    acc.carbs = nutrient.value
                    break
                  case 1004: // Total lipid (fat)
                    acc.fat = nutrient.value
                    break
                  case 1079: // Fiber
                    acc.fiber = nutrient.value
                    break
                }
                return acc
              },
              { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
            )

            return {
              id: `usda-${food.fdcId}`,
              name: food.description,
              nameEn: food.description,
              calories: Math.round(nutrients.calories || 0),
              protein: Math.round((nutrients.protein || 0) * 10) / 10,
              carbs: Math.round((nutrients.carbs || 0) * 10) / 10,
              fat: Math.round((nutrients.fat || 0) * 10) / 10,
              fiber: Math.round((nutrients.fiber || 0) * 10) / 10,
              category: "Internasional",
              source: "usda" as const,
            }
          })
          .filter((food: FoodItem) => food.calories > 0) || []
      )
    } catch (error) {
      console.error("Error searching USDA:", error)
      return []
    }
  }

  const searchFood = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    // Search combined database (local + custom)
    const localAndCustomResults = combinedFoodDatabase.filter((food) =>
      food.name.toLowerCase().includes(query.toLowerCase())
    )

    // Search USDA API
    const usdaResults = await searchUSDAFood(query)

    // Combine results, prioritize local/custom foods
    const combined = [...localAndCustomResults, ...usdaResults].slice(0, 10)

    setSearchResults(combined)
    setIsSearching(false)
  }

  // Debounced search
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const timeout = setTimeout(() => {
      searchFood(searchTerm)
    }, 500)

    setSearchTimeout(timeout)

    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [searchTerm])

  const calculateNutrition = (food: FoodItem, weight: number) => {
    const ratio = weight / 100 // karena data nutrisi per 100g
    return {
      calories: Math.round(food.calories * ratio * 10) / 10,
      protein: Math.round(food.protein * ratio * 10) / 10,
      carbs: Math.round(food.carbs * ratio * 10) / 10,
      fat: Math.round(food.fat * ratio * 10) / 10,
      fiber: Math.round(food.fiber * ratio * 10) / 10,
    }
  }

  const addTrackedFood = (foodToAdd: FoodItem, weightToAdd: number) => {
    if (foodToAdd && weightToAdd > 0) {
      const calculatedNutrition = calculateNutrition(foodToAdd, weightToAdd)

      const newTrackedFood: TrackedFood = {
        id: Date.now().toString(),
        food: foodToAdd,
        weight: weightToAdd,
        calculatedNutrition: calculatedNutrition,
        date: today,
      }

      setDailyTrackedFoodsHistory((prev) => ({
        ...prev,
        [today]: [...(prev[today] || []), newTrackedFood],
      }))

      setSelectedFood(null)
      setFoodWeight("")
      setSearchTerm("")
      setSearchResults([])
    }
  }

  const removeTrackedFood = (id: string) => {
    setDailyTrackedFoodsHistory((prev) => ({
      ...prev,
      [today]: (prev[today] || []).filter((food) => food.id !== id),
    }))
  }

  const getTotalNutrition = (foods: TrackedFood[]) => {
    return foods.reduce(
      (total, item) => ({
        calories: total.calories + item.calculatedNutrition.calories,
        protein: total.protein + item.calculatedNutrition.protein,
        carbs: total.carbs + item.calculatedNutrition.carbs,
        fat: total.fat + item.calculatedNutrition.fat,
        fiber: total.fiber + item.calculatedNutrition.fiber,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    )
  }

  const totalNutrition = getTotalNutrition(trackedFoods)
  const nutritionTargets = getNutritionTargets()

  // Calculate BMI
  const calculateBMI = (weight: number, height: number): number => {
    return weight / Math.pow(height / 100, 2)
  }

  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return "Underweight"
    if (bmi < 25) return "Normal"
    if (bmi < 30) return "Overweight"
    return "Obese"
  }

  const getRecommendationsAndMotivation = (profile: UserProfile | null) => {
    if (!profile || profile.weight === 0 || profile.height === 0 || profile.age === 0 || !profile.gender || !profile.activityLevel || !profile.goal) {
      return {
        recommendations: "Lengkapi profil Anda untuk mendapatkan rekomendasi makanan dan motivasi personal!",
        motivation: "Setiap perjalanan dimulai dengan langkah pertama. Lengkapi profil Anda sekarang!",
      }
    }

    const bmi = calculateBMI(profile.weight, profile.height)
    const bmiCategory = getBMICategory(bmi)
    let recommendations = ""
    let motivation = ""

    if (profile.goal === "lose" || bmiCategory === "Overweight" || bmiCategory === "Obese") {
      recommendations = `
        **Fokus pada:** Protein tanpa lemak (dada ayam, ikan, tahu, tempe), sayuran hijau (bayam, brokoli), buah-buahan rendah gula (apel, pir), karbohidrat kompleks porsi kecil (nasi merah, ubi).
        **Hindari:** Makanan tinggi gula, gorengan, makanan olahan, minuman manis, porsi besar.
      `
      motivation = `
        **Cukup sudah alasan!** Tubuhmu bukan tempat sampah. Setiap gigitan adalah pilihan, dan pilihanmu hari ini menentukan kesehatanmu besok. Mau terus jadi penonton atau jadi pemenang? Lemak itu bukan takdir, itu hasil dari kebiasaan. Berhenti menyalahkan genetik, mulai ubah piringmu. Disiplin itu pahit di awal, tapi manis di akhir. Mau sampai kapan menunda hidup sehat? **Bangun dan berjuang!**
      `
    } else if (profile.goal === "gain" || bmiCategory === "Underweight") {
      recommendations = `
        **Fokus pada:** Makanan padat kalori dan nutrisi. Protein tinggi (daging merah, ayam, telur, susu, kacang-kacangan), karbohidrat kompleks porsi besar (nasi putih/merah, roti gandum, pasta, ubi), lemak sehat (alpukat, minyak zaitun, kacang-kacangan).
        **Tambahan:** Makan lebih sering, porsi lebih besar, dan camilan sehat.
      `
      motivation = `
        **Membangun otot itu bukan cuma angkat beban, tapi juga angkat piring!** Kalau porsi makanmu masih kayak burung, jangan harap badanmu kayak banteng. Makan itu bagian dari latihan, bukan cuma pengisi perut. Setiap kalori yang masuk adalah bahan bakar untuk pertumbuhan. Jangan takut makan banyak, takutlah kalau kamu tidak cukup makan untuk mencapai potensimu. Disiplin di dapur sama pentingnya dengan disiplin di gym. **Jangan jadi 'skinny fat' yang cuma latihan tapi nutrisinya nol!**
      `
    } else {
      // Normal / Maintain
      recommendations = `
        **Fokus pada:** Diet seimbang. Variasi protein (ayam, ikan, telur, daging merah tanpa lemak), karbohidrat kompleks (nasi putih/merah, roti gandum), banyak sayuran dan buah, lemak sehat (alpukat, kacang-kacangan).
        **Pertahankan:** Konsistensi dalam pola makan sehat dan aktivitas fisik.
      `
      motivation = `
        **Selamat, kamu sudah di jalur yang benar!** Tapi ingat, mempertahankan itu lebih sulit daripada mencapai. Jangan lengah, konsistensi adalah kunci. Tubuhmu adalah kuil, jangan biarkan jadi reruntuhan karena kelalaian. Ini bukan garis finish, ini gaya hidup. Jangan biarkan satu 'cheat meal' merusak progresmu. Tetap waspada, tetap bergerak, tetap cerdas dalam memilih. **Kesehatan itu investasi, bukan pengeluaran!**
      `
    }

    return { recommendations, motivation }
  }

  const { recommendations, motivation } = getRecommendationsAndMotivation(userProfile)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative backdrop-blur-xl bg-white/5 border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 rounded-2xl blur opacity-50"></div>
                <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-2xl">
                  <Crown className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  NutriMeter+
                </h1>
                <p className="text-purple-300 text-sm font-medium">Advanced Nutrition Tracker</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-1 bg-white/5 backdrop-blur-lg rounded-2xl p-1.5 border border-white/10">
              <button
                onClick={() => setActiveTab("tracker")}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center ${
                  activeTab === "tracker"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "text-purple-200 hover:text-white hover:bg-white/10"
                }`}
              >
                <Sparkles className="h-4 w-4 inline mr-2" />
                Tracker
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center ${
                  activeTab === "profile"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "text-purple-200 hover:text-white hover:bg-white/10"
                }`}
              >
                <User className="h-4 w-4 inline mr-2" />
                Profil
              </button>
              <button
                onClick={() => setActiveTab("database")}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center ${
                  activeTab === "database"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "text-purple-200 hover:text-white hover:bg-white/10"
                }`}
              >
                <Star className="h-4 w-4 inline mr-2" />
                Database
              </button>
              <button
                onClick={() => setActiveTab("custom-food")}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center ${
                  activeTab === "custom-food"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "text-purple-200 hover:text-white hover:bg-white/10"
                }`}
              >
                <Utensils className="h-4 w-4 inline mr-2" />
                Makanan Kustom
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center ${
                  activeTab === "history"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "text-purple-200 hover:text-white hover:bg-white/10"
                }`}
              >
                <History className="h-4 w-4 inline mr-2" />
                Riwayat
              </button>
              <button
                onClick={() => setActiveTab("water")}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center ${
                  activeTab === "water"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "text-purple-200 hover:text-white hover:bg-white/10"
                }`}
              >
                <Droplet className="h-4 w-4 inline mr-2" />
                Air
              </button>
              <button
                onClick={() => setActiveTab("meal-plan")}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center ${
                  activeTab === "meal-plan"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "text-purple-200 hover:text-white hover:bg-white/10"
                }`}
              >
                <CalendarDays className="h-4 w-4 inline mr-2" />
                Rencana Makan
              </button>
            </nav>
          </div>
        </div>
      </header>

      {activeTab === "profile" && (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">
                Profil & Kalkulator
              </h2>
              <p className="text-xl text-purple-200">
                Masukkan data diri untuk mendapatkan target nutrisi yang dipersonalisasi
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Profile Form */}
              <div className="relative">
                <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl"></div> {/* More subtle blur */}
                <Card className="relative backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white flex items-center">
                      <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                        <Scale className="h-6 w-6 text-white" />
                      </div>
                      <span className="ml-3">Data Diri</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-purple-200 font-medium">Berat Badan (kg)</Label>
                        <Input
                          type="number"
                          placeholder="70"
                          value={userProfile?.weight || ""}
                          onChange={(e) => {
                            const weight = Number.parseFloat(e.target.value)
                            if (userProfile && !isNaN(weight)) {
                              saveUserProfile({ ...userProfile, weight })
                            } else if (!userProfile && !isNaN(weight)) {
                              saveUserProfile({
                                weight,
                                height: 0,
                                age: 0,
                                gender: "male",
                                activityLevel: "sedentary",
                                goal: "maintain",
                              })
                            }
                          }}
                          className="h-12 bg-white/10 backdrop-blur-lg border-white/20 text-white placeholder-purple-300 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-purple-200 font-medium">Tinggi Badan (cm)</Label>
                        <Input
                          type="number"
                          placeholder="170"
                          value={userProfile?.height || ""}
                          onChange={(e) => {
                            const height = Number.parseFloat(e.target.value)
                            if (userProfile && !isNaN(height)) {
                              saveUserProfile({ ...userProfile, height })
                            } else if (!userProfile && !isNaN(height)) {
                              saveUserProfile({
                                weight: 0,
                                height,
                                age: 0,
                                gender: "male",
                                activityLevel: "sedentary",
                                goal: "maintain",
                              })
                            }
                          }}
                          className="h-12 bg-white/10 backdrop-blur-lg border-white/20 text-white placeholder-purple-300 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-purple-200 font-medium">Umur (tahun)</Label>
                        <Input
                          type="number"
                          placeholder="25"
                          value={userProfile?.age || ""}
                          onChange={(e) => {
                            const age = Number.parseFloat(e.target.value)
                            if (userProfile && !isNaN(age)) {
                              saveUserProfile({ ...userProfile, age })
                            } else if (!userProfile && !isNaN(age)) {
                              saveUserProfile({
                                weight: 0,
                                height: 0,
                                age,
                                gender: "male",
                                activityLevel: "sedentary",
                                goal: "maintain",
                              })
                            }
                          }}
                          className="h-12 bg-white/10 backdrop-blur-lg border-white/20 text-white placeholder-purple-300 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-purple-200 font-medium">Jenis Kelamin</Label>
                        <Select
                          value={userProfile?.gender || ""}
                          onValueChange={(value: "male" | "female") => {
                            if (userProfile) {
                              saveUserProfile({ ...userProfile, gender: value })
                            } else {
                              saveUserProfile({
                                weight: 0,
                                height: 0,
                                age: 0,
                                gender: value,
                                activityLevel: "sedentary",
                                goal: "maintain",
                              })
                            }
                          }}
                        >
                          <SelectTrigger className="h-12 bg-white/10 backdrop-blur-lg border-white/20 text-white rounded-xl">
                            <SelectValue placeholder="Pilih jenis kelamin" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-white/20">
                            <SelectItem value="male" className="text-white">
                              Laki-laki
                            </SelectItem>
                            <SelectItem value="female" className="text-white">
                              Perempuan
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-purple-200 font-medium">Level Aktivitas</Label>
                      <Select
                        value={userProfile?.activityLevel || ""}
                        onValueChange={(value: UserProfile["activityLevel"]) => {
                          if (userProfile) {
                            saveUserProfile({ ...userProfile, activityLevel: value })
                          } else {
                            saveUserProfile({
                              weight: 0,
                              height: 0,
                              age: 0,
                              gender: "male",
                              activityLevel: value,
                              goal: "maintain",
                            })
                          }
                        }}
                      >
                        <SelectTrigger className="h-12 bg-white/10 backdrop-blur-lg border-white/20 text-white rounded-xl">
                          <SelectValue placeholder="Pilih level aktivitas" />
                        </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-white/20">
                            <SelectItem value="sedentary" className="text-white">
                              Sedentary (Tidak aktif)
                            </SelectItem>
                            <SelectItem value="light" className="text-white">
                              Light (Olahraga ringan 1-3x/minggu)
                            </SelectItem>
                            <SelectItem value="moderate" className="text-white">
                              Moderate (Olahraga 3-5x/minggu)
                            </SelectItem>
                            <SelectItem value="active" className="text-white">
                              Active (Olahraga 6-7x/minggu)
                            </SelectItem>
                            <SelectItem value="very_active" className="text-white">
                              Very Active (Olahraga 2x/hari)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-purple-200 font-medium">Tujuan</Label>
                        <Select
                          value={userProfile?.goal || ""}
                          onValueChange={(value: UserProfile["goal"]) => {
                            if (userProfile) {
                              saveUserProfile({ ...userProfile, goal: value })
                            } else {
                              saveUserProfile({
                                weight: 0,
                                height: 0,
                                age: 0,
                                gender: "male",
                                activityLevel: "sedentary",
                                goal: value,
                              })
                            }
                          }}
                        >
                          <SelectTrigger className="h-12 bg-white/10 backdrop-blur-lg border-white/20 text-white rounded-xl">
                            <SelectValue placeholder="Pilih tujuan" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-white/20">
                            <SelectItem value="lose" className="text-white">
                              Menurunkan Berat Badan
                            </SelectItem>
                            <SelectItem value="maintain" className="text-white">
                              Mempertahankan Berat Badan
                            </SelectItem>
                            <SelectItem value="gain" className="text-white">
                              Menaikkan Berat Badan
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {(!userProfile ||
                        userProfile.weight === 0 ||
                        userProfile.height === 0 ||
                        userProfile.age === 0 ||
                        !userProfile.gender ||
                        !userProfile.activityLevel ||
                        !userProfile.goal) && (
                        <Button
                          onClick={() => {
                            const defaultProfile: UserProfile = {
                              weight: 70,
                              height: 170,
                              age: 25,
                              gender: "male",
                              activityLevel: "moderate",
                              goal: "maintain",
                            }
                            saveUserProfile(defaultProfile)
                          }}
                          className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl"
                        >
                          <Calculator className="h-5 w-5 mr-2" />
                          Buat Profil
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Results */}
                {userProfile &&
                  userProfile.weight > 0 &&
                  userProfile.height > 0 &&
                  userProfile.age > 0 &&
                  userProfile.gender &&
                  userProfile.activityLevel &&
                  userProfile.goal && (
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl"></div> {/* More subtle blur */}
                      <Card className="relative backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl rounded-3xl">
                        <CardHeader>
                          <CardTitle className="text-2xl text-white flex items-center">
                            <div className="p-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl">
                              <Target className="h-6 w-6 text-white" />
                            </div>
                            <span className="ml-3">Hasil Perhitungan</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* BMI */}
                          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-lg border border-white/10">
                            <div className="text-center">
                              <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                                {calculateBMI(userProfile.weight, userProfile.height).toFixed(1)}
                              </div>
                              <div className="text-purple-200 font-medium">BMI</div>
                              <div className="text-sm text-purple-300 mt-1">
                                {getBMICategory(calculateBMI(userProfile.weight, userProfile.height))}
                              </div>
                            </div>
                          </div>

                          {/* Daily Targets */}
                          <div className="space-y-4">
                            <h4 className="text-white font-semibold text-lg">Target Harian Anda:</h4>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-lg border border-white/10">
                                <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                                  {nutritionTargets.calories}
                                </div>
                                <div className="text-purple-200 text-sm font-medium">Kalori</div>
                              </div>
                              <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-lg border border-white/10">
                                <div className="text-2xl font-bold bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
                                  {nutritionTargets.protein}g
                                </div>
                                <div className="text-purple-200 text-sm font-medium">Protein</div>
                              </div>
                              <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-lg border border-white/10">
                                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                                  {nutritionTargets.carbs}g
                                </div>
                                <div className="text-purple-200 text-sm font-medium">Karbo</div>
                              </div>
                              <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-lg border border-white/10">
                                <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                                  {nutritionTargets.fat}g
                                </div>
                                <div className="text-purple-200 text-sm font-medium">Lemak</div>
                              </div>
                            </div>

                            {/* Additional Info */}
                            <div className="p-4 bg-white/5 rounded-xl backdrop-blur-lg border border-white/10">
                              <div className="text-sm text-purple-200 space-y-2">
                                <div className="flex justify-between">
                                  <span>BMR (Metabolisme Basal):</span>
                                  <span className="text-white font-medium">
                                    {Math.round(calculateBMR(userProfile))} kal
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>TDEE (Total Kebutuhan):</span>
                                  <span className="text-white font-medium">
                                    {Math.round(calculateTDEE(userProfile))} kal
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Protein per kg BB:</span>
                                  <span className="text-white font-medium">
                                    {(calculateProteinNeeds(userProfile) / userProfile.weight).toFixed(1)}g
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Recommendations */}
                          <div className="relative">
                            <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl"></div> {/* More subtle blur */}
                            <Card className="relative backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl rounded-3xl">
                              <CardHeader>
                                <CardTitle className="text-2xl text-white flex items-center">
                                  <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                                    <Lightbulb className="h-6 w-6 text-white" />
                                  </div>
                                  <span className="ml-3">Rekomendasi Makanan</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-purple-200 whitespace-pre-line">{recommendations}</p>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Motivation */}
                          {/* <div className="relative"> */}
                            <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl"></div> {/* More subtle blur */}
                            <Card className="relative backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl rounded-3xl">
                              <CardHeader>
                                <CardTitle className="text-2xl text-white flex items-center">
                                  <div className="p-2 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl">
                                    <MessageSquare className="h-6 w-6 text-white" />
                                  </div>
                                  <span className="ml-3">Motivasi untuk Anda</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-yellow-200 whitespace-pre-line">{motivation}</p>
                              </CardContent>
                            </Card>
                          </CardContent>
                      </Card>
                      
                    </div>
                  )}
              </div>
            </div>
        </section>
      )}

        {activeTab === "tracker" && (
          <>
            {/* Hero Section */}
            <section className="relative py-16 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto text-center">
                <div className="relative">
                  <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6">
                    Smart Nutrition
                  </h2>
                  <p className="text-xl text-purple-200 mb-12 max-w-3xl mx-auto leading-relaxed">
                    Pantau asupan nutrisi Anda dengan teknologi terdepan dan target yang dipersonalisasi
                  </p>
                  {(!userProfile ||
                    userProfile.weight === 0 ||
                    userProfile.height === 0 ||
                    userProfile.age === 0 ||
                    !userProfile.gender ||
                    !userProfile.activityLevel ||
                    !userProfile.goal) && (
                    <div className="mb-8 p-4 bg-white/10 rounded-2xl backdrop-blur-lg max-w-md mx-auto border border-white/10">
                      <p className="text-yellow-200 text-sm">
                        💡 Lengkapi profil Anda untuk mendapatkan target nutrisi yang akurat!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Add Food Form */}
            <section className="py-8 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl"></div> {/* More subtle blur */}
                  <Card className="relative backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl rounded-3xl mb-8">
                    <CardHeader className="pb-6">
                      <CardTitle className="flex items-center space-x-3 text-2xl text-white">
                        <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                          <Scale className="h-6 w-6 text-white" />
                        </div>
                        <span>Tambah Makanan</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="food-search" className="text-purple-200 font-medium">
                            Cari Makanan
                          </Label>
                          <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300 h-5 w-5" />
                            {isSearching && (
                              <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-300 h-5 w-5 animate-spin" />
                            )}
                            <Input
                              id="food-search"
                              type="text"
                              placeholder="Ketik nama makanan..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-12 pr-12 h-14 bg-white/10 backdrop-blur-lg border-white/20 text-white placeholder-purple-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          {searchTerm && searchResults.length > 0 && (
                            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl max-h-80 overflow-y-auto z-10 relative">
                              {searchResults.map((food, index) => (
                                <button
                                  key={food.id}
                                  onClick={() => {
                                    setSelectedFood(food)
                                    setSearchTerm(food.name)
                                    setSearchResults([])
                                  }}
                                  className="w-full text-left px-4 py-4 hover:bg-white/10 border-b border-white/10 last:border-b-0 transition-all duration-200 first:rounded-t-2xl last:rounded-b-2xl"
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="font-medium text-white">{food.name}</div>
                                      <div className="text-sm text-purple-300">
                                        {food.category} • {food.calories} kal/100g
                                      </div>
                                    </div>
                                    <Badge
                                      variant={food.source === "local" ? "default" : "secondary"}
                                      className={`text-xs ${
                                        food.source === "local"
                                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                          : food.source === "custom"
                                          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                                          : "bg-white/20 text-purple-200"
                                      }`}
                                    >
                                      {food.source === "local" ? "🇮🇩 Lokal" : food.source === "custom" ? "✨ Kustom" : "🌍 USDA"}
                                    </Badge>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="weight" className="text-purple-200 font-medium">
                            Berat (gram)
                          </Label>
                          <Input
                            id="weight"
                            type="number"
                            placeholder="Masukkan berat..."
                            value={foodWeight}
                            onChange={(e) => setFoodWeight(e.target.value)}
                            min="1"
                            className="h-14 bg-white/10 backdrop-blur-lg border-white/20 text-white placeholder-purple-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>

                        <div className="flex items-end">
                          <Button
                            onClick={() => addTrackedFood(selectedFood!, Number.parseFloat(foodWeight))}
                            disabled={!selectedFood || !foodWeight || Number.parseFloat(foodWeight) <= 0}
                            className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="h-5 w-5 mr-2" />
                            Tambah
                          </Button>
                        </div>
                      </div>

                      {selectedFood && foodWeight && Number.parseFloat(foodWeight) > 0 && (
                        <div className="mt-6 p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
                          <h4 className="font-semibold text-white mb-4 flex items-center">
                            <Sparkles className="h-5 w-5 mr-2 text-purple-300" />
                            Preview Nutrisi:
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {(() => {
                              const preview = calculateNutrition(selectedFood, Number.parseFloat(foodWeight))
                              return (
                                <>
                                  <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-lg border border-white/10">
                                    <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                                      {preview.calories}
                                    </div>
                                    <div className="text-purple-200 text-sm font-medium">Kalori</div>
                                  </div>
                                  <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-lg border border-white/10">
                                    <div className="text-2xl font-bold bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
                                      {preview.protein}g
                                    </div>
                                    <div className="text-purple-200 text-sm font-medium">Protein</div>
                                  </div>
                                  <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-lg border border-white/10">
                                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                                      {preview.carbs}g
                                    </div>
                                    <div className="text-purple-200 text-sm font-medium">Karbo</div>
                                  </div>
                                  <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-lg border border-white/10">
                                    <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                                      {preview.fat}g
                                    </div>
                                    <div className="text-purple-200 text-sm font-medium">Lemak</div>
                                  </div>
                                  <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-lg border border-white/10">
                                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
                                      {preview.fiber}g
                                    </div>
                                    <div className="text-purple-200 text-sm font-medium">Serat</div>
                                  </div>
                                </>
                              )
                            })()}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Daily Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Nutrition Summary */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl"></div> {/* More subtle blur */}
                    <Card className="relative backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl rounded-3xl">
                      <CardHeader className="pb-6">
                        <CardTitle className="text-2xl text-white flex items-center">
                          <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                            <Crown className="h-6 w-6 text-white" />
                          </div>
                          <span className="ml-3">Ringkasan Hari Ini</span>
                          {userProfile &&
                            userProfile.weight > 0 &&
                            userProfile.height > 0 &&
                            userProfile.age > 0 &&
                            userProfile.gender &&
                            userProfile.activityLevel &&
                            userProfile.goal && (
                              <Badge className="ml-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs">
                                Dipersonalisasi
                              </Badge>
                            )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="text-center mb-6 p-6 bg-white/10 rounded-2xl backdrop-blur-lg border border-white/10">
                          <div className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                            {Math.round(totalNutrition.calories)}
                          </div>
                          <div className="text-purple-200 font-medium">Total Kalori</div>
                          <div className="text-sm text-purple-300 mt-1">Target: {nutritionTargets.calories} kal</div>
                        </div>

                        {/* <div className="space-y-6"> */}
                          <div className="space-y-3">
                            <div className="flex justify-between text-white font-medium">
                              <span className="flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div> {/* Solid color */}
                                Protein
                              </span>
                              <span className="text-purple-200">
                                {totalNutrition.protein.toFixed(1)}g / {nutritionTargets.protein}g
                              </span>
                            </div>
                            <div className="relative">
                              <div className="w-full bg-white/10 rounded-full h-3 backdrop-blur-lg">
                                <div
                                  className="bg-red-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-lg" // Solid color
                                  style={{
                                    width: `${Math.min((totalNutrition.protein / nutritionTargets.protein) * 100, 100)}%`,
                                  }}
                                ></div>
                              </div>
                              <div className="absolute inset-0 bg-red-500/20 rounded-full blur"></div> {/* Subtle blur */}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between text-white font-medium">
                              <span className="flex items-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div> {/* Solid color */}
                                Karbohidrat
                              </span>
                              <span className="text-purple-200">
                                {totalNutrition.carbs.toFixed(1)}g / {nutritionTargets.carbs}g
                              </span>
                            </div>
                            <div className="relative">
                              <div className="w-full bg-white/10 rounded-full h-3 backdrop-blur-lg">
                                <div
                                  className="bg-blue-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-lg" // Solid color
                                  style={{
                                    width: `${Math.min((totalNutrition.carbs / nutritionTargets.carbs) * 100, 100)}%`,
                                  }}
                                ></div>
                              </div>
                              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur"></div> {/* Subtle blur */}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between text-white font-medium">
                              <span className="flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div> {/* Solid color */}
                                Lemak
                              </span>
                              <span className="text-purple-200">
                                {totalNutrition.fat.toFixed(1)}g / {nutritionTargets.fat}g
                              </span>
                            </div>
                            <div className="relative">
                              <div className="w-full bg-white/10 rounded-full h-3 backdrop-blur-lg">
                                <div
                                  className="bg-green-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-lg" // Solid color
                                  style={{
                                    width: `${Math.min((totalNutrition.fat / nutritionTargets.fat) * 100, 100)}%`,
                                  }}
                                ></div>
                              </div>
                              <div className="absolute inset-0 bg-green-500/20 rounded-full blur"></div> {/* Subtle blur */}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between text-white font-medium">
                              <span className="flex items-center">
                                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div> {/* Solid color */}
                                Serat
                              </span>
                              <span className="text-purple-200">
                                {totalNutrition.fiber.toFixed(1)}g / {nutritionTargets.fiber}g
                              </span>
                            </div>
                            <div className="relative">
                              <div className="w-full bg-white/10 rounded-full h-3 backdrop-blur-lg">
                                <div
                                  className="bg-purple-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-lg" // Solid color
                                  style={{
                                    width: `${Math.min((totalNutrition.fiber / nutritionTargets.fiber) * 100, 100)}%`,
                                  }}
                                ></div>
                              </div>
                              <div className="absolute inset-0 bg-purple-500/20 rounded-full blur"></div> {/* Subtle blur */}
                            </div>
                          </div>
                        </CardContent>
                    </Card>
                  </div>

                  {/* Tracked Foods List */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl"></div> {/* More subtle blur */}
                    <Card className="relative backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl rounded-3xl">
                      <CardHeader className="pb-6">
                        <CardTitle className="text-2xl text-white flex items-center">
                          <div className="p-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl">
                            <Star className="h-6 w-6 text-white" />
                          </div>
                          <span className="ml-3">Makanan Dikonsumsi</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {trackedFoods.length === 0 ? (
                          <div className="text-center text-purple-200 py-12">
                            <div className="relative mb-6">
                              <div className="absolute inset-0 bg-white/10 rounded-full blur-xl"></div> {/* More subtle blur */}
                              <Scale className="relative h-16 w-16 mx-auto text-purple-300" />
                            </div>
                            <p className="text-lg font-medium">Belum ada makanan yang ditambahkan</p>
                            <p className="text-sm text-purple-300 mt-2">Mulai tracking nutrisi Anda</p>
                          </div>
                        ) : (
                          <div className="space-y-4 max-h-96 overflow-y-auto">
                            {trackedFoods.map((item, index) => (
                              <div
                                key={item.id}
                                className="group relative p-4 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                      <div className="font-semibold text-white text-lg">{item.food.name}</div>
                                      <Badge
                                        variant={item.food.source === "local" ? "default" : "secondary"}
                                        className={`text-xs ${
                                          item.food.source === "local"
                                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                            : item.food.source === "custom"
                                            ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                                            : "bg-white/20 text-purple-200"
                                        }`}
                                      >
                                        {item.food.source === "local" ? "🇮🇩 Lokal" : item.food.source === "custom" ? "✨ Kustom" : "🌍 USDA"}
                                      </Badge>
                                    </div>
                                    <div className="text-purple-300 font-medium mb-2">{item.weight}g</div>
                                    <div className="flex flex-wrap gap-2 text-sm">
                                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-lg">
                                        {item.calculatedNutrition.calories} kal
                                      </span>
                                      <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded-lg">
                                        {item.calculatedNutrition.protein}g protein
                                      </span>
                                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg">
                                        {item.calculatedNutrition.carbs}g karbo
                                      </span>
                                      <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-lg">
                                        {item.calculatedNutrition.fat}g lemak
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeTrackedFood(item.id)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all duration-200"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === "database" && (
          <section className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">
                  Database Makanan
                </h2>
                <p className="text-xl text-purple-200 max-w-3xl mx-auto">
                  Koleksi makanan lokal, kustom, dan internasional dengan data nutrisi akurat
                </p>
              </div>

              <div className="mb-8">
                <div className="relative max-w-2xl mx-auto">
                  <div className="absolute inset-0 bg-white/5 rounded-2xl blur-xl"></div> {/* More subtle blur */}
                  <div className="relative">
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-purple-300 h-6 w-6" />
                    <Input
                      type="text"
                      placeholder="Cari makanan..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-16 pr-6 h-16 bg-white/10 backdrop-blur-xl border-white/20 text-white placeholder-purple-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {combinedFoodDatabase
                  .filter((food) => food.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((food, index) => (
                    <div key={index} className="relative group">
                      <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div> {/* More subtle blur */}
                      <Card className="relative backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl rounded-3xl hover:bg-white/20 transition-all duration-300 group-hover:scale-105">
                        <CardHeader className="pb-4">
                          <div className="flex justify-between items-start mb-2">
                            <CardTitle className="text-xl text-white font-bold">{food.name}</CardTitle>
                            <Badge
                              className={`text-xs ${
                                food.source === "local"
                                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                  : food.source === "custom"
                                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                                  : "bg-white/20 text-purple-200"
                              }`}
                            >
                              {food.source === "local" ? "🇮🇩 Lokal" : food.source === "custom" ? "✨ Kustom" : "🌍 USDA"}
                            </Badge>
                          </div>
                          <CardDescription className="text-purple-300 font-medium">Per 100 gram</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-lg border border-white/10">
                            <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                              {food.calories}
                            </div>
                            <div className="text-purple-200 font-medium">Kalori</div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-white/5 rounded-xl backdrop-blur-lg border border-white/10">
                              <div className="text-2xl font-bold bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
                                {food.protein}g
                              </div>
                              <div className="text-purple-200 text-sm font-medium">Protein</div>
                            </div>
                            <div className="text-center p-3 bg-white/5 rounded-xl backdrop-blur-lg border border-white/10">
                              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                                {food.carbs}g
                              </div>
                              <div className="text-purple-200 text-sm font-medium">Karbo</div>
                            </div>
                            <div className="text-center p-3 bg-white/5 rounded-xl backdrop-blur-lg border border-white/10">
                              <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                                {food.fat}g
                              </div>
                              <div className="text-purple-200 text-sm font-medium">Lemak</div>
                            </div>
                            <div className="text-center p-3 bg-white/5 rounded-xl backdrop-blur-lg border border-white/10">
                              <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
                                {food.fiber}g
                              </div>
                              <div className="text-purple-200 text-sm font-medium">Serat</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === "custom-food" && (
          <section className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">
                  Makanan Kustom
                </h2>
                <p className="text-xl text-purple-200 max-w-3xl mx-auto">
                  Tambahkan makanan Anda sendiri ke database NutriMeter+
                </p>
              </div>
              <CustomFoodForm
                onAddFood={(newFood) => {
                  setCustomFoods((prev) => [...prev, newFood])
                  setIsCustomFoodDialogOpen(false)
                }}
                existingFoods={customFoods}
              />
            </div>
          </section>
        )}

        {activeTab === "history" && (
          <section className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">
                  Riwayat Nutrisi
                </h2>
                <p className="text-xl text-purple-200 max-w-3xl mx-auto">
                  Lihat ringkasan nutrisi dan makanan yang Anda konsumsi di hari-hari sebelumnya
                </p>
              </div>
              <DailyHistory
                dailyTrackedFoodsHistory={dailyTrackedFoodsHistory}
                getTotalNutrition={getTotalNutrition}
                nutritionTargets={nutritionTargets}
              />
            </div>
          </section>
        )}

        {activeTab === "water" && (
          <section className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">
                  Pelacak Air
                </h2>
                <p className="text-xl text-purple-200 max-w-3xl mx-auto">
                  Pantau asupan air harian Anda untuk tetap terhidrasi
                </p>
              </div>
              <WaterTracker
                dailyWaterIntake={dailyWaterIntake}
                setDailyWaterIntake={setDailyWaterIntake}
                today={today}
              />
            </div>
          </section>
        )}

        {activeTab === "meal-plan" && (
          <section className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">
                  Rencana Makan
                </h2>
                <p className="text-xl text-purple-200 max-w-3xl mx-auto">
                  Rencanakan makanan Anda untuk hari-hari mendatang
                </p>
              </div>
              <MealPlanner
                mealPlans={mealPlans}
                setMealPlans={setMealPlans}
                combinedFoodDatabase={combinedFoodDatabase}
                addTrackedFood={addTrackedFood}
                calculateNutrition={calculateNutrition}
              />
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="relative mt-20 backdrop-blur-xl bg-white/5 border-t border-white/10">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 rounded-2xl blur opacity-50"></div>
                <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-2xl">
                  <Crown className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h4 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  NutriMeter+
                </h4>
                <p className="text-purple-300 text-sm">Advanced Nutrition Experience</p>
              </div>
            </div>
            <p className="text-purple-200 mb-6 max-w-2xl mx-auto">
              Platform untuk tracking nutrisi makanan Indonesia dengan teknologi terdepan dan target yang dipersonalisasi
            </p>
            <div className="flex justify-center space-x-8 text-sm mb-8">
              <a href="#" className="text-purple-300 hover:text-white transition-colors duration-200">
                Kebijakan Privasi
              </a>
              <a href="#" className="text-purple-300 hover:text-white transition-colors duration-200">
                Syarat & Ketentuan
              </a>
              <a href="#" className="text-purple-300 hover:text-white transition-colors duration-200">
                Kontak
              </a>
            </div>
            <div className="pt-8 border-t border-white/10 text-purple-300">© 2024 NutriMeter+. Semua hak dilindungi.</div>
          </div>
        </footer>
      </div>
    );
}
