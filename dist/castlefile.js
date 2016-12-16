var Castlefile, _this = null;

Castlefile = function(element, options){
    return this.element = element,
        this.thumbnails = [],
        this.hiddenFileInput = null,
        this.gallery = null,
        this.uploadMultiple = false,
        this.startValue = null,
        this.maxFilesize = 256,
        this.paramName = "file",
        this.maxFiles = options.maxFiles || 1,
        this.clickable = true,
        this.defaultMessage = "Drop files here to upload",
        this.fallbackMessage = "Your browser does not support drag'n'drop file uploads.",
        this.FileTooBig = "File is too big ({{filesize}}MiB). Max filesize: {{maxFilesize}}MiB.",
        this.RemoveFile = "Remove file",
        this.maxFilesExceeded = "You can not upload any more files.",
        this.initialize();
};
Castlefile.prototype.initialize=function(){
    _this = this;

    if (_this.hiddenFileInput) {
      document.body.removeChild(_this.hiddenFileInput);
    }
    _this.hiddenFileInput = document.createElement("input");
    _this.hiddenFileInput.setAttribute("type", "file");
    _this.hiddenFileInput.style.visibility = 'hidden';
    _this.hiddenFileInput.style.position = "absolute";
    _this.hiddenFileInput.style.top = "0";
    _this.hiddenFileInput.style.left = "0";
    _this.hiddenFileInput.style.height = "0";
    _this.hiddenFileInput.style.width = "0";
    _this.hiddenFileInput.className = "dz-hidden-input";

    if (_this.maxFiles > 1) {
        _this.hiddenFileInput.setAttribute("multiple", true);
    }

    _this.hiddenFileInput.addEventListener("change", function() {
        if (this.files && this.files[0]) {
            for (var i = 0; i < this.files.length; i++) {
                var length = _this.thumbnails.length;
                if (_this.maxFiles === 1 || length + 1 <= _this.maxFiles) {
                    _this.addImageContainer(this.files[i]);
                }
            }
        }
    });

    document.body.appendChild(_this.hiddenFileInput);


    _this.element.addEventListener("click", function(e) {
        _this.hiddenFileInput.click();
    })

    _this.initialDesign(true);
},
Castlefile.prototype.initialDesign=function (visibility) {
    var container = _this.element.getElementsByClassName('castlefile-container')[0];
    if (visibility == true) {
        container.innerHTML = '';

        _this.gallery = null;

        var icon = document.createElement("i");
        icon.className = 'icon-instagram icon-2x';
        
        var text = document.createElement("p");
        text.appendChild(document.createTextNode(this.defaultMessage));

        container.appendChild(icon);
        container.appendChild(text);
    }else if(this.gallery === null){
        container.innerHTML = '';
        _this.appendGallery();
    }
},
Castlefile.prototype.appendGallery=function () {
    _this.gallery = document.createElement("ul");
    _this.gallery.className = 'castlefile-gallery';

    this.element.getElementsByClassName('castlefile-container')[0].append(_this.gallery);
},
Castlefile.prototype.addImageContainer=function (file) {
    //If Catlefile only accepts one image, remove all
    if (_this.maxFiles === 1) {
        for (var i = 0; i < _this.thumbnails.length; i++) {
            _this.thumbnails[i].remove();
            _this.thumbnails = [];
        }
    }

    var length = _this.thumbnails.length;

    _this.initialDesign(false);

    //Create thumbnail
    _this.thumbnails[length] = document.createElement("li");
    
    if (_this.maxFiles === 1) {
        _this.thumbnails[length].className = "thumbnail full-image";
    }else{
        if (length === 0) {
            _this.thumbnails[length].className = "thumbnail featured-image";
        }else{
            _this.thumbnails[length].className = "thumbnail";
        }
    }

    //Create thumbnail container
    thumbContainer = document.createElement("div");
    thumbContainer.className = "thumbnail-container";

    //Create img element
    imageElement = document.createElement("img");
    imageElement.className = "castlefile-img";
    thumbContainer.append(imageElement);

    //Create input hidden with value
    hiddenInput = document.createElement("input");
    hiddenInput.setAttribute("type", "hidden");
    hiddenInput.setAttribute("name", "image");
    hiddenInput.setAttribute("value", _this.startValue);
    thumbContainer.append(hiddenInput);

    _this.thumbnails[length].append(thumbContainer);

    //Create caption
    var caption = document.createElement("div");
    caption.className = "caption";

    var caption_content = document.createElement("div");
    caption_content.className = "caption-content";
    
    var caption_links = document.createElement("a");
    caption_links.className = "text-error link-remove";
    caption_links.addEventListener("click", function(e) {
        e.stopPropagation();
        e.preventDefault();

        var thumbnailId  = this.getAttribute('href');
        var thumbnailPos = document.getElementById(thumbnailId).getAttribute('castlefile-pos');
        thumbnailPos = thumbnailPos - 1;
        //remove thumbnail element from dom
        _this.thumbnails[thumbnailPos].remove();
        //remove thumbnail from array    
        _this.thumbnails.splice(thumbnailPos,1);
        //rename thumbnails
        _this.thumbnailsSortPosition();

        if (_this.thumbnails.length === 0) {
            _this.initialDesign(true);
        }

        if (_this.thumbnails.length) {
            _this.thumbnails[0].className = "thumbnail featured-image";
        }
    });
    
    var icon = document.createElement("i");
    icon.className = "icon-remove icon-3x";
    
    //Append caption to thumbnail
    caption_links.append(icon);
    caption_content.append(caption_links);
    caption.append(caption_content);
    _this.thumbnails[length].append(caption);

    //Append thumbnail to gallery container
    _this.gallery.append(_this.thumbnails[length]);

    this.preview(file, imageElement);

    _this.thumbnailsSortPosition();
},
Castlefile.prototype.preview=function (file, image) {
    var reader = new FileReader();

    reader.onload = function (e) {
        image.setAttribute("src", e.target.result);
    }

    reader.readAsDataURL(file);

},
Castlefile.prototype.thumbnailsSortPosition=function () {
    var length = _this.gallery.childNodes.length;

    for (var i = 0; i < length; i++) {
        var pos = i + 1;
        var thumb_id = 'gallery-cell-' + pos;

        _this.thumbnails[i].setAttribute("id", thumb_id);
        _this.thumbnails[i].setAttribute("castlefile-pos", pos);
        
        var link = _this.thumbnails[i].getElementsByClassName('link-remove');
        link[0].setAttribute("href", thumb_id);
    }
}