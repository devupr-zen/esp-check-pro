import React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { GlassCard } from "@/components/reusable/GlassCard"

interface DonutChartProps {
  data: Array<{
    name: string
    value: number
    color: string
  }>
  title: string
  centerValue?: string
  centerLabel?: string
  height?: number
}

export function DonutChart({ 
  data, 
  title, 
  centerValue, 
  centerLabel, 
  height = 300 
}: DonutChartProps) {
  const RADIAN = Math.PI / 180
  
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  const renderCenterContent = () => {
    if (!centerValue && !centerLabel) return null
    
    return (
      <g>
        <text 
          x="50%" 
          y="45%" 
          textAnchor="middle" 
          dominantBaseline="middle" 
          className="fill-foreground text-2xl font-bold"
        >
          {centerValue}
        </text>
        <text 
          x="50%" 
          y="55%" 
          textAnchor="middle" 
          dominantBaseline="middle" 
          className="fill-muted-foreground text-sm"
        >
          {centerLabel}
        </text>
      </g>
    )
  }

  return (
    <GlassCard className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              innerRadius={45}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '10px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            {renderCenterContent()}
          </PieChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  )
}