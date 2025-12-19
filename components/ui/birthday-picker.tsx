"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface BirthdayPickerProps {
    date?: Date
    onDateChange?: (date: Date | undefined) => void
    placeholder?: string
    className?: string
    disabled?: boolean
}

const MONTHS = [
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" },
]

// Generate years from current year down to 100 years ago
const generateYears = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let i = currentYear; i >= currentYear - 100; i--) {
        years.push({ value: i.toString(), label: i.toString() })
    }
    return years
}

// Generate days based on month and year
const generateDays = (month: number, year: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = []
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({ value: i.toString(), label: i.toString() })
    }
    return days
}

export function BirthdayPicker({
    date,
    onDateChange,
    placeholder = "Select birth date",
    className,
    disabled = false,
}: BirthdayPickerProps) {
    const [selectedMonth, setSelectedMonth] = React.useState<string | undefined>(
        date ? date.getMonth().toString() : undefined
    )
    const [selectedDay, setSelectedDay] = React.useState<string | undefined>(
        date ? date.getDate().toString() : undefined
    )
    const [selectedYear, setSelectedYear] = React.useState<string | undefined>(
        date ? date.getFullYear().toString() : undefined
    )

    const years = React.useMemo(() => generateYears(), [])
    const days = React.useMemo(() => {
        const month = selectedMonth ? parseInt(selectedMonth) : 0
        const year = selectedYear ? parseInt(selectedYear) : new Date().getFullYear()
        return generateDays(month, year)
    }, [selectedMonth, selectedYear])
    const isInternalUpdate = React.useRef(false)

    // Update internal state when date prop changes
    React.useEffect(() => {
        isInternalUpdate.current = true
        if (date) {
            setSelectedMonth(date.getMonth().toString())
            setSelectedDay(date.getDate().toString())
            setSelectedYear(date.getFullYear().toString())
        } else {
            setSelectedMonth(undefined)
            setSelectedDay(undefined)
            setSelectedYear(undefined)
        }
        // Reset flag after state updates
        setTimeout(() => {
            isInternalUpdate.current = false
        }, 0)
    }, [date])

    // Update parent when any selection changes
    React.useEffect(() => {
        // Don't notify parent if this is an internal update from props
        if (isInternalUpdate.current) return

        console.log('BirthdayPicker: State changed', { selectedMonth, selectedDay, selectedYear })

        if (selectedMonth !== undefined && selectedDay !== undefined && selectedYear !== undefined) {
            const newDate = new Date(
                parseInt(selectedYear),
                parseInt(selectedMonth),
                parseInt(selectedDay)
            )
            console.log('BirthdayPicker: Calling onDateChange with', newDate)
            onDateChange?.(newDate)
        } else if (selectedMonth === undefined && selectedDay === undefined && selectedYear === undefined) {
            console.log('BirthdayPicker: Calling onDateChange with undefined')
            onDateChange?.(undefined)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMonth, selectedDay, selectedYear])

    const handleMonthChange = (value: string) => {
        setSelectedMonth(value)
        // Adjust day if it's invalid for the new month
        if (selectedDay && selectedYear) {
            const month = parseInt(value)
            const year = parseInt(selectedYear)
            const daysInMonth = new Date(year, month + 1, 0).getDate()
            if (parseInt(selectedDay) > daysInMonth) {
                setSelectedDay(daysInMonth.toString())
            }
        }
    }

    const handleYearChange = (value: string) => {
        setSelectedYear(value)
        // Adjust day if it's invalid for the new year (leap year consideration)
        if (selectedDay && selectedMonth) {
            const month = parseInt(selectedMonth)
            const year = parseInt(value)
            const daysInMonth = new Date(year, month + 1, 0).getDate()
            if (parseInt(selectedDay) > daysInMonth) {
                setSelectedDay(daysInMonth.toString())
            }
        }
    }

    const handleClear = () => {
        setSelectedMonth(undefined)
        setSelectedDay(undefined)
        setSelectedYear(undefined)
        onDateChange?.(undefined)
    }

    const hasValue = selectedMonth !== undefined || selectedDay !== undefined || selectedYear !== undefined

    return (
        <div className={cn("space-y-2", className)}>
            <div className="grid grid-cols-3 gap-2">
                <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Month</label>
                    <Select
                        value={selectedMonth}
                        onValueChange={handleMonthChange}
                        disabled={disabled}
                    >
                        <SelectTrigger className="rounded-xl border-2 border-purple-300 focus:border-purple-500">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            {MONTHS.map((month) => (
                                <SelectItem key={month.value} value={month.value}>
                                    {month.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Day</label>
                    <Select
                        value={selectedDay}
                        onValueChange={setSelectedDay}
                        disabled={disabled || !selectedMonth}
                    >
                        <SelectTrigger className="rounded-xl border-2 border-purple-300 focus:border-purple-500">
                            <SelectValue placeholder="Day" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            {days.map((day) => (
                                <SelectItem key={day.value} value={day.value}>
                                    {day.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Year</label>
                    <Select
                        value={selectedYear}
                        onValueChange={handleYearChange}
                        disabled={disabled}
                    >
                        <SelectTrigger className="rounded-xl border-2 border-purple-300 focus:border-purple-500">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            {years.map((year) => (
                                <SelectItem key={year.value} value={year.value}>
                                    {year.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {hasValue && !disabled && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="text-xs text-purple-600 hover:text-purple-800 font-semibold underline transition-colors"
                >
                    Clear date
                </button>
            )}
        </div>
    )
}
