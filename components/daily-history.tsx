"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FoodItem {
  id: string
  name: string
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

interface NutritionTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

interface DailyHistoryProps {
  dailyTrackedFoodsHistory: Record<string, TrackedFood[]>
  getTotalNutrition: (foods: TrackedFood[]) => NutritionTotals
  nutritionTargets: NutritionTotals
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  return new Date(dateString).toLocaleDateString("id-ID", options)
}

export default function DailyHistory({
  dailyTrackedFoodsHistory,
  getTotalNutrition,
  nutritionTargets,
}: DailyHistoryProps) {
  const sortedDates = useMemo(() => {
    return Object.keys(dailyTrackedFoodsHistory).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  }, [dailyTrackedFoodsHistory])

  const [selectedDateIndex, setSelectedDateIndex] = useState(0)

  const currentSelectedDate = sortedDates[selectedDateIndex]
  const foodsForSelectedDate = dailyTrackedFoodsHistory[currentSelectedDate] || []
  const totalNutritionForSelectedDate = getTotalNutrition(foodsForSelectedDate)

  const handlePrevDay = () => {
    setSelectedDateIndex((prev) => Math.min(prev + 1, sortedDates.length - 1))
  }

  const handleNextDay = () => {
    setSelectedDateIndex((prev) => Math.max(prev - 1, 0))
  }

  return (
    <Card className="relative backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl rounded-3xl">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center space-x-3 text-2xl text-white">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
            <History className="h-6 w-6 text-white" />
          </div>
          <span>Riwayat Harian</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {sortedDates.length === 0 ? (
          <div className="text-center text-purple-200 py-12">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-xl"></div>
              <History className="relative h-16 w-16 mx-auto text-purple-300" />
            </div>
            <p className="text-lg font-medium">Belum ada riwayat nutrisi.</p>
            <p className="text-sm text-purple-300 mt-2">Mulai lacak makanan Anda di tab Tracker!</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevDay}
                disabled={selectedDateIndex === sortedDates.length - 1}
                className="text-purple-200 hover:bg-white/10 hover:text-white"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <h3 className="text-xl font-bold text-white text-center">{formatDate(currentSelectedDate)}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextDay}
                disabled={selectedDateIndex === 0}
                className="text-purple-200 hover:bg-white/10 hover:text-white"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Summary for selected day */}
            <div className="text-center mb-6 p-6 bg-white/10 rounded-2xl backdrop-blur-lg border border-white/10">
              <div className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                {Math.round(totalNutritionForSelectedDate.calories)}
              </div>
              <div className="text-purple-200 font-medium">Total Kalori</div>
              <div className="text-sm text-purple-300 mt-1">Target: {nutritionTargets.calories} kal</div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-white/5 rounded-xl backdrop-blur-lg border border-white/10">
                <div className="text-2xl font-bold bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
                  {totalNutritionForSelectedDate.protein.toFixed(1)}g
                </div>
                <div className="text-purple-200 text-sm font-medium">Protein</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-xl backdrop-blur-lg border border-white/10">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                  {totalNutritionForSelectedDate.carbs.toFixed(1)}g
                </div>
                <div className="text-purple-200 text-sm font-medium">Karbo</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-xl backdrop-blur-lg border border-white/10">
                <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  {totalNutritionForSelectedDate.fat.toFixed(1)}g
                </div>
                <div className="text-purple-200 text-sm font-medium">Lemak</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-xl backdrop-blur-lg border border-white/10">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
                  {totalNutritionForSelectedDate.fiber.toFixed(1)}g
                </div>
                <div className="text-purple-200 text-sm font-medium">Serat</div>
              </div>
            </div>

            {/* List of foods for selected day */}
            <h4 className="text-white font-semibold text-lg mb-4">Makanan Dikonsumsi:</h4>
            {foodsForSelectedDate.length === 0 ? (
              <p className="text-purple-300 text-center py-4">Tidak ada makanan yang dilacak pada tanggal ini.</p>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {foodsForSelectedDate.map((item) => (
                  <div
                    key={item.id}
                    className="group relative p-4 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="font-semibold text-white text-lg">{item.food.name}</div>
                          <Badge
                            className={`text-xs ${
                              item.food.source === "local"
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                : item.food.source === "custom"
                                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                                  : "bg-white/20 text-purple-200"
                            }`}
                          >
                            {item.food.source === "local"
                              ? "🇮🇩 Lokal"
                              : item.food.source === "custom"
                                ? "✨ Kustom"
                                : "🌍 USDA"}
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
