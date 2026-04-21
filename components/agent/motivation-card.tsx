"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Lightbulb, Quote } from "lucide-react"

const TIPS = [
  {
    tip: "The first 7 seconds decide the call. Lead with energy, name, and purpose.",
    author: "Sales Coaching",
  },
  {
    tip: "Objections are information, not rejection. Mirror the last three words.",
    author: "Chris Voss, Never Split the Difference",
  },
  {
    tip: "You miss 100% of the closes you don't ask for. Always ask twice.",
    author: "Floor Legend",
  },
  {
    tip: "The best close is when they're already saying yes. Listen for the buying signals.",
    author: "Sales Coaching",
  },
  {
    tip: "Silence is your friend after the price is stated. Let them speak first.",
    author: "Zig Ziglar",
  },
  {
    tip: "Every 'no' puts you closer to a 'yes'. Keep the dials coming.",
    author: "Floor Wisdom",
  },
  {
    tip: "If you can't explain it in 30 seconds, you don't understand it well enough.",
    author: "Sales Coaching",
  },
  {
    tip: "Tie every benefit back to their pain. Features tell, emotions sell.",
    author: "Sales Coaching",
  },
  {
    tip: "Hardest workers don't always win. Smartest workers do. Review your call recordings.",
    author: "Team Lead Wisdom",
  },
  {
    tip: "You don't rise to the level of your goals, you fall to the level of your systems.",
    author: "James Clear, Atomic Habits",
  },
]

export function MotivationCard() {
  const [tip] = React.useState(
    () => TIPS[Math.floor(Math.random() * TIPS.length)],
  )

  return (
    <Card className="relative overflow-hidden p-5">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-chart-4/10 blur-2xl"
      />
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-chart-4/20">
            <Lightbulb className="size-4 text-chart-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Pro Tip of the Day</h3>
            <p className="text-[11px] text-muted-foreground">
              Refreshes at midnight
            </p>
          </div>
        </div>

        <div className="mt-4">
          <Quote className="size-5 text-chart-4/50" />
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            {tip.tip}
          </p>
          <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            — {tip.author}
          </p>
        </div>
      </div>
    </Card>
  )
}
