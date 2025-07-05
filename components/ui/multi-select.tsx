"use client"

import * as React from "react"
import { X, Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface MultiSelectProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search options...",
  emptyText = "No options found.",
  className,
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item))
  }

  const handleSelect = (item: string) => {
    if (selected.includes(item)) {
      handleUnselect(item)
    } else {
      onChange([...selected, item])
    }
  }

  const handleCreate = () => {
    if (inputValue.trim() && !options.includes(inputValue.trim())) {
      const newOption = inputValue.trim()
      onChange([...selected, newOption])
      setInputValue("")
    }
  }

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(inputValue.toLowerCase())
  )

  const isCreateOptionVisible = 
    inputValue.trim() && 
    !options.includes(inputValue.trim()) && 
    !selected.includes(inputValue.trim())

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-gray-800/50 border-gray-600 text-white",
            className
          )}
          disabled={disabled}
        >
          <div className="flex gap-1 flex-wrap">
            {selected.length === 0 && placeholder}
            {selected.map((item) => (
              <Badge
                variant="secondary"
                key={item}
                className="mr-1 mb-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={(e) => {
                  e.stopPropagation()
                  handleUnselect(item)
                }}
              >
                {item}
                <button
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(item)
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleUnselect(item)
                  }}
                >
                  <X className="h-3 w-3 text-white hover:text-gray-300" />
                </button>
              </Badge>
            ))}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-gray-800 border-gray-600">
        <Command className="bg-gray-800">
          <CommandInput
            placeholder={searchPlaceholder}
            value={inputValue}
            onValueChange={setInputValue}
            className="bg-gray-800 border-gray-600 text-white"
          />
          <CommandList className="bg-gray-800">
            <CommandEmpty className="text-gray-400">{emptyText}</CommandEmpty>
            <CommandGroup className="bg-gray-800">
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option}
                  onSelect={() => handleSelect(option)}
                  className="bg-gray-800 hover:bg-gray-700 text-white"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
              {isCreateOptionVisible && (
                <CommandItem
                  onSelect={handleCreate}
                  className="bg-gray-800 hover:bg-gray-700 text-white border-t border-gray-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create "{inputValue.trim()}"
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 