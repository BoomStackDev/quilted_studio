import { Inter, Cormorant_Garamond } from 'next/font/google'

export const brand = {
  name:           'Quilted Studio',
  domain:         'quilted.studio',
  tagline:        'A curated studio for quilting education and instruction.',
  logoPath:       '/images/logo.svg',
  primaryColor:   '#6F7F75',
  secondaryColor: '#6B7C93',
  colors: {
    studioIvory:    '#F7F4EF',
    paperWarmGray:  '#EAE4DB',
    softBorder:     '#D6CFC6',
    ink:            '#1F1F1F',
    mutedText:      '#5A5A5A',
    studioSage:     '#6F7F75',
    slateBlue:      '#6B7C93',
  },
}

export const fontDisplay = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-display',
})

export const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
})
