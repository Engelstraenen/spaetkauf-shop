const paths = {
  home: 'M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z',
  grid: 'M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z',
  search: 'M10.5 3a7.5 7.5 0 1 0 4.6 13.4L20 21.3l1.4-1.4-4.9-4.9A7.5 7.5 0 0 0 10.5 3zm0 2a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11z',
  bookmark: 'M6 3h12v18l-6-4.5L6 21z',
  bag: 'M6 8h12l1 13H5zM9 8V6a3 3 0 0 1 6 0v2',
  back: 'M15 5 8 12l7 7',
  close: 'M6 6l12 12M18 6 6 18',
  chevron: 'M6 9l6 6 6-6',
  sun: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 1v3M12 20v3M1 12h3M20 12h3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1',
  moon: 'M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z',
  truck: 'M2 6h12v10H2zM14 10h4l3 3v3h-7M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  return: 'M4 9h11a5 5 0 0 1 0 10H8M4 9l4-4M4 9l4 4',
  shield: 'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z',
  check: 'M5 12.5 10 17 19 7',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  ruler: 'M3 15 15 3l6 6L9 21zM7 11l2 2M10 8l2 2M13 5l2 2',
}

// Gefüllte Formen (grid, search) vs. Linien
const filled = new Set(['grid', 'search'])

export default function Icon({ name, size = 22, fill = false, className = '' }) {
  const isFilled = fill || filled.has(name)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill={isFilled ? 'currentColor' : 'none'}
      stroke={isFilled ? 'none' : 'currentColor'}
      strokeWidth="1.8"
      strokeLinecap="square"
      strokeLinejoin="miter"
    >
      <path d={paths[name]} fillRule="evenodd" />
    </svg>
  )
}
