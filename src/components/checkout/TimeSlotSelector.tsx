import React, { useMemo } from "react";

interface TimeSlotSelectorProps {
  selectedSlot: "MORNING" | "AFTERNOON" | "EVENING" | null;
  onSlotChange: (slot: "MORNING" | "AFTERNOON" | "EVENING") => void;
}

interface TimeSlot {
  value: "MORNING" | "AFTERNOON" | "EVENING";
  label: string;
  time: string;
  availability: "Available" | "Limited";
}

const timeSlots: TimeSlot[] = [
  {
    value: "MORNING",
    label: "Morning",
    time: "6 AM - 12 PM",
    availability: "Available",
  },
  {
    value: "AFTERNOON",
    label: "Afternoon",
    time: "12 PM - 6 PM",
    availability: "Available",
  },
  {
    value: "EVENING",
    label: "Evening",
    time: "6 PM - 10 PM",
    availability: "Limited",
  },
];

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  selectedSlot,
  onSlotChange,
}) => {
  // Delivery is always scheduled for the day after the order is placed
  const deliveryDateLabel = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }, []);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium text-slate-300">Delivery Time Slot</h3>
        <p className="mt-0.5 text-xs text-supply-teal">
          📅 Delivering tomorrow, {deliveryDateLabel}
        </p>
      </div>

      <div className="grid gap-2">
        {timeSlots.map((slot) => (
          <label
            key={slot.value}
            className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-slate-950/40 cursor-pointer hover:border-white/20 transition"
          >
            <input
              type="radio"
              name="timeSlot"
              value={slot.value}
              checked={selectedSlot === slot.value}
              onChange={() => onSlotChange(slot.value)}
              className="w-4 h-4"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-100">{slot.label}</p>
              <p className="text-xs text-slate-400">{slot.time}</p>
            </div>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                slot.availability === "Available"
                  ? "bg-green-900/30 text-green-400"
                  : "bg-orange-900/30 text-orange-400"
              }`}
            >
              {slot.availability}
            </span>
          </label>
        ))}
      </div>

      {!selectedSlot && (
        <p className="text-xs text-orange-400">Please select a delivery time slot</p>
      )}
    </div>
  );
};

export default TimeSlotSelector;