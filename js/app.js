//Contributors: istiak.mah
//
//>>>>>>> e75616045baf06d6b860eb16ae26850623e8c2c4
//Donate link: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=T2J4GWJE5SKQE

/* Application functions */
(function () {
    'use strict';

    APP.Flickr = {
        apiKey: '03f6e74440c21a5878092a29945bc2a5',
        apiMethod: 'flickr.photos.search',
        apiUrl: 'https://api.flickr.com/services/rest/',
        imgUrlPattern: 'https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_{size}.jpg',
        imgPreview: "<div class='flickr-photo{class}'><img tabindex='0' data-index='{index}' data-id='{photoId}' data-props='{props}' class='th' src='{path}' alt='{title}'/><span class='glyphicon glyphicon-ok-circle' aria-hidden='true'></span></div>",
        counter: 0,
        collectedPhotos: {},
        isFlickrList: false,
        isShowGallery: false,
        /* pagination */
        currentPage: 0,
        maxPage: 0,
        /* sticky header */
        stickyClass: 'sticky-header',
        init: function () {
            this.body = APP.$('body');
            this.searchFormSel = APP.$('#js-search-form');
            this.searchBtnSel = APP.$('#js-search-btn');
            this.searchInputSel = APP.$('#js-search-input');
            this.searchErrorSel = APP.$('#js-search-error');
            this.gallerySel = APP.$('#js-gallery');
            this.galleryListSel = APP.$('#js-gallery-list');
            this.gallerySelectedSel = APP.$('#js-gallery-selected');
            this.gallerySelectedListSel = APP.$('#js-gallery-selected-list');
            this.gallerySelectedBackBtnSel = APP.$('#js-gallery-back');
            this.galleryStatSel = APP.$('#js-show-gallery-stat');
            this.galleryHeadSpaceSel = APP.$('#js-flickr-head-space');
            this.galleryStatCountSel = APP.$('#js-show-gallery-count');
            this.showSelectedPhotosSel = APP.$('#js-show-selected');
            this.morePhotosBtnSel = APP.$('#js-flickr-more-btn');
            this.morePhotosSel = APP.$('#js-flickr-more-container');
            this.loader = APP.$('#js-loader');
            this.emptymsg = APP.$('#js-emptymsg');
            this.gallerymsg = APP.$('#js-gallerymsg');
            this.searchText = '';

            /* modal dialog */
            this.modalTemplate = APP.$('#js-modal-template');
            this.modalTitle = APP.$('#js-modal-title');
            this.modalContent = APP.$('#js-modal-content');
            this.modalClose = APP.$('#js-modal-close');

            this.events();
        },
        
        events: function () {
            APP.Events.on(this.searchFormSel, 'submit', this.sendRequest.bind(this));
            APP.Events.on(this.galleryListSel, 'click', this.selectPhotos.bind(this), 'img');
            APP.Events.on(this.gallerySelectedSel, 'click', this.preparePhoto.bind(this), 'img');
            APP.Events.on(this.showSelectedPhotosSel, 'click', this.showSelected.bind(this));
            APP.Events.on(this.morePhotosBtnSel, 'click', this.loadMore.bind(this));
            APP.Events.on(this.gallerySelectedBackBtnSel, 'click', this.backToAllPhotos.bind(this));
            APP.Events.on(this.modalClose, 'click', this.hideModal.bind(this));
            APP.Events.on(window, 'scroll', this.stickyHeader.bind(this));
        },
        /**
         * Build http query to flickr api
         * @param q - text for searching
         * @param p - current page
         * @returns {string}
         */
        buildQuery: function (q, p) {
            p = p ? '&page=' + p : '';
            return this.apiUrl
                    + '?method=' + this.apiMethod
                    + '&format=json'
                    + '&api_key=' + this.apiKey
                    + '&text=' + encodeURI(q)
                    + '&content_type=7&nojsoncallback=1'
                    + p;
        },
        
        validation: function (text) {
            return !!text.length;
        },
        
        /**
         * Show error message
         * @param str - error message text
         */
        showError: function (str) {
            APP.show(this.searchErrorSel);
            if (typeof str == 'string') {
                this.searchErrorSel.innerHTML = str;
            }
        },
        /**
         * Hide error message
         */
        hideError: function () {
            APP.hide(this.searchErrorSel);
        },
        
        sendRequest: function (e) {
            e.preventDefault();

            this.loaderShow();
            this.searchText = this.searchInputSel.value;

            if (!this.validation(this.searchText)) {
                this.showError();
                return;
            } else {
                this.hideError();
            }

            this.backToAllPhotos();
            this.galleryListSel.innerHTML = '';

            APP.Ajax({
                url: this.buildQuery(this.searchText),
                callback: this.parseResponse.bind(this)
            });
        },
        
        loadMore: function () {
            if (this.currentPage == this.maxPage) {
                return;
            }
            this.currentPage += 1;
            this.loaderShow();
            APP.Ajax({
                url: this.buildQuery(this.searchText, this.currentPage),
                callback: this.parseResponse.bind(this)
            });
        },
        
        parseResponse: function (response) {
            var data = JSON.parse(response);
            if (data.stat == 'ok') {
                this.currentPage = data.photos.page;
                this.maxPage = data.photos.pages;
                this.generatePreviews(data.photos.photo);

            } else {
                this.emptymsgShow();
            }
        },
        
        generatePreviews: function (photos) {
            var output, i, c, img, item, imgPreviewPath, selected;
            c = photos.length;
            output = [];
            this.allPhotos = photos;

            for (i = 0; i < c; i++) {
                selected = typeof this.collectedPhotos[photos[i].id] == 'object' && !this.isShowGallery ? ' selected' : '';

                imgPreviewPath = this.imgUrlPattern
                        .replace('{farm-id}', photos[i].farm)
                        .replace('{server-id}', photos[i].server)
                        .replace('{id}', photos[i].id)
                        .replace('{secret}', photos[i].secret)
                        .replace('{size}', 'q');

                item = this.imgPreview
                        .replace('{path}', imgPreviewPath)
                        .replace('{index}', i)
                        .replace('{class}', selected)
                        .replace('{photoId}', photos[i].id)
                        .replace('{props}', APP.escapeTags(JSON.stringify(photos[i])))
                        .replace('{title}', APP.escapeTags(photos[i].title));

                output.push(item);
            }

            this.showPreview(output.join(''));
        },
        
        showPreview: function (output) {
            if (!!output) {
                if (this.isFlickrList) {
                    if (this.currentPage == this.maxPage) {
                        APP.hide(this.morePhotosSel);
                    } else if (this.currentPage < this.maxPage) {
                        APP.show(this.morePhotosSel);
                    }
                    APP.show(this.gallerySel);
                    this.galleryListSel.insertAdjacentHTML('beforeend', output);
                } else if (this.isShowGallery) {
                    this.gallerySelectedListSel.innerHTML = output;
                }
                this.loaderHide();
                this.emptymsgHide();
                this.gallerymsgShow();
            } else {
                this.emptymsgShow();
                this.loaderHide();
                this.gallerymsgHide();
            }
        },
        
        selectPhotos: function (e, el) {
            if (this.isFlickrList) {
                if (APP.hasClass(el.parentNode, 'selected')) {
                    APP.removeClass(el.parentNode, 'selected');
                    this.removePhotoToCollection(el.dataset.id);
                } else {
                    APP.addClass(el.parentNode, 'selected');
                    this.addPhotoToCollection(el);
                }
            }
        },
        
        addPhotoToCollection: function (el) {
            this.collectedPhotos[el.dataset.id] = JSON.parse(el.dataset.props);
            this.counter += 1;
            if (this.counter) {
                APP.show(this.galleryStatSel);
            }
            this.galleryCounter(this.counter);
        },
        
        removePhotoToCollection: function (i) {
            if (typeof this.collectedPhotos[i] == 'object') {
                delete this.collectedPhotos[i];
                this.counter -= 1;
                if (!this.counter) {
                    APP.hide(this.galleryStatSel);
                }
                this.galleryCounter(this.counter);
            }
        },
        
        galleryCounter: function (counter) {
            this.galleryStatCountSel.innerHTML = counter + ' ' + APP.plural(counter, 'photo');
        },
        
        showSelected: function () {
            var selected = [], i;
            for (i in this.collectedPhotos) {
                if (this.collectedPhotos.hasOwnProperty(i)) {
                    selected.push(this.collectedPhotos[i]);
                }
            }

            this.isFlickrList = false;
            this.isShowGallery = true;

            APP.hide(this.gallerySel);
            APP.show(this.gallerySelectedSel);
            this.generatePreviews(selected);
        },
        
        backToAllPhotos: function () {
            this.isFlickrList = true;
            this.isShowGallery = false;

            APP.show(this.gallerySel);
            APP.hide(this.gallerySelectedSel);
        },
        
        stickyHeader: function () {
            if (window.scrollY >= window.innerHeight / 2) {
                APP.addClass(this.body, this.stickyClass);
                this.galleryHeadSpaceSel.style.height = APP.Flickr.galleryStatSel.parentNode.offsetHeight + 'px';

            } else {
                APP.removeClass(this.body, this.stickyClass);
                this.galleryHeadSpaceSel.style.height = 0;
            }
        },
        
        preparePhoto: function (e, el) {
            var img, path, photo;

            img = document.createElement('img');

            if (this.isShowGallery) {
                photo = this.collectedPhotos[el.dataset.id];
                if (typeof photo == 'object') {
                    path = this.imgUrlPattern
                            .replace('{farm-id}', photo.farm)
                            .replace('{server-id}', photo.server)
                            .replace('{id}', photo.id)
                            .replace('{secret}', photo.secret)
                            .replace('{size}', 'b');

                    img.alt = photo.title;
                    img.src = path;

                    this.showModal({
                        title: photo.title,
                        content: APP.nodeToString(img)
                    });
                }
            }
        },
        
        showModal: function (config) {
            config = config || {};
            config.title = config.title || '';
            config.content = config.content || '';
            APP.show(this.modalTemplate);
            APP.addClass(this.modalTemplate, 'in');
            APP.addClass(this.body, 'modal-open');
            this.modalTitle.innerHTML = config.title;
            this.modalContent.innerHTML = config.content;
        },
        
        hideModal: function () {
            APP.hide(this.modalTemplate);
            APP.removeClass(this.modalTemplate, 'in');
            APP.removeClass(this.body, 'modal-open');
        },
        
        loaderShow: function () {
            APP.show(this.loader);
        },
        
        loaderHide: function () {
            APP.hide(this.loader);
        },
        
        emptymsgShow: function () {
            APP.show(this.emptymsg);
        },
        
        emptymsgHide: function () {
            APP.hide(this.emptymsg);
        },
        
        gallerymsgShow: function () {
            APP.show(this.gallerymsg);
        },
        
        gallerymsgHide: function () {
            APP.hide(this.gallerymsg);
        }
    };

})();


APP.Flickr.init();