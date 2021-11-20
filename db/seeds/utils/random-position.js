const randomPosition = (lat, lng, variation = 0.001000) => {
  return {
    lat: lat + ((Math.random() - variation) * (variation * 2)),
    lng: lng + ((Math.random() - variation) * (variation * 2))
  }
}

module.exports = randomPosition;