"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Droplet, Plus, CheckCircle, XCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface WaterTrackerProps {
  dailyWaterIntake: Record<string, number>
  setDailyWaterIntake: React.Dispatch<React.SetStateAction<Record<string, number>>>
  today: string
}

export default function WaterTracker({ dailyWaterIntake, setDailyWaterIntake, today }: WaterTrackerProps) {
  const [targetWater, setTargetWater] = useState(2000) // Default target: 2000ml
  const [inputTargetWater, setInputTargetWater] = useState(targetWater.toString())

  // Load target water from localStorage on mount
  useEffect(() => {
    const savedTarget = localStorage.getItem("nutriMeterWaterTarget")
    if (savedTarget) {
      const parsedTarget = Number.parseInt(savedTarget)
      if (!isNaN(parsedTarget) && parsedTarget > 0) {
        setTargetWater(parsedTarget)
        setInputTargetWater(parsedTarget.toString())
      }
    }
  }, [])

  // Save target water to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("nutriMeterWaterTarget", targetWater.toString())
  }, [targetWater])

  const currentWater = dailyWaterIntake[today] || 0
  const progress = Math.min((currentWater / targetWater) * 100, 100)

  const addWater = (amount: number) => {
    setDailyWaterIntake((prev) => ({
      ...prev,
      [today]: (prev[today] || 0) + amount,
    }))
  }

  const resetWater = () => {
    setDailyWaterIntake((prev) => ({
      ...prev,
      [today]: 0,
    }))
  }

  const handleSetTarget = () => {
    const newTarget = Number.parseInt(inputTargetWater)
    if (!isNaN(newTarget) && newTarget > 0) {
      setTargetWater(newTarget)
    } else {
      alert("Target air harus angka positif!")
    }
  }

  const remainingWater = targetWater - currentWater

  return (
    <Card className="relative backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl rounded-3xl">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center space-x-3 text-2xl text-white">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl">
            <Droplet className="h-6 w-6 text-white" />
          </div>
          <span>Asupan Air Harian</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Target Setting */}
        <div className="space-y-2 p-4 bg-white/10 rounded-2xl backdrop-blur-lg border border-white/10">
          <Label htmlFor="water-target" className="text-purple-200 font-medium">
            Target Air Harian (ml)
          </Label>
          <div className="flex gap-2">
            <Input
              id="water-target"
              type="number"
              placeholder="Contoh: 2000"
              value={inputTargetWater}
              onChange={(e) => setInputTargetWater(e.target.value)}
              className="h-12 bg-white/10 backdrop-blur-lg border-white/20 text-white placeholder-purple-300 rounded-xl flex-1"
              min="1"
            />
            <Button
              onClick={handleSetTarget}
              className="h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-xl"
            >
              Konfirmasi
            </Button>
          </div>
        </div>

        <div className="text-center mb-6 p-6 bg-white/10 rounded-2xl backdrop-blur-lg border border-white/10">
          <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
            {currentWater} ml
          </div>
          <div className="text-purple-200 font-medium">Total Air Dikonsumsi</div>
          <div className="text-sm text-purple-300 mt-1">Target: {targetWater} ml</div>
        </div>

        <div className="space-y-4">
          <Progress
            value={progress}
            className="h-4 bg-white/20"
            indicatorClassName="bg-gradient-to-r from-blue-500 to-cyan-500"
          />
          <div className="flex justify-between text-purple-200 text-sm">
            <span>0 ml</span>
            <span>{targetWater} ml</span>
          </div>
        </div>

        {/* Status Message */}
        <div
          className={`p-4 rounded-xl border flex items-center space-x-3 ${
            currentWater >= targetWater
              ? "bg-green-500/20 border-green-500 text-green-300"
              : "bg-yellow-500/20 border-yellow-500 text-yellow-300"
          }`}
        >
          {currentWater >= targetWater ? <CheckCircle className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
          <p className="font-medium">
            {currentWater >= targetWater
              ? "Selamat! Kebutuhan air Anda sudah tercukupi hari ini!"
              : `Anda masih membutuhkan ${remainingWater} ml air lagi untuk mencapai target harian.`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => addWater(250)}
            className="h-14 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="h-5 w-5 mr-2" />
            Tambah 250ml
          </Button>
          <Button
            onClick={() => addWater(500)}
            className="h-14 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="h-5 w-5 mr-2" />
            Tambah 500ml
          </Button>
        </div>
        <Button
          onClick={resetWater}
          variant="outline"
          className="w-full h-12 border-white/20 text-purple-200 hover:bg-white/10 hover:text-white rounded-2xl transition-all duration-300 bg-transparent"
        >
          Reset Hari Ini
        </Button>
      </CardContent>
    </Card>
  )
}
