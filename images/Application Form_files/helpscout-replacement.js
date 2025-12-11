
(function (window, beaconReplacement) {

    const DEFAULT_BEACON_ID = 'eaf1e2ef-7422-40a6-bd91-832366e9c4a8';
    const COOKIE_LEVEL = 'functionalityCookies';

    const UDEM_COOKIE_CONSENT_ID = 'udem_cookie_consent_toggle';

    const REPLACEMENT_ELEMENTS_ID =  {
        BLUE_BEACON : 'helpscout-replacement-blue-beacon',
        MESSAGE_BOX : 'helpscout-replacement-message-box',
        SIDE_PANEL : 'helpscout-replacement-side-panel',
        SIDE_PANEL_CONTENT : 'article-content',
        FALLBACK : 'helpscout-replacement-popup'
    }

    const BEACON_ACTION = {
        INFO : 'info',
        NAVIGATE : 'navigate',
        DESTROY : 'destroy',
        INIT : 'init',
        OPEN : 'open',
        CONFIG : 'config',
        ARTICLE : 'article',
        RESET : 'reset'
    }

    const articleDatasetAttributes = [
        'beacon-article',
        'beacon-article-inline',
        'beacon-article-sidebar',
        'beacon-article-modal'
    ];

    let domElements = {};

    function cleanExistingScripts() {
        let helpscoutSrc = false;
        let toRemove = [];
        const allScripts=document.getElementsByTagName('script');

        for (let i=0; i<allScripts.length; i++){
            const script = allScripts[i];
            const isHelpscout = script.dataset.helpscoutscript;
            if (isHelpscout) {
                helpscoutSrc = script.src ?? undefined;
                toRemove.push(script);
            }
        }

        for (let i=0; i<allScripts.length; i++){
            const script = allScripts[i];
            const currentSrc = script.src ?? undefined;
            const isMainHelpscout = currentSrc && currentSrc === helpscoutSrc;
            const needToRemove = !isMainHelpscout && currentSrc && currentSrc.startsWith(helpscoutSrc);
            if (needToRemove) {
                toRemove.push(script);
            }
        }

        //console.warn('scripts to remove', toRemove);

        for (let i=0; i<toRemove.length;i++) {
            if (toRemove[i].parentNode) {
                toRemove[i].parentNode.removeChild(toRemove[i]);
            }
        }
    }

    function loadBeacon(loadScriptOnly=false) {
        if (typeof window.Beacon == "undefined" || !beaconReplacement.getBeaconScriptsLoaded()) {
            
            beaconReplacement.setBeaconScriptsLoaded(true);
            
            let script = document.createElement("script");
            script.id = "beacon";
            script.text = `!function(e,t,n){function a(){var e=t.getElementsByTagName("script")[0],n=t.createElement("script");n.type="text/javascript",n.async=!0,n.setAttribute("data-helpscoutscript", "true"),n.src="https://beacon-v2.helpscout.net",e.parentNode.insertBefore(n,e)}if(e.Beacon=n=function(t,n,a){e.Beacon.readyQueue.push({method:t,options:n,data:a})},n.readyQueue=[],"complete"===t.readyState)return a();e.attachEvent?e.attachEvent("onload",a):e.addEventListener("load",a,!1);}(window,document,window.Beacon||function(){});`;
            
            document.head.appendChild(script);
        } 

        if (!loadScriptOnly) {
            window.Beacon(BEACON_ACTION.RESET);
            window.Beacon(BEACON_ACTION.INIT, beaconReplacement.getLastBeaconId());
            window.Beacon(BEACON_ACTION.CONFIG, beaconReplacement.getConfig());
            window.Beacon('on', 'ready', () => {
                beaconReplacement.saveInfoOnHelpscoutBeacon();
            });
        }
    }

    window.addEventListener('load', () => {

        // On veut cacher le bouton préférence de la boite de dialogue si on ne peut pas l'ouvrir
        const udemCookieConsentToggle = document.getElementById(UDEM_COOKIE_CONSENT_ID).querySelector('a');
        if (!udemCookieConsentToggle) {
            const buttonPreferences = domElements.MESSAGE_BOX.querySelector('.preferences_button');
            if (buttonPreferences) {
                buttonPreferences.style.display = 'none';
            }
        }

        beaconReplacement.addEventListenerForArticles();
    });

    beaconReplacement.updateCookieConsent = (allowed=false, isBeforeLoad=false) => {
        if (allowed) {
            beaconReplacement.allowAndLoadHelpscout(isBeforeLoad);
        } else {
            beaconReplacement.saveInfoOnHelpscoutBeacon(true);
            cleanExistingScripts();
            beaconReplacement.disallowHelpscoutAndLoadReplacement();
            beaconReplacement.displayReplacementBeacon();
        }
    }

    beaconReplacement.init = () => {
        beaconReplacement.initReplacementElements();
       
        //Si le script n'existe pas (Ex: adblocker), on désactive helpscout par défault.

        //FIXME : dans la doc, on précise de ne pas utiliser directement la valeur dans le localstorage
        //Cependant, on obtient la valeur que lorsque la page est 100% loadée ce qui n'est pas assez rapide pour nous...
        //On va donc la chercher directement pour le moment.
        const consent = localStorage.getItem('udem-cookie-consent-' + COOKIE_LEVEL);
        beaconReplacement.updateCookieConsent(consent && consent === 'true', true);
        beaconReplacement.COOKIE_LEVEL = COOKIE_LEVEL;
    }

    beaconReplacement.allowAndLoadHelpscout = (isBeforeLoad=false) => {
        beaconReplacement.hideReplacementBeacon();
        loadBeacon(isBeforeLoad);
        beaconReplacement.saveInfoOnHelpscoutBeacon();
    }

    beaconReplacement.disallowHelpscoutAndLoadReplacement = () => {
        beaconReplacement.setBeaconScriptsLoaded(false);
        window.Beacon = beaconReplacement.Beacon;
    }

    beaconReplacement.addEventListenerForArticles = () => {
        for (let i = 0; i < articleDatasetAttributes.length; i++) {
            const currentAttribute = articleDatasetAttributes[i];
            const articles = document.querySelectorAll('[data-' + currentAttribute + ']');
            for (let j = 0; j < articles.length; j++) {
                const articleId = articles[j].dataset[currentAttribute];
                articles[j].addEventListener('click', beaconReplacement.openHelpscoutArticle(articleId));
            }
        }
    }

    beaconReplacement.openHelpscoutArticle = (articleId) => (event) => {
        //handle this only if helpscout is disabled
        if (!beaconReplacement.getBeaconScriptsLoaded()) {
            window.Beacon('article', articleId);
            event.preventDefault();
        }
    }

    beaconReplacement.saveInfoOnHelpscoutBeacon = (destroy=false) => {
        if (window.Beacon === undefined) {
            return void 0;
        }
        const info = window.Beacon(BEACON_ACTION.INFO);
        if (info != undefined && beaconReplacement.getBeaconScriptsLoaded()) {
            beaconReplacement.setConfig(info.config);
            beaconReplacement.setLastBeaconId(info.beaconId)
            if (destroy) {
                window.Beacon(BEACON_ACTION.DESTROY);
            }
        }   
    }

    beaconReplacement.Beacon = (action, meta) => {

        //console.log('Replacement window.Beacon was called : ' + action, meta);

        if (action === BEACON_ACTION.OPEN || action === BEACON_ACTION.NAVIGATE) {

            beaconReplacement.openPopup();

        } else if (action === BEACON_ACTION.INIT) {

            if (meta) {
                beaconReplacement.setLastBeaconId(meta);
            }
            // show the blue bubble if needed
            beaconReplacement.displayReplacementBeacon();

        } else if (action === BEACON_ACTION.CONFIG) {

            const current = beaconReplacement.getConfig();
            beaconReplacement.setConfig({
                config:{...current.config, ...meta.config},
                display:{...current.display, ...meta.display},
                messaging:{...current.messaging, ...meta.messaging},
                labels:{...current.labels, ...meta.labels},
                local:{...current.local, ...meta.local},
            });
            
            beaconReplacement.hideReplacementBeacon();
            beaconReplacement.displayReplacementBeacon();

        } else if (action === BEACON_ACTION.INFO) {

            return {'error' : 'Les témoins de fonctionnalité sont désactivés.'};

        } else if (action === BEACON_ACTION.ARTICLE) {

            //For now, we just open the popup like the 
            beaconReplacement.openPopup();

            //TODO : implement Helpscout Docs API on the server side and then serve the article
            //to the user using beaconReplacement.openSidePanel(meta);
            //I suggest that we put the url to get the html of the article in the DOM. If not 
            //found, fallback on beaconReplacement.openPopup();
            //Note : the sidePanel and the content inside still need styling (css)

            //See : https://beaconapi.helpscout.net/v1/eaf1e2ef-7422-40a6-bd91-832366e9c4a8/docs/articles/646e0b0880d5e87385a88f82?deviceId=9f993f44-0ccc-4509-a290-a9d6f132d0b5
        
        }
    }

    beaconReplacement.isManualDisplay = (config) => {
        return config && config.display?.style === 'manual';
    }

    beaconReplacement.shouldDisplayBeacon = () => {
        //do not display if config.display.style === 'manual'
        const config = beaconReplacement.getConfig();
        return !beaconReplacement.isManualDisplay(config);
    }

    beaconReplacement.initReplacementElements = () => {
        beaconReplacement.addFallbackMessageBox();
        const blueBeacon = document.getElementById(REPLACEMENT_ELEMENTS_ID.BLUE_BEACON);
        const messageBox = document.getElementById(REPLACEMENT_ELEMENTS_ID.MESSAGE_BOX);
        const sidePanel = document.getElementById(REPLACEMENT_ELEMENTS_ID.SIDE_PANEL);
        const sidePanelContent = sidePanel?.querySelector('#' + REPLACEMENT_ELEMENTS_ID.SIDE_PANEL_CONTENT);
        const fallbackMessageBox = document.getElementById(REPLACEMENT_ELEMENTS_ID.FALLBACK);
        domElements = {
            BLUE_BEACON : blueBeacon,
            MESSAGE_BOX : messageBox,
            SIDE_PANEL : sidePanel,
            SIDE_PANEL_CONTENT : sidePanelContent,
            FALLBACK : fallbackMessageBox
        };
    }

    beaconReplacement.addFallbackMessageBox = () => {
        let newDiv = document.createElement("div");
        const lang = document.documentElement.lang;

        const title = lang === 'fr' ?
            'Impossible d\'utiliser cette fonctionnalité, car les témoins de fonctionnalité sont désactivés.'
            : 'EN : Impossible d\'utiliser cette fonctionnalité, car les témoins de fonctionnalité sont désactivés.';
        const message = lang === 'fr' ?
            "Afin d'utiliser la bulle de clavardage, veuillez accepter l'utilisation de ces témoins en éditant vos préférences. Si vous désirez communiquer avec un membre du service à la clientèle, vous pouvez nous contacter au #### de téléphone."
            : "EN : Afin d'utiliser la bulle de clavardage, veuillez accepter l'utilisation de ces témoins en éditant vos préférences. Si vous désirez communiquer avec un membre du service à la clientèle, vous pouvez nous contacter au #### de téléphone.";
       const button_preferences = lang === 'fr' ?
            "Préférences"
            : "EN : Préférences";
        const button_fermer = lang === 'fr' ?
            "Fermer"
            : "EN : Fermer"; 

        const style = "position:fixed;bottom:20px;right:20px;display: none;background-color:#e5f0f8;min-width:300px";
        newDiv.innerHTML +='<div id="' + REPLACEMENT_ELEMENTS_ID.FALLBACK + '" style="' + style + '"><div class="popup_body"></div><strong>' + title + '</strong><p>' + message + '</p><div class="btn-modal-container"><button class="preferences_button"onClick="beaconReplacement.openConsentementPreferences()">' + button_preferences + '</button><button class="close_button"onClick="beaconReplacement.closePopup()">' + button_fermer + '</button></div></div>';   
        let currentDiv = document.getElementById("main"); 
        document.body.insertBefore(newDiv, currentDiv); 
    }

    beaconReplacement.displayReplacementBeacon = () => {
        if (beaconReplacement.shouldDisplayBeacon() && domElements.BLUE_BEACON) {
            domElements.BLUE_BEACON.style.display = 'block';
        }
    }

    beaconReplacement.hideReplacementBeacon = () => {
        if (domElements.BLUE_BEACON) {
            domElements.BLUE_BEACON.style.display = 'none';
        }
    }

    //TODO : à implémenter dans une V2
    beaconReplacement.openSidePanel = (articleId) => {
        if (!domElements.SIDE_PANEL || domElements.SIDE_PANEL.length === 0) {
            beaconReplacement.openFallback();
        } else {
            if (domElements.SIDE_PANEL_CONTENT) {
                domElements.SIDE_PANEL_CONTENT.innerHTML = 'Erreur : impossible de charger l\'article ' + articleId;
                domElements.SIDE_PANEL.style.display = 'block';
            }
        }
    }

    beaconReplacement.closeSidePanel = () => {
        domElements.FALLBACK.style.display = 'none';
        domElements.SIDE_PANEL.style.display = 'none';
    }

    beaconReplacement.openPopup = () => {
        if (!domElements.MESSAGE_BOX || domElements.MESSAGE_BOX.length === 0) {
            beaconReplacement.openFallback();
        } else {
            domElements.MESSAGE_BOX.style.display = 'block';
        }
        beaconReplacement.hideReplacementBeacon();
    }

    beaconReplacement.closePopup = () => {
        domElements.FALLBACK.style.display = 'none';
        domElements.MESSAGE_BOX.style.display = 'none';
        beaconReplacement.displayReplacementBeacon();
    }

    beaconReplacement.openFallback = () => {
        let el = domElements.FALLBACK;
        el.style.display = 'block';
    }

    beaconReplacement.openConsentementPreferences = () => {
        let el = document.getElementById(UDEM_COOKIE_CONSENT_ID).querySelector('a');
        el?.click();
        let el2 = document.querySelector('.open-modal-parameter');
        el2?.click();
        beaconReplacement.closePopup();
    }

    beaconReplacement.setConfig = (config) => {
        beaconReplacement.config = config;
    }

    beaconReplacement.getConfig = () => {
        return beaconReplacement?.config || {};
    }

    beaconReplacement.setLastBeaconId = (beaconId) => {
        beaconReplacement.lastBeaconId = beaconId;
    }

    beaconReplacement.getLastBeaconId = () => {
        return beaconReplacement.lastBeaconId || DEFAULT_BEACON_ID;
    }

    beaconReplacement.setBeaconScriptsLoaded = (loaded) => {
        beaconReplacement.beaconScriptsLoaded = loaded;
    }

    beaconReplacement.getBeaconScriptsLoaded = () => {
        return beaconReplacement.beaconScriptsLoaded ?? false;
    }

    beaconReplacement.init();
    window.beaconReplacement = beaconReplacement;

})(window, window.beaconReplacement || {});