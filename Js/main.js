void (() => {
	// Strict mode
	"use strict";

	/**
	 * @type {Function} Main function
	 * @param {Window} _w Window object
	 * @param {Document} _d Document object
	 * @param {HTMLHtmlElement} _r Root element object
	 * @param {HTMLBodyElement} _b Body element object
	 */
	const main = function (_w, _d, _r, _b) {
		/** Code that runs ONCE on page load */
		void (function startupFunction() {
			// remove no-js class from root element
			_r.classList.remove("no-js");
		})(); /**/

		/** @module site Function to return all needed DOM landmark elements */
		const site = (() => {
			/** @param {String} id Id of the element to fetch from DOM */
			const getLandmarkElement = function (id) {
				const element = _d.getElementById(id) || _d.createElement("NOT-FOUND");
				if (element.tagName === "NOT-FOUND") {
					_r.classList.add(`no-${id.toLowerCase()}`);
					// eslint-disable-next-line no-console
					console.warn(`Warning:\tLandmark element with id "${id}" not found.`);
				}
				return element;
			};

			return {
				header: getLandmarkElement("header"),
				hero: getLandmarkElement("hero"),
				content: getLandmarkElement("content"),
				footer: getLandmarkElement("footer"),
			};
		})(); /**/
		// Throw error and stop script execution if element in site.elements
		if (Object.values(site).some((element) => element.tagName === "NOT-FOUND")) {
			// eslint-disable-next-line no-console
			console.error("Error:\tCould not find landmark element(s) from site Object in DOM!");
			return;
		}

		/** @module matchMedia Use Media Queries instead of resize events */
		const matchMedia = (() => {
			const mediaQueries = {
				sm: "540px",
				md: "744px",
				lg: "960px",
				xl: "1260px",
				xxl: "1620px",
			};

			/**
			 * @type {function} Evaluate Media Query
			 * @param {String} media Media Query in px
			 * @returns {MediaQueryList}
			 */
			const mediaQuery = function (media) {
				return _w.matchMedia(`(min-width: ${mediaQueries[media] || "-1px"})`);
			};

			/**
			 * @param {Function} func Function to add the event listener
			 * @param {String} media Media Query on which to add the function to
			 */
			const addMediaQueryListener = function (func, media) {
				mediaQuery(media).addEventListener("change", func);
			};

			/**
			 * @param {Function} func Function to remove the event listener
			 * @param {String} media Media Query on which to remove the function from
			 */
			const removeMediaQueryListener = function (func, media) {
				mediaQuery(media).removeEventListener("change", func);
			};

			return {
				/**
				 * @param {Function} func Function to remove the event listener
				 * @param {String} media Media Query on which to add the function to
				 */
				add: function (func, media) {
					addMediaQueryListener(func, media);
				},
				/**
				 * @param {Function} func Function to remove the event listener
				 * @param {String} media Media Query on which to remove the function from
				 */
				remove: function (func, media) {
					removeMediaQueryListener(func, media);
				},
				/**
				 * @param {String} media Media Query to evaluate
				 * @return {Boolean}
				 */
				match: function (media) {
					return mediaQuery(media).matches;
				},
			};
		})(); /**/

		/** @module ariaFunction All WAI-ARIA code belongs here */
		const ariaFunction = (() => {
			/**
			 * @type {function} Find all focussable Elements
			 * @param {HTMLElement} startingNode (Optional) Node in which to start searching for focussable elements
			 * @returns {Array<Element>}
			 */
			const getFocusElems = function (startingNode = _b) {
				return Array.from(
					startingNode.querySelectorAll(":any-link, button, input, select, textarea, [tabindex]")
				).filter((element) => {
					const unfocussable = "[disabled], [aria-disabled='true'], [aria-hidden='true']";
					if (!element.matches(`${unfocussable}, [tabindex='-1']`) && !element.closest(unfocussable))
						return element;
				});
			};

			const menuFunction = function (menuButtons) {
				/**
				 * @type {Function}
				 * @param {HTMLElement} menu
				 * @param {Boolean} override
				 * @param {Function} callback
				 */
				const toggleMenu = function (menu, override, callback) {
					if (!(menu instanceof HTMLElement)) return;

					// boolean if menu is to be opened or not
					const openMenu = override ?? menu.getAttribute("data-menu-open") !== "true";

					// toggle all menu controllers
					_d.querySelectorAll(`[aria-controls="${menu.id}"]`).forEach((menuController) => {
						if (!(menuController instanceof HTMLElement)) return;
						// set attribute
						menuController.setAttribute("aria-expanded", String(openMenu));
					});

					// set attributes and classes
					menu.setAttribute("aria-hidden", String(!openMenu));
					menu.setAttribute("data-menu-open", String(openMenu));

					// if element is of type collapse (aka has class "collapse")
					if (menu.classList.contains("collapse")) {
						// set height and add transition class
						menu.style.setProperty("height", `${menu.scrollHeight}px`);
						menu.classList.add("transition");
						// start opening transition and focus first element inside
						setTimeout(() => {
							menu.classList.toggle("open", openMenu);
							if (openMenu)
								getFocusElems(menu)[0]?.focus({
									preventScroll: true,
								});
						}, 0);
						// remove height and class after transition is finished
						setTimeout(() => {
							menu.style.setProperty("height", "");
							menu.classList.remove("transition");
						}, 250);
					}

					// run callback function if one exists
					if (callback && typeof callback === "function") callback(openMenu);
				};

				menuButtons.forEach((button) => {
					if (button instanceof HTMLButtonElement) {
						const controlElem = _d.getElementById(`${button.getAttribute("aria-controls")}`);
						if (!controlElem) return;

						button.addEventListener("click", () => {
							toggleMenu(controlElem, null, (/** @type {Boolean} */ openMenu) => {
								const haufeStellenFilter = _d.getElementById("hs-filter");
								if (
									haufeStellenFilter instanceof HTMLElement &&
									haufeStellenFilter.contains(controlElem)
								) {
									haufeStellenFilter.classList.toggle("open-filter", openMenu);
								}
							});
						});

						matchMedia.add(() => toggleMenu(controlElem, false), "lg");
					}
				});
			};
			menuFunction(_d.querySelectorAll("button[aria-controls]:not([aria-controls='']):not(.accordion-button)"));

			const disabledLinks = function (links) {
				links.forEach((link) => {
					if (link instanceof HTMLAnchorElement) {
						// link.title = `${link.title} (deaktiviert)`;
						link.addEventListener("click", (event) => {
							event.preventDefault();
							event.stopPropagation();
							event.stopImmediatePropagation();
							return false;
						});
					}
				});
			};
			disabledLinks(_d.querySelectorAll("a:is([disabled], [aria-disabled='true'])"));

			return {
				/**
				 * @param {HTMLElement} startingNode Node in which to start searching for focussable elements
				 * @return {Array<HTMLElement>}
				 */
				focussableElements: function (startingNode = _b) {
					return getFocusElems(startingNode);
				},
			};
		})(); /**/

		/** @module scrollFunction Code related to scroll events and functions */
		const scrollFunction = (() => {
			/**
			 * @type {Function} Throttled scroll event function
			 * @param {{x: number, y: number}} scrollPos Scroll position tuple
			 */
			const scrollEvent = function (scrollPos) {
				// Toggle class if user has scrolled down
				_r.classList.toggle("user-scroll", scrollPos.y > site.header.clientHeight / 2);
			};

			const scrollPos = { x: 0, y: 0 };
			let throttleNextScrollEvent = false;
			_d.addEventListener("scroll", () => {
				// set scroll position
				scrollPos.x = _w.scrollX;
				scrollPos.y = _w.scrollY;

				// throttled scroll events
				if (!throttleNextScrollEvent) {
					_w.requestAnimationFrame(() => {
						scrollEvent(scrollPos);
						throttleNextScrollEvent = false;
					});
					throttleNextScrollEvent = true;
				}
			});

			return {
				/** @return {{x: number, y: number}} */
				currentPosition: () => {
					return scrollPos;
				},
			};
		})(); /**/

		/** Animate content elements on page load */
		void (function contentAnimations() {
			// make content elements fade in when visible in viewport
			const animDuration = 675;
			let elementAnimateIOCount = 0;
			const elementAnimateIO = new IntersectionObserver(
				(entries, observer) => {
					entries.forEach((entry) => {
						if (!(entry.target instanceof HTMLElement && entry.isIntersecting)) return;
						entry.target.style.opacity = "";
						entry.target.style.transform = "";
						setTimeout(() => {
							entry.target.removeAttribute("style");
						}, animDuration);
						// unobserve already faded in elements
						observer.unobserve(entry.target);
						elementAnimateIOCount--;
					});
					// if nothing is observed, disconnect the observer
					if (elementAnimateIOCount <= 0) elementAnimateIO.disconnect();
				},
				{ rootMargin: "-5% 0%" }
			);

			_d.querySelectorAll("#content > * > *").forEach((contentElement) => {
				if (contentElement instanceof HTMLElement) {
					contentElement.style.opacity = "0";
					contentElement.style.transform = "translateY(7.5vw)";
					contentElement.style.transition = `opacity ${animDuration}ms ease, transform ${animDuration}ms ease`;
					elementAnimateIO.observe(contentElement);
					elementAnimateIOCount++;
				}
			});
		})(); /**/

		/** Add parallax effect to certain media elements */
		void (function parallaxFunction() {
			let requestIdArray = {};
			const parallaxMultiplier = 32.5;
			/**
			 * Calculate media parallax
			 * @param {Element} element Element to calculate parallax for
			 * @param {Number} index Index of element
			 * @param {HTMLElement|null} media Pass on media element
			 */
			const mediaParallax = function (element, index, media) {
				if (element instanceof HTMLElement) {
					media = media || element;
				} else {
					media = media || element.querySelector("img, video");
				}
				if (!(media instanceof HTMLElement)) return;

				media.style.transform = `translateZ(0) translateY(${
					((element.getBoundingClientRect().top + element.clientHeight / 2 + _r.clientHeight / 2) /
						_r.clientHeight -
						1) *
					-parallaxMultiplier
				}%) scale(${100 + parallaxMultiplier / 2}%)`;
				requestIdArray[index] = requestAnimationFrame(() => mediaParallax(element, index, media));
			};
			// set up intersection observer
			const io = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					const index = entry.target["index"];
					if (entry.isIntersecting) {
						requestIdArray[index] = requestAnimationFrame(() => mediaParallax(entry.target, index, null));
					} else {
						cancelAnimationFrame(requestIdArray[index]);
					}
				});
			});
			// attach parallax behavior to every object with given class
			_d.querySelectorAll(".parallax-media").forEach((mediaElement, index) => {
				if (mediaElement instanceof HTMLElement) {
					mediaElement["index"] = index;
					io.observe(mediaElement);
				}
			});
		})(); /**/

		/** Handle clicks and scroll on webpage */
		void (function clickHandling() {
			/**
			 * @type {Function} Scroll Handler
			 * @param {String} hash Element Id
			 */
			const scrollToHash = function (hash) {
				// define bool for state of scroll
				let handledScroll = false;
				void (() => {
					if (typeof hash !== "string" || !hash.length) return;
					// get element from hash
					const hashElement = _d.getElementById(hash.replace("#", ""));
					if (hashElement === null) return;
					// scroll to element and set flag
					hashElement.scrollIntoView();
					handledScroll = true;
				})();
				// go to top if scroll has not yet been handled
				if (!handledScroll) _w.scrollTo({ top: 0 });
			};

			// scroll on load and hashchange
			if (location.hash) scrollToHash(location.hash);
			//_w.addEventListener("hashchange", () => scrollToHash(location.hash));

			// link click handling
			_d.querySelectorAll(":any-link[href^='/'], :any-link[href*='#']").forEach((linkElement) => {
				linkElement.addEventListener("click", function (event) {
					if (!(linkElement instanceof HTMLAnchorElement)) return;

					// new URL object from link href
					const url = new URL(linkElement.href);

					// if link targets current page
					if (url.pathname !== location.pathname || url.search !== location.search) return;

					// run scrollToHash instead of unloading page
					event.preventDefault();
					scrollToHash(url.hash || "#");
					if (_d.activeElement instanceof HTMLElement) _d.activeElement.blur();
					history.pushState({}, "", url.hash);
				});
			});
		})(); /**/
	};

	// Run main function when DOM is loaded
	window.addEventListener("DOMContentLoaded", () => main(window, document, document.documentElement, document.body));
})();
