import React from "react"
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { GlassCard } from "@/components/reusable/GlassCard"

interface BarChartProps {
  data: Array<{
    name: string
    value: number
    comparison?: number
  }>
  title: string
  height?: number
  color?: string
  comparisonColor?: string
}

export function BarChart({ 
  data, 
  title, 
  height = 300,
  color = "hsl(var(--accent))",
  comparisonColor = "hsl(var(--chart-teal))"
}: BarChartProps) {
  return (
    <GlassCard className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '10px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar 
              dataKey="value" 
              fill={color}
              radius={[4, 4, 0, 0]}
              name="Your Score"
            />
            {data[0]?.comparison !== undefined && (
              <Bar 
                dataKey="comparison" 
                fill={comparisonColor}
                radius={[4, 4, 0, 0]}
                name="Class Average"
              />
            )}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  )
}