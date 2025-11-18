'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface CustomizationOption {
  name: string;
  price: number;
  available: boolean;
}

interface Customization {
  name: string;
  required: boolean;
  options: CustomizationOption[];
}

interface CustomizationOptionsBuilderProps {
  customizations: Customization[];
  onChange: (customizations: Customization[]) => void;
  disabled?: boolean;
}

/**
 * Customization options builder component
 * Allows building customization groups with options
 */
export function CustomizationOptionsBuilder({
  customizations,
  onChange,
  disabled = false,
}: CustomizationOptionsBuilderProps) {
  function addGroup() {
    onChange([
      ...customizations,
      {
        name: '',
        required: false,
        options: [{ name: '', price: 0, available: true }],
      },
    ]);
  }

  function removeGroup(groupIndex: number) {
    onChange(customizations.filter((_, i) => i !== groupIndex));
  }

  function updateGroup(groupIndex: number, field: keyof Customization, value: any) {
    const updated = [...customizations];
    updated[groupIndex] = { ...updated[groupIndex], [field]: value };
    onChange(updated);
  }

  function addOption(groupIndex: number) {
    const updated = [...customizations];
    updated[groupIndex].options.push({ name: '', price: 0, available: true });
    onChange(updated);
  }

  function removeOption(groupIndex: number, optionIndex: number) {
    const updated = [...customizations];
    updated[groupIndex].options = updated[groupIndex].options.filter(
      (_, i) => i !== optionIndex
    );
    onChange(updated);
  }

  function updateOption(
    groupIndex: number,
    optionIndex: number,
    field: keyof CustomizationOption,
    value: any
  ) {
    const updated = [...customizations];
    updated[groupIndex].options[optionIndex] = {
      ...updated[groupIndex].options[optionIndex],
      [field]: value,
    };
    onChange(updated);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Customization Options</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addGroup}
            disabled={disabled}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Group
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {customizations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No customization options yet</p>
            <p className="text-sm">Add groups like "Size", "Add-ons", or "Extras"</p>
          </div>
        ) : (
          customizations.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-4 p-4 border rounded-lg">
              {/* Group Header */}
              <div className="flex items-start gap-4">
                <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                <div className="flex-1 space-y-4">
                  {/* Group Name & Required Toggle */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <Label>Group Name</Label>
                      <Input
                        value={group.name}
                        onChange={(e) => updateGroup(groupIndex, 'name', e.target.value)}
                        placeholder="e.g., Size, Add-ons"
                        disabled={disabled}
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-8">
                      <Switch
                        checked={group.required}
                        onCheckedChange={(checked) =>
                          updateGroup(groupIndex, 'required', checked)
                        }
                        disabled={disabled}
                      />
                      <Label className="text-sm">Required</Label>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    <Label className="text-sm">Options</Label>
                    {group.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <Input
                          value={option.name}
                          onChange={(e) =>
                            updateOption(groupIndex, optionIndex, 'name', e.target.value)
                          }
                          placeholder="Option name"
                          disabled={disabled}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          step="0.01"
                          value={option.price}
                          onChange={(e) =>
                            updateOption(
                              groupIndex,
                              optionIndex,
                              'price',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="Price"
                          disabled={disabled}
                          className="w-32"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(groupIndex, optionIndex)}
                          disabled={disabled || group.options.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addOption(groupIndex)}
                      disabled={disabled}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Option
                    </Button>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeGroup(groupIndex)}
                  disabled={disabled}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {groupIndex < customizations.length - 1 && <Separator />}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
