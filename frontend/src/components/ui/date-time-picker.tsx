"use client"

import * as React from "react"
import { format, parseISO, isValid } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateTimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
}

import { buttonVariants } from "@/components/ui/button"

export function DateTimePicker({ value, onChange, label }: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  
  // Parse initial date and time
  const dateValue = value ? parseISO(value) : undefined
  const timeString = value && value.includes('T') ? value.split('T')[1].slice(0, 5) : "10:30"

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      // Keep the existing time if possible
      const time = timeString || "00:00"
      const y = newDate.getFullYear()
      const m = String(newDate.getMonth() + 1).padStart(2, '0')
      const d = String(newDate.getDate()).padStart(2, '0')
      onChange?.(`${y}-${m}-${d}T${time}`)
      setOpen(false)
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    if (dateValue && isValid(dateValue)) {
      const y = dateValue.getFullYear()
      const m = String(dateValue.getMonth() + 1).padStart(2, '0')
      const d = String(dateValue.getDate()).padStart(2, '0')
      onChange?.(`${y}-${m}-${d}T${newTime}`)
    } else {
      // If no date, use today
      const now = new Date()
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, '0')
      const d = String(now.getDate()).padStart(2, '0')
      onChange?.(`${y}-${m}-${d}T${newTime}`)
    }
  }

  return (
    <FieldGroup className="flex-col gap-2 w-full">
      <Field className="w-full">
        <FieldLabel>{label || "Date"}</FieldLabel>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <button
                type="button"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full justify-start text-left font-medium border-[#d0d7de] h-9 px-3 cursor-pointer",
                  !dateValue && "text-slate-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                {dateValue && isValid(dateValue) ? format(dateValue, "PPP") : "Select date"}
              </button>
            }
          />
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </Field>
      <Field className="w-full">
        <FieldLabel>Time</FieldLabel>
        <div className="relative group">
          <Input
            type="time"
            value={timeString}
            onChange={handleTimeChange}
            className="h-9 w-full pl-9 border-[#d0d7de] bg-white focus:ring-1 focus:ring-blue-500/20 text-xs font-bold"
          />
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
        </div>
      </Field>
    </FieldGroup>
  )
}
