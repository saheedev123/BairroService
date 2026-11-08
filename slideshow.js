document.addEventListener('DOMContentLoaded', function () {
  const slides = document.querySelectorAll('.slide')
  const dots = document.querySelectorAll('.dot')
  const nextButton = document.querySelector('.slide-arrow.next')
  const prevButton = document.querySelector('.slide-arrow.prev')

  let currentSlide = 0
  let slideTimer

  function showSlide(index) {
    slides[currentSlide].classList.remove('active')
    dots[currentSlide].classList.remove('active')

    currentSlide = (index + slides.length) % slides.length

    slides[currentSlide].classList.add('active')
    dots[currentSlide].classList.add('active')
  }

  function nextSlide() {
    showSlide(currentSlide + 1)
  }

  function previousSlide() {
    showSlide(currentSlide - 1)
  }

  function startSlideshow() {
    clearInterval(slideTimer)
    slideTimer = setInterval(nextSlide, 5000)
  }

  nextButton.addEventListener('click', function () {
    nextSlide()
    startSlideshow()
  })

  prevButton.addEventListener('click', function () {
    previousSlide()
    startSlideshow()
  })

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index)
      startSlideshow()
    })
  })

  startSlideshow()
})
