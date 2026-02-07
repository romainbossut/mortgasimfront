import React from 'react'
import { TextField } from '@mui/material'

// Numeric text field — standard text input constrained to digits and dots.
// Avoids number input quirks (spinner arrows, scroll-to-change, selection issues).
const NumericField: React.FC<
  Omit<React.ComponentProps<typeof TextField>, 'type' | 'value' | 'onChange'> & {
    value: number | undefined | ''
    onChange: (value: number | '') => void
    /** When true, only allow integer input (no decimal point) */
    integer?: boolean
  }
> = ({ value, onChange, integer, ...rest }) => {
  const [local, setLocal] = React.useState(() =>
    value != null && value !== '' ? String(value) : ''
  )

  const prev = React.useRef(value)
  React.useEffect(() => {
    if (value !== prev.current) {
      prev.current = value
      setLocal(value != null && value !== '' ? String(value) : '')
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = integer
      ? e.target.value.replace(/[^0-9]/g, '')
      : e.target.value.replace(/[^0-9.]/g, '')

    if (!integer) {
      // Allow at most one dot
      const dotIdx = raw.indexOf('.')
      if (dotIdx !== -1) {
        raw = raw.slice(0, dotIdx + 1) + raw.slice(dotIdx + 1).replace(/\./g, '')
      }
    }
    setLocal(raw)

    if (raw === '' || raw === '.') {
      onChange('')
    } else {
      const num = Number(raw)
      if (!isNaN(num)) onChange(num)
    }
  }

  return (
    <TextField
      {...rest}
      type="text"
      inputMode={integer ? 'numeric' : 'decimal'}
      value={local}
      onChange={handleChange}
    />
  )
}

export default NumericField
