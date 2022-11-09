!(function () {
	// Enable strict mode
	"use strict";

	/**
	 * @type {Function} Main function
	 * @param {Window} _w Window object
	 * @param {Document} _d Document object
	 * @param {HTMLElement} _r Root element object
	 * @param {HTMLElement} _b Root element object
	 */
	const main = function (_w, _d, _r, _b) {
        console.log("trappi.st");
	};

	// Run main function when DOM is loaded
	main(window, document, document.documentElement, document.body);

	// End of script
	return 0;
})();
