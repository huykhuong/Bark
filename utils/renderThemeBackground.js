export const renderThemeBackground = (color) => {
  if (!color?.includes('gradient')) return ''
  else if (color?.includes('gradient')) {
    switch (color) {
      case 'bg-gradient-to-br from-green-300 via-blue-500 to-purple-600':
        return 'lofi.webp'
      case 'bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400':
        return 'lofi-wallpaper-idlewp-7.jpg'
      case 'bg-gradient-to-br from-red-200 via-red-300 to-yellow-200':
        return 'coachella.png'
      case 'bg-gradient-to-br from-indigo-200 via-red-200 to-yellow-100':
        return 'idk.jpg'
      case 'bg-gradient-to-tr from-sky-400 to-sky-200':
        return 'dusk.jpg'
      case 'bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500':
        return 'moon-pink-aesthetic-jyhfvylz3rmavkmb.jpg'
      case 'bg-gradient-to-bl from-green-300 to-purple-400':
        return 'chill_dark.jpg'
      case 'bg-gradient-to-bl from-fuchsia-600 to-pink-600':
        return 'racing.jpg'
      case 'bg-gradient-to-tr from-blue-400 to-emerald-400':
        return 'gradient_number_6.jpg'
      case 'bg-gradient-to-br from-orange-400 to-rose-400':
        return 'gradient_number_7.jpg'
      default:
        break
    }
  }
}

// 'bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400',
// 'bg-gradient-to-br from-red-200 via-red-300 to-yellow-200',
// 'bg-gradient-to-br from-indigo-200 via-red-200 to-yellow-100',
// 'bg-gradient-to-br from-indigo-300 to-purple-400',
// 'bg-gradient-to-br from-cyan-200 to-cyan-400',
// 'bg-gradient-to-br from-orange-400 to-rose-400',
// 'bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500',
