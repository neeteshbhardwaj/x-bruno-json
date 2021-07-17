$(document).ready(function () {
    const baseUrl = 'https://api.unsplash.com';
    var apiKey = '';
    const toJson = res => res.json();

    var data = {
        collections: [],
        wallpapers: [],
        downloadIndex: 0
    };

    function doCollectionSearch(query, page, per_page) {
        if(!apiKey) alert("Missing Access Key from Unsplash");
        var collectionsContainer = $('.collections-container');
        collectionsContainer.empty();
        var source = document.getElementById("collection-template").innerHTML;
        var template = Handlebars.compile(source);
        fetch(`${baseUrl}/search/collections?client_id=${apiKey}&query=${query}&page=${page}&per_page=${per_page}`)
            .then(toJson)
            .then(res => {
                const info = `total: ${res.total} | total_pages: ${res.total_pages} | fetched count: ${res.results.length}`;
                $('.collections-container').html(info);
                return res.results;
            })
            .then(collections => {
                collections.forEach(collection => {
                    var html = template(collection);
                    collectionsContainer.append($(html));
                });
                data.collections = collections;
                bindCollectionSelectEvent();
            });
    }

    function doFetchCollectionPhotos(collectionId, page, per_page) {
        if(!apiKey) alert("Missing Access Key from Unsplash");
        var wallpapersContainer = $('.wallpapers-container');
        wallpapersContainer.empty();
        var source = document.getElementById("wallpaper-template").innerHTML;
        var template = Handlebars.compile(source);
        fetch(`${baseUrl}/collections/${collectionId}/photos?client_id=${apiKey}&page=${page}&per_page=${per_page}`)
            .then(toJson)
            .then(wallpapers => {
                wallpapers.forEach(wallpaper => {
                    var html = template(wallpaper);
                    wallpapersContainer.append($(html));
                });
                data.wallpapers = wallpapers;
                bindWallpaperDownloadEvent();
            });
    }

    $(".collection-search").on("keydown", e => {
        if (e.which == 13) doCollectionSearch(e.target.value, 1, 100);
    });

    $(".api-info-save").on("click", e => {
        apiKey = $(".api-info-key").val();
        data.downloadIndex = parseInt($(".api-info-download-index").val());
    });

    function bindCollectionSelectEvent() {
        const collectionSelectBtn = $(".collection-select");
        collectionSelectBtn.unbind("click");
        collectionSelectBtn.on("click", e => {
			$(e.target).addClass("btn-success");
            const collectionId = $(e.target).attr("data-collection-id");
            doFetchCollectionPhotos(collectionId, 1, 100);
        });
    }

    function bindWallpaperDownloadEvent() {
        const wallpaperDownlodBtn = $(".wallpaper-download");
        wallpaperDownlodBtn.unbind("click");
        wallpaperDownlodBtn.on("click", e => {
            const wallpaperId = $(e.target).attr("data-wallpaper-id");
            downlodWallpper(wallpaperId, (itemNumber) => {
                $(e.target).text(`Downloaded(${itemNumber})`);
                $(e.target).addClass("btn-success");
            });
        });
    }

    function wallpperJsonMpper(wallpaperJson) {
        return {
            "id": wallpaperJson.id,
            "color": wallpaperJson.color,
            "blur_hash": wallpaperJson.blur_hash,
            "urls": {
                "full": wallpaperJson.urls.full,
                "regular": wallpaperJson.urls.regular,
                "small": wallpaperJson.urls.small,
                "thumb": wallpaperJson.urls.thumb
            },
            "links": {
                "html": wallpaperJson.links.html,
                "download": wallpaperJson.links.download
            },
            "user": {
                "id": wallpaperJson.user.id,
                "portfolio_url": wallpaperJson.user.portfolio_url,
                "first_name": wallpaperJson.user.first_name,
                "last_name": wallpaperJson.user.last_name,
                "location": wallpaperJson.user.location
            }
        };
    }

    function downlodWallpper(wallpaperId, cb) {
        var wallpaperJson = data.wallpapers.filter(it => it.id == wallpaperId).map(wallpperJsonMpper)[0];
        if (wallpaperJson) {
            data.downloadIndex += 1;
            var filename = `${data.downloadIndex}.json`;
            var text = JSON.stringify(wallpaperJson);

            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            element.setAttribute('download', filename);

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
            cb(data.downloadIndex);
        }
    }
});