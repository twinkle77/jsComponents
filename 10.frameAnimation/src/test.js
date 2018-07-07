const imgUrl = './images/rabbit-big.png'
const positions = ['0 -854', '-174 -852', '-349 -852', '-524 -852', '-698 -852', '-873 -848']

const el = document.createElement('div')
el.style.width = '102px'
el.style.height = '80px'
document.body.appendChild(el)

function animation (el, positions, imgUrl) {
  let index = 0
  el.style.backgroundImage = `url('${imgUrl}')`
  el.style.backgroundRepeat = 'no-repeat'
  run()
  function run () {
    let pos = positions[index].split(' ')
    el.style.backgroundPosition = `${pos[0]}px ${pos[1]}px`
    index++
    if (index >= positions.length) {
      index = 0
    }
    setTimeout(run, 80)
  }
}

animation(el, positions, imgUrl)
