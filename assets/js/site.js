(function () {
	'use strict';

	var yearEl = document.querySelector('[data-year]');
	if (yearEl) {
		yearEl.textContent = new Date().getFullYear();
	}

	if (!('IntersectionObserver' in window)) {
		return;
	}

	/* Reveal on first entry, then stop observing. Skipped entirely when the
	   visitor prefers reduced motion, since the CSS leaves them visible. */
	if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		var revealer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) return;
				entry.target.classList.add('is-visible');
				revealer.unobserve(entry.target);
			});
		}, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

		document.querySelectorAll('.reveal').forEach(function (el) {
			revealer.observe(el);
		});
	}

	/* Mark the nav link for whichever section is currently deepest in view. */
	var links = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
	var sections = links
		.map(function (link) { return document.querySelector(link.hash); })
		.filter(Boolean);

	if (sections.length !== links.length) {
		return;
	}

	var ratios = new Map();

	var tracker = new IntersectionObserver(function (entries) {
		entries.forEach(function (entry) {
			ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
		});

		var best = null;
		ratios.forEach(function (ratio, section) {
			if (ratio > 0 && (!best || ratio > ratios.get(best))) {
				best = section;
			}
		});

		links.forEach(function (link, i) {
			if (sections[i] === best) {
				link.setAttribute('aria-current', 'true');
			} else {
				link.removeAttribute('aria-current');
			}
		});
	}, { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] });

	sections.forEach(function (section) {
		ratios.set(section, 0);
		tracker.observe(section);
	});
})();
