import React from "react";

interface SpecialInstructionsProps {
  instructions: string;
  onInstructionsChange: (instructions: string) => void;
}

const MAX_CHARACTERS = 500;

const SpecialInstructions: React.FC<SpecialInstructionsProps> = ({
  instructions,
  onInstructionsChange,
}) => {
  const remaining = MAX_CHARACTERS - instructions.length;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_CHARACTERS) {
      onInstructionsChange(e.target.value);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-slate-300">Special Instructions</h3>

      <div className="space-y-2">
        <textarea
          value={instructions}
          onChange={handleChange}
          placeholder="Add special instructions for the delivery (e.g., 'Please ring the bell twice', 'Leave at gate', etc.)"
          maxLength={MAX_CHARACTERS}
          rows={3}
          className="w-full rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-supply-teal resize-none"
        />

        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-500">
            {instructions.length > 0 && "Add special delivery instructions"}
          </p>
          <p
            className={`text-xs font-medium ${
              remaining < 50
                ? "text-orange-400"
                : remaining < 100
                ? "text-slate-400"
                : "text-slate-500"
            }`}
          >
            {remaining} / {MAX_CHARACTERS}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpecialInstructions;
