function newElement(tagName, className) {
  const element = document.createElement(tagName)
  element.className = className
  return element
}

function createWall(reversa = false) {
  this.elemento = newElement('div', 'barreira')

  const corpo = newElement('div', 'corpo')
  const borda = newElement('div', 'borda')

  this.elemento.appendChild(reversa? corpo: borda)
  this.elemento.appendChild(reversa? borda: corpo)

  this.setAltura = altura => corpo.style.height = `${altura}px`
}

function createTwoWalls(altura, abertura, x) {
  this.elemento = newElement('div', 'par-de-barreiras')

  this.superior = new createWall(true)
  this.inferior = new createWall(false)

  this.elemento.appendChild(this.superior.elemento)
  this.elemento.appendChild(this.inferior.elemento)

  this.sortearAbertura = () => {
    const alturaSuperior = Math.random() * (altura - abertura)
    const alturaInferior = altura - abertura - alturaSuperior
    this.superior.setAltura(alturaSuperior)
    this.inferior.setAltura(alturaInferior)
  }

  this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
  this.setX = x => this.elemento.style.left = `${x}px`
  this.getLargura = () => this.elemento.clientWidth

  this.sortearAbertura()
  this.setX(x)
}

function walls(altura, largura, abertura, espaco, notificarPonto) {

  this.pares = [
    new createTwoWalls(altura, abertura, largura),
    new createTwoWalls(altura, abertura, largura + espaco),
    new createTwoWalls(altura, abertura, largura + espaco * 2),
    new createTwoWalls(altura, abertura, largura + espaco * 3)
  ]

  const deslocamento = 7

  this.animar = () => {
    this.pares.forEach((wall, indice) => {
      wall.setX(wall.getX() - deslocamento)
      // Quando o elemento sair da área do jogo
      if(wall.getX() < -wall.getLargura()) {
        wall.setX(wall.getX() + espaco * this.pares.length)
        wall.sortearAbertura()
      }

      const meio = largura / 3.4
      const cruzouOMeio = wall.getX() + deslocamento >= meio && wall.getX() < meio
      if (cruzouOMeio) {
        notificarPonto()
      }
    })
  }
}

function ave(alturaDoJogo) {
  let voando = false

  this.elemento = newElement('img', 'passaro')
  this.elemento.src = 'imgs/passaro.png'
  this.elemento.style.transition = 'transform 0.3s'

  this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
  this.setY = y => this.elemento.style.bottom = `${y}px`

  window.onkeydown = e => voando = true
  window.onkeyup = e => voando = false

  this.animar = () => {
    const novoY = this.getY() + (voando? 9: -6)
    const alturaMaxima = alturaDoJogo - this.elemento.clientHeight - 20

    if (novoY <= 0) {
      this.setY(0)
    } else if (novoY >= alturaMaxima) {
      this.setY(alturaMaxima)
    } else {
      this.setY(novoY)
    }
    if (voando) {
      this.elemento.style.transform = 'translate(0px, 0px) rotate(-60deg)'
    } else {
      this.elemento.style.transform = 'translate(0px, 0px) rotate(30deg)'
    }
  }

  this.setY(alturaDoJogo / 2)
}

function Progresso() {
  this.elemento = newElement('span', 'progresso')
  this.atualizarPonto = pontos => {
    this.elemento.innerHTML = pontos
  }
  this.atualizarPonto(0)
}


function estaoSobrepostos(elementoA, elementoB) {
  const a = elementoA.getBoundingClientRect()
  const b = elementoB.getBoundingClientRect()

  const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
  const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top
  return horizontal && vertical
}

function colidiu(passaro, barreiras) {
  let colisao = false
  barreiras.pares.forEach(wall => {
    if (!colisao) {
      const superior = wall.superior.elemento
      const inferior = wall.inferior.elemento

      colisao = estaoSobrepostos(passaro.elemento, superior) || estaoSobrepostos(passaro.elemento, inferior)
    }
  })

  return colisao
}

function placar() {
  this.recorde = 0
  this.setRecorde = x => this.recorde = x > this.recorde? x: this.recorde
  this.getRecorde = () => this.recorde
}

const recorde = new placar()

function FlappyBirdGame() {
  let pontos = 0
  const labelRecord = newElement('span', 'meu-recorde')
  labelRecord.innerHTML = `Recorde: ${recorde.getRecorde()}`

  const areaDoJogo = document.querySelector('[wm-flappy]')
  const altura = areaDoJogo.clientHeight
  const largura = areaDoJogo.clientWidth

  const progresso = new Progresso()
  const barreiras = new walls(altura, largura, 215, 400, () => {
    progresso.atualizarPonto(++pontos)
  })
  const passaro = new ave(altura)
  areaDoJogo.appendChild(labelRecord)
  areaDoJogo.appendChild(progresso.elemento)
  areaDoJogo.appendChild(passaro.elemento)
  barreiras.pares.forEach(wall => areaDoJogo.appendChild(wall.elemento))

  this.start = () => {
    //Loop do jogo
    const temporizador = setInterval(() => {
      barreiras.animar()
      passaro.animar()
      if (colidiu(passaro, barreiras)) {
        clearInterval(temporizador)
        playAgain(pontos)
      }
    }, 20)
  }
}


function playAgain(novoPonto = 0) {
  recorde.setRecorde(novoPonto)

  document.querySelector('[wm-flappy]').innerHTML = ''
  const labelPontos = newElement('p', 'meu-ponto')

  labelPontos.innerHTML = `Seu ponto: ${novoPonto}`

  const play = newElement('div', 'play-again')
  const playButton = newElement('button', '')
  playButton.innerHTML = 'Play Again'

  play.appendChild(playButton)
  play.appendChild(labelPontos)

  document.querySelector('[wm-flappy]').appendChild(play)
  const main = new FlappyBirdGame
  playButton.onclick = () =>{
    main.start()
    play.style.display = 'none'
  }
}

playAgain()
