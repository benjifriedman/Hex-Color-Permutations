"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Check, Copy, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ColorSpaceVisualization } from "@/components/color-space-visualization"

// Debounce function
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function HexColorPermutations() {
  const [input, setInput] = useState("")
  const debouncedInput = useDebounce(input, input.length >= 4 ? 500 : 0)
  const [copiedColor, setCopiedColor] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 150
  const { toast } = useToast()

  // Generate all permutations based on input length
  const generatePermutations = (str: string): string[] => {
    if (str.length === 0) return []
    if (str.length === 1) return [str.repeat(6)]

    const result: string[] = []
    const generateCombinations = (current: string) => {
      if (current.length === 6) {
        result.push(current)
        return
      }
      for (let i = 0; i < str.length; i++) {
        generateCombinations(current + str[i])
      }
    }
    generateCombinations("")
    return result
  }

  // Memoize permutations to avoid unnecessary recalculations
  const allPermutations = useMemo(() => generatePermutations(debouncedInput), [debouncedInput])

  // Calculate total pages
  const totalPages = Math.ceil(allPermutations.length / itemsPerPage)

  // Get current page permutations
  const currentPermutations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return allPermutations.slice(startIndex, startIndex + itemsPerPage)
  }, [allPermutations, currentPage, itemsPerPage])

  // Reset to page 1 when input changes
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedInput])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase()
    // Only allow hex characters (0-9, a-f)
    if (value === "" || /^[0-9a-f]+$/.test(value)) {
      setInput(value)
    }
  }

  const addCharacter = (char: string) => {
    if (input.length < 6) {
      setInput((prev) => prev + char)
    } else {
      toast({
        title: "Maximum length reached",
        description: "You can only enter up to 6 characters.",
        duration: 2000,
      })
    }
  }

  // Copy hex color to clipboard
  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(`#${color}`)
    setCopiedColor(color)

    toast({
      title: "Copied to clipboard",
      description: `#${color} has been copied to your clipboard.`,
      duration: 2000,
    })

    setTimeout(() => {
      setCopiedColor(null)
    }, 1000)
  }

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Calculate display range
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(startItem + currentPermutations.length - 1, allPermutations.length)

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Hex Color Permutations</h1>
          <p className="text-muted-foreground">
            Enter hex characters (0-9, a-f) to see all possible 6-character color combinations.
          </p>
        </div>

        <div className="space-y-4">
          <Label htmlFor="hex-input">Enter hex characters (max 6)</Label>

          <div className="grid grid-cols-8 sm:grid-cols-16 gap-2 mb-4">
            {["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"].map((char) => (
              <Button
                key={char}
                variant="outline"
                size="sm"
                className="w-full font-mono"
                onClick={() => addCharacter(char)}
              >
                {char}
              </Button>
            ))}
          </div>

          <div className="flex space-x-2 max-w-md">
            <Input
              id="hex-input"
              type="text"
              placeholder="Enter hex characters (e.g. a10)"
              value={input}
              onChange={handleInputChange}
              maxLength={6}
              className="flex-1"
            />
            <Button variant="outline" onClick={() => setInput("")} aria-label="Clear input">
              Clear
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Only numbers 0-9 and letters a-f are allowed.</p>
        </div>

        {allPermutations.length > 0 && (
          <div className="space-y-6">
            {/* Color Space Visualization */}
            <div className="space-y-2">
              <h2 className="text-lg font-medium">Color Space Overview</h2>
              <ColorSpaceVisualization colors={allPermutations} />
              <p className="text-sm text-muted-foreground">
                Visual representation of the color space generated from your input.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {allPermutations.length} Color Combination{allPermutations.length !== 1 ? "s" : ""}
                </h2>
                {allPermutations.length > itemsPerPage && (
                  <p className="text-sm text-muted-foreground">
                    Showing {startItem}-{endItem} of {allPermutations.length}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {currentPermutations.map((perm) => (
                  <Button
                    key={perm}
                    variant="outline"
                    className="h-auto p-0 overflow-hidden flex flex-col items-stretch"
                    onClick={() => copyToClipboard(perm)}
                  >
                    <div
                      className="w-full h-24 flex items-center justify-center relative"
                      style={{ backgroundColor: `#${perm}` }}
                    >
                      {copiedColor === perm && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Check className="text-white h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="p-2 flex items-center justify-between w-full bg-background">
                      <span className="font-mono">#{perm}</span>
                      <Copy className="h-4 w-4 opacity-50" />
                    </div>
                  </Button>
                ))}
              </div>

              {allPermutations.length > itemsPerPage && (
                <div className="flex justify-between items-center pt-4">
                  <Button
                    variant="outline"
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer with link */}
      <footer className="mt-16 pb-8 text-center">
        <a
          href="https://benjifriedman.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
        >
          Benji Friedman 2025
        </a>
      </footer>
    </div>
  )
}

