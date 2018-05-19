export const util = {
    randomId (n) {
      let rnd = ''
      for (let i = 0; i < n; i++) {
        rnd += Math.floor(Math.random() * 10)
      }
      return rnd
    }
}
