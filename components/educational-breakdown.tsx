'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Music2, 
  HeartPulse, 
  Layers, 
  Sparkles,
  Lightbulb 
} from 'lucide-react'
import type { EducationalBreakdown as EducationalBreakdownType } from '@/app/api/generate/route'

interface EducationalBreakdownProps {
  data: EducationalBreakdownType
}

export function EducationalBreakdown({ data }: EducationalBreakdownProps) {
  if (!data) {
    return null
  }

  const sections = [
    {
      icon: Music2,
      title: 'Track Vibe',
      content: data.summary,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: HeartPulse,
      title: 'Rhythm & Energy',
      content: data.rhythm_lesson,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: Layers,
      title: 'Harmony & Structure',
      content: data.harmonic_lesson,
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10',
    },
    {
      icon: Sparkles,
      title: 'Instrument Magic',
      content: data.instrument_spotlight,
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
    },
    {
      icon: Lightbulb,
      title: 'Pro Tip',
      content: data.fun_fact,
      color: 'text-chart-5',
      bgColor: 'bg-chart-5/10',
    },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <span className="h-8 w-1 bg-primary rounded-full" />
        Your Music Lesson
      </h2>
      
      <div className="grid gap-4">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <Card 
              key={section.title} 
              className="bg-card border-border overflow-hidden"
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className={`p-2 rounded-lg ${section.bgColor}`}>
                    <Icon className={`h-5 w-5 ${section.color}`} />
                  </div>
                  <span className="text-foreground">{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
