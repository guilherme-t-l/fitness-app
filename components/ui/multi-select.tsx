"use client"

import * as React from "react"
import { X, Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react"
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
  onNewOption?: (newOption: string) => void
  onDeleteOption?: (option: string) => void
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
  onNewOption,
  onDeleteOption,
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
      onNewOption?.(newOption)
      setInputValue("")
    }
  }

  const handleDelete = (option: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onDeleteOption?.(option)
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
            "w-full justify-between min-h-10 h-auto py-2",
            className
          )}
          disabled={disabled}
        >
          <div className="flex gap-1 flex-wrap text-left font-normal">
            {selected.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
            {selected.map((item) => (
              <Badge
                variant="secondary"
                key={item}
                className="mr-1 mb-0.5"
                onClick={(e) => {
                  e.stopPropagation()
                  handleUnselect(item)
                }}
              >
                {item}
                <span
                  role="button"
                  tabIndex={0}
                  className="ml-1 ring-offset-background rounded-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all cursor-pointer"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
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
                  aria-label={`Remove ${item}`}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors" />
                </span>
              </Badge>
            ))}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 border-border bg-popover">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty className="text-muted-foreground">{emptyText}</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option}
                  onSelect={() => handleSelect(option)}
                  className="group relative"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="flex-1">{option}</span>
                  {onDeleteOption && (
                    <button
                      onClick={(e) => handleDelete(option, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1 hover:bg-destructive/10 rounded text-destructive"
                      title="Delete category"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </CommandItem>
              ))}
              {isCreateOptionVisible && (
                <CommandItem
                  onSelect={handleCreate}
                  className="text-primary border-t border-border"
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