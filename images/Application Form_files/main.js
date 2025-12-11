
var Guide = (function(Guide, $, window, document, undefined) {
    Guide.Common = {
        createObjects: function(obj, objName, config) {
            return obj.map(function() {
                return new objName(this, config || {}, Guide);
            });
        }

    };
    return Guide;

})(Guide || {}, jQuery, window, document);

(function( $, window, document, undefined ) {
    function build() {
        if (typeof Guide === 'object') {

            Guide.Settings = {
                Classes : {},
                langCode: 0
            };

            if (window.location.href.indexOf('/en/') != -1 || window.location.search.indexOf('L=1') != -1) {
                Guide.Settings.langCode = 1;
            }

            // Tooltip Glossaire
            if ($('[class*="infobulle-glossaire"]').length > 0) {
                Guide.TooltipGlossaire = Guide.Common.createObjects($('p [class*="infobulle-glossaire"]'), TooltipGlossaire, {
                    ajaxUrl: '/index.php?L=' + Guide.Settings.langCode + '&type=89657581&tx_lboudemglossaire_udemglossaire[action]=rechercheGlossaire&tx_lboudemglossaire_udemglossaire[controller]=Glossaire',
                    icon: false
                });
                Guide.TooltipGlossaire = Guide.Common.createObjects($(':not(p) > [class*="infobulle-glossaire"]'), TooltipGlossaire, {
                    ajaxUrl: '/index.php?L=' + Guide.Settings.langCode + '&type=89657581&tx_lboudemglossaire_udemglossaire[action]=rechercheGlossaire&tx_lboudemglossaire_udemglossaire[controller]=Glossaire',
                    icon: true
                });
            }

            // Comparaison des programmes
            // if ( $( '.compare-program' ).length > 0 ) Guide.CompareProgram.create();

            // Rang liste d'attente
            if ($('#rechercheRang').length > 0) {
                Guide.Rangs.init();
            }

        }
    }

    function initScrollToTrimestreTab() {
        if (!$('.programme-trimestres .nav-link').length) { return false; }

        // scroller au bon tab lorsqu'un trimestre est choisi via le bloc jaune "Pour commencer votre demande"
        const trimestreTabs = document.querySelectorAll('.programme-trimestres .nav-link');
        const trimestreTabsObserverOptions = { attributes: true }
        const trimestreTabsObserverCallback = (mutationList, observer) => {
            for (const mutation of mutationList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class' && mutation.target.classList.contains('active')) {
                    mutation.target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                }
            }
        };
        const trimestreTabsObserver = new MutationObserver(trimestreTabsObserverCallback);
        for (tab of trimestreTabs) {
            trimestreTabsObserver.observe(tab, trimestreTabsObserverOptions);
        }
    }

    function initBtnBaccap() {
        const btnBaccap = document.querySelector('.btn-combi-baccap');
        const sectionBaccap = document.querySelector('.combo-baccap-section');
        const stickyBar = document.querySelector('.programme-navigation.sticky-top');

        if (btnBaccap) {
            const btnIcon = btnBaccap.querySelector('i.icon-mobile-petit');
            const stickyBarHeight = stickyBar ? stickyBar.offsetHeight : 64; // valeur par défaut

            if(!btnIcon) {
                return false;
            }

            if (btnIcon && !sectionBaccap) { 
                // on enlève l'icône si on ne trouve pas la section
                // (ne devrait pas se produire mais au cas, ça évitera des erreurs en console)
                btnIcon.remove();
                return false;
            }

            window.onscroll = () => {
                const cutoffTop = window.scrollY + sectionBaccap.getBoundingClientRect().top - stickyBarHeight;

                if (window.scrollY >= cutoffTop) {
                    btnIcon.classList.remove('icon-reverse');
                } else {
                    btnIcon.classList.add('icon-reverse');
                }
            };
        }
    }

    /**
     * Fonction pour envoyer dataLayer
     * pour la fiche BACCAP
     */
    function initGtmBaccap() {

        const idBaccap = document.querySelector('.identification-baccap');

        if (idBaccap) {

            const cleanText = (text) => {
                return text?text.replace(/(<([^>]+)>)/gi, '').replace(/^\s+|\s+$/g, '') : text;
            }

            const convertCycleNumToText = (cycleNum) => {
                switch(cycleNum) {
                    case '1' :
                        return '1er cycle';
                    case '2' :
                        return '2e cycle';
                    case '3' :
                        return '3e cycle';
                    case '4' :
                    case '5' :
                    case '6' :
                    default :
                        return 'Autre'
                }
            }

            window.dataLayer = window.dataLayer || [];

            let numeroBaccap  = cleanText(idBaccap.dataset.gtmProgrammeNumero ?? "").replace(/-/gi, '');
            let titreBaccap   = cleanText(idBaccap.dataset.gtmProgrammeTitre ?? "");
            let cycleBaccap   = convertCycleNumToText(cleanText(idBaccap.dataset.gtmProgrammeCycle ?? ""));
            let niveauBaccap  = cleanText(idBaccap.dataset.gtmProgrammeNiveau ?? "");
            let domaineBaccap = cleanText(idBaccap.dataset.gtmProgrammeDomaine ?? "");
            let faculte       = (() => {
                const rawFaculte = cleanText(idBaccap.dataset.gtmProgrammeFaculte ?? "");
                return rawFaculte.length === 1 ? `0${rawFaculte}` : rawFaculte;
            })();

            const name = numeroBaccap + " - " + titreBaccap + " - " + niveauBaccap;

            const item = {
                baccap        : true,
                baccapTitre   : titreBaccap,
                price         : 0,
                currency      : 'CAD',
                quantity      : 1,
                item_id       : numeroBaccap,
                item_name     : name,
                item_category : cycleBaccap,
                item_category2: niveauBaccap,
                item_category3: domaineBaccap,
                item_category4: faculte,
                item_category5: titreBaccap,
                item_category6: 0,
                item_variant  : 0
            };

            dataLayer.push({
                event: "view_item",
                ecommerce : {
                    value : 0,
                    currency : 'CAD',
                    items: [item]
                }
            });

        }

    }

    // On ready !
    $(function() { build(); initScrollToTrimestreTab(); initBtnBaccap(); initMessages(); initGtmBaccap(); });

})( jQuery, window, document );
