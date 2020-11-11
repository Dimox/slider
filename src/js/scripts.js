$(function () {
  const cards = $('.card');
  const allSlides = cards.clone();
  const slidesToFilter = cards.clone();

  const slideOptions = {
    init: false,
    navigation: {
      prevEl: '.cards__arrow--prev',
      nextEl: '.cards__arrow--next',
    },
    pagination: {
      el: '.cards__dots',
      type: 'bullets',
      clickable: true,
    },
    slidesPerView: 2,
    slidesPerColumn: 2,
    spaceBetween: 20,
    watchSlidesProgress: true,
    watchSlidesVisibility: true,
    breakpoints: {
      768: {
        slidesPerView: 3,
        slidesPerColumn: 2,
        spaceBetween: 20,
      },
      1440: {
        slidesPerView: 6,
        slidesPerColumn: 2,
        spaceBetween: 30,
      },
    },
    simulateTouch: false,
    a11y: {
      prevSlideMessage: 'Предыдущий слайд',
      nextSlideMessage: 'Следующий слайд',
      paginationBulletMessage: 'Перейти к слайду {{index}}',
    },
  };
  var slider = new Swiper('.cards__slider', slideOptions);

  const setCardsClasses = (items) => {
    const visibleCards = items.filter('.swiper-slide-visible');
    items.removeClass('card--expanded');
    if (slider.params.slidesPerView === 2) {
      items.removeClass('card--top-left card--top-right card--bottom-left card--bottom-right');
      visibleCards.each(function (i) {
        switch (i) {
          case 0:
            $(this).addClass('card--top-left');
            break;
          case 1:
            $(this).addClass('card--bottom-left');
            break;
          case 2:
            $(this).addClass('card--top-right');
            break;
          case 3:
            $(this).addClass('card--bottom-right');
            break;
        }
      });
    } else if (slider.params.slidesPerView === 3) {
      items.removeClass('card--second card--third');
      visibleCards.each(function (i) {
        if (i === 2 || i === 3) {
          $(this).addClass('card--second');
        } else if (i === 4 || i === 5) {
          $(this).addClass('card--third');
        }
      });
    } else if (slider.params.slidesPerView === 6) {
      items.removeClass('card--right');
      visibleCards.each(function (i) {
        if (i > 7) {
          $(this).addClass('card--right');
        }
      });
    }
  };

  slider.on('init slideChange transitionEnd resize', () => {
    setCardsClasses(cards);
    slider.update();
  });
  slider.init();

  const filterCards = (el) => {
    allSlides.removeClass('card--expanded');
    slidesToFilter.removeClass('card--expanded');
    if (el.is('[data-all]')) {
      slider.removeAllSlides();
      slider.appendSlide(allSlides);
      setCardsClasses(allSlides);
      slider.on('slideChange', () => {
        setCardsClasses(allSlides);
      });
    } else {
      const filterCountry = el.text();
      const filteredSlides = slidesToFilter.filter(function () {
        const cardCountry = $(this).find('.card__country').text();
        return cardCountry === filterCountry;
      });
      slider.removeAllSlides();
      slider.appendSlide(filteredSlides);
      setCardsClasses(filteredSlides);
      slider.on('slideChange', () => {
        setCardsClasses(filteredSlides);
      });
    }
  };

  $('.filter').on('click', '.filter__button:not(.filter__button--active)', function () {
    $(this).addClass('filter__button--active').siblings().removeClass('filter__button--active');
    const button = $(this);
    const value = button.text();
    $('.select__option')
      .removeClass('select__option--selected')
      .each(function () {
        if ($(this).text() === value || (button.is('[data-all]') && $(this).is('[data-all]'))) {
          $(this).addClass('select__option--selected').closest('.select').find('.select__trigger').text($(this).text());
        }
      });
    filterCards($(this));
  });

  $('.cards')
    .on('click', '.card', function () {
      $(this).addClass('card--expanded').siblings().removeClass('card--expanded');
    })
    .on('click', '.card__close', function (e) {
      e.stopPropagation();
      $(this).closest('.card').removeClass('card--expanded');
    });

  $('.select').click(function (e) {
    e.stopPropagation();
    $(this).toggleClass('select--open');
    $(this).find('.select__options').slideToggle();
  });

  $('.select__option').click(function () {
    const option = $(this);
    const value = option.text();
    option
      .addClass('select__option--selected')
      .siblings()
      .removeClass('select__option--selected')
      .closest('.select')
      .find('.select__trigger')
      .text(value);
    $('.filter__button')
      .removeClass('filter__button--active')
      .each(function () {
        if ($(this).text() === value || (option.is('[data-all]') && $(this).is('[data-all]'))) {
          $(this).addClass('filter__button--active');
        }
      });
    filterCards($(this));
  });

  $(document).click(function (e) {
    if ($(e.target).not('.select__trigger')) {
      $('.select').removeClass('select--open');
      $('.select').find('.select__options').slideUp();
    }
  });
});
