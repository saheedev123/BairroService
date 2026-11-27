
document.addEventListener('DOMContentLoaded', function () {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const nextButton = document.querySelector('.slide-arrow.next');
    const prevButton = document.querySelector('.slide-arrow.prev');

    let currentSlide = 0;
    let slideTimer;

    function showSlide(index) {
        if (!slides.length) return;

        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        currentSlide = (index + slides.length) % slides.length;

        slides[currentSlide].classList.add('active');

        if (dots[currentSlide]) {
            dots[currentSlide].classList.add('active');
        }
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function previousSlide() {
        showSlide(currentSlide - 1);
    }

    function startSlideshow() {
        clearInterval(slideTimer);
        slideTimer = setInterval(nextSlide, 6000);
    }

    if (nextButton) {
        nextButton.addEventListener('click', function () {
            nextSlide();
            startSlideshow();
        });
    }

    if (prevButton) {
        prevButton.addEventListener('click', function () {
            previousSlide();
            startSlideshow();
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            startSlideshow();
        });
    });

    showSlide(0);
    startSlideshow();
});
