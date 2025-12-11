var TooltipGlossaire = ( function( $, window, document, undefined ) {

    var defaultConfig = {
        ajaxUrl : '',
        icon : false
    };

    const CLASS_NAME_SHOW = 'show';
    const SELECTOR_TOOLTIP_INNER = '.tooltip-inner';

    function TooltipGlossaire( obj, config, app  ) {
        // Get App
        this.app = app;

        // Overwrite defaultConfig
        this.config = $.extend( {}, defaultConfig, config );

        // Set the manage guide object or the main container
        if (this.config.icon) {
            const newObj = $('<span></span>');
            newObj.attr('data-id',$( obj ).attr('data-id'))
            $( obj ).append(newObj);
            this.tooltipGlossaire = newObj;
        } else {
            this.tooltipGlossaire = $( obj );
        }

        this.init();
    }

    TooltipGlossaire.prototype = {
        init: function() {
            this.enhanceDom();
            this.bindEvent();
        },

        enhanceDom: function() {
            if (this.config.icon) {
                this.tooltipGlossaire.attr('data-bs-toggle',"tooltipIcon");
            } else {
                this.tooltipGlossaire.attr('data-bs-toggle',"tooltip");
            }
            this.tooltipGlossaire.attr('data-bs-html',"true");
            this.tooltipGlossaire.attr('title',`<div class='spinner-border' role='status'>
            <span class='visually-hidden'>Chargement...</span>
            </div>`);
            this.tooltipGlossaire.attr('tabindex','0');

            const tooltipOptions = {
                trigger : "manual"
            }

            this.popover = new bootstrap.Tooltip(this.tooltipGlossaire,tooltipOptions);
        },

        bindEvent: function() {
            this.bindShowEvent();
            this.bindTriggerEvent();
        },

        bindTriggerEvent: function() {
            const self = this;

            self.tooltipGlossaire.on('click', function(event){
                event.preventDefault();
                event.stopPropagation();
                self.popover.toggle();
            });

            self.tooltipGlossaire.on('focusout.bs.tooltip', function () {
                self.popover.hide();
            })
        },

        bindShowEvent: function() {
            const self = this;

            self.load = false;

            // Adding the event listener on the element directly; 
            // Here, jQuery .on() doesn't catch 'show.bs.tooltip' for some reason
            self.tooltipGlossaire[0].addEventListener('show.bs.tooltip', function () {
                if (!self.load) {
                    self.ajaxCall();
                }
            });
        },

        ajaxCall: function() {
            const self = this;

            $.ajax({
                url: self.config.ajaxUrl,
                data: 'tx_lboudemglossaire_udemglossaire[data-id]=' + self.tooltipGlossaire.attr('data-id'),
                timeout: 3000 // Prend en général a besoin de moins de 500ms en mode throttle "Regular 3G"
            })
            .done(function(definition) {
                const newContent = new Array();
                newContent[SELECTOR_TOOLTIP_INNER] = definition;
                self.popover._newContent = newContent
                self.popover.tip.querySelector(SELECTOR_TOOLTIP_INNER).innerHTML = definition;
                self.popover.update();
                self.load = true;
            });
        }
    };

    return TooltipGlossaire;

})( jQuery, window, document );
