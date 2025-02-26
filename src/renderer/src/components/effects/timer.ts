let secondTimer = performance.now() / 1000
const counterMap = new Map()

export default function report(key: string): void {
  if (process.env.NODE_ENV !== 'development') {
    return
  }
  const nowSecond = performance.now() / 1000
  if (nowSecond - secondTimer > 1) {
    secondTimer = nowSecond
    counterMap.forEach((value, key) => {
      console.debug(`FPS of ${key}: ${value}`)
    })
    counterMap.clear()
  }

  if (counterMap.has(key)) {
    counterMap.set(key, counterMap.get(key) + 1)
  } else {
    counterMap.set(key, 1)
  }
}
