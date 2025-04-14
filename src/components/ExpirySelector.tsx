
import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';

export type ExpiryDuration = {
  value: number; // Time in milliseconds
  unit: 'minutes' | 'hours' | 'days' | 'weeks';
  display: string;
};

const expiryOptions: ExpiryDuration[] = [
  { value: 1000 * 60 * 30, unit: 'minutes', display: '30 Minutes' },
  { value: 1000 * 60 * 60, unit: 'hours', display: '1 Hour' },
  { value: 1000 * 60 * 60 * 24, unit: 'days', display: '1 Day' },
  { value: 1000 * 60 * 60 * 24 * 7, unit: 'days', display: '7 Days' },
  { value: 1000 * 60 * 60 * 24 * 14, unit: 'days', display: '14 Days' },
  { value: 1000 * 60 * 60 * 24 * 30, unit: 'days', display: '30 Days' },
];

interface ExpirySelectorProps {
  onExpiryChange: (duration: ExpiryDuration) => void;
  defaultValue?: number; // Time in milliseconds
}

const ExpirySelector: React.FC<ExpirySelectorProps> = ({
  onExpiryChange,
  defaultValue = 1000 * 60 * 60 * 24 * 7, // Default: 7 days
}) => {
  const handleChange = (value: string) => {
    const selectedDuration = expiryOptions.find(
      option => option.value === parseInt(value)
    );
    if (selectedDuration) {
      onExpiryChange(selectedDuration);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="expiry-select" className="flex items-center gap-2">
        <Clock size={16} className="text-blue-500" /> 
        <span>File Expiry Time</span>
      </Label>
      <Select 
        onValueChange={handleChange} 
        defaultValue={defaultValue.toString()}
      >
        <SelectTrigger id="expiry-select" className="w-full">
          <SelectValue placeholder="Select expiry time" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {expiryOptions.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value.toString()}
                className="flex items-center gap-2"
              >
                <div className="flex items-center gap-2">
                  {option.unit === 'minutes' || option.unit === 'hours' ? (
                    <Clock size={16} className="text-blue-500" />
                  ) : (
                    <Calendar size={16} className="text-purple-500" />
                  )}
                  {option.display}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ExpirySelector;
