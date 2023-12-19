const accordionBtns = document.querySelectorAll('.menu__item--expandable'),
	accordionInfos = document.querySelectorAll('.accordion__info'),
	burgerNav = document.querySelector('.nav__burger-nav'),
	burgerBtn = document.querySelector('.burger-btn'),
	firstBar = document.querySelector('.burger-btn__bar--one'),
	secondBar = document.querySelector('.burger-btn__bar--two'),
	thirdBar = document.querySelector('.burger-btn__bar--three')

const handleNav = () => {
	const burgerNav = document.querySelector('.nav__burger-nav')
	accordionInfos.forEach(el => {
		el.classList.remove('active')
		el.previousElementSibling.querySelector('svg').classList.remove('rotate')
	})
	burgerNav.classList.toggle('active-menu')
	document.body.classList.toggle('body-lock')
	firstBar.classList.toggle('first-cross')
	thirdBar.classList.toggle('third-cross')
	secondBar.classList.toggle('second-cross')
}

const closeNavOutsideBox = e => {
	e.stopPropagation()
	if (e.target.classList.contains('active-menu')) {
		burgerNav.classList.remove('active-menu')
		document.body.classList.remove('body-lock')
		firstBar.classList.remove('first-cross')
		thirdBar.classList.remove('third-cross')
		secondBar.classList.remove('second-cross')
	}
}

function openAccordionItems() {
	this.nextElementSibling.classList.toggle('active')
	this.querySelector('svg').classList.toggle('rotate')
}

accordionBtns.forEach(btn => btn.addEventListener('click', openAccordionItems))
burgerBtn.addEventListener('click', handleNav)
burgerNav.addEventListener('click', closeNavOutsideBox)