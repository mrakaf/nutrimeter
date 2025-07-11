"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Utensils } from "lucide-react"

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

interface CustomFoodFormProps {
  onAddFood: (food: FoodItem) => void
  existingFoods: FoodItem[]
}

export default function CustomFoodForm({ onAddFood, existingFoods }: CustomFoodFormProps) {
  const [name, setName] = useState("")
  const [calories, setCalories] = useState("")
  const [protein, setProtein] = useState("")
  const [carbs, setCarbs] = useState("")
  const [fat, setFat] = useState("")
  const [fiber, setFiber] = useState("")
  const [category, setCategory] = useState("Lain-lain")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const newCalories = Number.parseFloat(calories)
    const newProtein = Number.parseFloat(protein)
    const newCarbs = Number.parseFloat(carbs)
    const newFat = Number.parseFloat(fat)
    const newFiber = Number.parseFloat(fiber)

    if (!name || isNaN(newCalories) || isNaN(newProtein) || isNaN(newCarbs) || isNaN(newFat) || isNaN(newFiber)) {
      setError("Harap isi semua kolom nutrisi dengan angka yang valid.")
      return
    }

    if (existingFoods.some((food) => food.name.toLowerCase() === name.toLowerCase())) {
      setError("Makanan dengan nama ini sudah ada di database kustom Anda.")
      return
    }

    const newFood: FoodItem = {
      id: `custom-${Date.now()}`,
      name,
      calories: newCalories,
      protein: newProtein,
      carbs: newCarbs,
      fat: newFat,
      fiber: newFiber,
      category,
      source: "custom",
    }

    onAddFood(newFood)
    // Reset form
    setName("")
    setCalories("")
    setProtein("")
    setCarbs("")
    setFat("")
    setFiber("")
    setCategory("Lain-lain")
  }

  return (
    <Card className="relative backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl rounded-3xl">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center space-x-3 text-2xl text-white">
          <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl">
            <Utensils className="h-6 w-6 text-white" />
          </div>
          <span>Tambah Makanan Baru</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="food-name" className="text-purple-200 font-medium">
              Nama Makanan
            </Label>
            <Input
              id="food-name"
              type="text"
              placeholder="Contoh: Nasi Goreng Spesial"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 bg-white/10 backdrop-blur-lg border-white/20 text-white placeholder-purple-300 rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-purple-200 font-medium">
              Kategori
            </Label>
            <Input
              id="category"
              type="text"
              placeholder="Contoh: Makanan Utama, Cemilan, Minuman"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-12 bg-white/10 backdrop-blur-lg border-white/20 text-white placeholder-purple-300 rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories" className="text-purple-200 font-medium">
                Kalori (per 100g)
              </Label>
              <Input
                id="calories"
                type="number"
                placeholder="Kalori"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="h-12 bg-white/10 backdrop-blur-lg border-white/20 text-white placeholder-purple-300 rounded-xl"
                min="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protein" className="text-purple-200 font-medium">
                Protein (g per 100g)
              </Label>
              <Input
                id="protein"
                type="number"
                placeholder="Protein"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="h-12 bg-white/10 backdrop-blur-lg border-white/20 text-white placeholder-purple-300 rounded-xl"
                min="0"
                step="0.1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs" className="text-purple-200 font-medium">
                Karbohidrat (g per 100g)
              </Label>
              <Input
                id="carbs"
                type="number"
                placeholder="Karbohidrat"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="h-12 bg-white/10 backdrop-blur-lg border-white/20 text-white placeholder-purple-300 rounded-xl"
                min="0"
                step="0.1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fat" className="text-purple-200 font-medium">
                Lemak (g per 100g)
              </Label>
              <Input
                id="fat"
                type="number"
                placeholder="Lemak"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="h-12 bg-white/10 backdrop-blur-lg border-white/20 text-white placeholder-purple-300 rounded-xl"
                min="0"
                step="0.1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiber" className="text-purple-200 font-medium">
                Serat (g per 100g)
              </Label>
              <Input
                id="fiber"
                type="number"
                placeholder="Serat"
                value={fiber}
                onChange={(e) => setFiber(e.target.value)}
                className="h-12 bg-white/10 backdrop-blur-lg border-white/20 text-white placeholder-purple-300 rounded-xl"
                min="0"
                step="0.1"
                required
              />
            </div>
          </div>

          {error && <div className="p-3 bg-red-500/20 text-red-300 rounded-xl border border-red-500">{error}</div>}

          <Button
            type="submit"
            className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="h-5 w-5 mr-2" />
            Tambahkan Makanan Kustom
          </Button>
        </form>

        <div className="mt-8 space-y-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Utensils className="h-5 w-5 mr-2 text-purple-300" />
            Daftar Makanan Kustom Anda
          </h3>
          {existingFoods.length === 0 ? (
            <p className="text-purple-300 text-center py-4">Belum ada makanan kustom yang ditambahkan.</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {existingFoods.map((food) => (
                <div
                  key={food.id}
                  className="p-4 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium text-white">{food.name}</div>
                    <div className="text-sm text-purple-300">
                      {food.category} • {food.calories} kal/100g
                    </div>
                  </div>
                  {/* Add delete functionality if desired */}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
