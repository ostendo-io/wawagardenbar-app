'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DietaryTagsSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  spiceLevel?: string;
  onSpiceLevelChange: (level: string) => void;
  calories?: number;
  onCaloriesChange: (calories: number) => void;
  disabled?: boolean;
}

const DIETARY_TAGS = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten-Free' },
  { value: 'dairy-free', label: 'Dairy-Free' },
  { value: 'nut-free', label: 'Nut-Free' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
];

const ALLERGENS = [
  { value: 'peanuts', label: 'Peanuts' },
  { value: 'tree-nuts', label: 'Tree Nuts' },
  { value: 'milk', label: 'Milk' },
  { value: 'eggs', label: 'Eggs' },
  { value: 'fish', label: 'Fish' },
  { value: 'shellfish', label: 'Shellfish' },
  { value: 'soy', label: 'Soy' },
  { value: 'wheat', label: 'Wheat' },
  { value: 'gluten', label: 'Gluten' },
];

/**
 * Dietary tags and allergen selector component
 */
export function DietaryTagsSelector({
  selectedTags,
  onChange,
  spiceLevel = 'none',
  onSpiceLevelChange,
  calories = 0,
  onCaloriesChange,
  disabled = false,
}: DietaryTagsSelectorProps) {
  function toggleTag(tag: string) {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dietary & Allergen Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dietary Tags */}
        <div className="space-y-3">
          <Label>Dietary Tags</Label>
          <div className="grid gap-3 md:grid-cols-2">
            {DIETARY_TAGS.map((tag) => (
              <div key={tag.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`dietary-${tag.value}`}
                  checked={selectedTags.includes(tag.value)}
                  onCheckedChange={() => toggleTag(tag.value)}
                  disabled={disabled}
                />
                <Label
                  htmlFor={`dietary-${tag.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {tag.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Allergen Warnings */}
        <div className="space-y-3">
          <Label>Allergen Warnings</Label>
          <div className="grid gap-3 md:grid-cols-3">
            {ALLERGENS.map((allergen) => (
              <div key={allergen.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`allergen-${allergen.value}`}
                  checked={selectedTags.includes(allergen.value)}
                  onCheckedChange={() => toggleTag(allergen.value)}
                  disabled={disabled}
                />
                <Label
                  htmlFor={`allergen-${allergen.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {allergen.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Spice Level & Calories */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="spiceLevel">Spice Level</Label>
            <Select
              value={spiceLevel}
              onValueChange={onSpiceLevelChange}
              disabled={disabled}
            >
              <SelectTrigger id="spiceLevel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="mild">Mild 🌶️</SelectItem>
                <SelectItem value="medium">Medium 🌶️🌶️</SelectItem>
                <SelectItem value="hot">Hot 🌶️🌶️🌶️</SelectItem>
                <SelectItem value="extra-hot">Extra Hot 🌶️🌶️🌶️🌶️</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="calories">Calories (optional)</Label>
            <Input
              id="calories"
              type="number"
              value={calories || ''}
              onChange={(e) => onCaloriesChange(parseInt(e.target.value) || 0)}
              placeholder="0"
              disabled={disabled}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
