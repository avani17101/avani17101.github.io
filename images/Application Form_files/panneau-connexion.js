(function() {
    /*******************
     * Panneau de connexion - RECA
     *******************/

    function isFeTypoNocache() {
        if (document.cookie.match(/^(.*;)?\s*fe_typo_nocache\s*=\s*[^;]+(.*)?$/)) {
            // Un cookie « fe_typo_nocache » existe
            return true;
        }
        return false;
    }

    function refreshConnectionPanel() {
        if ($('#navbar-login-panel').length > 0) {
            let url = $('#navbar-login-panel').data('url');
            $.ajax(url, {
                success: function(content) {
                    $('#navbar-login-panel .dropdown-menu').html(content);
                },
                error: function() {
                    $('#navbar-login-panel .dropdown-menu').text(LocaleStrings.common.errorHappened);
                },
                timeout: 5000 // jusqu'à 3 sec quand on est sur listing des programmes en mode throttle "Regular 3G"
            });
        }
    }

    if (isFeTypoNocache()) {
        window.addEventListener('load',() => {
            let urlInfoUser = $('#navbar-login-panel').data('url-info-user');
            if (urlInfoUser) {
                window.dataLayer = window.dataLayer || [];
                $.ajax(urlInfoUser, {
                    success: function(content) {
                        const json = JSON.parse(content);
                        window.dataLayer.push({user_id:json?.user_id??""});
                        //console.log('gtm', {user_id:json?.user_id??""});
                        if (json?.send_login_event) {
                            window.dataLayer.push({event:'login', user_id:json?.user_id??""});
                            //console.log('gtm', {event:'login', user_id:json?.user_id??""});
                        }
                    },
                    error: function() {
                        window.dataLayer.push({user_id:""});
                    },
                    timeout: 1500 // Peut prendre jusqu'à 800ms sur Web3, mais en général a besoin de moins de 400ms
                });
            }
        });
    }
  
    if (isFeTypoNocache()) {
        window.refreshConnectionPanel = refreshConnectionPanel;
        refreshConnectionPanel();
    }
})();
