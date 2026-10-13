export const categories = [
  { id: 'jacken', label: 'Jacken' },
  { id: 'hoodies', label: 'Hoodies & Sweats' },
  { id: 'tshirts', label: 'T-Shirts' },
  { id: 'strick', label: 'Strick' },
  { id: 'hosen', label: 'Hosen' },
  { id: 'denim', label: 'Denim' },
  { id: 'accessoires', label: 'Accessoires' },
]

export const categoryLabel = (id) => categories.find((c) => c.id === id)?.label ?? id

export const genders = [
  { id: 'alle', label: 'Alle' },
  { id: 'herren', label: 'Herren' },
  { id: 'damen', label: 'Damen' },
]

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
