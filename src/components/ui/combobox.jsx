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

export function Combobox({ teams, value, onValueChange, placeholder = "Select a team...", onHome, onAllTeams, onConferences, onBracket }) {
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
              {onHome && (
                <CommandItem
                  value="Home"
                  keywords={["home"]}
                  onSelect={() => {
                    onHome()
                    setOpen(false)
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onHome()
                    setOpen(false)
                  }}
                  className="font-regular text-gray-600 text-sm"
                >
                  <Check className="mr-2 h-4 w-4 opacity-0" />
                  <span className="mr-2 w-6 h-6 rounded-md bg-black inline-flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </span>
                  Home
                </CommandItem>
              )}
              {onBracket && (
                <CommandItem
                  value="Projected Bracket"
                  keywords={["bracket", "seed", "seeding", "projection"]}
                  onSelect={() => {
                    onBracket()
                    setOpen(false)
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onBracket()
                    setOpen(false)
                  }}
                  className="font-regular text-gray-600 text-sm"
                >
                  <Check className="mr-2 h-4 w-4 opacity-0" />
                  <span className="mr-2 w-6 h-6 rounded-md bg-black inline-flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 30 24" strokeWidth="3" strokeLinecap="round">
                      <line x1="2" y1="3" x2="14" y2="3"/>
                      <line x1="2" y1="21" x2="14" y2="21"/>
                      <line x1="28" y1="12" x2="14.5" y2="12"/>
                      <line x1="14" y1="3" x2="14" y2="21"/>
                    </svg>
                  </span>
                  Projected bracket
                </CommandItem>
              )}
              {onConferences && (
                <CommandItem
                  value="Conference breakdown"
                  keywords={["conferences", "conference", "standings", "breakdown"]}
                  onSelect={() => {
                    onConferences()
                    setOpen(false)
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onConferences()
                    setOpen(false)
                  }}
                  className="font-regular text-gray-600 text-sm"
                >
                  <Check className="mr-2 h-4 w-4 opacity-0" />
                  <span className="mr-2 w-6 h-6 rounded-md bg-black inline-flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </span>
                  Conference breakdown
                </CommandItem>
              )}
              {onAllTeams && (
                <CommandItem
                  value="Full team list"
                  keywords={["all teams", "all", "teams", "list"]}
                  onSelect={() => {
                    onAllTeams()
                    setOpen(false)
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onAllTeams()
                    setOpen(false)
                  }}
                  className="font-regular text-gray-600 mb-4 text-sm"
                >
                  <Check className="mr-2 h-4 w-4 opacity-0" />
                  <span className="mr-2 w-6 h-6 rounded-md bg-black inline-flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-200" xmlns="https://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                    </svg>
                  </span>
                  Full teams list
                </CommandItem>
              )}
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

