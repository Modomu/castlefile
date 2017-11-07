(function( name, castlefile ) {
   
   if( typeof window === "object" ) {
      
      // add to window 
      window[ name ] = castlefile();
      
      // add jquery plugin, if available  
      if( typeof jQuery === "object" ) {
         jQuery.fn[ name ] = function( options ) {
            return this.each( function() {
               new window[ name ]( this, options );
            });
         };
      }
   }
    
})( "Castlefile", function() {

    var Castlefile = function(element, options){
        this.element = element;
        this.thumbnails = [];
        this.hiddenFileInput = null;
        this.gallery = null;
        this.files = [];
        this.uploadMultiple = false;
        this.startValue = null;
        this.maxFilesize = 256;
        this.paramName = options.paramName || 'file';
        this.maxFiles = options.maxFiles || 1;
        this.clickable = options.clickable;
        this.defaultMessage = "Drop files here to upload";
        this.fallbackMessage = "Your browser does not support drag'n'drop file uploads.";
        this.FileTooBig = "File is too big ({{filesize}}MiB). Max filesize: {{maxFilesize}}MiB.";
        this.RemoveFile = "Remove file";
        this.maxFilesExceeded = "You can not upload any more files.";
        this.initialize();
        this.thumbnailsAtInit(options.thumbnails);
    };

    Castlefile.prototype = {
        constructor: Castlefile,

        initialize:function()
        {
            _this = this;

            //Replace 
            this.paramName = this.paramName.replace('[]','');
            var fileInputName = this.maxFiles === 1 ? this.paramName : this.paramName + '[]';

            //create hidden input file
            if (this.hiddenFileInput) {
              document.body.removeChild(this.hiddenFileInput);
            }
            this.hiddenFileInput = document.createElement("input");
            this.hiddenFileInput.setAttribute("name", fileInputName);
            this.hiddenFileInput.setAttribute("type", "file");
            this.hiddenFileInput.className = "dz-hidden-input";

            if (this.maxFiles > 1) {
                this.hiddenFileInput.setAttribute("multiple", true);
            }

            this.hiddenFileInput.addEventListener("change", function() {
                _this.addFiles(this.files);
            });

            this.element.appendChild(_this.hiddenFileInput);

            //Add drop events to container
            this.element.addEventListener("dragover", function(e) {
                e.stopPropagation();
                e.preventDefault();
                _this.addClass(this, 'active');
            });
            this.element.addEventListener("dragleave", function(e) {
                e.stopPropagation();
                e.preventDefault();
                _this.removeClass(this, 'active');
            });
            this.element.addEventListener("drop", function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                _this.addFiles(event.dataTransfer.files);

                _this.removeClass(this, 'active');
            });
            //Open file browser on element click
            if (this.clickable !== false) {
                this.element.addEventListener("click", function(e) {
                    _this.hiddenFileInput.click();
                });
            }

            //Append button file upload
            buttonContainer = document.createElement("button");
            buttonContainer.className = 'clearfix';

            buttonFileInput = document.createElement("button");
            buttonFileInput.setAttribute('id','castlefile-button');
            buttonFileInput.setAttribute('type','button');
            buttonFileInput.className = 'btn btn-success btn-small pull-right';
            buttonFileInput.innerHTML = '<i class="icon-upload icon-large"></i>Añadir imagen';
            buttonFileInput.addEventListener('click', function (e) {
                _this.hiddenFileInput.click();
            });

            this.element.parentElement.appendChild(buttonFileInput);

            _this.initialDesign();
        },

        initialDesign: function () 
        {
            var container = this.element.getElementsByClassName('castlefile-container')[0];

            if (this.gallery === null || this.gallery.childNodes.length === 0) {
                container.innerHTML = '';

                var container_initial = document.createElement("div");
                container_initial.className = 'castlefile-wrapper';
                container_initial.setAttribute("id", 'castlefile-wrapper');

                var icon = document.createElement("i");
                icon.className = 'icon-picture icon-4x';

                var text = document.createElement("p");
                text.appendChild(document.createTextNode(this.defaultMessage));

                container_initial.appendChild(icon);
                container_initial.appendChild(text);
                container.appendChild(container_initial);

                this.gallery = document.createElement("ul");
                this.gallery.className = 'castlefile-gallery';
                container.append(this.gallery);
            }else{
                if (this.element.getElementsByClassName('castlefile-wrapper').length) {
                    this.element.getElementsByClassName('castlefile-wrapper')[0].remove();
                }
            }
        },

        thumbnailsAtInit:function (thumbnails) 
        {
            if (thumbnails instanceof Array === false) {
                thumbnails=[];
            }

            for (var i = 0; i < thumbnails.length; i++) {
                if (thumbnails[i]) {
                    this.addImageContainer(thumbnails[i]);
                }
            }
        },

        addFiles: function (files) 
        {
            if (files && files[0]) {
                for (var i = 0; i < files.length; i++) {
                    var length = this.thumbnails.length;
                    if (this.maxFiles !== 1 && length + 1 > this.maxFiles) {
                        alert(this.maxFilesExceeded);
                    }else {
                        this.addImageContainer(files[i]);
                    }
                }
            }
        },

        addImageContainer: function (file) 
        {
            //If Catlefile only accepts one image, remove all
            if (this.maxFiles === 1) {
                this.thumbnails = [];
            }

            var length = this.thumbnails.length;

            //Create thumbnail
            this.thumbnails.push(document.createElement("li"));

            if (this.maxFiles === 1) {
                this.thumbnails[length].className = "full-image";
            }

            //Create thumbnail container
            thumbContainer = document.createElement("div");
            thumbContainer.className = "thumbnail";

            //Create img element
            imageElement = document.createElement("img");
            imageElement.className = "castlefile-img";
            thumbContainer.append(imageElement);

            //Create input hidden with src value
            hiddenInputSrc = document.createElement("input");
            hiddenInputSrc.setAttribute("type", "hidden");
            hiddenInputSrc.setAttribute("value", file.src || '');

            if (this.maxFiles === 1) {
                hiddenInputSrc.setAttribute("name", this.paramName);
            }else{
                //Add input src
                hiddenInputSrc.setAttribute("name", this.paramName + '['+length+'][src]');

                //Add input id
                hiddenInputId = document.createElement("input");
                hiddenInputId.setAttribute("type", "hidden");
                hiddenInputId.setAttribute("name", this.paramName + '['+length+'][id]');
                hiddenInputId.setAttribute("value", file.id || '');
                thumbContainer.append(hiddenInputId);

                if (typeof file === "object" && file.src !== undefined) {
                    file = file.src;
                }
            }

            thumbContainer.append(hiddenInputSrc);

            //Create caption
            var caption = document.createElement("div");
            caption.className = "caption";

            var caption_content = document.createElement("div");
            caption_content.className = "caption-content";
            
            //Create thumbnail caption links
            var caption_links = document.createElement("a");
            var icon = document.createElement("i");
            icon.className = "icon-remove icon-3x";
            caption_links.append(icon);
            caption_links.className = "text-error link-remove";
            //Add remove image event
            caption_links.addEventListener("click", function(e) {
                e.stopPropagation();
                e.preventDefault();

               var gallery_li  = this.parentNode.parentNode.parentNode.parentNode,
                     position    = null;

                for (var i = 0; i < _this.gallery.childNodes.length; i++) {
                    if (_this.gallery.childNodes[i] == gallery_li) {
                        position = i;
                    }
                }

                _this.removeImage(position);
            });
            
            //Append caption to thumbnail
            caption_content.append(caption_links);
            caption.append(caption_content);
            thumbContainer.append(caption);
            this.thumbnails[length].append(thumbContainer);

            //Append thumbnail to gallery container
            this.gallery.append(this.thumbnails[length]);

            if (typeof file === "object") {
                this.preview(file, this.thumbnails[length]);
            }else{
                hiddenInputSrc.setAttribute('value',file);
                imageElement.setAttribute('src',file);
            }

            this.initialDesign();
            this.thumbnailsSortPosition();
        },
        removeImage: function(position){
            //remove thumbnail element from dom
            this.thumbnails[position].remove();
            //remove thumbnail from array    
            this.thumbnails.splice(position,1);
            //rename thumbnails
            this.thumbnailsSortPosition();

            if (this.thumbnails.length === 0) {
                this.initialDesign();
            }
        },
        preview: function (file, thumbnail) 
        {
            var reader = new FileReader();

            reader.onload = function (e) 
            {
                thumbnail.getElementsByTagName('img')[0].setAttribute("src", e.target.result);

                var inputs = thumbnail.getElementsByTagName('input'),
                    input_src = null,
                    position = 0;

                for (var i = 0; i < inputs.length; i++) {
                    position = inputs[i].name.match(/\[(\d+)\]/g);

                    if(inputs[i].name.match(/\[src\]/) !== null){
                        input_src = inputs[i];
                    }
                }

                if (input_src === null || position === null) {
                    return false;
                }

                if (_this.maxFiles > 1) {
                    input_src.setAttribute("value", e.target.result);
                }
                var input = document.createElement("input");
                input.setAttribute("type", "hidden");
                input.setAttribute('name', _this.paramName + position[0] + '[name]');
                input.setAttribute("value", file.name);

                thumbnail.getElementsByClassName('thumbnail')[0].append(input);
            };

            reader.readAsDataURL(file);
        },

        thumbnailsSortPosition: function () 
        {
            for (var i = 0; i < this.gallery.childNodes.length; i++) {
                var inputs = this.gallery.childNodes[i].getElementsByTagName('input');
                for (var x = 0; x < inputs.length; x++) {
                    if(inputs[x].name.match(/\[src\]/) !== null){
                        inputs[x].setAttribute("name", this.paramName + '['+i+'][src]');
                    }else if(inputs[x].name.match(/\[id\]/) !== null){
                        inputs[x].setAttribute("name", this.paramName + '['+i+'][id]');
                    }else if(inputs[x].name.match(/\[name\]/) !== null){
                        inputs[x].setAttribute("name", this.paramName + '['+i+'][name]');
                    }else if(inputs[x].name.match(/\[alt\]/) !== null){
                        inputs[x].setAttribute("name", this.paramName + '['+i+'][alt]');
                    }
                }
            }
        },

        hasClass: function (element, className) 
        {
            if (element.classList){
                return element.classList.contains(className);
            }else{
                return !!element.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
            }
        },

        addClass: function (element, className) 
        {
            if (element.classList){
                element.classList.add(className);
            }else if (!this.hasClass(element, className)){
                element.className += " " + className;
            }
        },

        removeClass: function (element, className) 
        {
            if (element.classList){
                element.classList.remove(className);
            }else if (this.hasClass(element, className)) {
                var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
                element.className=element.className.replace(reg, ' ');
            }
        }
    };

    // export
    return Castlefile;
});