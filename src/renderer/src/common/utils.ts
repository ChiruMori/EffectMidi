const getMidColor = (progress: number, fromColor: string, toColor: string): string => {
  const r =
    parseInt(fromColor.slice(1, 3), 16) +
    (parseInt(toColor.slice(1, 3), 16) - parseInt(fromColor.slice(1, 3), 16)) * progress
  const g =
    parseInt(fromColor.slice(3, 5), 16) +
    (parseInt(toColor.slice(3, 5), 16) - parseInt(fromColor.slice(3, 5), 16)) * progress
  const b =
    parseInt(fromColor.slice(5, 7), 16) +
    (parseInt(toColor.slice(5, 7), 16) - parseInt(fromColor.slice(5, 7), 16)) * progress
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`
}

export default {
  getMidColor
}
