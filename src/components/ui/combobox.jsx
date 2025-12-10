import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/cn"
import { Button } from "@/components/ui/button"
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

export function Combobox({ teams, value, onValueChange, placeholder = "Select a team..." }) {
  const [open, setOpen] = React.useState(false)

  const selectedTeam = teams.find((team) => team.slug === value)

  // Custom filter function for precise substring matching
  const filterTeams = (searchValue, search) => {
    const searchLower = search.toLowerCase()
    const valueLower = searchValue.toLowerCase()
    
    // Check if the search term is a substring of the value
    if (valueLower.includes(searchLower)) {
      return 1
    }
    return 0
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-medium px-6 py-6 border-1 border-blue-200 bg-white text-gray-900 rounded-md cursor-pointer hover:border-blue-400 hover:bg-white"
        >
          {value && selectedTeam ? (
            <div className="flex items-center gap-2">
              {selectedTeam.logo && (
                <img src={selectedTeam.logo} alt={selectedTeam.shortName} className="w-5 h-5 object-contain" />
              )}
              <span>{selectedTeam.displayName}</span>
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command filter={filterTeams}>
          <CommandInput placeholder="Search all teams" className="h-9" />
          <CommandList>
            <CommandEmpty>No team found.</CommandEmpty>
            <CommandGroup>
              {teams.map((team) => (
                <CommandItem
                  key={team.slug}
                  value={team.displayName}
                  keywords={[team.displayName, team.shortName]}
                  onSelect={(currentValue) => {
                    const selectedTeam = teams.find(t => t.displayName === currentValue || t.shortName === currentValue)
                    if (selectedTeam) {
                      onValueChange(selectedTeam.slug === value ? "" : selectedTeam.slug)
                      setOpen(false)
                    }
                  }}
                  onMouseDown={(e) => {
                    // Prevent the popover from closing immediately
                    e.preventDefault()
                  }}
                  onPointerUp={(e) => {
                    // Handle mouse/touch clicks
                    e.preventDefault()
                    e.stopPropagation()
                    onValueChange(team.slug === value ? "" : team.slug)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === team.slug ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {team.logo && (
                    <img src={team.logo} alt={team.shortName} className="w-5 h-5 object-contain mr-2" />
                  )}
                  {team.displayName}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

