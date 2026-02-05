import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  Add,
  Delete,
} from '@mui/icons-material'

export interface Deal {
  start_month: number
  end_month: number
  rate: number
}

interface DealTimelineProps {
  deals: Deal[]
  onChange: (deals: Deal[]) => void
  termYears: number
  variableRate: number
}

// Color palette for deals
const DEAL_COLORS = [
  '#1976d2', // blue
  '#388e3c', // green
  '#f57c00', // orange
  '#7b1fa2', // purple
  '#c62828', // red
  '#00838f', // teal
]

const getDealColor = (index: number) => DEAL_COLORS[index % DEAL_COLORS.length]

export const DealTimeline: React.FC<DealTimelineProps> = ({
  deals,
  onChange,
  termYears,
  variableRate,
}) => {
  const termMonths = Math.round(termYears * 12)
  const timelineRef = useRef<HTMLDivElement>(null)
  const [dragState, setDragState] = useState<{
    dealIndex: number
    type: 'move' | 'resize-start' | 'resize-end'
    startX: number
    originalDeal: Deal
  } | null>(null)
  const [selectedDeal, setSelectedDeal] = useState<number | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newDealRate, setNewDealRate] = useState(2.0)

  const monthToPercent = (month: number) => (month / termMonths) * 100
  const percentToMonth = useCallback((percent: number) => {
    return Math.max(0, Math.min(termMonths, Math.round((percent / 100) * termMonths)))
  }, [termMonths])

  const getMouseMonthPosition = useCallback((clientX: number) => {
    if (!timelineRef.current) return 0
    const rect = timelineRef.current.getBoundingClientRect()
    const percent = ((clientX - rect.left) / rect.width) * 100
    return percentToMonth(Math.max(0, Math.min(100, percent)))
  }, [percentToMonth])

  // Find gaps for suggested new deal placement
  const findFirstGap = useCallback((): { start: number; end: number } | null => {
    const sorted = [...deals].sort((a, b) => a.start_month - b.start_month)

    // Check gap before first deal
    if (sorted.length === 0 || sorted[0].start_month > 0) {
      const gapEnd = sorted.length > 0 ? sorted[0].start_month : termMonths
      return { start: 0, end: Math.min(gapEnd, 24) }
    }

    // Check gaps between deals
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].end_month < sorted[i + 1].start_month) {
        const gapStart = sorted[i].end_month
        const gapEnd = sorted[i + 1].start_month
        return { start: gapStart, end: Math.min(gapEnd, gapStart + 24) }
      }
    }

    // Check gap after last deal
    const last = sorted[sorted.length - 1]
    if (last.end_month < termMonths) {
      return { start: last.end_month, end: Math.min(termMonths, last.end_month + 24) }
    }

    return null
  }, [deals, termMonths])

  // Check for overlaps
  const wouldOverlap = useCallback((newDeal: Deal, excludeIndex: number): boolean => {
    return deals.some((deal, i) => {
      if (i === excludeIndex) return false
      return newDeal.start_month < deal.end_month && newDeal.end_month > deal.start_month
    })
  }, [deals])

  // Drag handlers
  const handleMouseDown = useCallback((
    e: React.MouseEvent,
    dealIndex: number,
    type: 'move' | 'resize-start' | 'resize-end'
  ) => {
    e.stopPropagation()
    e.preventDefault()
    setSelectedDeal(dealIndex)
    setDragState({
      dealIndex,
      type,
      startX: e.clientX,
      originalDeal: { ...deals[dealIndex] },
    })
  }, [deals])

  useEffect(() => {
    if (!dragState) return

    const handleMouseMove = (e: MouseEvent) => {
      const currentMonth = getMouseMonthPosition(e.clientX)
      const { dealIndex, type, originalDeal } = dragState

      let newDeal: Deal
      if (type === 'move') {
        const startMonth = getMouseMonthPosition(dragState.startX)
        const delta = currentMonth - startMonth
        const newStart = Math.max(0, originalDeal.start_month + delta)
        const duration = originalDeal.end_month - originalDeal.start_month
        const newEnd = Math.min(termMonths, newStart + duration)
        const adjustedStart = newEnd - duration
        newDeal = { ...originalDeal, start_month: Math.max(0, adjustedStart), end_month: newEnd }
      } else if (type === 'resize-start') {
        const newStart = Math.max(0, Math.min(originalDeal.end_month - 1, currentMonth))
        newDeal = { ...originalDeal, start_month: newStart }
      } else {
        const newEnd = Math.min(termMonths, Math.max(originalDeal.start_month + 1, currentMonth))
        newDeal = { ...originalDeal, end_month: newEnd }
      }

      if (!wouldOverlap(newDeal, dealIndex)) {
        const newDeals = [...deals]
        newDeals[dealIndex] = newDeal
        onChange(newDeals)
      }
    }

    const handleMouseUp = () => {
      setDragState(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragState, deals, onChange, getMouseMonthPosition, termMonths, wouldOverlap])

  const handleDeleteDeal = (index: number) => {
    const newDeals = deals.filter((_, i) => i !== index)
    onChange(newDeals)
    setSelectedDeal(null)
  }

  const handleAddDeal = () => {
    const gap = findFirstGap()
    if (!gap) return

    const newDeal: Deal = {
      start_month: gap.start,
      end_month: gap.end,
      rate: newDealRate,
    }

    const newDeals = [...deals, newDeal].sort((a, b) => a.start_month - b.start_month)
    onChange(newDeals)
    setAddDialogOpen(false)
  }

  const handleListFieldChange = (index: number, field: keyof Deal, value: number) => {
    const newDeals = [...deals]
    const updated = { ...newDeals[index], [field]: value }

    // Validate
    if (updated.end_month <= updated.start_month) return
    if (updated.start_month < 0 || updated.end_month > termMonths) return
    if (!wouldOverlap(updated, index)) {
      newDeals[index] = updated
      onChange(newDeals)
    }
  }

  // Generate year labels for the timeline axis
  const yearLabels: number[] = []
  const yearStep = termYears <= 10 ? 1 : termYears <= 20 ? 2 : 5
  for (let y = 0; y <= termYears; y += yearStep) {
    yearLabels.push(y)
  }

  // Build SVR gap zones
  const sortedDeals = [...deals].sort((a, b) => a.start_month - b.start_month)
  const svrZones: { start: number; end: number }[] = []
  let cursor = 0
  for (const deal of sortedDeals) {
    if (deal.start_month > cursor) {
      svrZones.push({ start: cursor, end: deal.start_month })
    }
    cursor = Math.max(cursor, deal.end_month)
  }
  if (cursor < termMonths) {
    svrZones.push({ start: cursor, end: termMonths })
  }

  return (
    <Box>
      {/* Timeline visualization */}
      <Box sx={{ mb: 2 }}>
        {/* Timeline bar */}
        <Box
          ref={timelineRef}
          sx={{
            position: 'relative',
            height: 56,
            backgroundColor: 'grey.100',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'grey.300',
            overflow: 'hidden',
            cursor: dragState ? 'grabbing' : 'default',
            userSelect: 'none',
          }}
          onClick={() => {
            if (!dragState) setSelectedDeal(null)
          }}
        >
          {/* SVR zones */}
          {svrZones.map((zone, i) => (
            <Tooltip
              key={`svr-${i}`}
              title={`SVR ${variableRate}%`}
              arrow
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: `${monthToPercent(zone.start)}%`,
                  width: `${monthToPercent(zone.end) - monthToPercent(zone.start)}%`,
                  top: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.04)',
                  borderLeft: zone.start > 0 ? '1px dashed rgba(0,0,0,0.15)' : 'none',
                  borderRight: zone.end < termMonths ? '1px dashed rgba(0,0,0,0.15)' : 'none',
                }}
              >
                {(zone.end - zone.start) > termMonths * 0.06 && (
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontSize: '0.65rem', opacity: 0.7 }}
                  >
                    SVR {variableRate}%
                  </Typography>
                )}
              </Box>
            </Tooltip>
          ))}

          {/* Deal boxes */}
          {deals.map((deal, index) => {
            const left = monthToPercent(deal.start_month)
            const width = monthToPercent(deal.end_month) - left
            const isSelected = selectedDeal === index
            const color = getDealColor(index)
            const duration = deal.end_month - deal.start_month
            const isNarrow = width < 8

            return (
              <Tooltip
                key={index}
                title={`${deal.rate}% · ${duration}mo`}
                arrow
                placement="top"
              >
                <Box
                  sx={{
                    position: 'absolute',
                    left: `${left}%`,
                    width: `${width}%`,
                    minWidth: 4,
                    top: 4,
                    bottom: 4,
                    backgroundColor: color,
                    opacity: isSelected ? 1 : 0.85,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: dragState?.dealIndex === index ? 'grabbing' : 'grab',
                    boxShadow: isSelected ? `0 0 0 2px ${color}, 0 2px 8px rgba(0,0,0,0.2)` : '0 1px 3px rgba(0,0,0,0.15)',
                    transition: dragState ? 'none' : 'box-shadow 0.15s, opacity 0.15s',
                    '&:hover': {
                      opacity: 1,
                    },
                    zIndex: isSelected ? 2 : 1,
                    overflow: 'hidden',
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedDeal(index)
                  }}
                  onMouseDown={(e) => handleMouseDown(e, index, 'move')}
                >
                  {/* Resize handle - start */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 8,
                      cursor: 'ew-resize',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
                      borderRadius: '4px 0 0 4px',
                    }}
                    onMouseDown={(e) => handleMouseDown(e, index, 'resize-start')}
                  />

                  {/* Content — hidden when box is too narrow */}
                  {!isNarrow && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        px: 1,
                      }}
                    >
                      {deal.rate}%{width > 12 ? ` · ${duration}mo` : ''}
                    </Typography>
                  )}

                  {/* Resize handle - end */}
                  <Box
                    sx={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: 8,
                      cursor: 'ew-resize',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
                      borderRadius: '0 4px 4px 0',
                    }}
                    onMouseDown={(e) => handleMouseDown(e, index, 'resize-end')}
                  />
                </Box>
              </Tooltip>
            )
          })}
        </Box>

        {/* Year axis */}
        <Box sx={{ position: 'relative', height: 20, mt: 0.5 }}>
          {yearLabels.map((year) => (
            <Typography
              key={year}
              variant="caption"
              sx={{
                position: 'absolute',
                left: `${(year / termYears) * 100}%`,
                transform: 'translateX(-50%)',
                color: 'text.secondary',
                fontSize: '0.65rem',
              }}
            >
              {year}y
            </Typography>
          ))}
        </Box>
      </Box>

      {/* Companion list */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {/* Header */}
        {deals.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '24px 1fr 80px 80px 60px 32px',
              gap: 1,
              alignItems: 'center',
              px: 0.5,
            }}
          >
            <Typography variant="caption" color="text.secondary">#</Typography>
            <Typography variant="caption" color="text.secondary">Rate (%)</Typography>
            <Typography variant="caption" color="text.secondary">Start Mo</Typography>
            <Typography variant="caption" color="text.secondary">End Mo</Typography>
            <Typography variant="caption" color="text.secondary">Dur</Typography>
            <Box />
          </Box>
        )}

        {/* Deal rows */}
        {deals.map((deal, index) => {
          const isSelected = selectedDeal === index
          return (
            <Box
              key={index}
              sx={{
                display: 'grid',
                gridTemplateColumns: '24px 1fr 80px 80px 60px 32px',
                gap: 1,
                alignItems: 'center',
                px: 0.5,
                py: 0.25,
                borderRadius: 0.5,
                backgroundColor: isSelected ? 'action.selected' : 'transparent',
                '&:hover': { backgroundColor: isSelected ? 'action.selected' : 'action.hover' },
                cursor: 'pointer',
              }}
              onClick={() => setSelectedDeal(index)}
            >
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: getDealColor(index),
                  flexShrink: 0,
                }}
              />
              <TextField
                value={deal.rate}
                onChange={(e) => {
                  const val = parseFloat(e.target.value)
                  if (!isNaN(val)) handleListFieldChange(index, 'rate', val)
                }}
                type="number"
                size="small"
                inputProps={{ min: 0, max: 15, step: 0.01 }}
                sx={{ '& .MuiInputBase-input': { py: 0.5, fontSize: '0.8rem' } }}
                onClick={(e) => e.stopPropagation()}
              />
              <TextField
                value={deal.start_month}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10)
                  if (!isNaN(val)) handleListFieldChange(index, 'start_month', val)
                }}
                type="number"
                size="small"
                inputProps={{ min: 0, max: termMonths - 1 }}
                sx={{ '& .MuiInputBase-input': { py: 0.5, fontSize: '0.8rem' } }}
                onClick={(e) => e.stopPropagation()}
              />
              <TextField
                value={deal.end_month}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10)
                  if (!isNaN(val)) handleListFieldChange(index, 'end_month', val)
                }}
                type="number"
                size="small"
                inputProps={{ min: 1, max: termMonths }}
                sx={{ '& .MuiInputBase-input': { py: 0.5, fontSize: '0.8rem' } }}
                onClick={(e) => e.stopPropagation()}
              />
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                {deal.end_month - deal.start_month}mo
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteDeal(index)
                }}
                sx={{ p: 0.25 }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          )
        })}

        {/* Add deal button */}
        <Button
          size="small"
          startIcon={<Add />}
          onClick={() => {
            if (findFirstGap()) {
              setAddDialogOpen(true)
            }
          }}
          disabled={!findFirstGap()}
          sx={{ alignSelf: 'flex-start', mt: 0.5 }}
        >
          Add Deal
        </Button>
      </Box>

      {/* Add Deal Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Deal</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Interest Rate (%)"
              type="number"
              value={newDealRate}
              onChange={(e) => setNewDealRate(parseFloat(e.target.value) || 0)}
              inputProps={{ min: 0, max: 15, step: 0.01 }}
              fullWidth
              size="small"
            />
            {findFirstGap() && (
              <Typography variant="body2" color="text.secondary">
                Will be placed at months {findFirstGap()!.start}–{findFirstGap()!.end}.
                You can drag to adjust after adding.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddDeal} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
