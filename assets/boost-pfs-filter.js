// Override Settings
var boostPFSFilterConfig = {
	general: {
		limit: boostPFSConfig.custom.products_per_page,
		/* Optional */
		loadProductFirst: true,
		//paginationType: boostPFSConfig.custom.enable_infinite_scrolling? "infinite": "default",
	},
};

// Declare Templates
var boostPFSTemplate = {
	saleLabelHtml: '<div class="sale-badge">' + boostPFSConfig.label.on_sale + "</div>",
	soldOutLabelHtml: '<div class="sold-out-badge">' + boostPFSConfig.label.sold_out + "</div>",
	vendorHtml:'<div class="product-grid--vendor-text">{{itemVendorLabel}}</div>',

	// Grid Template
	productGridItemHtml: 	'<div class="grid__item ' + boostPFSConfig.custom.grid_item_width + '">' +
								'<div class="grid-view-item">' +
									'<div class="grid-view-item-image">' +
										"{{itemImages}}" +
										"{{itemQuickview}}" +
									'</div>' +
									'<div class="grid-view-item--desc-wrapper grid-uniform">' +
										'<div class="grid__item large--one-whole">' +
											"{{itemVendor}}" +
											'<p class="product-grid--title">' +
												'<a href="{{itemUrl}}">{{itemTitle}}</a>' +
											'</p>' +
											'<p class="product-grid--price">' +
												'{{itemPrice}}' +
												'{{itemReviews}}' +
											'</p>' +
										'</div>' +
									'</div>' +
									'{{itemBadges}}' +
								'</div>' +
							'</div>',

	// Pagination Template
	previousActiveHtml: '<li class="pagination-arrow"><a href="{{itemUrl}}"><i class="fa fa-chevron-left"></i></a></li>',
	previousDisabledHtml: '<li class="prev disabled"><a href="#" onclick="return false;">&laquo;</a></li>',
	nextActiveHtml: '<li class="pagination-arrow"><a href="{{itemUrl}}"><i class="fa fa-chevron-right"></i></a></li>',
	nextDisableHtml: '<li class="next disabled"><a href="#" onclick="return false;">&raquo;</a></li>',
	pageItemHtml: '<li class="pagination-number"><a href="{{itemUrl}}" title="">{{itemTitle}}</a></li>',
	pageItemSelectedHtml: '<li class="active pagination-number"><a href="" title="">{{itemTitle}}</a></li>',
	pageItemRemainHtml: '<li class="ellipsis">{{itemTitle}}</li>',
	paginateHtml: "<ul>{{previous}}{{pageItems}}{{next}}</ul>",

	// Sorting Template
	sortingHtml: '<label for="bc-sf-filter-top-sorting-select">' +boostPFSConfig.label.sorting +'</label><select id="bc-sf-filter-top-sorting-select">{{sortingItems}}</select>',
};

(function () {
	// Add this
	BoostPFS.inject(this); // Add this

	// Build Product Grid Item
	ProductGridItem.prototype.compileTemplate = function (data, index, totalProduct) {

		if (!data) data = this.data; // Add this line
		if (!index) index = this.index; // Add this line
		if (!totalProduct) totalProduct = this.totalProduct;

		var soldOut = !data.available;
		var onSale = data.compare_at_price_min > data.price_min;
		var priceVaries = data.price_min != data.price_max;
		// Get Template
		var itemHtml = boostPFSTemplate.productGridItemHtml;

		// Add class
		// Add Badges
		var itemBadgesHtml = "";
		if (boostPFSConfig.custom.enable_sale_badge && onSale && data.available) {
			itemBadgesHtml += boostPFSTemplate.saleLabelHtml;
		}
		if (boostPFSConfig.custom.enable_sold_out_badge && !data.available) {
			itemBadgesHtml += boostPFSTemplate.soldOutLabelHtml;
		}
		itemHtml = itemHtml.replace(/{{itemBadges}}/g, itemBadgesHtml);

		// Add Vendor
		var itemVendorHtml = boostPFSConfig.custom.show_vendor ? boostPFSTemplate.vendorHtml.replace(/{{itemVendorLabel}}/g, data.vendor): "";
		itemHtml = itemHtml.replace(/{{itemVendor}}/g, itemVendorHtml);

		// Add price
		itemHtml = itemHtml.replace(/{{itemPrice}}/g, buildPrice(data, soldOut, onSale, priceVaries));

		// Add Reviews
		var itemReviewsHtml = boostPFSConfig.custom.show_reviews ? '<span class="shopify-product-reviews-badge" data-id="{{itemId}}"></span>': "";
		itemHtml = itemHtml.replace(/{{itemReviews}}/g, itemReviewsHtml);

		// Add Images
		itemHtml = itemHtml.replace(/{{itemImages}}/g, buildImages(data));

		// Add Quick view
		itemHtml = itemHtml.replace(/{{itemQuickview}}/g, buildHover(data));

		// Add main attribute
		itemHtml = itemHtml.replace(/{{itemId}}/g, data.id);
		itemHtml = itemHtml.replace(/{{itemHandle}}/g, data.handle);
		itemHtml = itemHtml.replace(/{{itemTitle}}/g, data.title);
		itemHtml = itemHtml.replace(/{{itemUrl}}/g,Utils.buildProductItemUrl(data));

		return itemHtml;
	};

	function buildImages(data) {
		var images = data.images_info;
		var html = "";
		if (boostPFSConfig.custom.hover_effect) {
			if (images.length > 1) {
				html += '<div class="reveal">';
				html += '<a href="{{itemUrl}}" title="{{itemTitle}}" class="grid__image grid__image__match">';
				html += '<img src="' + Utils.optimizeImage(images[0]["src"], "760x") + '" alt="{{itemTitle}}" class="img-responsive wow fadeIn" id="collection-image-anim">';
				html += '<div class="hidden">';
				html +='<img src="' + Utils.optimizeImage(images[1]["src"], "760x") + '" alt="{{itemTitle}}" class="img-responsive" />';
				html += "</div>";
				html += "</a>";
				html += "</div>";
			} else {
				html += '<a href="{{itemUrl}}" title="{{itemTitle}}" class="grid__image grid__image__match">';
				html += '<img src="' + Utils.getFeaturedImage(images, "760x") + '" alt="{{itemTitle}}" class="img-responsive wow fadeIn" id="collection-image-anim">';
				html += "</a>";
			}
		} else {
			html += '<a href="{{itemUrl}}" title="{{itemTitle}}" class="grid__image grid__image__match">';
			html += '<img src="' + Utils.getFeaturedImage(images, "760x") + '" alt="{{itemTitle}}" class="img-responsive wow fadeIn" id="collection-image-anim">';
			html += "</a>";
		}
		return html;
	}

	function buildHover(data) {
		var html = "";
		if (boostPFSConfig.custom.quick_shop_enable) {
		html += '<div class="shop-now-wrapper">';
		html += '<a class="shop-now-button" href="{{itemUrl}}">' + boostPFSConfig.label.quick_shop + '</a>';
		html += '</div>';
		}
		return html;
	}

	function buildPrice(data, soldOut, onSale, priceVaries) {
		var html = '';
		if (onSale) {
			if (priceVaries) {
				html += boostPFSConfig.label.sale_from_price.replace( /{{ price }}/g, '<span class="money">' + Utils.formatMoney(data.price_min) + '</span>');
			} else {
				html += '<span class="product-grid--compare-price">' + Utils.formatMoney(data.compare_at_price_min) + "</span>";
				html += ' <span class="money">' + Utils.formatMoney(data.price_min) + '</span>';
			}
		} else {
			if (priceVaries) {
				html += ' <span class="product-grid--from-wrapper">' + boostPFSConfig.label.from_price + '</span> <span class="money">' + Utils.formatMoney(data.price_min) + "</span>";
			} else {
				html += '<span class="money">' + Utils.formatMoney(data.price_min) + '</span>';
			}
		}
		if (soldOut) {
			html += '<br><strong>' + boostPFSConfig.label.sold_out + '</strong>';
		}
		return html;
	}

	// Build Pagination
	ProductPaginationDefault.prototype.compileTemplate = function (totalProduct) {
		if (!totalProduct) totalProduct = this.totalProduct;

		// Get page info
		var currentPage = parseInt(Globals.queryParams.page);
		var totalPage = Math.ceil(totalProduct / Globals.queryParams.limit);

		if (totalPage > 1) {
			var paginationHtml = boostPFSTemplate.paginateHtml;
			// Build Previous
			var previousHtml = currentPage > 1 ? boostPFSTemplate.previousActiveHtml : "";
			previousHtml = previousHtml.replace(/{{itemUrl}}/g, Utils.buildToolbarLink("page", currentPage, currentPage - 1));
			paginationHtml = paginationHtml.replace(/{{previous}}/g, previousHtml);
			// Build Next
			var nextHtml = currentPage < totalPage ? boostPFSTemplate.nextActiveHtml : "";
			nextHtml = nextHtml.replace(/{{itemUrl}}/g, Utils.buildToolbarLink("page", currentPage, currentPage + 1));
			paginationHtml = paginationHtml.replace(/{{next}}/g, nextHtml);
			// Create page items array
			var beforeCurrentPageArr = [];
			for (var iBefore = currentPage - 1; iBefore > currentPage - 3 && iBefore > 0; iBefore--) {
				beforeCurrentPageArr.unshift(iBefore);
			}
			if (currentPage - 4 > 0) {
				beforeCurrentPageArr.unshift("...");
			}
			if (currentPage - 4 >= 0) {
				beforeCurrentPageArr.unshift(1);
			}
			beforeCurrentPageArr.push(currentPage);
			var afterCurrentPageArr = [];
			for (var iAfter = currentPage + 1; iAfter < currentPage + 3 && iAfter <= totalPage; iAfter++) {
				afterCurrentPageArr.push(iAfter);
			}
			if (currentPage + 3 < totalPage) {
				afterCurrentPageArr.push("...");
			}
			if (currentPage + 3 <= totalPage) {
				afterCurrentPageArr.push(totalPage);
			}
			// Build page items
			var pageItemsHtml = "";
			var pageArr = beforeCurrentPageArr.concat(afterCurrentPageArr);
			for (var iPage = 0; iPage < pageArr.length; iPage++) {
				if (pageArr[iPage] == "...") {
					pageItemsHtml += boostPFSTemplate.pageItemRemainHtml;
				} else {
					pageItemsHtml += pageArr[iPage] == currentPage ? boostPFSTemplate.pageItemSelectedHtml : boostPFSTemplate.pageItemHtml;
				}
				pageItemsHtml = pageItemsHtml.replace(/{{itemTitle}}/g, pageArr[iPage]);
				pageItemsHtml = pageItemsHtml.replace(/{{itemUrl}}/g, Utils.buildToolbarLink("page", currentPage, pageArr[iPage]));
			}
			paginationHtml = paginationHtml.replace(/{{pageItems}}/g, pageItemsHtml);
			return paginationHtml;
		}
		
		return '';
	};

	// Build Sorting
	ProductSorting.prototype.compileTemplate = function () {
		if (boostPFSTemplate.hasOwnProperty("sortingHtml")) {
			var sortingArr = Utils.getSortingList();
			if (sortingArr) {
				// Build content
				var sortingItemsHtml = "";
				for (var k in sortingArr) {
					sortingItemsHtml += '<option value="' + k + '">' + sortingArr[k] + "</option>";
				}
				var html = boostPFSTemplate.sortingHtml.replace(/{{sortingItems}}/g, sortingItemsHtml);
				return html;
			}
		}
		return '';
	};

	// Add additional feature for product list, used commonly in customizing product list
	ProductList.prototype.afterRender = function (data, eventType) {
		if (!data) data = this.data;
		if (!eventType) eventType = this.eventType;

		//Call theme function
		if (window.wetheme && typeof wetheme.load_all == "function") {
			wetheme.load_all({});
		}
		buildTheme();
	};

	// Build additional elements
	FilterResult.prototype.afterRender = function (data, eventType) {};

	function buildTheme() {
		if (window.SPR) {
			SPR.initDomEls();
			SPR.loadBadges();
		}
		Shopify.PaymentButton.init();

		if (boostPFSConfig.custom.show_multiple_currencies) {
			convertCurrencies();
		}
	}
})();
