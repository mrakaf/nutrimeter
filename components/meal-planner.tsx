"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarDays, Plus, Search, Trash2, CheckCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, addDays, subDays } from "date-fns"
import { id } from "date-fns/locale" // Import Indonesian locale

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

interface NutritionTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

interface MealPlannerProps {
  mealPlans: Record<string, FoodItem[]>
  setMealPlans: React.Dispatch<React.SetStateAction<Record<string, FoodItem[]>>>
  combinedFoodDatabase: FoodItem[]
  addTrackedFood: (food: FoodItem, weight: number) => void
  calculateNutrition: (food: FoodItem, weight: number) => NutritionTotals
}

export default function MealPlanner({
  mealPlans,
  setMealPlans,
  combinedFoodDatabase,
  addTrackedFood,
  calculateNutrition,
}: MealPlannerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<FoodItem[]>([])
  const [selectedFoodToAdd, setSelectedFoodToAdd] = useState<FoodItem | null>(null)
  const [foodWeight, setFoodWeight] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  const formattedDate = format(selectedDate, "yyyy-MM-dd")
  const plannedFoodsForSelectedDate = mealPlans[formattedDate] || []

  const searchFood = (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    const results = combinedFoodDatabase
      .filter((food) => food.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10)
    setSearchResults(results)
    setIsSearching(false)
  }

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    const timeout = setTimeout(() => {
      searchFood(searchTerm)
    }, 300)
    setSearchTimeout(timeout)
    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [searchTerm])

  const addFoodToPlan = () => {
    if (selectedFoodToAdd && foodWeight && Number.parseFloat(foodWeight) > 0) {
      const weight = Number.parseFloat(foodWeight)
      const foodWithWeight: FoodItem = {
        ...selectedFoodToAdd,
        id: `${selectedFoodToAdd.id}-${Date.now()}`, // Unique ID for planned item
        calories: calculateNutrition(selectedFoodToAdd, weight).calories,
        protein: calculateNutrition(selectedFoodToAdd, weight).protein,
        carbs: calculateNutrition(selectedFoodToAdd, weight).carbs,
        fat: calculateNutrition(selectedFoodToAdd, weight).fat,
        fiber: calculateNutrition(selectedFoodToAdd, weight).fiber,
        name: `${selectedFoodToAdd.name} (${weight}g)`, // Display weight in name for plan
      }

      setMealPlans((prev) => ({
        ...prev,
        [formattedDate]: [...(prev[formattedDate] || []), foodWithWeight],
      }))

      setSelectedFoodToAdd(null)
      setFoodWeight("")
      setSearchTerm("")
      setSearchResults([])
    }
  }

  const removeFoodFromPlan = (idToRemove: string) => {
    setMealPlans((prev) => ({
      ...prev,
      [formattedDate]: (prev[formattedDate] || []).filter((food) => food.id !== idToRemove),
    }))
  }

  const trackPlannedFood = (food: FoodItem) => {
    // Extract original food item and weight from the planned food's modified name
    const match = food.name.match(/(.*) $$(\d+)g$$/)
    if (match) {
      const originalName = match[1].trim()
      const originalWeight = Number.parseFloat(match[2])
      const originalFoodItem = combinedFoodDatabase.find((f) => f.name === originalName)

      if (originalFoodItem) {
        addTrackedFood(originalFoodItem, originalWeight)
        removeFoodFromPlan(food.id) // Remove from plan after tracking
      } else {
        // Fallback if original food not found (e.g., custom food was deleted)
        // Use the planned food's current nutrition values directly
        const calculatedNutrition = {
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          fiber: food.fiber,
        }
        const newTrackedFood = {
          id: Date.now().toString(),
          food: { ...food, name: originalName, id: food.id.split("-")[0] + "-" + Date.now() }, // Revert name for tracking
          weight: originalWeight,
          calculatedNutrition: calculatedNutrition,
          date: format(new Date(), "yyyy-MM-dd"),
        }
        // Directly add to dailyTrackedFoodsHistory (assuming it's passed down or accessible)
        // This requires a prop or context to update dailyTrackedFoodsHistory in page.tsx
        // For now, I'll just call addTrackedFood which handles this.
        addTrackedFood({ ...food, name: originalName, id: food.id.split("-")[0] + "-" + Date.now() }, originalWeight)
        removeFoodFromPlan(food.id)
      }
    }
  }

  const totalPlannedNutrition = plannedFoodsForSelectedDate.reduce(
    (total, item) => ({
      calories: total.calories + item.calories,
      protein: total.protein + item.protein,
      carbs: total.carbs + item.carbs,
      fat: total.fat + item.fat,
      fiber: total.fiber + item.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  )

  return (
    <Card className="relative backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl rounded-3xl">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center space-x-3 text-2xl text-white">
          <div className="p-2 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-xl">
            <CalendarDays className="h-6 w-6 text-white" />
          </div>
          <span>Rencana Makan</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Selector */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            className="text-purple-200 hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-[280px] justify-center text-left font-normal h-12 bg-white/10 backdrop-blur-lg border-white/20 text-white rounded-xl hover:bg-white/20"
              >
                <CalendarDays className="mr-2 h-4 w-4 text-purple-300" />
                {format(selectedDate, "PPP", { locale: id })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-slate-800 border-white/20 rounded-xl">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                locale={id}
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="text-purple-200 hover:bg-white/10 hover:text-white"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Add Food to Plan Form */}
        <div className="space-y-6 p-6 bg-white/10 rounded-2xl backdrop-blur-lg border border-white/10">
          <h4 className="font-semibold text-white mb-4 flex items-center">
            <Plus className="h-5 w-5 mr-2 text-purple-300" />
            Tambahkan ke Rencana
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan-food-search" className="text-purple-200 font-medium">
                Cari Makanan
              </Label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300 h-5 w-5" />
                {isSearching && (
                  <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-300 h-5 w-5 animate-spin" />
                )}
                <Input
                  id="plan-food-search"
                  type="text"
                  placeholder="Ketik nama makanan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-12 h-12 bg-white/10 backdrop-blur-lg border-white/20 text-white placeholder-purple-300 rounded-xl"
                />
              </div>
              {searchTerm && searchResults.length > 0 && (
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl max-h-40 overflow-y-auto z-10 relative">
                  {searchResults.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => {
                        setSelectedFoodToAdd(food)
                        setSearchTerm(food.name)
                        setSearchResults([])
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-white/10 border-b border-white/10 last:border-b-0 transition-all duration-200"
                    >
                      <div className="font-medium text-white">{food.name}</div>
                      <div className="text-sm text-purple-300">{food.calories} kal/100g</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-weight" className="text-purple-200 font-medium">
                Berat (gram)
              </Label>
              <Input
                id="plan-weight"
                type="number"
                placeholder="Masukkan berat..."
                value={foodWeight}
                onChange={(e) => setFoodWeight(e.target.value)}
                min="1"
                className="h-12 bg-white/10 backdrop-blur-lg border-white/20 text-white placeholder-purple-300 rounded-xl"
              />
            </div>
          </div>
          <Button
            onClick={addFoodToPlan}
            disabled={!selectedFoodToAdd || !foodWeight || Number.parseFloat(foodWeight) <= 0}
            className="w-full h-12 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-5 w-5 mr-2" />
            Tambahkan ke Rencana
          </Button>
        </div>

        {/* Planned Foods List */}
        <div className="mt-8 space-y-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <CalendarDays className="h-5 w-5 mr-2 text-purple-300" />
            Makanan Terencana untuk {format(selectedDate, "PPP", { locale: id })}
          </h3>
          {plannedFoodsForSelectedDate.length === 0 ? (
            <p className="text-purple-300 text-center py-4">Belum ada makanan yang direncanakan untuk tanggal ini.</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {plannedFoodsForSelectedDate.map((food) => (
                <div
                  key={food.id}
                  className="p-4 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium text-white">{food.name}</div>
                    <div className="text-sm text-purple-300">
                      {food.calories} kal • {food.protein}g protein • {food.carbs}g karbo • {food.fat}g lemak
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => trackPlannedFood(food)}
                      className="text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-xl transition-all duration-200"
                      title="Lacak Makanan Ini"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFoodFromPlan(food.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all duration-200"
                      title="Hapus dari Rencana"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total Planned Nutrition */}
        {plannedFoodsForSelectedDate.length > 0 && (
          <div className="mt-6 p-6 bg-white/10 rounded-2xl backdrop-blur-lg border border-white/10">
            <h4 className="font-semibold text-white mb-4">Total Nutrisi Terencana:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white/5 rounded-xl backdrop-blur-lg border border-white/10">
                <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  {totalPlannedNutrition.calories}
                </div>
                <div className="text-purple-200 text-sm font-medium">Kalori</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-xl backdrop-blur-lg border border-white/10">
                <div className="text-2xl font-bold bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
                  {totalPlannedNutrition.protein}g
                </div>
                <div className="text-purple-200 text-sm font-medium">Protein</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-xl backdrop-blur-lg border border-white/10">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                  {totalPlannedNutrition.carbs}g
                </div>
                <div className="text-purple-200 text-sm font-medium">Karbo</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-xl backdrop-blur-lg border border-white/10">
                <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  {totalPlannedNutrition.fat}g
                </div>
                <div className="text-purple-200 text-sm font-medium">Lemak</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
