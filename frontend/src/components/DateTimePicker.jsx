import React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Combined date + time picker.
 * Props:
 *   value: Date | null
 *   onChange: (Date) => void
 *   testId: string prefix for data-testid attrs
 *   placeholder: string (optional)
 *   minDate: Date (optional) — disables earlier dates
 */
export default function DateTimePicker({ value, onChange, testId, placeholder = "Pick a date", minDate }) {
  const [open, setOpen] = React.useState(false);
  const time = value ? format(value, "HH:mm") : "";

  const setDate = (day) => {
    if (!day) return;
    const merged = new Date(day);
    if (value) {
      merged.setHours(value.getHours(), value.getMinutes(), 0, 0);
    } else {
      const now = new Date();
      merged.setHours(now.getHours(), Math.ceil(now.getMinutes() / 5) * 5, 0, 0);
    }
    onChange(merged);
  };

  const setTime = (e) => {
    const t = e.target.value;
    if (!t || !value) {
      // If no date picked yet, seed with today's date + the time entered.
      const base = value ? new Date(value) : new Date();
      const [h, m] = t.split(":").map(Number);
      if (!Number.isNaN(h) && !Number.isNaN(m)) {
        base.setHours(h, m, 0, 0);
        onChange(base);
      }
      return;
    }
    const [h, m] = t.split(":").map(Number);
    const next = new Date(value);
    next.setHours(h, m, 0, 0);
    onChange(next);
  };

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "flex-1 justify-start text-left font-normal",
              !value && "text-[#8A8A8A]"
            )}
            data-testid={`${testId}-trigger`}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value || undefined}
            onSelect={(day) => {
              setDate(day);
              setOpen(false);
            }}
            disabled={(day) => (minDate ? day < new Date(minDate.setHours(0, 0, 0, 0)) : false)}
            initialFocus
            data-testid={`${testId}-calendar`}
          />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        step="60"
        value={time}
        onChange={setTime}
        className="w-[130px] mono"
        data-testid={`${testId}-time`}
      />
    </div>
  );
}
