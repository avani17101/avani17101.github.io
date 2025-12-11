window.Beacon('init', 'd36c4a21-9aa1-4cda-bbc1-2e07e40343b9');window.Beacon('init', 'eaf1e2ef-7422-40a6-bd91-832366e9c4a8');window.Beacon('config', {display: {style: 'manual'}});    const UDEM_COOKIE_CONSENT_ID = 'udem_cookie_consent_toggle';

    function openConsentementPreferences(){
      let el = document.getElementById(UDEM_COOKIE_CONSENT_ID).querySelector('a');
      el?.click();
      let el2 = document.querySelector('.open-modal-parameter');
      el2?.click();
    }

    function assignConsentementVideosMaps(categories){
      if (categories.functionalityCookies === 'granted') {
        // Grant YT permission/*  */
        moveYouTubeSrc(true);
      } else {
        // Revoke YT permission
        moveYouTubeSrc(false);
      }
    }

    function disabledMessage(disable){
      if(disable){
        //set parent element to iframe size to display not authorized content
        const compStyles = window.getComputedStyle(this);
        this.parentElement.style.setProperty("width",compStyles.getPropertyValue("width"));
        this.parentElement.style.setProperty("height",compStyles.getPropertyValue("height"));
        this.parentElement.classList.add("authorization-denied");
        
        if(!this.parentElement.querySelector(".authorization-denied-message")){
          let createMessage = document.createElement("p");
          createMessage.classList.add("authorization-denied-message");
          createMessage.innerHTML = "<span>To view the <span class='no-video hide'>video</span><span class='no-map hide'>map</span>, <a class='open-consent-prefs'>enable the functionality cookies</a> in your preferences.</span>";
          createMessage.querySelector(".open-consent-prefs").addEventListener("click",openConsentementPreferences);
          this.parentElement.insertAdjacentElement('afterbegin',createMessage);
          
          //show hidden media keywork in authorization description
          if(this.dataset.src.match(/maps/i)){
            createMessage.querySelector(".no-map").classList.remove("hide");
          }
          else{
            createMessage.querySelector(".no-video").classList.remove("hide");
          }
            
        }
      }
      else{
        this.parentElement.style.removeProperty("width");
        this.parentElement.style.removeProperty("height");
        this.parentElement.classList.remove("authorization-denied");
        if(this.parentElement.querySelector(".authorization-denied-message")){
          this.parentElement.querySelector(".open-consent-prefs").removeEventListener("click",openConsentementPreferences);
          this.parentElement.removeChild(this.parentElement.querySelector(".authorization-denied-message"));
        }
      }

    }

    function disableMapsIframe(){
      this.src = "about:blank";
    }

    function moveYouTubeSrc(consentGiven = false) {
        // Select all iframe elements on the page
        const iframes = document.querySelectorAll('iframe');

        // Loop through each iframe
        iframes.forEach((iframe) => {
            if(!consentGiven) {
              const pattern = new RegExp(/(youtube)|(vimeo)|(dailymotion)|(maps)/,"i");

              //if iframe src and match pattern
              if (iframe.src && pattern.test(iframe.src)) {
                  iframe.dataset.src = iframe.src;
                  iframe.removeAttribute("src");

                  disabledMessage.call(iframe,true);
              }
            }
            else {
                // Move the data-src attribute back to src
                const dataSrc = iframe.dataset.src;
                if (dataSrc) {
                    iframe.src = dataSrc;
                    iframe.removeAttribute('data-src');
                    disabledMessage.call(iframe,false);
                }
            }
        });
    }

     // Hide YT videos so they can't be played until consent is granted
    window.addEventListener('DOMContentLoaded', () => {
        // Call the function to move YouTube iframe src attributes to data-src attributes
        moveYouTubeSrc(false);
    });        // Define dataLayer and the gtag function.
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }

        // Default ad_storage to 'denied'.
        gtag('consent', 'default', {
            'ad_storage': 'denied',
            'analytics_storage': 'denied',
            'functionality_storage': 'denied'
        });window.addEventListener('load', () => {
                if (typeof on_udem_cookie_update_consent === 'function') {function udem_cookie_consent_update(categories) {                beaconReplacement.updateCookieConsent(categories[beaconReplacement.COOKIE_LEVEL]);                for (const [key, value] of Object.entries(categories)) {
                    categories[key] = (value === true) ? 'granted' : 'denied';
                }                udem_google_cookie_consent_update(categories);                assignConsentementVideosMaps(categories);}                    function udem_google_cookie_consent_update(categories) {
                        // Page-views and other "onload" gtm triggers require that consent is granted
                        // in advance by registering it in dataLayer before we inject the GTM script.
                        gtag('consent', 'update', {
                            'ad_storage': categories.adsCookies,
                            'functionality_storage': categories.functionalityCookies,
                            'analytics_storage': categories.performanceCookies
                        });        // If dataLayer does not contain gtm.js yet.
        if (typeof dataLayer === 'undefined' || dataLayer.length == 0 || !(dataLayer.some((obj) => obj.event === 'gtm.js'))) {
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-WLFMZQ2');
        }}on_udem_cookie_update_consent(udem_cookie_consent_update);
                }
            });